import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export const defaultSteps = [
  {
    stepNumber: "01",
    title: "تأسيس قوي (Foundation)",
    subtitle: "البداية الصحيحة",
    description: "تعلم اللغات الأساسية (HTML, CSS, JS) بفهم عميق للمنطق البرمجي، وليس مجرد حفظ للأكواد. ستمتلك عقلية المبرمج المحترف.",
    icon: "architecture", // Google Material Symbol
    color: "from-blue-500 to-blue-700",
    shadow: "shadow-blue-500/30",
    duration: "4 أسابيع",
    outcome: "بناء واجهات مواقع كاملة",
    income: "بداية الطريق",
    emotional: "ستشعر لأول مرة أنك تفهم كيف يعمل الويب، وتتخلص من رهبة البدايات.",
    progress: 20,
    id: "step-01" // Added ID for admin key handling
  },
  {
    stepNumber: "02",
    title: "التطبيقات العملية (Practice)",
    subtitle: "كسر حاجز الخوف",
    description: "لن تتعلم بالمشاهدة. سنبني معاً مشاريع صغيرة وتحديات برمجية تكسر حاجز الخوف وتثبت المعلومات في عقلك للأبد.",
    icon: "construction",
    color: "from-green-500 to-green-700",
    shadow: "shadow-green-500/30",
    duration: "6 أسابيع",
    outcome: "+15 تطبيق تفاعلي",
    income: "جاهز لمشاريع بسيطة",
    emotional: "ستشعر بالثقة حين ترى كودك يعمل ويتحرك أمامك. ستبدأ الاستمتاع بالبرمجة.",
    progress: 40,
    id: "step-02"
  },
  {
    stepNumber: "03",
    title: "مشاريع التخرج (Mastery)",
    subtitle: "محاكاة سوق العمل",
    description: "بناء أنظمة كاملة (E-commerce, Dashboard, SaaS) بنفس معايير الشركات الكبرى. كود نظيف، قابل للتطوير، واحترافي.",
    icon: "rocket_launch",
    color: "from-orange-500 to-orange-700",
    shadow: "shadow-orange-500/30",
    duration: "8 أسابيع",
    outcome: "3 مشاريع ضخمة",
    income: "مؤهل للتوظيف (Junior)",
    emotional: "ستنتقل من 'مبتدئ' إلى 'محترف' يمتلك أدواته وقادر على حل المشاكل المعقدة.",
    progress: 75,
    id: "step-03"
  },
  {
    stepNumber: "04",
    title: "الانطلاق الوظيفي (Launch)",
    subtitle: "الحصاد والربح",
    description: "كيف تبيع مهاراتك؟ تجهيز البورتفوليو، تظبيط الـ LinkedIn، مهارات التفاوض، وكيف تحصل على أول عرض عمل أو مشروع.",
    icon: "workspace_premium",
    color: "from-purple-500 to-purple-700",
    shadow: "shadow-purple-500/30",
    duration: "مستمر",
    outcome: "وظيفة / فريلانس",
    income: "أول دخل بالدولار 💵",
    emotional: "لحظة الفخر الحقيقية. تحويل المجهود والشغف إلى مهنة ومستقبل آمن.",
    progress: 100,
    id: "step-04"
  }
];

export const defaultRoadmapData = {
  title: "خارطة طريقك من الصفر",
  subtitle: "إلى الاحتراف والدخل",
  description: "لا نبيع لك كورسات، نحن نصمم لك رحلة تحول كاملة. خطوات مدروسة علمياً لتضمن وصولك للهدف دون تشتت.",
  studentCount: "+1.2k",
  finalTitle: "من الصفر...",
  finalIncome: "$1,250.00",
  finalDesc: "هذه ليست مجرد دورة تعليمية، هذا استثمار في مستقبلك. هدفنا النهائي هو أن نرى ذلك الإشعار: \"لقد تلقيت دفعة جديدة\" في حسابك البنكي."
};

const Roadmap = ({ data }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Use dynamic data or fallback
  const steps = (data?.steps && data.steps.length > 0) ? data.steps : defaultSteps;
  const headerTitle = data?.title || "خارطة طريقك من الصفر";
  const headerSubtitle = data?.subtitle || "إلى الاحتراف والدخل";
  const headerDesc = data?.description || "لا نبيع لك كورسات، نحن نصمم لك رحلة تحول كاملة. خطوات مدروسة علمياً لتضمن وصولك للهدف دون تشتت.";
  const studentCount = data?.studentCount || "+1.2k";

  // Final Anchor Data
  const finalTitle = data?.finalTitle || "من الصفر...";
  const finalIncome = data?.finalIncome || "$1,250.00";
  const finalDesc = data?.finalDesc || "هذه ليست مجرد دورة تعليمية، هذا استثمار في مستقبلك. هدفنا النهائي هو أن نرى ذلك الإشعار: \"لقد تلقيت دفعة جديدة\" في حسابك البنكي.";

  return (
    <section className="section-padding bg-background-alt relative overflow-hidden" id="roadmap" ref={containerRef}>

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-accent/5 rounded-full blur-3xl mix-blend-multiply"></div>
      </div>

      <div className="container-layout relative z-10">

        {/* 1. Psychological Header */}
        <div className="text-center mb-24 mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            {/* Micro Social Proof */}
            <div className="flex -space-x-4 space-x-reverse rtl:space-x-reverse">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="Student" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-heading-dark text-white flex items-center justify-center text-xs font-bold relative z-10">
                {studentCount}
              </div>
            </div>
            <span className="text-gray-500 text-sm font-semibold mr-3">طالب بدأوا الرحلة من هنا</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-heading-dark mb-6 leading-tight">
            {headerTitle} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{headerSubtitle}</span>
          </h2>
          <p className="text-xl text-gray-500 font-medium leading-relaxed ">
            {headerDesc}
          </p>
        </div>

        {/* 2. Transformation Journey (Timeline) */}
        <div className="relative w-full">

          {/* Central Progress Line (The Path) - Desktop Only */}
          <div className="hidden md:block absolute left-[20px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-1 bg-border-light/50 rounded-full">
            <motion.div
              style={{ height }}
              className="w-full bg-gradient-to-b from-primary via-accent to-primary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)]"
            />
          </div>

          {/* Steps */}
          <div className="space-y-12 md:space-y-24">
            {steps.map((step, index) => (
              <RoadmapCard key={index} step={step} index={index} />
            ))}
          </div>

        </div>

        {/* 3. Final Transformation Anchor */}
        <div className="mt-32">
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-heading-dark to-black p-1 shadow-2xl transform hover:scale-[1.01] transition-transform duration-500">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-[1.9rem] p-8 md:p-12 text-center md:text-right flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">

              {/* Text */}
              <div className="flex-1">
                <div className="inline-block px-4 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold mb-4 border border-accent/20">
                  🏆 الجائزة الكبرى
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                  {finalTitle} <span className="text-accent">إلى أول دولار 💵</span>
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  {finalDesc}
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    حرية مالية
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    عمل عن بعد
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    أمان وظيفي
                  </div>
                </div>
              </div>

              {/* Visual Transformation */}
              <div className="w-full md:w-80 bg-white/5 rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                  <span className="text-gray-400 text-xs font-mono">Current Balance</span>
                  <span className="text-green-400 text-xs font-mono animate-pulse">● Live</span>
                </div>
                <div className="text-center py-4">
                  <span className="block text-gray-500 text-sm line-through mb-1">$0.00</span>
                  <span className="block text-4xl font-black text-white tracking-tight group-hover:text-accent transition-colors duration-300">{finalIncome}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-gray-400">
                  <span>Project Payment</span>
                  <span>Just Now</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 4. Conversion CTAs */}
        <div className="mt-16 text-center flex flex-col md:flex-row items-center justify-center gap-6">
          <Link to="/learning-paths" className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white transition-all duration-200 bg-primary font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 overflow-hidden hover:scale-105 shadow-xl hover:shadow-primary/50">
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center gap-3">
              ابدأ أول مرحلة الآن مجاناً
              <span className="material-symbols-outlined rtl:rotate-180 group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
            </span>
          </Link>

          <Link to="/roadmaps" className="text-heading-dark font-bold text-lg hover:text-primary transition-colors flex items-center gap-2 group">
            <span>شاهد تفاصيل المسار الكامل</span>
            <span className="material-symbols-outlined text-xl group-hover:translate-y-1 transition-transform">expand_more</span>
          </Link>
        </div>

      </div>
    </section>
  );
};

// --- Sub Component: Premium Roadmap Card (Accordion on Mobile / Timeline on Desktop) ---
const RoadmapCard = ({ step, index }) => {
  const isEven = index % 2 === 0;
  const [isExpanded, setIsExpanded] = useState(index === 0); // Default first open on mobile

  // Animation Variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={cardVariants}
      className={`relative w-full z-10`}
    >
      {/* --- Desktop Layout (md:flex) --- */}
      <div className={`hidden md:flex items-center justify-between w-full md:gap-12 pl-12 md:pl-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse text-right rtl:text-right'}`}>
        {/* CENTER NODE */}
        <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} shadow-lg flex items-center justify-center text-white border-4 border-background-alt relative group cursor-pointer transition-transform hover:scale-110`}>
            <span className="material-symbols-outlined text-2xl">{step.icon}</span>
            <div className={`absolute inset-0 rounded-full ${step.color} opacity-20 animate-ping`}></div>
          </div>
        </div>

        {/* EMPTY SIDE */}
        <div className="w-5/12"></div>

        {/* CARD CONTENT */}
        <div className="w-5/12">
          <div className="group relative bg-white rounded-3xl p-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border-light overflow-visible">
            {/* Step Number Badge */}
            <div className={`absolute -top-5 ${isEven ? 'left-8' : 'right-8'} w-12 h-12 bg-heading-dark text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg rotate-3 group-hover:rotate-12 transition-transform duration-300 z-30 border-2 border-white`}>
              {step.stepNumber}
            </div>

            <div className={`active p-6 md:p-8 rounded-[1.4rem] bg-gradient-to-br from-white to-gray-50 h-full relative overflow-hidden`}>
              {/* Top Meta */}
              <div className="flex items-center gap-3 mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                <span className="bg-gray-100 px-3 py-1 rounded-full">{step.duration}</span>
                <span className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-sm">stars</span> {step.outcome}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-black text-heading-dark mb-2 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-sm font-bold text-primary mb-4">{step.subtitle}</p>

              {/* Description */}
              <p className="text-gray-500 leading-relaxed text-sm mb-6 border-b border-dashed border-gray-200 pb-6">
                {step.description}
              </p>

              {/* Emotional Layer */}
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 mb-6">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-accent shrink-0">sentiment_satisfied</span>
                  <p className="text-sm font-bold text-heading-dark/80 italic">"{step.emotional}"</p>
                </div>
              </div>

              {/* Outcome/Income & Progress */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">المكسب المتوقع</span>
                  <span className="font-black text-sm text-green-600 flex items-center gap-1">
                    {step.income}
                    {index === 3 && <span className="animate-bounce">💰</span>}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 font-bold mb-1">إنجاز</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div style={{ width: `${step.progress}%` }} className={`h-full bg-gradient-to-r ${step.color} rounded-full`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Mobile Layout (Accordion) --- */}
      <div className="md:hidden">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            bg-white rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer
            ${isExpanded ? 'shadow-xl border-primary/30' : 'shadow-sm border-border-light'}
          `}
        >
          {/* Mobile Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-md`}>
                <span className="material-symbols-outlined text-xl">{step.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-heading-dark/50 bg-gray-100 px-2 py-0.5 rounded-md">
                    M{step.stepNumber}
                  </span>
                  {isExpanded && <span className="text-xs font-bold text-primary">{step.duration}</span>}
                </div>
                <h3 className="font-bold text-heading-dark text-lg leading-tight">{step.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Visual Progress Circle on Mobile */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${step.progress}, 100`} className={index === 3 ? "text-green-500" : "text-primary"} />
                </svg>
                <span className="material-symbols-outlined absolute text-sm text-gray-400">
                  {isExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-4 pb-6 pt-0 border-t border-dashed border-gray-100 mt-2">
                  <p className="text-sm font-bold text-primary mb-2 mt-4">{step.subtitle}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{step.description}</p>

                  <div className="bg-background-alt p-3 rounded-xl mb-4 border border-border-light text-xs font-medium text-gray-600 flex gap-2">
                    <span className="material-symbols-outlined text-accent text-base">emoji_objects</span>
                    {step.emotional}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-6">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-green-600">payments</span>
                      {step.income}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-blue-600">school</span>
                      {step.outcome}
                    </span>
                  </div>

                  <Link to="/learning-paths" className="block w-full text-center py-3 rounded-xl bg-heading-dark text-white font-bold shadow-lg hover:bg-primary transition-colors">
                    ابدأ هذه المرحلة
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Roadmap;
