import React, { useEffect, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { FaWhatsapp, FaHourglassHalf, FaFileInvoice, FaRegClock, FaCircleInfo, FaCopy, FaArrowLeft } from 'react-icons/fa6';

// --- Helper Components ---

const ReviewHeader = () => (
  <div className="text-center mb-8 relative">
    {/* Top Gold Bar */}
    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-[#e6a219] rounded-b-lg opacity-80"></div>

    <div className="w-20 h-20 bg-[#e6a219]/10 rounded-full flex items-center justify-center mx-auto mb-6">
      <FaHourglassHalf className="text-3xl text-[#e6a219]" />
    </div>
    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
      طلبك قيد المراجعة
    </h1>
  </div>
);

const ReviewMessage = ({ firstName, paymentMethod }) => (
  <div className="text-center mb-10">
    <p className="text-lg text-gray-500 leading-relaxed  mx-auto font-medium">
      شكراً لاشتراكك، <span className="text-gray-800">{firstName}</span>.
      <br />
      لقد استلمنا {paymentMethod === 'manual' ? 'إيصال التحويل البنكي' : 'طلب الدفع'} وجاري التحقق منه يدوياً من قبل فريقنا المالي.
      <br />
      <span className="text-gray-500 mt-1 inline-block">لا تقلق، مقعدك محجوز.</span>
    </p>
  </div>
);

const OrderMetaCard = ({ order }) => (
  <div className="bg-[#F9FAFB] p-8 rounded-[1.5rem] border border-gray-100 mb-10">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-200">

      {/* Order ID & Copy */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <span className="text-sm text-gray-400 font-medium">رقم الطلب</span>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
          <span className="font-bold text-xl text-gray-900 dir-ltr select-all truncate">{order.id || order.orderId}</span>
          <button
            onClick={() => {
              const id = order.id || order.orderId;
              navigator.clipboard.writeText(id);
              // Optional: Show toast or feedback
            }}
            className="text-gray-400 hover:text-primary transition-colors p-1"
            title="نسخ رقم الطلب"
          >
            <FaCopy size={14} />
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex-1 flex flex-col items-center gap-2 w-full md:w-auto pt-4 md:pt-0">
        <span className="text-sm text-gray-400 font-medium">حالة الطلب</span>
        {(!order.status || order.status === 'pending') && (
          <span className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
            <FaHourglassHalf className="text-xs" /> قيد المراجعة
          </span>
        )}
        {order.status === 'approved' && (
          <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm font-bold">check</span> مكتمل
          </span>
        )}
        {order.status === 'rejected' && (
          <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm font-bold">close</span> مرفوض
          </span>
        )}
      </div>

      {/* View/Download Receipt */}
      {(order.receiptUrl || order.receiptFile) && (
        <div className="flex-1 flex flex-col items-center gap-2 w-full md:w-auto pt-4 md:pt-0">
          <span className="text-sm text-gray-400 font-medium">الإيصال المرفق</span>
          {order.receiptUrl ? (
            <a
              href={order.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-white hover:bg-primary bg-white border border-primary/20 transition-all px-4 py-2 rounded-lg text-xs font-bold w-full md:w-auto justify-center "
            >
              <FaFileInvoice /> عرض الإيصال
            </a>
          ) : (
            <span className="flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-medium w-full md:w-auto justify-center ">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
              <span className="truncate dir-ltr">{order.receiptFile}</span>
            </span>
          )}
        </div>
      )}

    </div>
  </div>
);

const SupportSection = () => (
  <div className="space-y-6 text-center">
    <button
      onClick={() => window.open('https://wa.me/201015580843', '_blank')}
      className="w-full  mx-auto 
bg-[#0cc042] 
border border-[#0cc042]/40 
text-white 
font-semibold 
py-3.5 
rounded-[1.5rem] 
transition-all duration-300 
flex items-center justify-center gap-3
hover:bg-[#0cc042]/5 
hover:border-[#0cc042] 
hover:shadow-md 
hover:text-[#0cc042] cursor-pointer"
    >
      <FaWhatsapp className="text-xl text-[#fff]" />
      <span>تواصل مع الدعم الفني عبر واتساب</span>
    </button>

    <Link
      to="/"
      className="inline-block text-gray-400 hover:text-gray-600 transition-colors font-medium text-sm"
    >
      العودة للصفحة الرئيسية
    </Link>
  </div>
);

// --- Main Page Component ---

const OrderUnderReview = () => {
  const location = useLocation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      const orders = JSON.parse(localStorage.getItem('shams_orders') || '[]');
      if (orders.length > 0) {
        setOrder(orders[orders.length - 1]);
      }
    }
  }, [location.state]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <Link to="/" className="text-[#e6a219] hover:underline font-bold">العودة للرئيسية</Link>
      </div>
    );
  }

  // Extract First Name Logic
  const getFirstName = (fullName) => {
    if (!fullName) return 'عزيزي';
    return fullName.trim().split(' ')[0];
  };

  const firstName = getFirstName(order.customerInfo?.name);

  if (order.status === 'approved') {
    return <Navigate to="/checkout/success" state={{ order }} replace />;
  }

  return (
    <div className="mt-[6rem]  bg-[#F8F9FB] flex flex-col items-center justify-center p-4 font-sans relative">

      <div className="relative z-10 container-narrow">

        {/* Main Card */}
        <div className="bg-white p-10 pt-16 rounded-[2rem] border border-gray-300 relative overflow-hidden">

          <ReviewHeader />

          <ReviewMessage
            firstName={firstName}
            paymentMethod={order.paymentMethod}
          />

          <OrderMetaCard order={order} />

          <SupportSection />

          {/* Footer Note within card or just below? Image suggests it might be bottom part of card area or separate. Putting it inside card as bottom section for cleaner look or outside. Image shows it inside a lighter footer area of the card. Let's add a footer section to the card. */}

          <div className="mt-8 pt-6 border-t border-gray-50 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <FaCircleInfo className="text-gray-300" />
            <span>في حال وجود خطأ في الإيصال، سيتم التواصل معك عبر البريد الإلكتروني.</span>
          </div>

        </div>

      </div>

      {/* Footer Copyright Links - Outside Card */}
      <div className="mt-8 flex gap-6 text-xs text-gray-400">
        <Link to="/policy" className="hover:text-gray-600">سياسة الاسترجاع</Link>
        <span>•</span>
        <Link to="/faq" className="hover:text-gray-600">الأسئلة الشائعة</Link>
      </div>

      {/* DEV LINK - KEEP FOR TESTING */}
      <div className="absolute bottom-4 right-4 opacity-0 hover:opacity-50 transition-opacity">
        <Link
          to="/checkout/success"
          state={{ order }}
          className="text-[10px] bg-black text-white px-2 py-1 rounded"
        >
          [DEV]
        </Link>
      </div>

    </div>
  );
};

export default OrderUnderReview;
