import React from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';
import MediaUploader from '../MediaUploader';

const TestimonialsSectionAdmin = ({ data = [], onAddItem, onUpdateItem, onRemoveItem }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">آراء العملاء</h3>
        <button
          type="button"
          onClick={() => onAddItem('testimonials', { name: '', role: '', content: '', image: '' })}
          className="
            text-primary 
            flex items-center gap-2 
            font-semibold text-sm 
            px-3 py-1.5 
            rounded-full 
            transition-all duration-300 
            hover:text-primary/80 
            hover:scale-105 
            hover:bg-gray-100 cursor-pointer
          "
        >
          <MdAdd size={20} /> إضافة رأي
        </button>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="border border-border-light rounded-xl p-4 bg-gray-50 relative group">
            <button
              type="button"
              onClick={() => onRemoveItem('testimonials', item.id)}
              className="absolute top-4 left-4 text-red-400 hover:text-red-500"
            >
              <MdDelete size={20} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الاسم</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={e => onUpdateItem('testimonials', item.id, 'name', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الوظيفة</label>
                <input
                  type="text"
                  value={item.role}
                  onChange={e => onUpdateItem('testimonials', item.id, 'role', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">الرأي</label>
                <textarea
                  value={item.content}
                  onChange={e => onUpdateItem('testimonials', item.id, 'content', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <MediaUploader
                  label="صورة العميل (اختياري)"
                  currentUrl={item.image}
                  folder="Namaa-Academy/home"
                  onUploadComplete={(res) => onUpdateItem('testimonials', item.id, 'image', res ? res.url : '')}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSectionAdmin;
