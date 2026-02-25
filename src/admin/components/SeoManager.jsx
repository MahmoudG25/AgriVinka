import React from 'react';

const SeoManager = ({ seoData, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...seoData, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h3 className="text-lg font-bold text-heading-dark flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">search</span>
        تحسين محركات البحث (SEO)
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            عنوان الصفحة (Meta Title)
          </label>
          <input
            type="text"
            value={seoData?.metaTitle || ''}
            onChange={(e) => handleChange('metaTitle', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="مثال: الرئيسية | أكاديمية نماء"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            وصف الصفحة (Meta Description)
          </label>
          <textarea
            value={seoData?.metaDescription || ''}
            onChange={(e) => handleChange('metaDescription', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="وصف شيق ومختصر يظهر في نتائج البحث..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الكلمات المفتاحية (Keywords)
          </label>
          <input
            type="text"
            value={seoData?.keywords || ''}
            onChange={(e) => handleChange('keywords', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="مثال: تعليم, لغة, كورس"
          />
        </div>
      </div>
    </div>
  );
};

export default SeoManager;
