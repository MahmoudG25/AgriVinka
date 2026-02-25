import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logger } from '../../utils/logger';
import { addToast } from '../../store/slices/uiSlice';
import DragDropList from '../components/DragDropList';
import MediaUploader from '../components/MediaUploader';
import { MdSave, MdArrowBack, MdAdd } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';
import { roadmapService } from '../../services/roadmapService';
import { courseService } from '../../services/courseService';

const RoadmapEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    modules: [], // { id, title, courseId, locked, ... }
    price: 0,
    discount: 0,
    tag: '',
    isPublished: false,
    image: '',
    instructor: { name: '', role: '', image: '' },
    outcomes: [],
    seo: { slug: '', metaTitle: '', metaDescription: '', keywords: '' }
  });

  const [selectedCourseId, setSelectedCourseId] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // Load courses for the dropdown
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);

        if (isEditMode) {
          const roadmap = await roadmapService.getRoadmapById(id);
          if (roadmap) {
            setFormData(roadmap);
          } else {
            dispatch(addToast({ type: 'error', message: 'لم يتم العثور على المسار' }));
            navigate('/admin/roadmaps');
          }
        }
      } catch (error) {
        logger.error('Error loading data:', error);
        dispatch(addToast({ type: 'error', message: 'فشل تحميل البيانات' }));
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [isEditMode, id, navigate, dispatch]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // --- Module Management ---
  const addModule = () => {
    if (!selectedCourseId) return;

    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) return;

    const newModule = {
      id: uuidv4(),
      title: course.title,
      courseId: course.id, // Link to course
      locked: true,
      description: course.description,
      image: course.image || course.media?.thumbnail || course.preview_image || '', // Copy image from course (robust check)
      level: course.level || 'Beginner',
      lessons_count: course.lessons_count || 0,
      outcomes: course.learning_points?.slice(0, 3) || [] // Default outcomes
    };

    setFormData(prev => ({
      ...prev,
      modules: [...(prev.modules || []), newModule]
    }));
    setSelectedCourseId('');
  };

  const handleReorder = (newModules) => {
    setFormData(prev => ({ ...prev, modules: newModules }));
  };

  const removeModule = (modId) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== modId)
    }));
  };

  const toggleLock = (modId) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === modId ? { ...m, locked: !m.locked } : m)
    }));
  };

  // --- Save ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert('العنوان مطلوب');

    setLoading(true);
    try {
      // Derive clean courseIds from modules for the public page
      const courseIds = (formData.modules || [])
        .map(m => m.courseId)
        .filter(Boolean);

      const dataToSave = { ...formData, courseIds };

      if (isEditMode) {
        await roadmapService.updateRoadmap(id, dataToSave);
        dispatch(addToast({ type: 'success', message: 'تم تحديث المسار بنجاح' }));
      } else {
        // Generate URL-safe slug from title if not provided in SEO
        let finalSlug = formData.seo?.slug;
        if (!finalSlug) {
          finalSlug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }

        await roadmapService.createRoadmap(dataToSave, finalSlug || undefined);
        dispatch(addToast({ type: 'success', message: 'تم إنشاء المسار بنجاح' }));
      }
      navigate('/admin/roadmaps');
    } catch (error) {
      logger.error('Error saving roadmap:', error);
      dispatch(addToast({ type: 'error', message: 'فشل حفظ التغييرات' }));
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.id) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <MdArrowBack size={24} />
          </button>
          <h1 className="text-2xl font-bold text-heading-dark">
            {isEditMode ? 'تعديل المسار' : 'إضافة مسار جديد'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-heading-dark font-bold px-6 py-3 rounded-xl hover:bg-accent shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
        >
          <MdSave size={20} />
          <span>{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
            <h3 className="font-bold text-lg mb-4">معلومات المسار</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المسار *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <textarea
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Modules */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-6">
            <h3 className="font-bold text-lg">الوحدات التعليمية (السحب للإفلات)</h3>

            {/* Add Module */}
            <div className="flex gap-4 items-end">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">إضافة دورة للمسار</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                >
                  <option value="">اختر دورة...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addModule}
                className="bg-gray-100 text-gray-700 font-bold px-4 py-3 rounded-lg hover:bg-gray-200"
              >
                <MdAdd size={20} />
              </button>
            </div>

            <DragDropList
              items={formData.modules || []}
              onReorder={handleReorder}
              onRemove={removeModule}
              onToggleLock={toggleLock}
            />
          </div>
        </div>

        <div className="space-y-8">
          {/* Instructor & Outcomes */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-6">
            <h3 className="font-bold text-lg mb-2">المدرب والمخرجات</h3>

            {/* Instructor */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <h4 className="font-bold text-sm text-gray-700">معلومات المدرب</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المدرب</label>
                <input
                  type="text"
                  value={formData.instructor?.name || ''}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    instructor: { ...prev.instructor, name: e.target.value }
                  }))}
                  className="w-full p-2 rounded-lg border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  value={formData.instructor?.role || ''}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    instructor: { ...prev.instructor, role: e.target.value }
                  }))}
                  className="w-full p-2 rounded-lg border border-gray-200"
                />
              </div>

              <MediaUploader
                label="صورة المدرب"
                currentUrl={formData.instructor?.image}
                folder="Namaa-Academy/instructors"
                onUploadComplete={(data) => setFormData(prev => ({
                  ...prev,
                  instructor: { ...prev.instructor, image: data ? data.url : '' }
                }))}
              />
            </div>

            {/* Outcomes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ماذا سيتعلم الطالب؟ (مخرجات التعلم)</label>
              <div className="space-y-2">
                {(formData.outcomes || []).map((outcome, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => {
                        const newOutcomes = [...(formData.outcomes || [])];
                        newOutcomes[index] = e.target.value;
                        setFormData(prev => ({ ...prev, outcomes: newOutcomes }));
                      }}
                      className="flex-grow p-2 rounded-lg border border-gray-200"
                      placeholder="نقطة تعلم..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOutcomes = (formData.outcomes || []).filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, outcomes: newOutcomes }));
                      }}
                      className="text-red-500 p-2 hover:bg-red-50 rounded"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, outcomes: [...(prev.outcomes || []), ''] }))}
                  className="text-primary font-bold text-sm flex items-center gap-1 mt-2 hover:underline"
                >
                  <MdAdd /> إضافة نقطة تعلم
                </button>
              </div>
            </div>

          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
            <h3 className="font-bold text-lg mb-2">الإعدادات</h3>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={e => handleChange('isPublished', e.target.checked)}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                نشر المسار (Public)
              </label>
            </div>

            <div>
              <MediaUploader
                label="صورة المسار"
                currentUrl={formData.image}
                folder="Namaa-Academy/paths"
                onUploadComplete={(data) => handleChange('image', data ? data.url : '')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
              <select
                value={formData.level}
                onChange={e => handleChange('level', e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>All Levels</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الشارة / Tag</label>
              <input
                type="text"
                value={formData.tag}
                onChange={e => handleChange('tag', e.target.value)}
                placeholder="مثال: الأكثر مبيعاً"
                className="w-full p-2 rounded-lg border border-gray-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => handleChange('price', Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الخصم</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={e => handleChange('discount', Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-gray-200"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
            <h3 className="font-bold text-lg mb-4">تحسين محركات البحث (SEO)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرابط المخصص (Slug) *</label>
                <input
                  type="text"
                  value={formData.seo?.slug || ''}
                  onChange={e => handleNestedChange('seo', 'slug', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="my-awesome-roadmap"
                />
                <p className="text-xs text-gray-400 mt-1">يُشترط استخدام حروف إنجليزية صغيرة، أرقام، وعلامة الناقص (-)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الميتا (Meta Title)</label>
                <input
                  type="text"
                  value={formData.seo?.metaTitle || ''}
                  onChange={e => handleNestedChange('seo', 'metaTitle', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="العنوان الذي يظهر في محركات البحث"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وصف الميتا (Meta Description)</label>
                <textarea
                  value={formData.seo?.metaDescription || ''}
                  onChange={e => handleNestedChange('seo', 'metaDescription', e.target.value)}
                  rows="3"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="وصف مختصر يظهر في نتائج البحث (150-160 حرف)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الكلمات المفتاحية (Keywords)</label>
                <input
                  type="text"
                  value={formData.seo?.keywords || ''}
                  onChange={e => handleNestedChange('seo', 'keywords', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="افصل بين الكلمات بفاصلة (,)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RoadmapEditPage;
