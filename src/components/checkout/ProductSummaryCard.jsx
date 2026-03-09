import React from 'react';
import { FaFileVideo, FaFilePdf, FaInfinity, FaDownload } from 'react-icons/fa';

const ProductSummaryCard = ({ product, type }) => {
  if (!product) return null;

  // Determine image and title based on type (handling different field names)
  const image = type === 'course'
    ? product.media?.thumbnail
    : product.image;

  const title = product.title;
  // const instructor = type === 'course' ? product.instructor?.name : product.provider?.name;

  // Format info
  const meta = product.meta || {}; // For courses
  const duration = type === 'course' ? meta.duration : product.duration;
  const level = type === 'course' ? meta.level : product.level;

  return (
    <div className="bg-surface-white p-6 rounded-3xl shadow-sm border border-border-light h-full">
      <div className="flex items-center gap-2 mb-6 text-gray-500 font-medium text-sm">
        <span>ملخص المنتج</span>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {type === 'track' ? 'مسار' : 'دورة'}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg text-heading-dark leading-snug mb-2 line-clamp-2">
            {title}
          </h3>
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg">
            {type === 'course' ? 'باقة ذهبية' : 'مسار شامل'}
          </span>
        </div>
      </div>

      <div className="space-y-4 border-t border-border-light pt-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">حجم المحتوى</span>
          <span className="font-bold text-body-text dir-ltr">{duration}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">نوع المحتوى</span>
          <span className="font-bold text-body-text flex items-center gap-1 dir-ltr">
            {type === 'course' ? 'HD Video, PDF' : 'Video, Projects'}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">صلاحية الوصول</span>
          <span className="font-bold text-green-600 flex items-center gap-1">
            مدى الحياة
          </span>
        </div>
      </div>

      <div className="mt-8 bg-background-alt p-4 rounded-xl flex items-center justify-between">
        <div className="text-sm">
          <p className="font-bold text-heading-dark">الفاتورة الإلكترونية</p>
          <p className="text-xs text-gray-500 mt-1">تم تأكيد الدفع</p>
        </div>
        <button className="text-primary hover:text-heading-dark transition-colors text-sm font-bold flex items-center gap-1">
          <FaDownload />
          تحميل
        </button>
      </div>
    </div>
  );
};

export default ProductSummaryCard;
