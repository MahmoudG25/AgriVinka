import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logger } from '../../../utils/logger';
import { addToast } from '../../../app/store/slices/uiSlice';
import { MdSave, MdAdd, MdDelete } from 'react-icons/md';
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
        setFormData(data || defaultAboutData);
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

  const handleNestedChange = (section, subSection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: { ...prev[section][subSection], [field]: value }
      }
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    const updatedArray = [...formData[section]];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    setFormData(prev => ({ ...prev, [section]: updatedArray }));
  };

  const handleNestedArrayChange = (section, subSection, index, field, value) => {
    const updatedArray = [...formData[section][subSection]];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [subSection]: updatedArray }
    }));
  };

  const addArrayItem = (section, newItem) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const removeArrayItem = (section, index) => {
    const updatedArray = [...formData[section]];
    updatedArray.splice(index, 1);
    setFormData(prev => ({ ...prev, [section]: updatedArray }));
  };

  const addNestedArrayItem = (section, subSection, newItem) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: [...prev[section][subSection], newItem]
      }
    }));
  };

  const removeNestedArrayItem = (section, subSection, index) => {
    const updatedArray = [...formData[section][subSection]];
    updatedArray.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [subSection]: updatedArray }
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
    { id: 'hero', label: 'القسم الرئيسي' },
    { id: 'bridge', label: 'القصة (Bridge)' },
    { id: 'vision', label: 'الرؤية والرسالة' },
    { id: 'values', label: 'القيم' },
    { id: 'stats', label: 'الإحصائيات' },
    { id: 'team', label: 'فريق العمل' },
    { id: 'cta', label: 'نداء العمل (CTA)' }
  ];

  return (
    <div className="p-6 mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تعديل صفحة "من نحن"</h1>
        <button
          onClick={handleSubmit}
          className="bg-primary cursor-pointer text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <MdSave size={20} /> حفظ التغييرات
        </button>
      </div>

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
        {/* HERO */}
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">الوصف المختطر</label>
                  <textarea
                    value={formData.hero.description}
                    onChange={e => handleChange('hero', 'description', e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">خلفية القسم</label>
                <MediaUploader
                  onUploadComplete={(data) => handleChange('hero', 'backgroundImage', data ? data.url : '')}
                  currentUrl={formData.hero.backgroundImage}
                  folder="agrivinka/about"
                />
              </div>
            </div>
          </div>
        )}

        {/* BRIDGE */}
        {activeTab === 'bridge' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">العنوان</label>
                  <input
                    type="text"
                    value={formData.bridge.title}
                    onChange={e => handleChange('bridge', 'title', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">شارة (Badge)</label>
                  <input
                    type="text"
                    value={formData.bridge.badge}
                    onChange={e => handleChange('bridge', 'badge', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الوصف بالتفصيل</label>
                  <textarea
                    value={formData.bridge.description}
                    onChange={e => handleChange('bridge', 'description', e.target.value)}
                    rows={8}
                    className="w-full p-2 border rounded-lg whitespace-pre-line"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الصورة الأولى</label>
                  <MediaUploader
                    onUploadComplete={(data) => handleChange('bridge', 'image1', data ? data.url : '')}
                    currentUrl={formData.bridge.image1}
                    folder="agrivinka/about"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الصورة الثانية</label>
                  <MediaUploader
                    onUploadComplete={(data) => handleChange('bridge', 'image2', data ? data.url : '')}
                    currentUrl={formData.bridge.image2}
                    folder="agrivinka/about"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISION & MISSION */}
        {activeTab === 'vision' && (
          <div className="space-y-12">
            {/* Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-green-50 rounded-xl border border-green-100">
              <div className="space-y-4">
                <h3 className="font-bold text-green-800 text-lg">قسم الرؤية</h3>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">العنوان</label>
                  <input
                    type="text"
                    value={formData.visionMission.vision.title}
                    onChange={e => handleNestedChange('visionMission', 'vision', 'title', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">أيقونة (Material Symbol)</label>
                  <input
                    type="text"
                    value={formData.visionMission.vision.icon}
                    onChange={e => handleNestedChange('visionMission', 'vision', 'icon', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-8">
                <label className="block text-sm font-bold text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={formData.visionMission.vision.description}
                  onChange={e => handleNestedChange('visionMission', 'vision', 'description', e.target.value)}
                  rows={4}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div className="space-y-4">
                <h3 className="font-bold text-blue-800 text-lg">قسم الرسالة</h3>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">العنوان</label>
                  <input
                    type="text"
                    value={formData.visionMission.mission.title}
                    onChange={e => handleNestedChange('visionMission', 'mission', 'title', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">أيقونة (Material Symbol)</label>
                  <input
                    type="text"
                    value={formData.visionMission.mission.icon}
                    onChange={e => handleNestedChange('visionMission', 'mission', 'icon', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-8">
                <label className="block text-sm font-bold text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={formData.visionMission.mission.description}
                  onChange={e => handleNestedChange('visionMission', 'mission', 'description', e.target.value)}
                  rows={4}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* VALUES */}
        {activeTab === 'values' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-700">القيم والمبادئ</h3>
              <button
                type="button"
                onClick={() => addNestedArrayItem('visionMission', 'values', { title: '', description: '', icon: 'bolt' })}
                className="text-primary flex items-center gap-1 font-bold text-sm bg-white border border-primary px-3 py-1 rounded"
              >
                <MdAdd /> إضافة قيمة
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.visionMission.values.map((val, idx) => (
                <div key={idx} className="p-4 border rounded-xl relative bg-gray-50">
                  <button
                    type="button"
                    onClick={() => removeNestedArrayItem('visionMission', 'values', idx)}
                    className="absolute top-2 left-2 text-red-500"
                  >
                    <MdDelete size={18} />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">العنوان</label>
                      <input
                        type="text"
                        value={val.title}
                        onChange={e => handleNestedArrayChange('visionMission', 'values', idx, 'title', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الأيقونة</label>
                      <input
                        type="text"
                        value={val.icon}
                        onChange={e => handleNestedArrayChange('visionMission', 'values', idx, 'icon', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">الوصف</label>
                    <textarea
                      value={val.description}
                      onChange={e => handleNestedArrayChange('visionMission', 'values', idx, 'description', e.target.value)}
                      className="w-full p-2 border rounded"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-700">قسم الأرقام والإحصائيات</h3>
              <button
                type="button"
                onClick={() => addArrayItem('stats', { label: '', value: '' })}
                className="text-primary flex items-center gap-1 font-bold text-sm bg-white border border-primary px-3 py-1 rounded"
              >
                <MdAdd /> إضافة رقم
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {formData.stats.map((stat, idx) => (
                <div key={idx} className="p-4 border rounded-xl relative bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => removeArrayItem('stats', idx)}
                    className="absolute top-2 left-2 text-red-500"
                  >
                    <MdDelete size={18} />
                  </button>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="القيمة (مثال: 50,000+)"
                      value={stat.value}
                      onChange={e => handleArrayChange('stats', idx, 'value', e.target.value)}
                      className="w-full p-2 border rounded text-center font-bold text-lg text-primary"
                    />
                    <input
                      type="text"
                      placeholder="العنوان (مثال: طالب)"
                      value={stat.label}
                      onChange={e => handleArrayChange('stats', idx, 'label', e.target.value)}
                      className="w-full p-2 border rounded text-center text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEAM */}
        {activeTab === 'team' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">عنوان القسم</label>
                <input
                  type="text"
                  value={formData.team.title}
                  onChange={e => handleChange('team', 'title', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">العنوان الفرعي</label>
                <input
                  type="text"
                  value={formData.team.subtitle}
                  onChange={e => handleChange('team', 'subtitle', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-700">أعضاء الفريق</h3>
              <button
                type="button"
                onClick={() => addNestedArrayItem('team', 'members', { name: '', role: '', image: '' })}
                className="text-primary flex items-center gap-1 font-bold text-sm bg-white border border-primary px-3 py-1 rounded"
              >
                <MdAdd /> إضافة عضو
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {formData.team.members.map((member, idx) => (
                <div key={idx} className="p-4 border rounded-xl relative bg-white shadow-sm flex gap-4">
                  <button
                    type="button"
                    onClick={() => removeNestedArrayItem('team', 'members', idx)}
                    className="absolute top-2 left-2 text-red-500"
                  >
                    <MdDelete size={18} />
                  </button>
                  <div className="w-24">
                    <MediaUploader
                      onUploadComplete={(data) => handleNestedArrayChange('team', 'members', idx, 'image', data ? data.url : '')}
                      currentUrl={member.image}
                      folder="agrivinka/team"
                      label="صورة"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الإسم</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={e => handleNestedArrayChange('team', 'members', idx, 'name', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">المسمى الوظيفي</label>
                      <input
                        type="text"
                        value={member.role}
                        onChange={e => handleNestedArrayChange('team', 'members', idx, 'role', e.target.value)}
                        className="w-full p-2 border rounded text-green-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {activeTab === 'cta' && (
          <div className="space-y-6">
            <div className="p-8 bg-gray-800 text-white rounded-[2rem] space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">العنوان الكبير</label>
                <input
                  type="text"
                  value={formData.cta.title}
                  onChange={e => handleChange('cta', 'title', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">وصف نداء العمل</label>
                <textarea
                  value={formData.cta.subtitle}
                  onChange={e => handleChange('cta', 'subtitle', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">نص الزر الرئيسي</label>
                  <input
                    type="text"
                    value={formData.cta.primaryBtn}
                    onChange={e => handleChange('cta', 'primaryBtn', e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">نص الزر الثانوي</label>
                  <input
                    type="text"
                    value={formData.cta.secondaryBtn}
                    onChange={e => handleChange('cta', 'secondaryBtn', e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
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
