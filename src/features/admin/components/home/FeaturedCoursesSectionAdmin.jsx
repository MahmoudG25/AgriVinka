import React from 'react';

const FeaturedCoursesSectionAdmin = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mb-6">
        <p className="text-sm font-bold text-primary">قسم الدورات المميزة (Featured Courses)</p>
        <p className="text-xs text-gray-500 mt-1">
          يعرض هذا القسم أحدث أو أفضل الدورات المنشورة. يتم جلب الدورات تلقائياً من قاعدة البيانات.
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">العنوان (Title)</label>
        <input
          type="text"
          value={data?.title || ''}
          onChange={(e) => onChange('featuredCourses', 'title', e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
          placeholder="مثال: أحدث الدورات التدريبية"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">الوصف (Subtitle)</label>
        <textarea
          value={data?.subtitle || ''}
          onChange={(e) => onChange('featuredCourses', 'subtitle', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
          placeholder="وصف قصير للقسم..."
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">عدد الدورات المعروضة (Limit)</label>
        <input
          type="number"
          min="1"
          max="20"
          value={data?.limit || 4}
          onChange={(e) => onChange('featuredCourses', 'limit', parseInt(e.target.value) || 4)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
          placeholder="مثال: 4"
        />
        <p className="text-xs text-gray-500 mt-1">يُنصح بـ 4 أو 8 أو 12 للحفاظ على شكل الشبكة.</p>
      </div>
    </div>
  );
};

export default FeaturedCoursesSectionAdmin;
