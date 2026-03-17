import React from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';
import MediaUploader from '../MediaUploader';

const PricingSectionAdmin = ({ data = {}, onChange, onAddItem, onUpdateItem, onRemoveItem }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">عنوان القسم</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={e => onChange('pricing', 'title', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الوصف الفرعي</label>
          <input
            type="text"
            value={data.subtitle || ''}
            onChange={e => onChange('pricing', 'subtitle', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">نص الزر (CTA)</label>
          <input
            type="text"
            value={data.cta || ''}
            onChange={e => onChange('pricing', 'cta', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">نص تحت الزر</label>
          <input
            type="text"
            value={data.cta_sub || ''}
            onChange={e => onChange('pricing', 'cta_sub', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 mb-4">
        <h3 className="font-bold text-lg">الخطط (Plans)</h3>
        <button
          type="button"
          onClick={() => onAddItem('pricing.plans', { title: '', price: '', period: '/monthly', features: [], highlight: false })}
          className="text-primary flex items-center gap-1 font-bold text-sm"
        >
          <MdAdd size={20} /> إضافة خطة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.plans?.map((plan) => (
          <div key={plan.id} className={`border rounded-xl p-4 relative group ${plan.highlight ? 'border-primary bg-primary/5' : 'border-border-light bg-gray-50'}`}>
            <button
              type="button"
              onClick={() => onRemoveItem('pricing.plans', plan.id)}
              className="absolute top-2 left-2 text-red-400 hover:text-red-500 bg-white rounded-full p-1 shadow-md z-10"
            >
              <MdDelete size={18} />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={plan.highlight || false}
                  onChange={e => onUpdateItem('pricing.plans', plan.id, 'highlight', e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <label className="text-sm font-bold text-primary">تميز هذه الخطة (Highlight)</label>
              </div>

              <MediaUploader
                label="صورة الخطة (خلفية الكارد)"
                currentUrl={plan.image}
                folder="Namaa-Academy/home"
                onUploadComplete={(res) => onUpdateItem('pricing.plans', plan.id, 'image', res ? res.url : '')}
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">اسم الخطة</label>
                  <input
                    type="text"
                    value={plan.title}
                    onChange={e => onUpdateItem('pricing.plans', plan.id, 'title', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">السعر</label>
                  <input
                    type="text"
                    value={plan.price}
                    onChange={e => onUpdateItem('pricing.plans', plan.id, 'price', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">السعر الأصلي (للخصم)</label>
                  <input
                    type="text"
                    value={plan.originalPrice}
                    onChange={e => onUpdateItem('pricing.plans', plan.id, 'originalPrice', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                    placeholder="مثال: 5000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">الفترة (Period)</label>
                  <input
                    type="text"
                    value={plan.period}
                    onChange={e => onUpdateItem('pricing.plans', plan.id, 'period', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">الشارة (Badge)</label>
                  <input
                    type="text"
                    value={plan.badge}
                    onChange={e => onUpdateItem('pricing.plans', plan.id, 'badge', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">الوصف المختصر</label>
                  <input
                    type="text"
                    value={plan.subtitle}
                    onChange={e => onUpdateItem('pricing.plans', plan.id, 'subtitle', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">الوصف الكامل</label>
                  <textarea
                    value={plan.description}
                    onChange={e => onUpdateItem('pricing.plans', plan.id, 'description', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                    rows={2}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">الميزات (كل ميزة في سطر)</label>
                  <textarea
                    value={Array.isArray(plan.features) ? plan.features.join('\n') : plan.features}
                    onChange={e => onUpdateItem('pricing.plans', plan.id, 'features', e.target.value.split('\n'))}
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
  );
};

export default PricingSectionAdmin;
