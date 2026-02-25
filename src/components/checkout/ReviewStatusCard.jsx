import React from 'react';
import { FaHourglassHalf } from 'react-icons/fa6';

const ReviewStatusCard = () => {
  return (
    <div className="bg-surface-white p-8 rounded-3xl shadow-lg border border-primary/20 text-center  mx-auto transform hover:scale-[1.01] transition-transform duration-300">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <FahourglassHalf className="text-5xl text-primary" />
      </div>

      <h1 className="text-3xl font-bold text-heading-dark mb-4">
        طلبك قيد المراجعة
      </h1>

      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        شكراً لاشتراكك، يا أحمد. لقد استلمنا إيصال التحويل البنكي وجاري التحقق منه يدوياً من قبل فريقنا المالي. لا تقلق، مقعدك محجوز.
      </p>

      <div className="bg-background-alt p-6 rounded-2xl border border-border-light mb-8">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <span className="text-gray-500">رقم الطلب</span>
          <span className="font-bold text-xl text-heading-dark dir-ltr">#ORD-9281</span>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500">الإيصال المرفق</span>
          <span className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            transfer...jpg
          </span>
        </div>

        <div className="flex justify-between items-center bg-primary/5 p-3 rounded-xl">
          <span className="text-gray-500">وقت المراجعة المتوقع</span>
          <span className="font-bold text-primary flex items-center gap-2 text-sm">
            <FaHourglassHalf />
            خلال 24 ساعة
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReviewStatusCard;
