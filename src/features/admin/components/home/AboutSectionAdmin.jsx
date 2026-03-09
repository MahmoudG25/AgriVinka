import React from 'react';
import MediaUploader from '../MediaUploader';

const AboutSectionAdmin = ({ data = {}, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg mb-4">من نحن (About Preview)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">العنوان</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={e => onChange('about', 'title', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
            placeholder="قصة AgriVinka"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">المحتوى (القصة)</label>
          <textarea
            value={data.content || ''}
            onChange={e => onChange('about', 'content', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 h-40"
            placeholder="اكتب القصة هنا..."
          />
        </div>

        <div className="border p-4 rounded-xl bg-gray-50 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-sm mb-2">الصورة الكبيرة (الخلفية)</h4>
            <MediaUploader
              label="صورة الفريق (Image 1)"
              currentUrl={data.image1}
              folder="Namaa-Academy/home"
              onUploadComplete={(res) => onChange('about', 'image1', res ? res.url : '')}
            />
          </div>
          <div>
            <h4 className="font-bold text-sm mb-2">الصورة الصغيرة (الأمامية)</h4>
            <MediaUploader
              label="صورة الثقافة (Image 2)"
              currentUrl={data.image2}
              folder="Namaa-Academy/home"
              onUploadComplete={(res) => onChange('about', 'image2', res ? res.url : '')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSectionAdmin;
