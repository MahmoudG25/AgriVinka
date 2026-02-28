import React from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';
import MediaUploader from '../MediaUploader';

const HeroSectionAdmin = ({ data = {}, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg mb-4">القسم الرئيسي (Hero)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <MediaUploader
            label="صورة الخلفية (Cover)"
            currentUrl={data.bgImage}
            folder="Namaa-Academy/home"
            onUploadComplete={(res) => onChange('hero', 'bgImage', res ? res.url : '')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">الشارة (Badge)</label>
          <input
            type="text"
            value={data.badge || ''}
            onChange={e => onChange('hero', 'badge', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
            placeholder="مثال: 🚀 الاستثمار الأفضل لمستقبلك"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">العنوان الرئيسي</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={e => onChange('hero', 'title', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">العنوان الفرعي</label>
          <textarea
            value={data.subtitle || ''}
            onChange={e => onChange('hero', 'subtitle', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">نص الزر (CTA)</label>
          <input
            type="text"
            value={data.ctaText || ''}
            onChange={e => onChange('hero', 'ctaText', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">رابط الزر</label>
          <input
            type="text"
            value={data.ctaLink || ''}
            onChange={e => onChange('hero', 'ctaLink', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">رابط الفيديو (Video URL - YouTube/Vimeo)</label>
          <div className="flex gap-2 items-start">
            <input
              type="text"
              value={data.videoUrl || ''}
              onChange={e => onChange('hero', 'videoUrl', e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="mt-2">
            <MediaUploader
              label="أو قم برفع فيديو (Cloudinary)"
              currentUrl={data.videoUrl}
              folder="Namaa-Academy/home/videos"
              accept={{ 'video/*': [] }}
              maxSize={104857600} // 100MB
              onUploadComplete={(res) => {
                if (res) onChange('hero', 'videoUrl', res.url);
              }}
            />
            <p className="text-xs text-gray-500 mt-1">يمكنك رفع ملف فيديو (MP4, WebM) مباشرة حتى 100MB.</p>
          </div>
        </div>

        {/* Hero Slider Images Management */}
        <div className="md:col-span-2 space-y-4 mt-4 border-t pt-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold">صور المعرض (Slider Images)</label>
            <button
              type="button"
              onClick={() => {
                const newImages = [...(data.images || []), ''];
                onChange('hero', 'images', newImages);
              }}
              className="text-primary flex items-center gap-1 font-bold text-sm"
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
                    onChange('hero', 'images', newImages);
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
                      onChange('hero', 'images', newImages);
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

export default HeroSectionAdmin;
