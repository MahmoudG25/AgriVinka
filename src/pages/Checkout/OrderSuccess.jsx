import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheck, FaArrowLeft, FaRegCopy, FaCloud } from 'react-icons/fa6';
import { FaRegFolderOpen } from 'react-icons/fa';
import ProductSummaryCard from '../../components/checkout/ProductSummaryCard';
import { courseService } from '../../services/firestore/courseService';
import { roadmapService } from '../../services/firestore/roadmapService';
import { orderService } from '../../services/firestore/orderService';
import { logger } from '../../utils/logger';

const OrderSuccess = () => {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderAndProduct = async () => {
      let foundOrder = location.state?.order;
      
      // If we only got the ID (from redirect or previous page)
      const orderId = location.state?.orderId || foundOrder?.id || foundOrder?.orderId;

      if (!foundOrder && orderId) {
        try {
           const fetchedOrder = await orderService.getOrderById(orderId);
           if (fetchedOrder) {
              foundOrder = { ...fetchedOrder, id: fetchedOrder.id || orderId };
           } else {
              logger.warn(`Order Success: Order not found for ID: ${orderId}`);
           }
        } catch (error) {
           logger.error('Error fetching order for success page:', error);
        }
      }

      setOrder(foundOrder);

      if (foundOrder) {
        try {
          let fetchedProduct = null;
          // Itemtype is used in the DB, productType might be legacy front-end map
          const type = foundOrder.itemType || foundOrder.productType;
          
          if (type === 'course') {
            fetchedProduct = await courseService.getCourseById(foundOrder.itemId || foundOrder.productId);
          } else if (type === 'track' || type === 'roadmap') {
            fetchedProduct = await roadmapService.getRoadmapById(foundOrder.itemId || foundOrder.productId);
          }
          setProduct(fetchedProduct);
        } catch (error) {
          logger.error("Error fetching product details:", error);
        }
      }
      setLoading(false);
    };
    fetchOrderAndProduct();
  }, [location.state]);

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
           <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[#e6a219] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-bold">جاري تحميل بيانات الطلب...</p>
           </div>
        </div>
     );
  }

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
  const productType = order.itemType || order.productType;
  const productId = order.itemId || order.productId;
  const contentLink = order.accessLink || (productType === 'track' || productType === 'roadmap' ? `/roadmaps/${productId}` : `/courses/${productId}`);
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
          شكراً لانضمامك إلينا. رحلتك المعرفية مع "AgriVinka" تبدأ الآن.
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
