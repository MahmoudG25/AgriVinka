import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from '../../utils/logger';
import CheckoutSteps from '../../components/checkout/CheckoutSteps';
import PaymentMethodCard from '../../components/checkout/PaymentMethodCard';
import BankDetailsCard from '../../components/checkout/BankDetailsCard';
import UploadZone from '../../components/checkout/UploadZone';
import OrderSummaryCard from '../../components/checkout/OrderSummaryCard';
import { FaMoneyBillWave, FaWallet, FaCopy, FaUser, FaEnvelope, FaPhone, FaArrowLeft, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import { saveOrder, calculateOrderTotals } from '../../utils/checkoutUtils';
import { courseService } from '../../services/firestore/courseService';
import { roadmapService } from '../../services/firestore/roadmapService';
import { orderService } from '../../services/firestore/orderService';
import { cloudinaryService } from '../../services/cloudinary';
import { useAuth } from '../../app/contexts/AuthContext';

const PaymentSubmission = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const productId = searchParams.get('id');
  const productType = searchParams.get('type');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('manual');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New States
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [electronicProvider, setElectronicProvider] = useState('instapay'); // instapay | vodafone

  // Wallet Phone Number (from environment variable with fallback)
  const WALLET_NUMBER = import.meta.env.VITE_WALLET_NUMBER || '01015580843';

  if (!import.meta.env.VITE_WALLET_NUMBER && import.meta.env.PROD) {
    logger.warn('VITE_WALLET_NUMBER not configured in production');
  }

  useEffect(() => {
    const fetchProduct = async () => {
      if (productId && productType) {
        try {
          let fetchedProduct = null;
          if (productType === 'course') {
            fetchedProduct = await courseService.getCourseById(productId);
          } else if (productType === 'track') {
            fetchedProduct = await roadmapService.getRoadmapById(productId);
          }

          if (fetchedProduct) {
            setProduct(fetchedProduct);
          } else {
            alert('المنتج غير موجود');
            navigate('/');
          }
        } catch (error) {
          logger.error('Error fetching product:', error);
          alert('حدث خطأ أثناء تحميل المنتج');
        }
      } else {
        alert('رابط غير صالح');
        navigate('/');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId, productType, navigate]);


  const paymentMethods = [
    {
      id: 'manual',
      icon: FaMoneyBillWave,
      title: 'تحويل بنكي يدوي',
      description: 'تحويل مباشر لحسابنا البنكي',
      disabled: false
    },
    {
      id: 'electronic',
      icon: FaWallet,
      title: 'دفع إلكتروني',
      description: 'InstaPay, Vodafone Cash',
      disabled: false
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(WALLET_NUMBER);
    alert('تم نسخ الرقم بنجاح');
  };

  const handleSubmit = async () => {
    // Validation
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('يرجى تعبئة بيانات العميل');
      return;
    }

    if (!file) {
      alert('يرجى إرفاق إيصال التحويل');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Check for duplicate pending/approved order FIRST
      if (currentUser?.uid) {
        const existingOrder = await orderService.checkExistingOrder(currentUser.uid, product.id);
        if (existingOrder) {
          alert('لديك بالفعل طلب قيد المراجعة أو معتمد لهذا المسار/الدورة. لا يمكنك تكرار الطلب.');
          setIsSubmitting(false);
          return;
        }
      }

      const { total } = calculateOrderTotals(product, productType);

      // Upload Receipt to Firebase Storage
      let receiptUrl = '';
      if (file) {
        try {
          const uploadUrl = await cloudinaryService.uploadFile(file, "Namaa-Academy/receipts");
          receiptUrl = uploadUrl;
        } catch (uploadError) {
          logger.error('Upload failed:', uploadError);
          alert("فشل رفع الإيصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.");
          setIsSubmitting(false);
          return;
        }
      }

      const orderData = {
        userId: currentUser?.uid || null,
        itemId: product.id,
        itemType: productType === 'track' ? 'roadmap' : 'course', // map "track" to "roadmap"
        productTitle: product.title,
        price: total,
        currency: 'EGP',
        totalAmount: total,
        paymentMethod: selectedMethod === 'electronic' ? electronicProvider : 'manual',
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        receiptUrl: receiptUrl,
        receiptFile: file?.name,
        items: [{ title: product.title, type: productType, price: total }]
      };

      // Save to Firestore
      const firestoreId = await orderService.createOrder(orderData);

      // Add ID to orderData for local storage
      const finalOrderData = { ...orderData, id: firestoreId, orderId: firestoreId };

      // Save Local (for success page fallback)
      saveOrder(finalOrderData);

      navigate('/checkout/review', { state: { order: finalOrderData } });

    } catch (error) {
      logger.error('Order submission failed:', error);
      alert("فشل إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pt-32 pb-20 font-sans">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
        <CheckoutSteps currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-12">

          {/* MAIN CONTENT (Span 8) */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. CUSTOMER INFO SECTON */}
            <section className="bg-white p-8 rounded-[1.5rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">1</div>
                <h2 className="text-2xl font-bold text-heading-dark">بيانات العميل</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-xl px-5 py-3.5 focus:outline-none transition-all pl-12 placeholder-gray-400 text-heading-dark"
                      placeholder="أدخل اسمك الكامل"
                    />
                    <FaUser className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                    <div className="relative group">
                      <input
                        type="email"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-xl px-5 py-3.5 focus:outline-none transition-all pl-12 placeholder-gray-400 text-heading-dark"
                        placeholder="name@example.com"
                      />
                      <FaEnvelope className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                    <div className="relative group">
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-xl px-5 py-3.5 focus:outline-none transition-all pl-12 placeholder-gray-400 text-heading-dark dir-ltr text-right"
                        placeholder="+20 101 0000 000"
                      />
                      <FaPhone className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. PAYMENT METHOD SECTION */}
            <section className="bg-white p-8 rounded-[1.5rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">2</div>
                <h2 className="text-2xl font-bold text-heading-dark">طريقة الدفع</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`
                                relative flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2
                                ${isSelected
                          ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
                          : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'}
                            `}
                    >
                      <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors
                                ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}
                            `}>
                        <method.icon />
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-heading-dark' : 'text-gray-600'}`}>
                          {method.title}
                        </h3>
                        <p className="text-xs text-gray-400">{method.description}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-primary shadow-[0_0_0_3px_white]"></div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Manual Bank Transfer Content */}
              {selectedMethod === 'manual' && (
                <div className="animate-fade-in space-y-6">
                  <BankDetailsCard />
                </div>
              )}

              {/* Electronic Payment Content */}
              {selectedMethod === 'electronic' && (
                <div className="animate-fade-in bg-gray-50 p-6 rounded-2xl border border-gray-200/60 pb-8">
                  <div className="flex gap-3 mb-6 p-1 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <button
                      onClick={() => setElectronicProvider('instapay')}
                      className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${electronicProvider === 'instapay' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      InstaPay
                    </button>
                    <button
                      onClick={() => setElectronicProvider('vodafone')}
                      className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${electronicProvider === 'vodafone' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      Vodafone Cash
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-4 font-medium">
                      {electronicProvider === 'instapay' ? 'حول المبلغ عبر تطبيق انستا باي للرقم التالي:' : 'حول المبلغ عبر محفظة فودافون كاش للرقم التالي:'}
                    </p>
                    <div
                      onClick={handleCopyNumber}
                      className="bg-white border-2 border-dashed border-primary/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <span className="text-3xl font-extrabold text-heading-dark dir-ltr tracking-wider">{WALLET_NUMBER}</span>
                      <div className="flex items-center gap-2 text-primary text-sm font-bold bg-primary/5 px-3 py-1 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                        <FaCopy />
                        <span>اضغط للنسخ</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Zone (Common for both) */}
              <div className="mt-10 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-heading-dark">إرفاق إيصال التحويل</span>
                  <span className="text-sm text-red-500 bg-red-50 px-2 py-0.5 rounded-md font-medium">مطلوب *</span>
                </div>
                <UploadZone onFileSelect={setFile} />
              </div>

            </section>

          </div>

          {/* SIDEBAR (Span 4) */}
          <div className="lg:col-span-4 space-y-6 sticky top-28">
            <OrderSummaryCard product={product} type={productType} />

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !file || !customerInfo.name || !customerInfo.email || !customerInfo.phone}
              className={`
                  w-full py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all duration-300
                  ${isSubmitting || !file || !customerInfo.name || !customerInfo.email || !customerInfo.phone
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-primary text-white hover:bg-accent hover:shadow-2xl hover:-translate-y-1'
                }
              `}
            >
              {isSubmitting ? 'جاري المعالجة...' : 'إتمام الطلب والدفع'}
              {!isSubmitting && <FaArrowLeft />}
            </button>

            <div className="text-center space-y-3 pt-2">
              <div className="flex justify-center gap-4 text-gray-400">
                <FaShieldAlt className="text-lg" />
                <span className="text-xs">دفع آمن ومحمي 100%</span>
              </div>
              <div className="flex justify-center gap-4 text-gray-400">
                <FaHeadset className="text-lg" />
                <span className="text-xs">دعم فني متواجد 24/7</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentSubmission;
