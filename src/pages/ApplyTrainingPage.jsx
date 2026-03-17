import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../app/contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, collection, query, where, getDocs, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { EGYPT_UNIVERSITIES } from '../constants/egyptUniversities';
import SEOHead from '../components/common/SEOHead';
import { toast } from 'react-hot-toast';
import { FaUser, FaPhone, FaEnvelope, FaIdCard, FaUniversity, FaGraduationCap, FaBookReader, FaSpinner, FaArrowRight, FaInfoCircle } from 'react-icons/fa';
import { logger } from '../utils/logger';

const ApplyTrainingPage = () => {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [training, setTraining] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: currentUser?.email || '',
    nationalId: '',
    university: '',
    otherUniversityName: '',
    faculty: '',
    gradeYear: '',
    graduateYear: '',
    specialization: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!currentUser) return;

      try {
        setLoadingInitial(true);
        // 1. Fetch Training Data
        const trainingRef = doc(db, 'trainings', trainingId);
        const trainingSnap = await getDoc(trainingRef);

        if (!trainingSnap.exists() || trainingSnap.data().status !== 'open') {
          toast.error('التدريب غير متاح للتسجيل حالياً');
          navigate('/practical-training');
          return;
        }
        setTraining({ id: trainingSnap.id, ...trainingSnap.data() });

        // 2. Check if already applied
        const appsRef = collection(db, 'trainingApplications');
        const q = query(appsRef, where('uid', '==', currentUser.uid), where('trainingId', '==', trainingId));
        const appSnap = await getDocs(q);

        if (!appSnap.empty) {
          setAlreadyApplied(true);
        }

      } catch (error) {
        logger.error("Error fetching application initial data:", error);
        toast.error("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitialData();
  }, [trainingId, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'الاسم بالكامل مطلوب';
    if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
    if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'رقم البطاقة مطلوب';
    } else if (!/^\d{14}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'رقم البطاقة يجب أن يتكون من 14 رقم صحيح';
    }

    if (!formData.university) newErrors.university = 'الجامعة مطلوبة';
    if (formData.university === 'أخرى' && !formData.otherUniversityName.trim()) {
      newErrors.otherUniversityName = 'يرجى كتابة اسم الجامعة / المعهد';
    }

    if (!formData.faculty.trim()) newErrors.faculty = 'الكلية / المعهد مطلوب';
    if (!formData.gradeYear) newErrors.gradeYear = 'الفرقة الدراسية مطلوبة';
    if (formData.gradeYear === 'خريج' && !formData.graduateYear) {
      newErrors.graduateYear = 'سنة التخرج مطلوبة';
    }

    if (!formData.specialization.trim()) newErrors.specialization = 'التخصص مطلوب';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('يرجى التأكد من ملء جميع الحقول المطلوبة بشكل صحيح');
      return;
    }

    try {
      setSubmitting(true);

      // Re-fetch training to check latest seat availability
      const trainingRef = doc(db, 'trainings', trainingId);
      const latestSnap = await getDoc(trainingRef);

      if (!latestSnap.exists() || latestSnap.data().status !== 'open') {
        toast.error('عذراً، هذا التدريب لم يعد متاحاً للتسجيل.');
        navigate('/practical-training');
        return;
      }

      const latestData = latestSnap.data();

      // Check seat capacity if seats are limited
      if (latestData.seatsLimited) {
        const remaining = latestData.seatsRemaining ?? latestData.seatsTotal ?? 0;
        if (remaining <= 0) {
          toast.error('عذراً، العدد المتاح للمقاعد مكتمل. لا يمكن التسجيل في الوقت الحالي.');
          return;
        }
      }

      const appsRef = collection(db, 'trainingApplications');
      const newAppRef = doc(appsRef); // Generate new ID
      const userAppRef = doc(db, `users/${currentUser.uid}/trainingApplications`, newAppRef.id);

      const applicationData = {
        uid: currentUser.uid,
        trainingId: training.id,
        trainingTitle: training.title,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        nationalId: formData.nationalId,
        faculty: formData.faculty,
        gradeYear: formData.gradeYear,
        graduateYear: formData.graduateYear,
        specialization: formData.specialization,
        // sanitize otherUniversity
        university: formData.university === 'أخرى' ? formData.otherUniversityName : formData.university,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // We don't save otherUniversityName explicitly if we merged it
      if (formData.university === 'أخرى') {
        applicationData.originalUniversitySelection = 'أخرى';
      }

      const batch = writeBatch(db);
      batch.set(newAppRef, applicationData);
      batch.set(userAppRef, applicationData);

      // Decrement seats if limited
      if (latestData.seatsLimited) {
        batch.update(trainingRef, {
          seatsRemaining: increment(-1)
        });
      }

      await batch.commit();

      toast.success('🎉 تم تسجيل طلبك بنجاح! يمكنك متابعة حالة طلبك من لوحة التحكم.');
      navigate('/dashboard/practical-training');

    } catch (error) {
      logger.error('Error submitting application:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-background-light pt-32 pb-20 flex items-center justify-center">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="min-h-screen bg-background-light pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-11/12 md:w-6/12 lg:w-4/12 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <FaInfoCircle className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-heading-dark mb-4">قمت بالتسجيل مسبقاً</h2>
          <p className="text-gray-600 mb-8">
            لقد قمت بإرسال طلب تسجيل لهذا التدريب من قبل. يمكنك متابعة حالة طلبك من لوحة التحكم.
          </p>
          <Link to="/dashboard/practical-training" className="inline-block w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-accent transition-colors">
            الذهاب إلى لوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-28 pb-20 px-4 md:px-8">
      <SEOHead title={`التسجيل في: ${training?.title || 'تدريب'}`} />

      <div className="w-full md:w-10/12 lg:w-8/12 mx-auto">
        <Link to="/practical-training" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 font-medium">
          <FaArrowRight /> عودة للتدريبات
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-heading-dark dark:text-gray-100 mb-2">
              طلب التقديم
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              التسجيل في: <span className="font-bold text-primary">{training?.title}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الاسم بالكامل (رباعي)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <FaUser />
                  </div>
                  <input
                    type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    className={`w-full pl-3 pr-10 py-3 rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-heading-dark dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                    placeholder="الاسم كما في البطاقة"
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              {/* National ID */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الرقم القومي</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <FaIdCard />
                  </div>
                  <input
                    type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} maxLength="14" dir="ltr"
                    className={`w-full pl-3 pr-10 py-3 rounded-xl border ${errors.nationalId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-heading-dark dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-right`}
                    placeholder="14 رقم"
                  />
                </div>
                {errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رقم الهاتف (واتساب)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <FaPhone />
                  </div>
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange} dir="ltr"
                    className={`w-full pl-3 pr-10 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-heading-dark dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-right`}
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange} dir="ltr"
                    className={`w-full pl-3 pr-10 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-heading-dark dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-right`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700 my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* University */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الجامعة / المعهد</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <FaGraduationCap />
                  </div>
                  <select
                    name="university" value={formData.university} onChange={handleChange}
                    className={`w-full pl-3 pr-10 py-3 rounded-xl border ${errors.university ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-heading-dark dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none`}
                  >
                    <option value="">اختر الجامعة</option>
                    {EGYPT_UNIVERSITIES.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
                {errors.university && <p className="text-red-500 text-xs mt-1">{errors.university}</p>}
              </div>

              {/* Other University Input */}
              {formData.university === 'أخرى' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسم الجامعة / المعهد</label>
                  <input
                    type="text" name="otherUniversityName" value={formData.otherUniversityName} onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.otherUniversityName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-heading-dark dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                    placeholder="اكتب اسم جامعتك أو معهدك"
                  />
                  {errors.otherUniversityName && <p className="text-red-500 text-xs mt-1">{errors.otherUniversityName}</p>}
                </div>
              )}

              {/* Faculty */}
              <div className={formData.university === 'أخرى' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الكلية</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <FaUniversity />
                  </div>
                  <input
                    type="text" name="faculty" value={formData.faculty} onChange={handleChange}
                    className={`w-full pl-3 pr-10 py-3 rounded-xl border ${errors.faculty ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-heading-dark dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                    placeholder="مثال: الزراعة"
                  />
                </div>
                {errors.faculty && <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">القسم / التخصص</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <FaBookReader />
                  </div>
                  <input
                    type="text" name="specialization" value={formData.specialization} onChange={handleChange}
                    className={`w-full pl-3 pr-10 py-3 rounded-xl border ${errors.specialization ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-heading-dark dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                    placeholder="مثال: إنتاج نباتي"
                  />
                </div>
                {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
              </div>

              {/* Grade Year */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الفرقة الدراسية</label>
                <select
                  name="gradeYear" value={formData.gradeYear} onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.gradeYear ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-heading-dark dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none`}
                >
                  <option value="">اختر الفرقة</option>
                  <option value="الفرقة الأولى">الفرقة الأولى</option>
                  <option value="الفرقة الثانية">الفرقة الثانية</option>
                  <option value="الفرقة الثالثة">الفرقة الثالثة</option>
                  <option value="الفرقة الرابعة">الفرقة الرابعة</option>
                  <option value="خريج">خريج</option>
                </select>
                {errors.gradeYear && <p className="text-red-500 text-xs mt-1">{errors.gradeYear}</p>}
              </div>

              {/* Graduate Year */}
              {formData.gradeYear === 'خريج' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">سنة التخرج</label>
                  <select
                    name="graduateYear" value={formData.graduateYear} onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.graduateYear ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-heading-dark dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none`}
                  >
                    <option value="">اختر سنة التخرج</option>
                    {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.graduateYear && <p className="text-red-500 text-xs mt-1">{errors.graduateYear}</p>}
                </div>
              )}
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full md:w-auto px-10 py-4 font-bold text-lg rounded-xl text-white shadow-lg transition-all flex justify-center items-center gap-2 ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-accent shadow-primary/30 hover:shadow-primary/50'}`}
              >
                {submitting ? (
                  <><FaSpinner className="animate-spin" /> جاري الإرسال...</>
                ) : (
                  'تأكيد وارسال الطلب'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyTrainingPage;
