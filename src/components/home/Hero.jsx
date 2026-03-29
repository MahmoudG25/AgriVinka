import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import VideoModal from '../common/VideoModal';

const DEFAULT_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBTKmWhez9b101sSoIDiSGoQ4OzhrimMSQtb_PJbzgpnGBdLWWqm8wp-_e7Ed9gB1UUPm-GsLQf_LqdWUmi_-pVNfvqpVdU9KRqWnUUjcAoG3u_V1L6_C6nNoTpd2GcbjJcLj5DoH5Rfn4lvx2DlM1j9SO8GrZNcRHlDdGQ1VtxZla5RX1UDtSe9FLQdpo6lk8Z6Xpexf8OvSvTTI_a70b_dfC2eWZa5fCuvbFMiPfAXZY8jOmUeunjDuISEC0SdY_nJu91gDw1Cpo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDVCpBzq7nKMMn0310H0J94wEg1ejsYH1oWYQ5hK8lBTiFk8BgUg9ySLy0bt4GU2nHJDNO7iq4MZJbWDChnE8oLOERo77ICGadg3k1k33Ag6eSiNh9ffy5XynsGN-FvW4ORj0-d54O6zI_bDjBjD9mcRANcnN6gcO0b8yt4I5K7-FkKVAJzgUZK0zR6aQ4q-Z3mrxPETkz07mVXTP3qrtxdcXe41OkjJpnQk_A_qqHka110iFcA_SiOaDGuvWw90IGdJ-NOR6U3Bbw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBp5ijlG7F4mZjeqlQBVjebdRVtZdNg03WEHAIhydMj0AuBNhN-xbUVRF0O8TqtaNsCPMthz_IjTxfuIAt7VZcwCSkEJWnSeuABc2TUUJi1Fd8XPR-gXd8dDlStG-B_igRJbpxMLYVWaZVgQRxfghlI9RyAs1bOl4D1eZNPZ8o7dYU7bLIw89heumoNtrRguKtymBW2vWBV56YUsXs4CYK0mlMKi0okHNssPDyjaImQRSwE8bEWZMJbaEY02l_gzZ0Bgi1BdYARpjM",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBBTXX0HUFOERBieY3zdPe-tCvR-aOcmIncBDHkX79H5gR4Fm0CY78zMLnVdLtYRNk2KsJDEqPbJb25Phi2Mt2gViLIKF_JuCbgtlFezc-4eUdmC0-yVTpvFNibXbryK9nkWuhJpiG86joIFWL-RJfY1GhE3kAVPItzV_qFJ2Dzuya_Ecu4-GwzG4BVcKmHsZrIgIk-ESVtU1u-gzqGu3WQPOfSLEqF1dQyKZqIoWJcd0SZ-Adg7WriPeVKUfIB95M4_LqPi67Qpvw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCWzp81q3aBT51MdPeHVknhEFfhZivTe6Ndm94jV-M4jOpcE9-SiFzcBSxOstTf0SXbksmwQ8Z4OvteZHZkwvgIwGksO3vNTnW3j9OXwtNDHlrPW3BpAkpr10DAjeXBXtkU6rMXeLK_7EHa7Lr07I9iP-wnPlZ62Q5-u89DmqmXzxlbI8ubyN67PWMfa8cqE3a_ZPzQdENx-NQImTB66Nv7igeFYZ4C-L9DfrHAfrwvOMKZE_sgMlFr9JniHhz0C1VS0VDdbb45VFI",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBlDweBEFcznHGl9FeLXf-2SaPaVumFOFddD7v4iGFtecOlgNyr-mLKubI47pirjpv7Vj9i-Y1GVDYz6R7LV4HpfLQHtil_DD3QE8eZQB8IUKof3jlfxd-ELHH3jqZb_KhATfogr27TbXP6zj0zxkf5_PFKMpOjpSbLmgnrqntjBI-OWKBoDb7p7BbOyGx-j2I6khzy1DY6DpQb5xNk4jAulM5lAbUwW1KNO6BZGsXXkb9VC6WXJbM9wCRJh281zN1nGTMeOqcdYNU",
];

/* ─── Stagger helpers ─── */
const stagger = {
  parent: {
    animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  },
  child: {
    initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const Hero = ({ data }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const badgeText = data?.badge || '🚀 روّاد التعليم الزراعي الحديث';
  const title = data?.title || 'ارتقِ بمسارك المهني';
  const subtitle = data?.subtitle || 'كمهندس زراعي عبر دورات متخصصة ومسارات معتمدة تجمع بين الأساس الأكاديمي والتطبيق الميداني.';
  const ctaText = data?.ctaText || 'تصفح الدورات';
  const videoUrl = data?.videoUrl || '';

  const allImages = (data?.images?.length > 0) ? data.images : DEFAULT_IMAGES;

  // Active image index for crossfading
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!allImages || allImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 4000); // 4 seconds per image
    return () => clearInterval(interval);
  }, [allImages]);

  return (
    <header className="relative pt-6 pb-14 lg:pt-16 lg:pb-24 overflow-hidden bg-warm-light min-h-[75vh] lg:min-h-[90vh] flex items-center">

      {/* ─── Background Decor ─── */}
      <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-br from-primary/8 to-secondary/4 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/8 to-primary/3 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      {/* Subtle grid pattern for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #1B5E20 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

        {/* ─── Right: Text Content ─── */}
        <motion.div
          className="order-2 lg:order-1 text-start space-y-7 min-w-0"
          variants={stagger.parent}
          initial="initial"
          animate="animate"
        >

          {/* Badge */}
          <motion.div variants={stagger.child} transition={stagger.child.transition}>
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-primary/15 text-heading-dark font-bold text-sm shadow-xs hover:shadow-sm transition-shadow">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              {badgeText}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={stagger.child} transition={stagger.child.transition} className="space-y-4 lg:space-y-5">
            {data?.title ? (
              <h1 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-[4.25rem] xl:text-[4.75rem] font-black leading-[1.15] text-heading-dark tracking-tight whitespace-pre-line">
                {title}
              </h1>
            ) : (
              <h1 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-[4.25rem] xl:text-[4.75rem] font-black leading-[1.15] text-heading-dark tracking-tight">
                من التشتت <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-secondary to-primary bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                  إلى الوضوح
                </span>
              </h1>
            )}
            <p className="text-base sm:text-lg lg:text-xl text-body-text/75 leading-relaxed font-medium max-w-[540px]">
              {subtitle}
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={stagger.child} transition={stagger.child.transition} className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <Link to={data?.ctaLink || "/learning-paths"} className="w-full sm:w-auto block">
              <button className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-base sm:text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 overflow-hidden cursor-pointer">
                {/* Shine effect */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <span className="relative z-10">{ctaText}</span>
                <span className="relative z-10 material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform rtl:rotate-180">
                  arrow_right_alt
                </span>
              </button>
            </Link>

            {videoUrl && (
              <button
                onClick={() => setIsVideoOpen(true)}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl border-2 border-heading-dark/10 bg-white/60 backdrop-blur-sm text-heading-dark font-bold text-base sm:text-lg hover:border-primary/30 hover:bg-white hover:shadow-md active:scale-[0.98] transition-all duration-300 cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">play_circle</span>
                شاهد كيف نعمل
              </button>
            )}
          </motion.div>

          {/* Trust Strip */}
          <motion.div
            variants={stagger.child}
            transition={stagger.child.transition}
            className="pt-7 border-t border-heading-dark/6 flex flex-wrap gap-y-3 gap-x-6 lg:gap-x-8 items-center"
          >
            {[
              { icon: 'verified_user', color: 'text-success', text: 'ضمان استرداد 30 يوم' },
              { icon: 'all_inclusive', color: 'text-primary', text: 'وصول مدى الحياة' },
              { icon: 'workspace_premium', color: 'text-accent', text: 'شهادات معتمدة' },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-2 text-sm font-bold text-body-text/65 hover:text-heading-dark transition-colors">
                <span className={`material-symbols-outlined text-lg ${item.color}`}>{item.icon}</span>
                {item.text}
              </span>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={stagger.child}
            transition={stagger.child.transition}
            className="flex gap-8 sm:gap-10 pt-3"
          >
            {(data?.stats?.length > 0 ? data.stats : [
              { value: '+10k', label: 'طالب' },
              { value: '+50', label: 'دورة' },
              { value: '4.9', label: '★★★★★', isStars: true },
            ]).map((stat, i) => (
              <div key={i} className="group">
                <p className="text-2xl sm:text-3xl font-black text-heading-dark group-hover:text-primary transition-colors">
                  {stat.value}
                </p>
                {stat.isStars || stat.label === '★★★★★' ? (
                  <p className="flex text-accent text-sm mt-0.5">{stat.label}</p>
                ) : (
                  <p className="text-xs sm:text-sm text-muted font-bold mt-0.5">{stat.label}</p>
                )}
              </div>
            ))}
          </motion.div>

        </motion.div>

        {/* ─── Left: Image Area (Crossfade) ─── */}
        <motion.div
          className="relative order-1 lg:order-2 w-full lg:h-[550px] flex justify-center items-center"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative w-[90%] sm:w-[80%] lg:w-full max-w-[550px] aspect-square rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-border shadow-primary/10 bg-white group">

            {/* Framer Motion Crossfade */}
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentImageIndex}
                src={allImages[currentImageIndex]}
                alt="AgriVinka Hero"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                loading="eager"
                fetchPriority="high"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-heading-dark/60 via-transparent to-transparent opacity-80" />

            {/* Floating badge */}
            <div className="absolute bottom-6 right-6 left-6 flex justify-end">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md text-sm font-bold text-heading-dark shadow-xl border border-white/20">
                <span className="material-symbols-outlined text-primary">verified</span>
                بيئة تعليمية متكاملة
              </span>
            </div>

            {/* Decorative Dots */}
            <div className="absolute top-4 left-4 grid grid-cols-2 gap-1.5 opacity-50">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
              ))}
            </div>
          </div>
        </motion.div>

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

export default React.memo(Hero);
