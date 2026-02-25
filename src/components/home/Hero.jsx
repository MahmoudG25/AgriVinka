import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoModal from '../common/VideoModal';

const DEFAULT_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBTKmWhez9b101sSoIDiSGoQ4OzhrimMSQtb_PJbzgpnGBdLWWqm8wp-_e7Ed9gB1UUPm-GsLQf_LqdWUmi_-pVNfvqpVdU9KRqWnUUjcAoG3u_V1L6_C6nNoTpd2GcbjJcLj5DoH5Rfn4lvx2DlM1j9SO8GrZNcRHlDdGQ1VtxZla5RX1UDtSe9FLQdpo6lk8Z6Xpexf8OvSvTTI_a70b_dfC2eWZa5fCuvbFMiPfAXZY8jOmUeunjDuISEC0SdY_nJu91gDw1Cpo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDVCpBzq7nKMMn0310H0J94wEg1ejsYH1oWYQ5hK8lBTiFk8BgUg9ySLy0bt4GU2nHJDNO7iq4MZJbWDChnE8oLOERo77ICGadg3k1k33Ag6eSiNh9ffy5XynsGN-FvW4ORj0-d54O6zI_bDjBjD9mcRANcnN6gcO0b8yt4I5K7-FkKVAJzgUZK0zR6aQ4q-Z3mrxPETkz07mVXTP3qrtxdcXe41OkjJpnQk_A_qqHka110iFcA_SiOaDGuvWw90IGdJ-NOR6U3Bbw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBp5ijlG7F4mZjeqlQBVjebdRVtZdNg03WEHAIhydMj0AuBNhN-xbUVRF0O8TqtaNsCPMthz_IjTxfuIAt7VZcwCSkEJWnSeuABc2TUUJi1Fd8XPR-gXd8dDlStG-B_igRJbpxMLYVWaZVgQRxfghlI9RyAs1bOl4D1eZNPZ8o7dYU7bLIw89heumoNtrRguKtymBW2vWBV56YUsXs4CYK0mlMKi0okHNssPDyjaImQRSwE8bEWZMJbaEY02l_gzZ0Bgi1BdYARpjM",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBBTXX0HUFOERBieY3zdPe-tCvR-aOcmIncBDHkX79H5gR4Fm0CY78zMLnVdLtYRNk2KsJDEqPbJb25Phi2Mt2gViLIKF_JuCbgtlFezc-4eUdmC0-yVTpvFNibXbryK9nkWuhJpiG86joIFWL-RJfY1GhE3kAVPItzV_qFJ2Dzuya_Ecu4-GwzG4BVcKmHsZrIgIk-ESVtU1u-gzqGu3WQPOfSLEqF1dQyKZqIoWJcd0SZ-Adg7WriPeVKUfIB95M4_LqPi67Qpvw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCWzp81q3aBT51MdPeHVknhEFfhZivTe6Ndm94jV-M4jOpcE9-SiFzcBSxOstTf0SXbksmwQ8Z4OvteZHZkwvgIwGksO3vNTnW3j9OXwtNDHlrPW3BpAkpr10DAjeXBXtkU6rMXeLK_7EHa7Lr07I9iP-wnPlZ62Q5-u89DmqmXzxlbI8ubyN67PWMfa8cqE3a_ZPzQdENx-NQImTB66Nv7igeFYZ4C-L9DfrHAfrwvOMKZE_sgMlFr9JniHhz0C1VS0VDdbb45VFI",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBlDweBEFcznHGl9FeLXf-2SaPaVumFOFddD7v4iGFtecOlgNyr-mLKubI47pirjpv7Vj9i-Y1GVDYz6R7LV4HpfLQHtil_DD3QE8eZQB8IUKof3jlfxd-ELHH3jqZb_KhATfogr27TbXP6zj0zxkf5_PFKMpOjpSbLmgnrqntjBI-OWKBoDb7p7BbOyGx-j2I6khzy1DY6DpQb5xNk4jAulM5lAbUwW1KNO6BZGsXXkb9VC6WXJbM9wCRJh281zN1nGTMeOqcdYNU",
];

const Hero = ({ data }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const badgeText = data?.badge || '🚀 روّاد التعليم الزراعي الحديث';
  const title = data?.title || 'ارتقِ بمسارك المهني';
  const subtitle = data?.subtitle || 'كمهندس زراعي عبر دورات متخصصة ومسارات معتمدة تجمع بين الأساس الأكاديمي والتطبيق الميداني.';
  const ctaText = data?.ctaText || 'تصفح الدورات';
  const videoUrl = data?.videoUrl || '';

  // Use images from database, fallback to defaults
  const allImages = (data?.images?.length > 0) ? data.images : DEFAULT_IMAGES;
  const sliderImages = useMemo(() => {
    const mid = Math.ceil(allImages.length / 2);
    return [allImages.slice(0, mid), allImages.slice(mid)];
  }, [allImages]);

  return (
    <header className="relative pt-10 pb-12 lg:pt-30 lg:pb-30 overflow-hidden bg-warm-light min-h-[75vh] lg:min-h-[90vh] flex items-center">

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="container-layout relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">

        {/* --- Right: Text Content --- */}
        <div className="order-2 lg:order-1 text-start space-y-8 min-w-0">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary/20 text-heading-dark font-bold text-sm shadow-sm"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            {badgeText}
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3 lg:space-y-4"
          >
            <h1 className="text-3xl md:text-5xl lg:text-[72px] font-black leading-[1.2] lg:leading-[1.15] text-heading-dark tracking-normal">
              من التشتت <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-heading-dark">
                إلى الوضوح
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-body-text/80 leading-relaxed font-medium">
              {subtitle}
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Link to="/learning-paths" className="w-full sm:w-auto block">
              <button className="btn-cta w-full sm:w-auto flex justify-center items-center group">
                <span>{ctaText}</span>
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform rtl:rotate-180">arrow_right_alt</span>
              </button>
            </Link>

            <button
              onClick={() => setIsVideoOpen(true)}
              className="btn-ghost px-8 py-4 w-full sm:w-auto rounded-full font-bold text-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined">play_circle</span>
              شاهد كيف نعمل
            </button>
          </motion.div>

          {/* Trust Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-8 border-t border-heading-dark/5 flex flex-wrap gap-y-4 gap-x-8 items-center text-sm font-bold text-body-text/70"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-lg">verified_user</span>
              ضمان استرداد 30 يوم
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">all_inclusive</span>
              وصول مدى الحياة
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-heading-dark text-lg">workspace_premium</span>
              شهادات معتمدة
            </span>
          </motion.div>

          {/* Stats */}
          <div className="flex gap-10 pt-4 border-t border-heading-dark/5 lg:border-none">
            <div>
              <p className="text-3xl font-black text-heading-dark">+10k</p>
              <p className="text-sm text-gray-500 font-bold">طالب</p>
            </div>
            <div>
              <p className="text-3xl font-black text-heading-dark">+50</p>
              <p className="text-sm text-gray-500 font-bold">دورة</p>
            </div>
            <div>
              <p className="text-3xl font-black text-heading-dark">4.9</p>
              <p className="flex text-accent text-sm">★★★★★</p>
            </div>
          </div>

        </div>

        {/* --- Left: Animated Slider / Mobile Image --- */}
        <div className="relative order-1 lg:order-2 w-full lg:h-[700px] flex justify-center lg:block">

          {/* Mobile Static Image */}
          <div className="block lg:hidden w-[85%] mx-auto rounded-2xl overflow-hidden shadow-lg border border-white/20 relative">
            <img src={allImages[0]} alt="Hero" className="w-full h-auto" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>

          {/* Desktop Slider */}
          <div className="hidden lg:block relative h-full w-full overflow-hidden mask-gradient-b">
            {/* Inner Grid */}
            <div className="grid grid-cols-2 gap-4 h-full w-full rotate-[-2deg] scale-110 origin-center">

              {/* Col 1: Up */}
              <div className="animate-scroll-up flex flex-col gap-4">
                {[...sliderImages[0], ...sliderImages[0], ...sliderImages[0]].map((src, i) => (
                  <div key={`c1-${i}`} className="w-full relative rounded-2xl overflow-hidden shadow-md">
                    <img src={src} className="w-full h-auto hover:scale-105 transition-transform duration-700" alt="Student" />
                  </div>
                ))}
              </div>

              {/* Col 2: Down */}
              <div className="animate-scroll-down flex flex-col gap-4 -mt-32">
                {[...sliderImages[1], ...sliderImages[1], ...sliderImages[1]].map((src, i) => (
                  <div key={`c2-${i}`} className="w-full relative rounded-2xl overflow-hidden shadow-md">
                    <img src={src} className="w-full h-auto hover:scale-105 transition-transform duration-700" alt="Student" />
                  </div>
                ))}
              </div>

            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-warm-light via-warm-light/80 to-transparent z-20"></div>
          </div>
        </div>

      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={videoUrl}
      />
    </header>
  );
};

export default Hero;
