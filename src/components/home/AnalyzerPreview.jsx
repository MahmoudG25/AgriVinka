import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AnalyzerPreview = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-primary/5 relative overflow-hidden">

      {/* Decorative BG Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Text Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-right space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-primary/20 text-primary font-bold text-sm mx-auto lg:mx-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              ميزة جديدة مدعومة بالذكاء الاصطناعي
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-heading-dark leading-tight">
              فاحص أمراض النبات <br />
              <span className="text-primary">الذكي والمجاني</span>
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              هل تواجه مشكلة في محصولك ولا تعرف السبب؟ التقط صورة للورقة المصابة وسيقوم الذكاء الاصطناعي الخاص بنا بتشخيص المرض واقتراح أفضل طرق العلاج والوقاية في ثوانٍ معدودة.
            </p>

            <ul className="space-y-4 text-right">
              <li className="flex items-center gap-3 text-heading-dark font-medium">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 material-symbols-outlined text-sm">bolt</span>
                تحليل دقيق وسريع باستخدام OpenAI و Gemini
              </li>
              <li className="flex items-center gap-3 text-heading-dark font-medium">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 material-symbols-outlined text-sm">photo_camera</span>
                يعمل برفع الصور أو بالتقاطها مباشرة من هاتفك
              </li>
              <li className="flex items-center gap-3 text-heading-dark font-medium">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 material-symbols-outlined text-sm">healing</span>
                خطوات علاجية مفصلة و مراجع علمية
              </li>
            </ul>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/analyzer" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">document_scanner</span>
                جرب الفاحص الآن
              </Link>
            </div>
          </div>

          {/* Visual/Mockup */}
          <div className="w-full lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative mx-auto w-full max-w-md aspect-[4/5] bg-white rounded-[2.5rem] p-4 shadow-2xl border-4 border-white z-10 overflow-hidden"
            >
              {/* Fake UI Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-100 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">psychiatry</span>
                </div>
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-3 w-20 bg-gray-100 rounded-full"></div>
                </div>
              </div>

              {/* Fake scanning box */}
              <div className="w-full aspect-square bg-gray-50 rounded-3xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center relative overflow-hidden group">

                {/* Fake image (just a green tint for preview) */}
                <div className="absolute inset-0 bg-green-900/10"></div>

                {/* Scanning line animation */}
                <motion.div
                  animate={{ y: ["0%", "400%", "0%"] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute top-0 w-full h-8 bg-gradient-to-b from-transparent to-primary/40 border-b-2 border-primary shadow-[0_4px_10px_rgba(var(--color-primary),0.5)] z-20"
                ></motion.div>

                <span className="material-symbols-outlined text-6xl text-primary/40 relative z-10 group-hover:scale-110 transition-transform">document_scanner</span>
              </div>

              {/* Fake Result box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 left-8 right-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <div className="h-3 w-24 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full mb-1"></div>
                <div className="h-2 w-3/4 bg-gray-100 rounded-full"></div>
              </motion.div>
            </motion.div>

            {/* Backdrop decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/40 blur-3xl rounded-full z-0 pointer-events-none"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AnalyzerPreview;
