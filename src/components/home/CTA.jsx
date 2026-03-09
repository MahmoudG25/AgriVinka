import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CTA = ({ data }) => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background with Gradient */}
      <div className="absolute inset-0 bg-heading-dark">
        {/* DB Image as background */}
        {data?.images?.[0] && (
          <img src={data.images[0]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" loading="lazy" decoding="async" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-heading-dark via-heading-dark/10 to-black/70"></div>
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container-narrow relative z-10 text-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary font-bold text-sm mb-6 border border-primary/20">
            ⏳ العرض سينتهي قريباً
          </span>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg">
            {data?.title || "هل أنت مستعد لتطوير مهاراتك الزراعية؟"}
          </h2>

          <p className="text-xl text-gray-200 mb-10 mx-auto font-medium drop-shadow-md leading-relaxed">
            {data?.subtitle || data?.description || "لا تضيع المزيد من الوقت في البحث العشوائي. انضم الآن وابدأ رحلة الاحتراف في الهندسة الزراعية مع خطة مدروسة."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link to="/pricing" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-12 py-5 bg-primary hover:bg-accent text-heading-dark font-black text-xl rounded-full shadow-2xl hover:shadow-primary/50 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 duration-300 min-w-[200px]">
                {data?.buttonText || "اشترك الآن"}
              </button>
            </Link>
            <Link to="/courses" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-12 py-5 bg-transparent border-2 border-white/20 hover:bg-white/10 text-white font-bold text-xl rounded-full transition-all min-w-[200px]">
                تصفح الدورات
              </button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-400 font-medium">
            🔒 دفع آمن 100% • 💎 ضمان استرداد الأموال
          </p>

        </motion.div>

      </div>
    </section>
  );
};

export default CTA;
