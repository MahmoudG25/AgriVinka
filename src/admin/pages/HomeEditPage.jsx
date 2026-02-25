import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logger } from '../../utils/logger';
import { addToast } from '../../store/slices/uiSlice';
import { MdSave, MdAdd, MdDelete, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { pageService } from '../../services/pageService';
import MediaUploader from '../components/MediaUploader';
import { v4 as uuidv4 } from 'uuid';
import { defaultRoadmapData, defaultSteps } from '../../components/home/Roadmap';

const HomeEditPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [formData, setFormData] = useState({
    hero: { title: '', subtitle: '', ctaText: '', ctaLink: '/paths', stats: [], bgImage: '', images: [], badge: '', videoUrl: '' }, // Added badge & videoUrl
    partners: [],
    mission: { title: '', description: '', features: [] },
    diagnosis: { title: '', subtitle: '', items: [] }, // NEW: Problem Agitation
    tracks: { title: '', subtitle: '', items: [] },
    trackFeatures: [],
    roadmap: { title: '', subtitle: '', steps: [] }, // NEW: Journey
    testimonials: [],
    faq: [],
    pricing: { title: 'Pricing', subtitle: 'Choose your plan', plans: [] },
    about: { title: '', content: '', image1: '', image2: '' }, // NEW: About Preview
    ctaFinal: { title: '', subtitle: '', buttonText: '', images: [] }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await pageService.getPageData('home');

        if (data) {
          setFormData(prev => {
            const updatedData = {
              ...prev,
              ...data,
              hero: { ...prev.hero, ...(data.hero || {}), stats: (data.hero?.stats && Array.isArray(data.hero.stats)) ? data.hero.stats : [], images: data.hero?.images || [] },
              partners: Array.isArray(data.partners) ? data.partners : [],
              mission: { ...prev.mission, ...(data.mission || {}), features: (data.mission?.features && Array.isArray(data.mission.features)) ? data.mission.features : [] },
              diagnosis: { ...prev.diagnosis, ...(data.diagnosis || {}), items: (data.diagnosis?.items && Array.isArray(data.diagnosis.items)) ? data.diagnosis.items : [] },
              testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
              faq: Array.isArray(data.faq) ? data.faq : [],
              pricing: { ...prev.pricing, ...(data.pricing || {}), plans: Array.isArray(data.pricing?.plans) ? data.pricing.plans : [] },
              about: { ...prev.about, ...(data.about || {}) },
              ctaFinal: { ...prev.ctaFinal, ...(data.ctaFinal || {}), images: (data.ctaFinal?.images && Array.isArray(data.ctaFinal.images)) ? data.ctaFinal.images : [] }
            };

            // Check and initialize roadmap if missing
            if (!updatedData.roadmap || Object.keys(updatedData.roadmap).length === 0 || !updatedData.roadmap.steps || updatedData.roadmap.steps.length === 0) {
              updatedData.roadmap = {
                ...defaultRoadmapData,
                steps: defaultSteps.map(step => ({ ...step, id: step.id || uuidv4() })) // Ensure IDs for default steps
              };
            } else {
              // If roadmap exists, ensure steps format
              updatedData.roadmap = {
                ...updatedData.roadmap,
                steps: (updatedData.roadmap.steps && Array.isArray(updatedData.roadmap.steps)) ? updatedData.roadmap.steps : []
              };
            }

            return updatedData;
          });
        } else {
          // No data found in DB, initialize with defaults
          setFormData(prev => ({
            ...prev,
            roadmap: {
              ...defaultRoadmapData,
              steps: defaultSteps.map(step => ({ ...step, id: step.id || uuidv4() }))
            }
          }));
        }
      } catch (error) {
        logger.error('Error fetching home data:', error);
        dispatch(addToast({ type: 'error', message: 'فشل تحميل البيانات' }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pageService.updatePageData('home', formData);
      dispatch(addToast({ type: 'success', message: 'تم تحديث الصفحة الرئيسية بنجاح' }));
    } catch (error) {
      logger.error('Error updating home page:', error);
      dispatch(addToast({ type: 'error', message: 'فشل حفظ التغييرات' }));
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers for Arrays (Testimonials, FAQ, Partners, Plans) ---
  const addItem = (section, template) => {
    // Handle nested arrays (like pricing.plans) vs top-level arrays
    if (section.includes('.')) {
      const [parent, child] = section.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: [...(prev[parent][child] || []), { id: uuidv4(), ...template }]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: [...(prev[section] || []), { id: uuidv4(), ...template }]
      }));
    }
  };

  const updateItem = (section, id, field, value) => {
    if (section.includes('.')) {
      const [parent, child] = section.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: prev[parent][child].map(item => item.id === id ? { ...item, [field]: value } : item)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].map(item => item.id === id ? { ...item, [field]: value } : item)
      }));
    }
  };

  const removeItem = (section, id) => {
    if (section.includes('.')) {
      const [parent, child] = section.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: prev[parent][child].filter(item => item.id !== id)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].filter(item => item.id !== id)
      }));
    }
  };

  if (loading) return <div>Loading...</div>;

  const tabs = [
    { id: 'hero', label: 'الرئيسية (Hero)' },
    { id: 'partners', label: 'الشركاء' },
    { id: 'diagnosis', label: 'المشكلة (Diagnosis)' }, // New
    { id: 'tracks', label: 'المسارات (Tracks)' },
    { id: 'roadmap', label: 'الرحلة (Roadmap)' }, // New
    { id: 'testimonials', label: 'آراء العملاء' },
    { id: 'faq', label: 'الأسئلة الشائعة' },
    { id: 'pricing', label: 'الأسعار' },
    { id: 'about', label: 'من نحن (About)' },
    { id: 'cta', label: 'الخاتمة (CTA)' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading-dark">إدارة الصفحة الرئيسية</h1>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-heading-dark font-bold px-6 py-3 rounded-xl hover:bg-accent shadow-lg shadow-primary/20 transition-all"
        >
          <MdSave size={20} />
          <span>حفظ التغييرات</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light min-h-[400px]">

        {/* HERO SECTION */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg mb-4">القسم الرئيسي (Hero)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <MediaUploader
                  label="صورة الخلفية (Cover)"
                  currentUrl={formData.hero?.bgImage}
                  folder="Namaa-Academy/home"
                  onUploadComplete={(data) => handleChange('hero', 'bgImage', data ? data.url : '')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الشارة (Badge)</label>
                <input
                  type="text"
                  value={formData.hero?.badge || ''}
                  onChange={e => handleChange('hero', 'badge', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                  placeholder="مثال: 🚀 الاستثمار الأفضل لمستقبلك"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">العنوان الرئيسي</label>
                <input
                  type="text"
                  value={formData.hero?.title || ''}
                  onChange={e => handleChange('hero', 'title', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">العنوان الفرعي</label>
                <textarea
                  value={formData.hero?.subtitle || ''}
                  onChange={e => handleChange('hero', 'subtitle', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نص الزر (CTA)</label>
                <input
                  type="text"
                  value={formData.hero?.ctaText || ''}
                  onChange={e => handleChange('hero', 'ctaText', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رابط الزر</label>
                <input
                  type="text"
                  value={formData.hero?.ctaLink || ''}
                  onChange={e => handleChange('hero', 'ctaLink', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">رابط الفيديو (Video URL - YouTube/Vimeo)</label>
                <div className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={formData.hero?.videoUrl || ''}
                    onChange={e => handleChange('hero', 'videoUrl', e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-200"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="mt-2">
                  <MediaUploader
                    label="أو قم برفع فيديو (Cloudinary)"
                    currentUrl={formData.hero?.videoUrl}
                    folder="Namaa-Academy/home/videos"
                    accept={{ 'video/*': [] }}
                    maxSize={104857600} // 100MB
                    onUploadComplete={(data) => {
                      if (data) handleChange('hero', 'videoUrl', data.url);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">يمكنك رفع ملف فيديو (MP4, WebM) مباشرة حتى 100MB.</p>
                </div>
              </div>

              {/* Hero Slider Images Management */}
              <div className="md:col-span-2 space-y-4 mt-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold">صور المعرض (Slider Images)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = [...(formData.hero?.images || []), ''];
                      handleChange('hero', 'images', newImages);
                    }}
                    className="text-primary flex items-center gap-1 font-bold text-sm"
                  >
                    <MdAdd size={20} /> إضافة صورة
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(formData.hero?.images || []).map((imgUrl, index) => (
                    <div key={index} className="relative group border rounded-xl p-2 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.hero.images.filter((_, i) => i !== index);
                          handleChange('hero', 'images', newImages);
                        }}
                        className="absolute top-1 left-1 text-red-500 bg-white rounded-full p-1 shadow-sm z-10"
                      >
                        <MdDelete size={16} />
                      </button>
                      <MediaUploader
                        label={`صورة ${index + 1}`}
                        currentUrl={imgUrl}
                        folder="Namaa-Academy/home"
                        onUploadComplete={(data) => {
                          if (data) {
                            const newImages = [...formData.hero.images];
                            newImages[index] = data.url;
                            handleChange('hero', 'images', newImages);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PARTNERS SECTION */}
        {activeTab === 'partners' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">شركاء النجاح</h3>
              <button
                type="button"
                onClick={() => addItem('partners', { name: '', logo: '' })}
                className="text-primary flex items-center gap-1 font-bold text-sm"
              >
                <MdAdd size={20} /> إضافة شريك
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formData.partners?.map((item) => (
                <div key={item.id} className="border border-border-light rounded-xl p-4 bg-gray-50 relative group shadow-sm">
                  <button
                    type="button"
                    onClick={() => removeItem('partners', item.id)}
                    className="absolute top-2 left-2 text-red-400 hover:text-red-500 bg-white rounded-full p-1 shadow-md z-10"
                  >
                    <MdDelete size={18} />
                  </button>

                  <div className="space-y-4">
                    <MediaUploader
                      label="شعار الشريك"
                      currentUrl={item.logo}
                      folder="Namaa-Academy/home"
                      onUploadComplete={(data) => updateItem('partners', item.id, 'logo', data ? data.url : '')}
                    />
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">اسم الشريك</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => updateItem('partners', item.id, 'name', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200 text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIAGNOSIS SECTION (NEW) */}
        {activeTab === 'diagnosis' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">المشكلة (Pain Points)</h3>
              <button
                type="button"
                onClick={() => addItem('diagnosis.items', { title: '', desc: '', emoji: '⚠️' })}
                className="text-primary flex items-center gap-1 font-bold text-sm"
              >
                <MdAdd size={20} /> إضافة مشكلة
              </button>
            </div>

            <div className="space-y-4">
              {formData.diagnosis?.items?.map((item) => (
                <div key={item.id} className="border border-border-light rounded-xl p-4 bg-gray-50 relative">
                  <button
                    type="button"
                    onClick={() => removeItem('diagnosis.items', item.id)}
                    className="absolute top-2 left-2 text-red-400 hover:text-red-500"
                  >
                    <MdDelete size={20} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الرمز (Emoji)</label>
                      <input
                        type="text"
                        value={item.emoji}
                        onChange={e => updateItem('diagnosis.items', item.id, 'emoji', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200 text-center text-2xl"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1">عنوان المشكلة</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={e => updateItem('diagnosis.items', item.id, 'title', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-gray-500 mb-1">الوصف</label>
                      <textarea
                        value={item.desc}
                        onChange={e => updateItem('diagnosis.items', item.id, 'desc', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRACKS SECTION */}
        {activeTab === 'tracks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">المسارات التعليمية</h3>
              <button
                type="button"
                onClick={() => addItem('tracks', { title: '', category: 'All', tag: '', from: '', to: '', image: '' })}
                className="text-primary flex items-center gap-1 font-bold text-sm"
              >
                <MdAdd size={20} /> إضافة مسار
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">عنوان القسم</label>
                <input
                  type="text"
                  value={formData.tracks?.title || ''}
                  onChange={e => handleChange('tracks', 'title', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                />
              </div>

              {/* Track Items */}
              {formData.tracks?.items?.map((item) => (
                <div key={item.id} className="border border-border-light rounded-xl p-4 bg-gray-50 relative group">
                  <button
                    type="button"
                    onClick={() => removeItem('tracks.items', item.id)}
                    className="absolute top-2 left-2 text-red-400 hover:text-red-500 bg-white rounded-full p-1 shadow-md z-10"
                  >
                    <MdDelete size={18} />
                  </button>

                  <div className="space-y-4">
                    <MediaUploader
                      label="صورة المسار"
                      currentUrl={item.image}
                      folder="Namaa-Academy/home"
                      onUploadComplete={(data) => updateItem('tracks.items', item.id, 'image', data ? data.url : '')}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">العنوان</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={e => updateItem('tracks.items', item.id, 'title', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">التصنيف (Category)</label>
                        <input
                          type="text"
                          value={item.category}
                          onChange={e => updateItem('tracks.items', item.id, 'category', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">من (From)</label>
                        <input
                          type="text"
                          value={item.from}
                          onChange={e => updateItem('tracks.items', item.id, 'from', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">إلى (To)</label>
                        <input
                          type="text"
                          value={item.to}
                          onChange={e => updateItem('tracks.items', item.id, 'to', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">العلامة (Tag)</label>
                        <input
                          type="text"
                          value={item.tag}
                          onChange={e => updateItem('tracks.items', item.id, 'tag', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROADMAP SECTION (NEW) */}
        {activeTab === 'roadmap' && (
          <div className="space-y-8">

            {/* Main Header Config */}
            <div className="border p-4 rounded-xl bg-gray-50 mb-6">
              <h4 className="font-bold mb-4 text-primary">إعدادات القسم (Header)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">العنوان الرئيسي</label>
                  <input
                    type="text"
                    value={formData.roadmap?.title || ''}
                    onChange={e => handleChange('roadmap', 'title', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">العنوان الفرعي (Gradient)</label>
                  <input
                    type="text"
                    value={formData.roadmap?.subtitle || ''}
                    onChange={e => handleChange('roadmap', 'subtitle', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">الوصف</label>
                  <textarea
                    value={formData.roadmap?.description || ''}
                    onChange={e => handleChange('roadmap', 'description', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">عدد الطلاب (Social Proof)</label>
                  <input
                    type="text"
                    value={formData.roadmap?.studentCount || '+1.2k'}
                    onChange={e => handleChange('roadmap', 'studentCount', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Steps Config */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">خطوات الرحلة (Journey Steps)</h3>
              <button
                type="button"
                onClick={() => addItem('roadmap.steps', {
                  stepNumber: '00',
                  title: '',
                  subtitle: '',
                  description: '',
                  icon: 'check_circle',
                  duration: '4 أسابيع',
                  outcome: 'مهارة جديدة',
                  income: 'زيادة الدخل',
                  emotional: 'شعور بالإنجاز',
                  progress: 20,
                  color: 'from-blue-500 to-blue-700'
                })}
                className="text-primary flex items-center gap-1 font-bold text-sm bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20"
              >
                <MdAdd size={20} /> إضافة خطوة
              </button>
            </div>

            <div className="space-y-6">
              {formData.roadmap?.steps?.map((item, index) => (
                <div key={item.id} className="border border-border-light rounded-xl p-6 bg-white shadow-sm relative group">
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">Step {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('roadmap.steps', item.id)}
                      className="text-red-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">

                    {/* Basic Info */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">رقم الخطوة</label>
                      <input
                        type="text"
                        value={item.stepNumber}
                        onChange={e => updateItem('roadmap.steps', item.id, 'stepNumber', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200 font-mono text-center"
                        placeholder="01"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">العنوان</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={e => updateItem('roadmap.steps', item.id, 'title', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200"
                        placeholder="تأسيس قوي"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">العنوان الفرعي</label>
                      <input
                        type="text"
                        value={item.subtitle}
                        onChange={e => updateItem('roadmap.steps', item.id, 'subtitle', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200"
                        placeholder="البداية الصحيحة"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-12">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">الوصف</label>
                      <textarea
                        value={item.description}
                        onChange={e => updateItem('roadmap.steps', item.id, 'description', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200"
                        rows={2}
                      />
                    </div>

                    {/* Psychological Props */}
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">المدة (Duration)</label>
                      <input
                        type="text"
                        value={item.duration}
                        onChange={e => updateItem('roadmap.steps', item.id, 'duration', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200 text-sm"
                        placeholder="4 أسابيع"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">النتيجة (Outcome)</label>
                      <input
                        type="text"
                        value={item.outcome}
                        onChange={e => updateItem('roadmap.steps', item.id, 'outcome', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200 text-sm"
                        placeholder="بناء موقع كامل"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">الدخل المتوقع (Income)</label>
                      <input
                        type="text"
                        value={item.income}
                        onChange={e => updateItem('roadmap.steps', item.id, 'income', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200 text-sm"
                        placeholder="بداية الطريق"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">نسبة الإنجاز (Progress %)</label>
                      <input
                        type="number"
                        value={item.progress}
                        onChange={e => updateItem('roadmap.steps', item.id, 'progress', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200 text-sm"
                        placeholder="20"
                      />
                    </div>

                    <div className="md:col-span-12">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">الرسالة العاطفية (Emotional Copy)</label>
                      <input
                        type="text"
                        value={item.emotional}
                        onChange={e => updateItem('roadmap.steps', item.id, 'emotional', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200 border-l-4 border-l-accent bg-amber-50"
                        placeholder="ستشعر لأول مرة أنك مبرمج حقيقي..."
                      />
                    </div>

                    {/* Visuals */}
                    <div className="md:col-span-6">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">الأيقونة (Material Symbol)</label>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-2xl text-gray-400 bg-gray-100 p-1 rounded">{item.icon || 'star'}</span>
                        <input
                          type="text"
                          value={item.icon}
                          onChange={e => updateItem('roadmap.steps', item.id, 'icon', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-6">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">اللون (Tailwind Gradient)</label>
                      <input
                        type="text"
                        value={item.color}
                        onChange={e => updateItem('roadmap.steps', item.id, 'color', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200 text-xs font-mono text-gray-500"
                        placeholder="from-blue-500 to-blue-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Anchor Config */}
            <div className="border p-6 rounded-xl bg-gray-900/5 mt-8 border-gray-200">
              <h4 className="font-bold mb-4 text-heading-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">emoji_events</span>
                بطاقة التحول النهائي (Final Anchor)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">عنوان البطاقة</label>
                  <input
                    type="text"
                    value={formData.roadmap?.finalTitle || ''}
                    onChange={e => handleChange('roadmap', 'finalTitle', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                    placeholder="من الصفر إلى أول دولار"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">رقم الدخل (Visual)</label>
                  <input
                    type="text"
                    value={formData.roadmap?.finalIncome || ''}
                    onChange={e => handleChange('roadmap', 'finalIncome', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                    placeholder="$1,250.00"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">وصف البطاقة</label>
                  <textarea
                    value={formData.roadmap?.finalDesc || ''}
                    onChange={e => handleChange('roadmap', 'finalDesc', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                    rows={2}
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TESTIMONIALS SECTION */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">آراء العملاء</h3>
              <button
                type="button"
                onClick={() => addItem('testimonials', { name: '', role: '', content: '', image: '' })}
                className="
text-primary 
flex items-center gap-2 
font-semibold text-sm 
px-3 py-1.5 
rounded-full 
transition-all duration-300 
hover:text-primary/80 
hover:scale-105 
hover:bg-gray-100 cursor-pointer
"
              >
                <MdAdd size={20} /> إضافة رأي
              </button>
            </div>

            <div className="space-y-4">
              {formData.testimonials?.map((item, idx) => (
                <div key={item.id} className="border border-border-light rounded-xl p-4 bg-gray-50 relative group">
                  <button
                    type="button"
                    onClick={() => removeItem('testimonials', item.id)}
                    className="absolute top-4 left-4 text-red-400 hover:text-red-500"
                  >
                    <MdDelete size={20} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الاسم</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => updateItem('testimonials', item.id, 'name', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الوظيفة</label>
                      <input
                        type="text"
                        value={item.role}
                        onChange={e => updateItem('testimonials', item.id, 'role', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1">الرأي</label>
                      <textarea
                        value={item.content}
                        onChange={e => updateItem('testimonials', item.id, 'content', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200"
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <MediaUploader
                        label="صورة العميل (اختياري)"
                        currentUrl={item.image}
                        folder="Namaa-Academy/home"
                        onUploadComplete={(data) => updateItem('testimonials', item.id, 'image', data ? data.secure_url : '')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ SECTION */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">الأسئلة الشائعة</h3>
              <button
                type="button"
                onClick={() => addItem('faq', { question: '', answer: '' })}
                className="text-primary flex items-center gap-1 font-bold text-sm"
              >
                <MdAdd size={20} /> إضافة سؤال
              </button>
            </div>

            <div className="space-y-4">
              {formData.faq?.map((item, idx) => (
                <div key={item.id} className="border border-border-light rounded-xl p-4 bg-gray-50 relative">
                  <button
                    type="button"
                    onClick={() => removeItem('faq', item.id)}
                    className="absolute top-4 left-4 text-red-400 hover:text-red-500"
                  >
                    <MdDelete size={20} />
                  </button>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">السؤال</label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={e => updateItem('faq', item.id, 'question', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الإجابة</label>
                      <textarea
                        value={item.answer}
                        onChange={e => updateItem('faq', item.id, 'answer', e.target.value)}
                        className="w-full p-2 rounded border border-gray-200"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRICING SECTION */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">عنوان القسم</label>
                <input
                  type="text"
                  value={formData.pricing?.title || ''}
                  onChange={e => handleChange('pricing', 'title', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف الفرعي</label>
                <input
                  type="text"
                  value={formData.pricing?.subtitle || ''}
                  onChange={e => handleChange('pricing', 'subtitle', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نص الزر (CTA)</label>
                <input
                  type="text"
                  value={formData.pricing?.cta || ''}
                  onChange={e => handleChange('pricing', 'cta', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نص تحت الزر</label>
                <input
                  type="text"
                  value={formData.pricing?.cta_sub || ''}
                  onChange={e => handleChange('pricing', 'cta_sub', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 mb-4">
              <h3 className="font-bold text-lg">الخطط (Plans)</h3>
              <button
                type="button"
                onClick={() => addItem('pricing.plans', { title: '', price: '', period: '/monthly', features: [], highlight: false })}
                className="text-primary flex items-center gap-1 font-bold text-sm"
              >
                <MdAdd size={20} /> إضافة خطة
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {formData.pricing?.plans?.map((plan) => (
                <div key={plan.id} className={`border rounded-xl p-4 relative group ${plan.highlight ? 'border-primary bg-primary/5' : 'border-border-light bg-gray-50'}`}>
                  <button
                    type="button"
                    onClick={() => removeItem('pricing.plans', plan.id)}
                    className="absolute top-2 left-2 text-red-400 hover:text-red-500 bg-white rounded-full p-1 shadow-md z-10"
                  >
                    <MdDelete size={18} />
                  </button>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={plan.highlight || false}
                        onChange={e => updateItem('pricing.plans', plan.id, 'highlight', e.target.checked)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <label className="text-sm font-bold text-primary">تميز هذه الخطة (Highlight)</label>
                    </div>

                    <MediaUploader
                      label="صورة الخطة"
                      currentUrl={plan.image}
                      folder="Namaa-Academy/home"
                      onUploadComplete={(data) => updateItem('pricing.plans', plan.id, 'image', data ? data.secure_url : '')}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">اسم الخطة</label>
                        <input
                          type="text"
                          value={plan.title}
                          onChange={e => updateItem('pricing.plans', plan.id, 'title', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">السعر</label>
                        <input
                          type="text"
                          value={plan.price}
                          onChange={e => updateItem('pricing.plans', plan.id, 'price', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">السعر الأصلي (للخصم)</label>
                        <input
                          type="text"
                          value={plan.originalPrice}
                          onChange={e => updateItem('pricing.plans', plan.id, 'originalPrice', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                          placeholder="مثال: 5000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">الفترة (Period)</label>
                        <input
                          type="text"
                          value={plan.period}
                          onChange={e => updateItem('pricing.plans', plan.id, 'period', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">الشارة (Badge)</label>
                        <input
                          type="text"
                          value={plan.badge}
                          onChange={e => updateItem('pricing.plans', plan.id, 'badge', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">الوصف المختصر</label>
                        <input
                          type="text"
                          value={plan.subtitle}
                          onChange={e => updateItem('pricing.plans', plan.id, 'subtitle', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">الوصف الكامل</label>
                        <textarea
                          value={plan.description}
                          onChange={e => updateItem('pricing.plans', plan.id, 'description', e.target.value)}
                          className="w-full p-2 rounded border border-gray-200"
                          rows={2}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">الميزات (كل ميزة في سطر)</label>
                        <textarea
                          value={Array.isArray(plan.features) ? plan.features.join('\n') : plan.features}
                          onChange={e => updateItem('pricing.plans', plan.id, 'features', e.target.value.split('\n'))}
                          className="w-full p-2 rounded border border-gray-200"
                          rows={4}
                          placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FINAL CTA SECTION */}
        {activeTab === 'cta' && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg mb-4">الخاتمة (Call To Action)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">العنوان</label>
                <input
                  type="text"
                  value={formData.ctaFinal?.title || ''}
                  onChange={e => handleChange('ctaFinal', 'title', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <input
                  type="text"
                  value={formData.ctaFinal?.subtitle || ''}
                  onChange={e => handleChange('ctaFinal', 'subtitle', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نص الزر</label>
                <input
                  type="text"
                  value={formData.ctaFinal?.buttonText || ''}
                  onChange={e => handleChange('ctaFinal', 'buttonText', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                />
              </div>

              {/* CTA Background Images Management */}
              <div className="md:col-span-2 space-y-4 mt-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold">صور الخلفية (Background Slider)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = [...(formData.ctaFinal?.images || []), ''];
                      handleChange('ctaFinal', 'images', newImages);
                    }}
                    className="
                      text-primary 
                      flex items-center gap-2 
                      font-semibold text-sm 
                      px-3 py-1.5 
                      rounded-full 
                      transition-all duration-300 
                      hover:text-primary/80 
                      hover:scale-105 
                      hover:bg-gray-100 cursor-pointer
                    "
                  >
                    <MdAdd size={20} /> إضافة صورة
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(formData.ctaFinal?.images || []).map((imgUrl, index) => (
                    <div key={index} className="relative group border rounded-xl p-2 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.ctaFinal.images.filter((_, i) => i !== index);
                          handleChange('ctaFinal', 'images', newImages);
                        }}
                        className="absolute top-1 left-1 text-red-500 bg-white rounded-full p-1 shadow-sm z-10"
                      >
                        <MdDelete size={16} />
                      </button>
                      <MediaUploader
                        label={`صورة ${index + 1}`}
                        currentUrl={imgUrl}
                        folder="Namaa-Academy/home"
                        onUploadComplete={(data) => {
                          if (data) {
                            const newImages = [...formData.ctaFinal.images];
                            newImages[index] = data.secure_url;
                            handleChange('ctaFinal', 'images', newImages);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ABOUT SECTION */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg mb-4">من نحن (About Preview)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">العنوان</label>
                <input
                  type="text"
                  value={formData.about?.title || ''}
                  onChange={e => handleChange('about', 'title', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200"
                  placeholder="قصة أكاديمية نماء"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">المحتوى (القصة)</label>
                <textarea
                  value={formData.about?.content || ''}
                  onChange={e => handleChange('about', 'content', e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 h-40"
                  placeholder="اكتب القصة هنا..."
                />
              </div>

              <div className="border p-4 rounded-xl bg-gray-50 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-sm mb-2">الصورة الكبيرة (الخلفية)</h4>
                  <MediaUploader
                    label="صورة الفريق (Image 1)"
                    currentUrl={formData.about?.image1}
                    folder="Namaa-Academy/home"
                    onUploadComplete={(data) => handleChange('about', 'image1', data ? data.secure_url : '')}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-2">الصورة الصغيرة (الأمامية)</h4>
                  <MediaUploader
                    label="صورة الثقافة (Image 2)"
                    currentUrl={formData.about?.image2}
                    folder="Namaa-Academy/home"
                    onUploadComplete={(data) => handleChange('about', 'image2', data ? data.secure_url : '')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </form>
  );
};

export default HomeEditPage;
