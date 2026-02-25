import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheck, FaArrowLeft, FaRegCopy, FaCloud } from 'react-icons/fa6';
import { FaRegFolderOpen } from 'react-icons/fa';
import ProductSummaryCard from '../../components/checkout/ProductSummaryCard';
import { courseService } from '../../services/courseService';
import { roadmapService } from '../../services/roadmapService';

const OrderSuccess = () => {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrderAndProduct = async () => {
      // Try to get order from state, otherwise fallback to local storage (latest order)
      let foundOrder = location.state?.order;
      if (!foundOrder) {
        const orders = JSON.parse(localStorage.getItem('shams_orders') || '[]');
        if (orders.length > 0) {
          foundOrder = orders[orders.length - 1];
        }
      }
      setOrder(foundOrder);

      if (foundOrder) {
        try {
          let fetchedProduct = null;
          if (foundOrder.productType === 'course') {
            fetchedProduct = await courseService.getCourseById(foundOrder.productId);
          } else if (foundOrder.productType === 'track') {
            fetchedProduct = await roadmapService.getRoadmapById(foundOrder.productId);
          }
          setProduct(fetchedProduct);
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      }
    };
    fetchOrderAndProduct();
  }, [location.state]);

  const handleCopyLink = () => {
    if (order?.accessLink) {
      navigator.clipboard.writeText(order.accessLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link to="/" className="text-primary hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  // Use access link from order if available, otherwise fallback to course page link
  const contentLink = order.accessLink || (order.productType === 'track' ? `/roadmaps/${order.productId}` : `/courses/${order.productId}`);
  const isExternalLink = !!order.accessLink;

  return (
    <div className="min-h-screen bg-[#FFFBF5] pt-28 pb-12 font-sans flex items-center justify-center">

      <div className="bg-white rounded-3xl shadow-xl container-narrow py-12 text-center relative overflow-hidden">
        {/* Top Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-full opacity-50 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-24 h-24 bg-green-50 rounded-br-full opacity-50 pointer-events-none"></div>

        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm animate-scale-in">
          <FaCheck className="text-4xl text-green-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-heading-dark mb-4">
          تمت عملية الشراء بنجاح!
        </h1>
        <p className="text-gray-500 mb-10 text-lg">
          شكراً لانضمامك إلينا. رحلتك المعرفية مع "أكاديمية نماء" تبدأ الآن.
        </p>

        {/* Access Box */}
        <div className="bg-[#FFFAF4] border border-[#F5E6D3] rounded-2xl p-6 mb-8 text-right">
          <div className="flex items-center gap-2 mb-4 text-heading-dark font-bold text-lg">
            <FaRegFolderOpen className="text-accent" />
            <span>الوصول للمحتوى</span>
          </div>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            يمكنك الوصول إلى مكتبة الدورة التدريبية والملفات المرفقة عبر الرابط التالي. يرجى حفظ الرابط للرجوع إليه لاحقاً.
          </p>

          <div className="flex items-center gap-3">
            {/* Copy Button */}
            <button
              onClick={handleCopyLink}
              disabled={!order.accessLink}
              className={`flex-shrink-0 w-32 h-12 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                ${order.accessLink
                  ? 'bg-[#F0EBE5] hover:bg-[#E5DFD7] text-heading-dark'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              {copied ? 'تم النسخ' : 'نسخ الرابط'}
              {!copied && <FaRegCopy />}
            </button>

            {/* Link Display */}
            <div className="flex-grow bg-white border border-gray-200 rounded-xl h-12 flex items-center px-4 relative">
              <span className="text-gray-500 dir-ltr truncate w-full text-left font-mono text-sm">
                {order.accessLink || 'بانتظار تفعيل الرابط...'}
              </span>
              <FaCloud className="text-gray-400 absolute left-4" />
            </div>
          </div>
        </div>

        {/* Main CTA */}
        {isExternalLink ? (
          <a
            href={contentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#D4AF37] text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:bg-[#C5A028] hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 mb-8"
          >
            فتح المحتوى الآن
            <FaArrowLeft />
          </a>
        ) : (
          <Link
            to={contentLink}
            className="w-full bg-[#D4AF37] text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:bg-[#C5A028] hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 mb-8"
          >
            فتح المحتوى الآن
            <FaArrowLeft />
          </Link>
        )}

        <p className="text-xs text-gray-400">
          تم إرسال نسخة من الفاتورة وتفاصيل الدخول إلى بريدك الإلكتروني.
        </p>

        {/* Footer Links */}
        <div className="flex items-center justify-center gap-6 mt-12 text-sm text-gray-400">
          <Link to="/" className="hover:text-primary transition-colors">الصفحة الرئيسية</Link>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <button className="hover:text-primary transition-colors">الدعم الفني</button>
        </div>

      </div>
    </div>
  );
};


export default OrderSuccess;
