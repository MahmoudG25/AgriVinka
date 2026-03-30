import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logger } from '../../../utils/logger';
import { addToast } from '../../../app/store/slices/uiSlice';
import MediaUploader from '../components/MediaUploader';
import { MdSave, MdArrowBack, MdAdd, MdDelete, MdDragIndicator } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';
import { courseService } from '../../../services/firestore/courseService';

const CourseEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    short_title: '',
    description: '',
    pricing: { price: 0, original_price: 0, discount_percentage: 0 },
    media: { thumbnail: null, preview_video: null },
    instructor: { name: '', title: '', bio: '', image: null },
    sections: [],
    meta: { duration: '', level: 'Beginner', certificate: true },
    seo: { slug: '', metaTitle: '', metaDescription: '', keywords: '' },
    isPublished: false
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchCourse = async () => {
        setLoading(true);
        try {
          const course = await courseService.getCourseWithModules(id);
          if (course) {
            setFormData(course);
          } else {
            dispatch(addToast({ type: 'error', message: 'لم يتم العثور على الدورة' }));
            navigate('/features/admin/courses');
          }
        } catch (error) {
          logger.error('Error fetching course:', error);
          dispatch(addToast({ type: 'error', message: 'فشل تحميل البيانات' }));
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [isEditMode, id, navigate, dispatch]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  // --- Curriculum Management ---
  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...(prev.sections || []), { id: uuidv4(), title: '', lessons: [] }]
    }));
  };

  const updateSection = (secId, title) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => sec.id === secId ? { ...sec, title } : sec)
    }));
  };

  const deleteSection = (secId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(sec => sec.id !== secId)
    }));
  };

  const moveSection = (index, direction) => {
    setFormData(prev => {
      const newSections = [...prev.sections];
      if (direction === 'up' && index > 0) {
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      } else if (direction === 'down' && index < newSections.length - 1) {
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      }
      return { ...prev, sections: newSections };
    });
  };

  const addLesson = (secId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: [...(sec.lessons || []), { id: uuidv4(), title: '', duration: '0:00', free_preview: false, video_url: '', description: '', resources: [] }]
          };
        }
        return sec;
      })
    }));
  };

  const updateLesson = (secId, lessonId, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: sec.lessons.map(lesson => lesson.id === lessonId ? { ...lesson, [field]: value } : lesson)
          };
        }
        return sec;
      })
    }));
  };

  const deleteLesson = (secId, lessonId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: sec.lessons.filter(l => l.id !== lessonId)
          };
        }
        return sec;
      })
    }));
  };

  const moveLesson = (secId, index, direction) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id === secId) {
          const newLessons = [...sec.lessons];
          if (direction === 'up' && index > 0) {
            [newLessons[index - 1], newLessons[index]] = [newLessons[index], newLessons[index - 1]];
          } else if (direction === 'down' && index < newLessons.length - 1) {
            [newLessons[index], newLessons[index + 1]] = [newLessons[index + 1], newLessons[index]];
          }
          return { ...sec, lessons: newLessons };
        }
        return sec;
      })
    }));
  };

  const addResource = (secId, lessonId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: sec.lessons.map(lesson => lesson.id === lessonId ? {
              ...lesson,
              resources: [...(lesson.resources || []), { id: uuidv4(), title: '', type: 'link', url: '', size: '' }]
            } : lesson)
          };
        }
        return sec;
      })
    }));
  };

  const updateResource = (secId, lessonId, resId, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: sec.lessons.map(lesson => lesson.id === lessonId ? {
              ...lesson,
              resources: (lesson.resources || []).map(res => res.id === resId ? { ...res, [field]: value } : res)
            } : lesson)
          };
        }
        return sec;
      })
    }));
  };

  const deleteResource = (secId, lessonId, resId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: sec.lessons.map(lesson => lesson.id === lessonId ? {
              ...lesson,
              resources: (lesson.resources || []).filter(res => res.id !== resId)
            } : lesson)
          };
        }
        return sec;
      })
    }));
  };

  // --- Save ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert('العنوان مطلوب');

    setLoading(true);
    try {
      await courseService.saveCourseWithModules(
        isEditMode ? id : null,
        formData,
        !isEditMode
      );
      dispatch(addToast({ type: 'success', message: isEditMode ? 'تم تحديث الدورة بنجاح' : 'تم إنشاء الدورة بنجاح' }));
      navigate('/features/admin/courses');
    } catch (error) {
      console.error("Error saving course:", error);
      dispatch(addToast({ type: 'error', message: 'فشل حفظ التغييرات' }));
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.id) return <div>Loading...</div>; // Initial load

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <MdArrowBack size={24} />
          </button>
          <h1 className="text-2xl font-bold text-heading-dark">
            {isEditMode ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
            <h3 className="font-bold text-lg mb-4">معلومات أساسية</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الدورة *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                placeholder="مثال: دورة React الشاملة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان المختصر</label>
              <input
                type="text"
                value={formData.short_title}
                onChange={e => handleChange('short_title', e.target.value)}
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

          {/* Curriculum */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">المنهج الدراسي</h3>
              <button type="button" onClick={addSection} className="text-primary font-bold text-sm flex items-center gap-1">
                <MdAdd /> إضافة قسم
              </button>
            </div>

            <div className="space-y-4">
              {formData.sections?.map((section, idx) => (
                <div key={section.id} className="border border-border-light rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-grow">
                      <span className="font-bold text-gray-400 bg-white shadow-sm w-8 h-8 rounded-full flex items-center justify-center border border-gray-100">{idx + 1}</span>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, e.target.value)}
                        className="bg-transparent font-bold flex-grow text-lg text-heading-dark focus:outline-none placeholder-gray-400"
                        placeholder="اسم القسم (مثال: أساسيات الزراعة المائية)"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="p-1.5 text-gray-400 hover:text-primary disabled:opacity-30">↑</button>
                      <button type="button" onClick={() => moveSection(idx, 'down')} disabled={idx === formData.sections.length - 1} className="p-1.5 text-gray-400 hover:text-primary disabled:opacity-30">↓</button>
                      <button type="button" onClick={() => deleteSection(section.id)} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><MdDelete size={20} /></button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 bg-white">
                    {section.lessons?.map((lesson, lIdx) => (
                      <div key={lesson.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 transition-all hover:border-primary/20 hover:shadow-sm group">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col gap-1 shrink-0 mt-1">
                            <button type="button" onClick={() => moveLesson(section.id, lIdx, 'up')} disabled={lIdx === 0} className="text-gray-400 hover:text-primary disabled:opacity-30 leading-none">▲</button>
                            <span className="text-xs text-gray-400 font-bold text-center">{lIdx + 1}</span>
                            <button type="button" onClick={() => moveLesson(section.id, lIdx, 'down')} disabled={lIdx === section.lessons.length - 1} className="text-gray-400 hover:text-primary disabled:opacity-30 leading-none">▼</button>
                          </div>

                          <div className="flex-grow space-y-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLesson(section.id, lesson.id, 'title', e.target.value)}
                                className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm flex-grow focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                                placeholder="عنوان الدرس"
                              />
                              <input
                                type="text"
                                value={lesson.duration}
                                onChange={(e) => updateLesson(section.id, lesson.id, 'duration', e.target.value)}
                                className="w-20 text-sm text-center bg-white border border-gray-200 px-2 py-2 rounded-lg focus:outline-none focus:border-primary shadow-inner dir-ltr"
                                placeholder="00:00"
                              />
                            </div>

                            <div className="w-full mt-2">
                              <textarea
                                value={lesson.description || ''}
                                onChange={(e) => updateLesson(section.id, lesson.id, 'description', e.target.value)}
                                className="w-full text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:border-primary shadow-inner custom-scrollbar"
                                placeholder="اكتب وصفاً إضافياً أو ملاحظات للدرس..."
                                rows={3}
                              />
                            </div>

                            <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-inner mt-3">
                              <MediaUploader
                                label="الدروس المشروحة (رابط فيديو أو رفع مباشر)"
                                accept={{ 'video/*': [], 'application/pdf': [] }}
                                maxSize={524288000} // 500MB
                                currentUrl={lesson.video_url}
                                folder={`Namaa-Academy/courses/lessons`}
                                onUploadComplete={(data) => updateLesson(section.id, lesson.id, 'video_url', data?.url || null)}
                              />
                            </div>

                              <div className="flex items-center gap-2 mt-3">
                                <input type="checkbox" id={`free-${lesson.id}`} checked={lesson.free_preview || false} onChange={e => updateLesson(section.id, lesson.id, 'free_preview', e.target.checked)} className="rounded text-primary focus:ring-primary h-4 w-4 border-gray-300" />
                                <label htmlFor={`free-${lesson.id}`} className="text-xs font-bold text-gray-600 cursor-pointer">معاينة مجانية (يمكن لغير المسجلين المشاهدة)</label>
                              </div>

                              {/* Resources / Attachments */}
                              <div className="mt-4 border border-gray-100 rounded-lg bg-gray-50/50 p-3">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-bold text-gray-700">المصادر والمرفقات ({lesson.resources?.length || 0})</h4>
                                  <button type="button" onClick={() => addResource(section.id, lesson.id)} className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline">
                                    <MdAdd size={14} /> إضافة مصدر
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {(lesson.resources || []).map((res, rIdx) => (
                                    <div key={res.id} className="bg-white border border-gray-200 rounded-lg p-3 relative flex flex-col gap-2">
                                      <button type="button" onClick={() => deleteResource(section.id, lesson.id, res.id)} className="absolute left-2 top-2 text-gray-400 hover:text-red-500">
                                        <MdDelete size={16} />
                                      </button>
                                      
                                      <div className="flex gap-2 w-full pr-8">
                                        <select
                                          value={res.type}
                                          onChange={(e) => updateResource(section.id, lesson.id, res.id, 'type', e.target.value)}
                                          className="text-xs border border-gray-200 rounded-md p-1.5 outline-none focus:border-primary bg-gray-50 shrink-0"
                                        >
                                          <option value="link">رابط</option>
                                          <option value="pdf">ملف (PDF/صورة)</option>
                                        </select>
                                        <input
                                          type="text"
                                          placeholder="عنوان المصدر (مثال: ملزمة الدرس)"
                                          value={res.title}
                                          onChange={(e) => updateResource(section.id, lesson.id, res.id, 'title', e.target.value)}
                                          className="flex-1 text-xs border border-gray-200 rounded-md p-1.5 outline-none focus:border-primary"
                                        />
                                      </div>
                                      
                                      <div className="flex gap-2 w-full">
                                        <input
                                          type="text"
                                          placeholder={res.type === 'link' ? "الرابط (URL)" : "رابط الملف (قم برفعه من خارج الإطار أو ضع الرابط هنا)"}
                                          value={res.url}
                                          onChange={(e) => updateResource(section.id, lesson.id, res.id, 'url', e.target.value)}
                                          className="flex-3 text-xs border border-gray-200 rounded-md p-1.5 outline-none focus:border-primary dir-ltr"
                                          style={{ flex: 3 }}
                                        />
                                        <input
                                          type="text"
                                          placeholder="الحجم (2MB)"
                                          value={res.size}
                                          onChange={(e) => updateResource(section.id, lesson.id, res.id, 'size', e.target.value)}
                                          className="flex-1 text-xs border border-gray-200 rounded-md p-1.5 outline-none focus:border-primary dir-ltr"
                                          style={{ flex: 1 }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                  {(!lesson.resources || lesson.resources.length === 0) && (
                                    <p className="text-[11px] text-gray-400 text-center py-2">لا يوجد مصادر مضافة لهذا الدرس.</p>
                                  )}
                                </div>
                              </div>
                          </div>

                          <div className="shrink-0 mt-1">
                            <button type="button" onClick={() => deleteLesson(section.id, lesson.id)} className="text-gray-300 hover:text-red-500 bg-white border border-gray-200 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm hover:border-red-200 hover:bg-red-50 transition-colors">
                              <MdDelete size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLesson(section.id)}
                      className="w-full py-3 text-sm font-bold text-gray-500 hover:text-primary hover:bg-primary/5 hover:border-primary/30 rounded-xl border-2 border-dashed border-gray-200 transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                      <MdAdd size={20} /> إضافة درس جديد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
            <h3 className="font-bold text-lg mb-4">تحسين محركات البحث (SEO)</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرابط المخصص (Slug) *</label>
              <input
                type="text"
                value={formData.seo?.slug || ''}
                onChange={e => handleNestedChange('seo', 'slug', e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none dir-ltr text-left"
                placeholder="react-course-2024"
              />
              <p className="text-xs text-gray-500 mt-1">يجب أن يكون باللغة الإنجليزية وبدون مسافات، يفضل استخدام الشرطات (-).</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان (Meta Title)</label>
              <input
                type="text"
                value={formData.seo?.metaTitle || ''}
                onChange={e => handleNestedChange('seo', 'metaTitle', e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                placeholder="عنوان يظهر في محركات البحث"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وصف (Meta Description)</label>
              <textarea
                value={formData.seo?.metaDescription || ''}
                onChange={e => handleNestedChange('seo', 'metaDescription', e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                placeholder="وصف مختصر للمحتوى يظهر في جوجل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمات مفتاحية (Keywords)</label>
              <input
                type="text"
                value={formData.seo?.keywords || ''}
                onChange={e => handleNestedChange('seo', 'keywords', e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                placeholder="مثال: دورة تصميم, UI, UX, Figma"
              />
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar inputs) */}
        <div className="space-y-8">
          {/* Media */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
            <h3 className="font-bold text-lg mb-2">الوسائط</h3>
            <MediaUploader
              label="صورة الدورة"
              currentUrl={formData.media?.thumbnail}
              folder="Namaa-Academy/courses/thumbnails"
              onUploadComplete={(data) => data ? handleNestedChange('media', 'thumbnail', data.url) : handleNestedChange('media', 'thumbnail', null)}
            />

            <div className="border-t border-gray-100 pt-4"></div>

            <MediaUploader
              label="فيديو مقدمة"
              accept={{ 'video/*': [] }}
              maxSize={524288000}
              currentUrl={formData.media?.preview_video}
              folder="Namaa-Academy/courses/preview-videos"
              onUploadComplete={(data) => data ? handleNestedChange('media', 'preview_video', data.url) : handleNestedChange('media', 'preview_video', null)}
            />
          </div>

          {/* Visibility Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
            <h3 className="font-bold text-lg mb-2">النشر والظهور</h3>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished || false}
                onChange={e => handleChange('isPublished', e.target.checked)}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="isPublished" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                نشر الدورة (Public)
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
            <h3 className="font-bold text-lg mb-2">التسعيـــر</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">السعر الحالي (ج.م)</label>
                <input
                  type="number"
                  value={formData.pricing.price}
                  onChange={e => handleNestedChange('pricing', 'price', parseFloat(e.target.value))}
                  className="w-full p-2 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">السعر الأصلي (ج.م)</label>
                <input
                  type="number"
                  value={formData.pricing.original_price}
                  onChange={e => handleNestedChange('pricing', 'original_price', parseFloat(e.target.value))}
                  className="w-full p-2 rounded-lg border border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Instructor */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
            <h3 className="font-bold text-lg mb-2">المدرب</h3>

            <input
              type="text"
              placeholder="اسم المدرب"
              value={formData.instructor?.name || ''}
              onChange={e => handleNestedChange('instructor', 'name', e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-200 mb-2"
            />
            <input
              type="text"
              placeholder="المسمى الوظيفي"
              value={formData.instructor?.title || ''}
              onChange={e => handleNestedChange('instructor', 'title', e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-200"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default CourseEditPage;
