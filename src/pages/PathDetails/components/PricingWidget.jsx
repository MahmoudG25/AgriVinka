import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import { useAuth } from '../../../contexts/AuthContext';

const PricingWidget = ({ price, discount, currency, features = [], roadmapId, isEnrolled, orderStatus, nextCourseId }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const hasPrice = price && price > 0;

  // Calculate original price based on discount
  const originalPrice = hasPrice && discount > 0
    ? Math.round(price * (100 / (100 - discount)))
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">

      {/* Header: Price or Contact */}
      {hasPrice ? (
        <div className="flex justify-between items-start mb-6">
          <div className="text-right">
            <span className="text-gray-500 text-xs font-bold block mb-1">السعر الإجمالي</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-heading-dark">{price} ج.م</span>
              {discount > 0 && originalPrice > 0 && (
                <span className="text-gray-400 line-through text-sm font-medium decoration-red-400 decoration-1">
                  {originalPrice} ج.م
                </span>
              )}
            </div>
          </div>
          {discount > 0 && (
            <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
              خصم {discount}%
            </span>
          )}
        </div>
      ) : (
        <div className="mb-6 text-right">
          <span className="text-gray-500 text-xs font-bold block mb-1">السعر</span>
          <span className="text-xl font-bold text-heading-dark">مجاناً</span>
        </div>
      )}

      {/* Primary CTA */}
      {isEnrolled ? (
        <Link to={`/courses/${nextCourseId}/play`} className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all mb-4 text-sm" >
          <span className="material-symbols-outlined text-lg">play_circle</span>
          متابعة التعلم
        </Link >
      ) : orderStatus === 'pending' ? (
        <div className="w-full bg-yellow-50 border-2 border-yellow-300 text-yellow-700 font-bold py-3 rounded-lg flex justify-center items-center gap-2 mb-4 text-sm text-center">
          <span className="material-symbols-outlined text-lg">schedule</span>
          قيد المراجعة
        </div>
      ) : orderStatus === 'rejected' ? (
        <>
          <div className="w-full bg-red-50 border-2 border-red-300 text-red-600 font-bold py-2 rounded-lg flex justify-center items-center gap-2 mb-2 text-xs text-center">
            تم رفض الطلب السابق
          </div>
          <Link
            to={`/checkout/payment?id=${roadmapId}&type=track`}
            className="flex items-center justify-center gap-2 w-full bg-[#d4a017] hover:bg-[#b88a12] text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all mb-4 text-sm"
          >
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            إعادة الشراء
          </Link>
        </>
      ) : (
        <Link
          to={`/checkout/payment?id=${roadmapId}&type=track`}
          className="flex items-center justify-center gap-2 w-full bg-[#d4a017] hover:bg-[#b88a12] text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all mb-4 text-sm"
        >
          <span className="material-symbols-outlined text-lg">shopping_cart</span>
          {hasPrice ? 'شراء المسار الكامل' : 'ابدأ التعلم الآن'}
        </Link>
      )}

      {/* Features List */}
      <ul className="space-y-3 pt-5 border-t border-gray-100">
        {features.map((feat, idx) => (
          <li key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
            {feat}
          </li>
        ))}
      </ul>

    </div >
  );
};

export default PricingWidget;
