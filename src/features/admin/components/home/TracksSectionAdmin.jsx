import React from 'react';

const TracksSectionAdmin = ({ data = {}, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">المسارات التعليمية</h3>
      </div>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 border border-blue-100">
        <p className="font-bold mb-1">💡 كيف تعمل هذه القائمة؟</p>
        <p>هذا القسم يسحب مسارات التعلم تلقائياً من قواعد البيانات. يمكنك التحكم في المسارات المعروضة هنا عبر صفحة <a href="/features/admin/roadmaps" className="text-blue-600 underline font-bold">إدارة المسارات</a>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">الشارة (Badge)</label>
          <input
            type="text"
            value={data.badge || ''}
            onChange={e => onChange('tracks', 'badge', e.target.value)}
            placeholder="مثال: 🎯 مساراتك نحو الاحتراف"
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">العنوان الرئيسي</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={e => onChange('tracks', 'title', e.target.value)}
            placeholder="مثال: خطط دراسية متدرجة ترسم لك"
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">العنوان الفرعي الملون</label>
          <input
            type="text"
            value={data.subtitle || ''}
            onChange={e => onChange('tracks', 'subtitle', e.target.value)}
            placeholder="مثال: الطريق من الأساسيات وحتى التخصص"
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">نص الوصف</label>
          <textarea
            value={data.description || ''}
            onChange={e => onChange('tracks', 'description', e.target.value)}
            placeholder="مثال: مصممة بعناية لبناء مهندس زراعي شامل..."
            rows="3"
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
      </div>
    </div>
  );
};

export default TracksSectionAdmin;
