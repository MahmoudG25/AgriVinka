import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import SEOHead from '../../components/common/SEOHead';
import { logger } from '../../utils/logger';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import { MdSave, MdArrowBack } from 'react-icons/md';
import { FaPlus, FaTrash } from 'react-icons/fa';

const initialFormState = {
  title: '',
  shortDescription: '',
  details: '',
  requirements: '',
  durationText: '',
  location: {
    governorate: '',
    city: '',
    address: ''
  },
  startDate: '',
  endDate: '',
  deadline: '',
  seatsLimited: false,
  seatsTotal: 0,
  status: 'draft',
  instructors: []
};

const AdminTrainingEdit = () => {
  const { id } = useParams();
  const isEditMode = id !== 'new';
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTraining = async () => {
      if (!isEditMode) return;
      try {
        const docRef = doc(db, 'trainings', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Format timestamps to YYYY-MM-DD for input fields
          const formatDate = (timestamp) => {
            if (!timestamp) return '';
            let date;
            if (typeof timestamp.toDate === 'function') {
              date = timestamp.toDate();
            } else if (timestamp instanceof Date) {
              date = timestamp;
            } else {
              date = new Date(timestamp);
            }
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
          };

          setFormData({
            ...initialFormState,
            ...data,
            location: data.location || initialFormState.location,
            startDate: formatDate(data.startDate),
            endDate: formatDate(data.endDate),
            deadline: formatDate(data.deadline),
            instructors: data.instructors || []
          });
        } else {
          dispatch(addToast({ type: 'error', message: 'التدريب غير موجود' }));
          navigate('/admin/trainings');
        }
      } catch (error) {
        logger.error("Error fetching training:", error);
        dispatch(addToast({ type: 'error', message: 'حدث خطأ أثناء تحميل البيانات' }));
      } finally {
        setLoading(false);
      }
    };

    fetchTraining();
  }, [id, isEditMode, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested location object
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value
        }
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddInstructor = () => {
    setFormData(prev => ({
      ...prev,
      instructors: [...prev.instructors, { name: '', title: '' }]
    }));
  };

  const handleInstructorChange = (index, field, value) => {
    setFormData(prev => {
      const updatedInstructors = [...prev.instructors];
      updatedInstructors[index][field] = value;
      return { ...prev, instructors: updatedInstructors };
    });
  };

  const handleRemoveInstructor = (index) => {
    setFormData(prev => ({
      ...prev,
      instructors: prev.instructors.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Explicitly pick properties to avoid sending unintended Firestore Timestamp objects back
      const dataToSave = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        details: formData.details,
        requirements: formData.requirements,
        durationText: formData.durationText,
        location: formData.location,
        seatsLimited: formData.seatsLimited,
        status: formData.status,
        instructors: formData.instructors,
        seatsTotal: parseInt(formData.seatsTotal) || 0,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        deadline: formData.deadline ? new Date(formData.deadline) : null,
        updatedAt: serverTimestamp()
      };

      if (isEditMode) {
        await updateDoc(doc(db, 'trainings', id), dataToSave);
        dispatch(addToast({ type: 'success', message: 'تم تحديث التدريب بنجاح' }));
      } else {
        dataToSave.createdAt = serverTimestamp();
        dataToSave.seatsRemaining = dataToSave.seatsTotal;
        const newDocRef = doc(collection(db, 'trainings'));
        await setDoc(newDocRef, dataToSave);
        dispatch(addToast({ type: 'success', message: 'تم إضافة التدريب بنجاح' }));
        navigate('/admin/trainings');
      }
    } catch (error) {
      logger.error("Error saving training:", error);
      dispatch(addToast({ type: 'error', message: 'حدث خطأ أثناء الحفظ' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full lg:w-10/12 mx-auto pb-24">
      <SEOHead title={isEditMode ? "تعديل تدريب | AgriVinka" : "إضافة تدريب جديد | AgriVinka"} />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/trainings')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-border-light text-gray-500 hover:text-primary transition-colors"
          >
            <MdArrowBack size={24} className="rotate-180" /> {/* Flip back arrow for RTL */}
          </button>
          <h1 className="text-2xl font-bold text-heading-dark">
            {isEditMode ? 'تعديل التدريب العملي' : 'إضافة تدريب جديد'}
          </h1>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
        >
          <MdSave size={20} />
          <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="bg-white rounded-2xl shadow-sm border border-border-light p-6">
          <h2 className="text-lg font-bold text-heading-dark mb-4 border-b pb-2">المعلومات الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">عنوان التدريب <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">وصف مختصر <span className="text-red-500">*</span></label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                required
                rows="2"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors resize-none"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">التفاصيل الكاملة</label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">المتطلبات (شروط التقديم)</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border-light p-6">
          <h2 className="text-lg font-bold text-heading-dark mb-4 border-b pb-2">الزمان والمكان</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">مدة التدريب نصياً (مثال: 8 أسابيع)</label>
              <input
                type="text"
                name="durationText"
                value={formData.durationText}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">تاريخ البدء</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">تاريخ الانتهاء</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">المحافظة</label>
              <input
                type="text"
                name="location.governorate"
                value={formData.location.governorate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">المركز / المدينة</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">العنوان بالتفصيل</label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
              />
            </div>

          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border-light p-6">
          <h2 className="text-lg font-bold text-heading-dark mb-4 border-b pb-2">التسجيل والإعدادات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">حالة التدريب</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
              >
                <option value="draft">مسودة (مخفي)</option>
                <option value="open">مفتوح للتقديم</option>
                <option value="closed">مغلق</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">آخر موعد للتقديم</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer h-[50px]">
              <input
                type="checkbox"
                name="seatsLimited"
                checked={formData.seatsLimited}
                onChange={handleChange}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm font-bold text-gray-700">محدود المقاعد</span>
            </label>

            {formData.seatsLimited && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">إجمالي عدد المقاعد المتاحة</label>
                <input
                  type="number"
                  name="seatsTotal"
                  value={formData.seatsTotal}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors"
                />
              </div>
            )}

          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border-light p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-heading-dark">المدربين والمشرفين</h2>
            <button
              type="button"
              onClick={handleAddInstructor}
              className="flex items-center gap-2 text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold"
            >
              <FaPlus size={12} />
              إضافة مدرب
            </button>
          </div>

          <div className="space-y-4">
            {formData.instructors.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">لم يتم إضافة مدربين بعد.</p>
            ) : (
              formData.instructors.map((inst, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-gray-500">اسم المدرب</label>
                    <input
                      type="text"
                      value={inst.name}
                      onChange={(e) => handleInstructorChange(index, 'name', e.target.value)}
                      placeholder="د. محمد أحمد"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white text-sm"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-gray-500">المسمى الوظيفي</label>
                    <input
                      type="text"
                      value={inst.title}
                      onChange={(e) => handleInstructorChange(index, 'title', e.target.value)}
                      placeholder="استشاري زراعي"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstructor(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-6"
                    title="حذف المدرب"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </form>
    </div>
  );
};

export default AdminTrainingEdit;
