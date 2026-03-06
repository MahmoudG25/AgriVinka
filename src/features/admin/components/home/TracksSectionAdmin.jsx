import React from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';
import MediaUploader from '../MediaUploader';

const TracksSectionAdmin = ({ data = {}, onChange, onAddItem, onUpdateItem, onRemoveItem }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">المسارات التعليمية</h3>
        <button
          type="button"
          onClick={() => onAddItem('tracks.items', { title: '', category: 'All', tag: '', from: '', to: '', image: '' })}
          className="text-primary flex items-center gap-1 font-bold text-sm"
        >
          <MdAdd size={20} /> إضافة مسار
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">عنوان القسم</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={e => onChange('tracks', 'title', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>

        {/* Track Items */}
        {data.items?.map((item) => (
          <div key={item.id} className="border border-border-light rounded-xl p-4 bg-gray-50 relative group">
            <button
              type="button"
              onClick={() => onRemoveItem('tracks.items', item.id)}
              className="absolute top-2 left-2 text-red-400 hover:text-red-500 bg-white rounded-full p-1 shadow-md z-10"
            >
              <MdDelete size={18} />
            </button>

            <div className="space-y-4">
              <MediaUploader
                label="صورة المسار"
                currentUrl={item.image}
                folder="Namaa-Academy/home"
                onUploadComplete={(res) => onUpdateItem('tracks.items', item.id, 'image', res ? res.url : '')}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">العنوان</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => onUpdateItem('tracks.items', item.id, 'title', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">التصنيف (Category)</label>
                  <input
                    type="text"
                    value={item.category}
                    onChange={e => onUpdateItem('tracks.items', item.id, 'category', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">من (From)</label>
                  <input
                    type="text"
                    value={item.from}
                    onChange={e => onUpdateItem('tracks.items', item.id, 'from', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">إلى (To)</label>
                  <input
                    type="text"
                    value={item.to}
                    onChange={e => onUpdateItem('tracks.items', item.id, 'to', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">العلامة (Tag)</label>
                  <input
                    type="text"
                    value={item.tag}
                    onChange={e => onUpdateItem('tracks.items', item.id, 'tag', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
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

export default TracksSectionAdmin;
