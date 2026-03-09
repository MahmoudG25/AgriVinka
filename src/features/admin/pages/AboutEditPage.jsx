import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logger } from '../../../utils/logger';
import { addToast } from '../../../app/store/slices/uiSlice';
import { MdSave, MdAdd, MdDelete, MdDragIndicator } from 'react-icons/md';
import { aboutService, defaultAboutData } from '../../../services/firestore/aboutService';
import MediaUploader from '../components/MediaUploader';

const AboutEditPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [formData, setFormData] = useState(defaultAboutData);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await aboutService.getAboutPage();
        setFormData(prev => ({
          ...prev,
          ...data,
          hero: {
            ...prev.hero,
            ...(data.hero || {}),
            initiatives: Array.isArray(data.hero?.initiatives) ? data.hero.initiatives : []
          },
          quote: { ...prev.quote, ...(data.quote || {}) },
          story: { ...prev.story, ...(data.story || {}) }
        }));
      } catch (err) {
        logger.error('Failed to load about page:', err);
        dispatch(addToast({ type: 'error', message: 'فشل تحميل البيانات' }));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [dispatch]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleInitiativeChange = (index, field, value) => {
    const newInitiatives = [...(formData.hero.initiatives || [])];
    newInitiatives[index] = { ...newInitiatives[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      hero: { ...prev.hero, initiatives: newInitiatives }
    }));
  };

  const addInitiative = () => {
    setFormData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        initiatives: [
          ...(prev.hero.initiatives || []),
          { id: Date.now(), icon: 'stars', title: '', description: '' }
        ]
      }
    }));
  };

  const removeInitiative = (index) => {
    const newInitiatives = [...(formData.hero.initiatives || [])];
    newInitiatives.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      hero: { ...prev.hero, initiatives: newInitiatives }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await aboutService.updateAboutPage(formData);
      dispatch(addToast({ type: 'success', message: 'تم تحديث صفحة من نحن بنجاح' }));
    } catch (err) {
      console.error(err);
      dispatch(addToast({ type: 'error', message: 'فشل حفظ التغييرات' }));
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;

  const tabs = [
    { id: 'hero', label: 'القسم الرئيسي (Hero)' },
    { id: 'initiatives', label: 'المبادرات (Initiatives)' },
    { id: 'quote', label: 'الاقتباس (Quote)' },
    { id: 'story', label: 'قصتنا (Story)' }
  ];

  return (
    <div className="p-6  mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تعديل صفحة "من نحن"</h1>
        <button
          onClick={handleSubmit}
          className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <MdSave size={20} /> حفظ التغييرات
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id
              ? 'bg-primary text-white font-bold'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-border-light p-6 min-h-[500px]">

        {/* HERO TAB */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">العنوان الرئيسي</label>
                  <input
                    type="text"
                    value={formData.hero.title}
                    onChange={e => handleChange('hero', 'title', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الوصف</label>
                  <textarea
                    value={formData.hero.description}
                    onChange={e => handleChange('hero', 'description', e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الصورة الرئيسية (3D Card)</label>
                <MediaUploader
                  onUploadComplete={(data) => handleChange('hero', 'image', data ? data.url : '')}
                  currentUrl={formData.hero.image}
                  folder="shams-elarab/about"
                  label="يفضل صورة طولية عالية الجودة"
                />
              </div>
            </div>
          </div>
        )}

        {/* INITIATIVES TAB */}
        {activeTab === 'initiatives' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div>
                <h3 className="font-bold text-gray-700">قائمة المبادرات</h3>
                <p className="text-xs text-gray-500">تظهر على يسار القسم الرئيسي</p>
              </div>
              <button
                type="button"
                onClick={addInitiative}
                className="text-primary flex items-center gap-1 font-bold text-sm bg-white border border-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition-colors"
              >
                <MdAdd /> إضافة مبادرة
              </button>
            </div>

            {formData.hero.initiatives?.map((item, index) => (
              <div key={item.id || index} className="border p-4 rounded-xl bg-gray-50 relative group">
                <button
                  type="button"
                  onClick={() => removeInitiative(index)}
                  className="absolute top-2 left-2 text-red-400 hover:text-red-500 bg-white p-1 rounded-full shadow-sm"
                >
                  <MdDelete />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-1 flex items-center justify-center">
                    <span className="text-gray-300 font-bold text-lg">#{index + 1}</span>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">الأيقونة</label>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-gray-400">{item.icon}</span>
                      <input
                        type="text"
                        value={item.icon}
                        onChange={e => handleInitiativeChange(index, 'icon', e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="icon_name"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 mb-1">العنوان</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={e => handleInitiativeChange(index, 'title', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-gray-500 mb-1">الوصف المختصر</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => handleInitiativeChange(index, 'description', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QUOTE TAB */}
        {activeTab === 'quote' && (
          <div className=" mx-auto space-y-6 text-center">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">نص الاقتباس</label>
              <textarea
                value={formData.quote.text}
                onChange={e => handleChange('quote', 'text', e.target.value)}
                rows={3}
                className="w-full p-4 border rounded-xl text-center text-lg font-serif"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">صاحب الاقتباس / التوقيع</label>
              <input
                type="text"
                value={formData.quote.author}
                onChange={e => handleChange('quote', 'author', e.target.value)}
                className="w-full p-2 border rounded-lg text-center"
              />
            </div>
          </div>
        )}

        {/* STORY TAB */}
        {activeTab === 'story' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">عنوان القصة</label>
                  <input
                    type="text"
                    value={formData.story.title}
                    onChange={e => handleChange('story', 'title', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">محتوى القصة</label>
                  <textarea
                    value={formData.story.content}
                    onChange={e => handleChange('story', 'content', e.target.value)}
                    rows={8}
                    className="w-full p-2 border rounded-lg whitespace-pre-line"
                  />
                  <p className="text-xs text-gray-500 mt-1">يتم حفظ تنسيق الفقرات تلقائياً</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الصورة الأولى (كبيرة)</label>
                  <MediaUploader
                    onUploadComplete={(data) => handleChange('story', 'image1', data ? data.url : '')}
                    currentUrl={formData.story.image1}
                    folder="shams-elarab/about"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الصورة الثانية (صغيرة متداخلة)</label>
                  <MediaUploader
                    onUploadComplete={(data) => handleChange('story', 'image2', data ? data.url : '')}
                    currentUrl={formData.story.image2}
                    folder="shams-elarab/about"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

export default AboutEditPage;
