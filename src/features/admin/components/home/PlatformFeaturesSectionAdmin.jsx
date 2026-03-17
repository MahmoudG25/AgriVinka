import React from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';

const PlatformFeaturesSectionAdmin = ({ data, onChange, onAddItem, onUpdateItem, onRemoveItem }) => {
  return (
    <div className="space-y-8">
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mb-6">
        <p className="text-sm font-bold text-primary">قسم مميزات المنصة (Platform Features)</p>
        <p className="text-xs text-gray-500 mt-1">
          أضف أو عدل مميزات المنصة الرئيسية التي تظهر أسفل الدورات المميزة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">الشارة (Badge)</label>
          <input
            type="text"
            value={data?.badge || ''}
            onChange={(e) => onChange('platformFeatures', 'badge', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 outline-none text-sm"
            placeholder="مثال: لماذا تختار منصتنا؟"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">العنوان (Title)</label>
          <input
            type="text"
            value={data?.title || ''}
            onChange={(e) => onChange('platformFeatures', 'title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 outline-none text-sm"
            placeholder="مثال: طريقك الأمثل لاحتراف المجال الزراعي"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">الوصف (Subtitle)</label>
        <textarea
          value={data?.subtitle || ''}
          onChange={(e) => onChange('platformFeatures', 'subtitle', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 outline-none text-sm resize-none"
        />
      </div>

      {/* Features List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-bold text-gray-700">المميزات (Features)</label>
          <button
            type="button"
            onClick={() => onAddItem('platformFeatures.features', { icon: 'star', title: 'ميزة جديدة', description: 'وصف الميزة الجديدة', color: 'text-primary', bg: 'bg-primary/10' })}
            className="flex items-center gap-2 bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors text-sm"
          >
            <MdAdd size={18} />
            إضافة ميزة
          </button>
        </div>

        <div className="space-y-4">
          {(data?.features || []).map((feature) => (
            <div key={feature.id} className="relative bg-gray-50 p-4 rounded-xl border border-gray-200 group">
              <button
                type="button"
                onClick={() => onRemoveItem('platformFeatures.features', feature.id)}
                className="absolute top-4 left-4 text-red-400 hover:text-red-600 bg-white rounded-lg p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MdDelete size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">أيقونة (Material Symbol)</label>
                  <input
                    type="text"
                    value={feature.icon || ''}
                    onChange={(e) => onUpdateItem('platformFeatures.features', feature.id, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 outline-none text-sm"
                    placeholder="مثال: school, eco"
                  />
                  <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline mt-1 block">استعرض الأيقونات</a>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">عنوان الميزة</label>
                  <input
                    type="text"
                    value={feature.title || ''}
                    onChange={(e) => onUpdateItem('platformFeatures.features', feature.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 outline-none text-sm"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">الوصف</label>
                  <input
                    type="text"
                    value={feature.description || ''}
                    onChange={(e) => onUpdateItem('platformFeatures.features', feature.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">لون الأيقونة (Taiwind class)</label>
                  <input
                    type="text"
                    value={feature.color || ''}
                    onChange={(e) => onUpdateItem('platformFeatures.features', feature.id, 'color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 outline-none text-[11px] font-mono"
                    placeholder="text-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">خلفية الأيقونة (Tailwind class)</label>
                  <input
                    type="text"
                    value={feature.bg || ''}
                    onChange={(e) => onUpdateItem('platformFeatures.features', feature.id, 'bg', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 outline-none text-[11px] font-mono"
                    placeholder="bg-blue-50"
                  />
                </div>
              </div>
            </div>
          ))}

          {(!data?.features || data.features.length === 0) && (
            <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
              لا توجد مميزات مضافة. اضغط على "إضافة ميزة" للبدء.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformFeaturesSectionAdmin;
