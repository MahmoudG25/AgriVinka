import React, { useState, useEffect } from 'react';
import { pageService } from '../../../services/firestore/pageService';
import { SectionRegistry } from '../utils/SectionRegistry';
import SeoManager from '../components/SeoManager';
import { toast } from 'react-hot-toast';
import { FaGripLines, FaTrash, FaPlus, FaSave, FaEye } from 'react-icons/fa';

const PageBuilder = () => {
  const [pageId, setPageId] = useState('home'); // Currently fixed to home, can be dynamic
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageData, setPageData] = useState({
    title: 'الصفحة الرئيسية',
    seo: {},
    sections: [] // Array of { id, type, data }
  });

  const [activeSectionId, setActiveSectionId] = useState(null);

  useEffect(() => {
    fetchPageData();
  }, [pageId]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const data = await pageService.getPageData(pageId);
      if (data) {
        setPageData(data);
      } else {
        // Initialize if empty (e.g., first time loading 'home')
        setPageData({
          title: 'الصفحة الرئيسية',
          seo: { metaTitle: '', metaDescription: '', keywords: '' },
          sections: []
        });
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل بيانات الصفحة');
    } finally {
      setLoading(false);
    }
  };

  const handeSave = async () => {
    try {
      setSaving(true);
      await pageService.updatePageData(pageId, pageData);
      toast.success('تم الحفظ بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // --- Section Management ---
  const addSection = (type) => {
    const newSection = {
      id: `sec_${Date.now()}`,
      type,
      data: { ...SectionRegistry[type].defaultData }
    };
    setPageData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setActiveSectionId(newSection.id);
  };

  const removeSection = (id) => {
    setPageData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id)
    }));
    if (activeSectionId === id) setActiveSectionId(null);
  };

  const moveSection = (index, direction) => {
    const newSections = [...pageData.sections];
    if (direction === 'up' && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
    }
    setPageData(prev => ({ ...prev, sections: newSections }));
  };

  const updateSectionData = (id, field, value) => {
    setPageData(prev => ({
      ...prev,
      sections: prev.sections.map(sec =>
        sec.id === id ? { ...sec, data: { ...sec.data, [field]: value } } : sec
      )
    }));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;

  const activeSection = pageData.sections.find(s => s.id === activeSectionId);
  const activeSchema = activeSection ? SectionRegistry[activeSection.type].schema : null;

  return (
    <div className="p-6  mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heading-dark">منشئ الصفحات (Page Builder)</h1>
          <p className="text-gray-500">قم بتخصيص وبناء صفحة: <strong className="text-primary">{pageId}</strong></p>
        </div>
        <div className="flex gap-4">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FaEye />
            معاينة
          </a>
          <button
            onClick={handeSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-bold disabled:opacity-50"
          >
            <FaSave />
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column (List of Sections) - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-bold mb-4 px-2">مكونات الصفحة ({pageData.sections.length})</h3>

            <div className="space-y-2">
              {pageData.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${activeSectionId === section.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
                    }`}
                  onClick={() => setActiveSectionId(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-gray-400 hover:text-gray-600 cursor-grab">
                      <FaGripLines />
                    </button>
                    <span className="font-medium text-sm">
                      {SectionRegistry[section.type]?.name || section.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="flex flex-col gap-0.5 ml-2">
                      <button onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }} disabled={index === 0} className="text-[10px] text-gray-400 hover:text-primary disabled:opacity-30">▲</button>
                      <button onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }} disabled={index === pageData.sections.length - 1} className="text-[10px] text-gray-400 hover:text-primary disabled:opacity-30">▼</button>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {pageData.sections.length === 0 && (
                <div className="text-center p-6 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  لا توجد مكونات في هذه الصفحة حالياً
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider px-2">إضافة مكون جديد</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SectionRegistry).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className="flex items-center justify-center gap-2 p-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-primary hover:text-white hover:border-primary transition-colors bg-gray-50"
                    title={config.name}
                  >
                    <FaPlus size={10} />
                    {config.name.split(' ')[0]} {/* Shorthand name */}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Editor) - 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section Editor */}
          {activeSectionId && activeSection && activeSchema ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-heading-dark flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">
                    <FaEye />
                  </span>
                  تحرير: {SectionRegistry[activeSection.type].name}
                </h2>
              </div>

              <div className="space-y-5">
                {activeSchema.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      {field.label}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        value={activeSection.data[field.key] || ''}
                        onChange={(e) => updateSectionData(activeSection.id, field.key, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                        placeholder={field.placeholder}
                        rows={3}
                      />
                    ) : field.type === 'json' ? (
                      <textarea
                        value={typeof activeSection.data[field.key] === 'object' ? JSON.stringify(activeSection.data[field.key], null, 2) : activeSection.data[field.key] || ''}
                        onChange={(e) => {
                          let val = e.target.value;
                          try {
                            const parsed = JSON.parse(val);
                            updateSectionData(activeSection.id, field.key, parsed);
                          } catch (err) {
                            // If invalid JSON, just store as string for now, user is still typing
                            updateSectionData(activeSection.id, field.key, val);
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm font-mono"
                        placeholder={field.placeholder}
                        rows={6}
                        dir="ltr"
                      />
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={activeSection.data[field.key] || ''}
                        onChange={(e) => updateSectionData(activeSection.id, field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                        placeholder={field.placeholder}
                        dir={field.type === 'url' ? 'ltr' : 'rtl'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 mt-0">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-20">touch_app</span>
              <p className="text-lg">اختر مكوّن من القائمة الجانبية لتعديله</p>
            </div>
          )}

          {/* SEO Manager for this page */}
          <div className="mt-8">
            <SeoManager
              seoData={pageData.seo}
              onChange={(newSeo) => setPageData(prev => ({ ...prev, seo: newSeo }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;
