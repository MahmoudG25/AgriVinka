import React from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';
import MediaUploader from '../MediaUploader';

const PartnersSectionAdmin = ({ data = [], onAddItem, onUpdateItem, onRemoveItem }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">شركاء النجاح</h3>
        <button
          type="button"
          onClick={() => onAddItem('partners', { name: '', logo: '' })}
          className="text-primary flex items-center gap-1 font-bold text-sm"
        >
          <MdAdd size={20} /> إضافة شريك
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div key={item.id} className="border border-border-light rounded-xl p-4 bg-gray-50 relative group shadow-sm">
            <button
              type="button"
              onClick={() => onRemoveItem('partners', item.id)}
              className="absolute top-2 left-2 text-red-400 hover:text-red-500 bg-white rounded-full p-1 shadow-md z-10"
            >
              <MdDelete size={18} />
            </button>

            <div className="space-y-4">
              <MediaUploader
                label="شعار الشريك"
                currentUrl={item.logo}
                folder="Namaa-Academy/home"
                onUploadComplete={(res) => onUpdateItem('partners', item.id, 'logo', res ? res.url : '')}
              />
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">اسم الشريك</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={e => onUpdateItem('partners', item.id, 'name', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200 text-center"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnersSectionAdmin;
