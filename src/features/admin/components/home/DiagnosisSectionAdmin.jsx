import React from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';

const DiagnosisSectionAdmin = ({ data = {}, onAddItem, onUpdateItem, onRemoveItem }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">المشكلة (Pain Points)</h3>
        <button
          type="button"
          onClick={() => onAddItem('diagnosis.items', { title: '', desc: '', emoji: '⚠️' })}
          className="text-primary flex items-center gap-1 font-bold text-sm"
        >
          <MdAdd size={20} /> إضافة مشكلة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">الشارة (Badge)</label>
          <input
            type="text"
            value={data.badge || ''}
            onChange={e => onUpdateItem('diagnosis', null, 'badge', e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-200"
            placeholder="مثال: ⚠ هل هذا يبدو مألوفاً؟"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">العنوان</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={e => onUpdateItem('diagnosis', null, 'title', e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-200"
            placeholder="المشكلة ليست في قدراتك،"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">تكملة العنوان (Subtitle - بلون مختلف)</label>
          <input
            type="text"
            value={data.subtitle || ''}
            onChange={e => onUpdateItem('diagnosis', null, 'subtitle', e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-200"
            placeholder="المشكلة في الفجوة بين النظرية والتطبيق."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">الوصف أسفل العنوان</label>
          <textarea
            value={data.description || ''}
            onChange={e => onUpdateItem('diagnosis', null, 'description', e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-200"
            rows={2}
          />
        </div>
      </div>

      <div className="space-y-4">
        {data.items?.map((item) => (
          <div key={item.id} className="border border-border-light rounded-xl p-4 bg-gray-50 relative">
            <button
              type="button"
              onClick={() => onRemoveItem('diagnosis.items', item.id)}
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
                  onChange={e => onUpdateItem('diagnosis.items', item.id, 'emoji', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200 text-center text-2xl"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">عنوان المشكلة</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={e => onUpdateItem('diagnosis.items', item.id, 'title', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 mb-1">الوصف</label>
                <textarea
                  value={item.desc}
                  onChange={e => onUpdateItem('diagnosis.items', item.id, 'desc', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiagnosisSectionAdmin;
