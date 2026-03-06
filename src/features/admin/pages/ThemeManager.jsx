import React, { useState, useEffect } from 'react';
import { themeService } from '../../../services/firestore/themeService';
import { toast } from 'react-hot-toast';
import { FaSave, FaPalette, FaFont } from 'react-icons/fa';

const ThemeManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    colors: { primary: '#059669', secondary: '#D97706' },
    typography: { scale: 1 },
    seo: { defaultMetaTitle: '', defaultMetaDescription: '' }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await themeService.getSettings();
      setSettings(data);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل إعدادات الهوية');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await themeService.updateSettings(settings);
      // Immediately apply to DOM for live feedback in admin panel
      themeService.applyThemeToDOM(settings);
      toast.success('تم تحديث الهوية بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const updateColor = (key, value) => {
    setSettings(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
  };

  const updateTypography = (key, value) => {
    setSettings(prev => ({
      ...prev,
      typography: { ...prev.typography, [key]: value }
    }));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">جاري تحميل إعدادات الهوية...</div>;

  return (
    <div className="p-6  mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heading-dark flex items-center gap-2">
            <FaPalette className="text-primary" /> تخصيص الهوية (Theme Manager)
          </h1>
          <p className="text-gray-500 mt-1">إدارة الألوان، الخطوط، والإعدادات العامة للمنصة</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-bold disabled:opacity-50"
        >
          <FaSave />
          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Colors Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-heading-dark flex items-center gap-2 mb-6">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FaPalette />
            </span>
            الألوان الرئيسية
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اللون الأساسي (Primary Color)</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.colors.primary}
                  onChange={(e) => updateColor('primary', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.colors.primary}
                  onChange={(e) => updateColor('primary', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">يستخدم في الأزرار الرئيسية، الروابط، وعناصر التفاعل.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اللون الثانوي (Secondary/Accent Color)</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.colors.secondary}
                  onChange={(e) => updateColor('secondary', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.colors.secondary}
                  onChange={(e) => updateColor('secondary', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">يستخدم في التنبيهات، وعناصر التمييز، والشهادات.</p>
            </div>
          </div>
        </div>

        {/* Typography Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-heading-dark flex items-center gap-2 mb-6">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FaFont />
            </span>
            الخطوط (Typography)
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">مقياس حجم الخط (Typography Scale)</label>
                <span className="text-sm font-bold text-primary">{Math.round(settings.typography.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={settings.typography.scale}
                onChange={(e) => updateTypography('scale', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                <span>أصغر</span>
                <span>الافتراضي</span>
                <span>أكبر</span>
              </div>
              <p className="text-xs text-gray-500 mt-4">يؤثر هذا المقياس على جميع النصوص في الموقع بشكل نسبي.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThemeManager;
