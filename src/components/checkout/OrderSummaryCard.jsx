import React from 'react';
import { calculateOrderTotals } from '../../utils/checkoutUtils';

const OrderSummaryCard = ({ product, type }) => {
  if (!product) return null;

  const { subtotal, tax, total, originalPrice, discount } = calculateOrderTotals(product, type);

  // Determine image and title based on type (handling different field names)
  const image = type === 'course'
    ? product.media?.thumbnail
    : product.image; // Tracks/Roadmaps might use 'image'

  const title = product.title;
  const instructor = type === 'course' ? product.instructor?.name : product.provider?.name;

  return (
    <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100/50">
      <h3 className="text-xl font-bold text-heading-dark mb-6 pb-4 border-b border-gray-100">ملخص الطلب</h3>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden border border-gray-100 shadow-sm">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs p-1 text-center">
              {type === 'track' ? 'مسار' : 'دورة'}
            </div>
          )}
        </div>
        <div>
          <h4 className="font-bold text-base text-heading-dark line-clamp-2 leading-snug">{title}</h4>
          <p className="text-xs text-gray-500 mt-2 bg-gray-50 w-fit px-2 py-1 rounded-md border border-gray-100">
            {type === 'course' ? 'المدرب: ' : 'المزود: '}
            <span className="font-medium text-heading-dark">{instructor}</span>
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
        <div className="flex justify-between">
          <span>المجموع الفرعي</span>
          <span className="font-medium dir-ltr">{subtotal}ج.م</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>خصم</span>
            <span className="font-bold dir-ltr">-{discount} ج.م</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-xl text-heading-dark pt-3 border-t border-gray-200 mt-2">
          <span>الإجمالي</span>
          <span className="text-primary dir-ltr">{total.toFixed(2)} ج.م</span>
        </div>
      </div>

      {/* Trust badge visually */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        ضمان استرداد الأموال لمدة 30 يوم
      </div>
    </div>
  );
};

export default OrderSummaryCard;
