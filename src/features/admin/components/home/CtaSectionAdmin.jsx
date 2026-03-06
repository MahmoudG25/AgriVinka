import React from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';
import MediaUploader from '../MediaUploader';

const CtaSectionAdmin = ({ data = {}, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg mb-4">الخاتمة (Call To Action)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">العنوان</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={e => onChange('ctaFinal', 'title', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الوصف</label>
          <input
            type="text"
            value={data.subtitle || ''}
            onChange={e => onChange('ctaFinal', 'subtitle', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">نص الزر</label>
          <input
            type="text"
            value={data.buttonText || ''}
            onChange={e => onChange('ctaFinal', 'buttonText', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>

        {/* CTA Background Images Management */}
        <div className="md:col-span-2 space-y-4 mt-4 border-t pt-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold">صور الخلفية (Background Slider)</label>
            <button
              type="button"
              onClick={() => {
                const newImages = [...(data.images || []), ''];
                onChange('ctaFinal', 'images', newImages);
              }}
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
              <MdAdd size={20} /> إضافة صورة
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(data.images || []).map((imgUrl, index) => (
              <div key={index} className="relative group border rounded-xl p-2 bg-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    const newImages = data.images.filter((_, i) => i !== index);
                    onChange('ctaFinal', 'images', newImages);
                  }}
                  className="absolute top-1 left-1 text-red-500 bg-white rounded-full p-1 shadow-sm z-10"
                >
                  <MdDelete size={16} />
                </button>
                <MediaUploader
                  label={`صورة ${index + 1}`}
                  currentUrl={imgUrl}
                  folder="Namaa-Academy/home"
                  onUploadComplete={(res) => {
                    if (res) {
                      const newImages = [...data.images];
                      newImages[index] = res.url;
                      onChange('ctaFinal', 'images', newImages);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CtaSectionAdmin;
