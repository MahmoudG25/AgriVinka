import React from 'react';
import { motion } from 'framer-motion';

const Diagnosis = ({ data }) => {
  // Use dynamic data from CMS, fallback to default only if empty
  const problems = (data?.items && data.items.length > 0) ? data.items : [
    {
      emoji: "😵",
      title: "صدمة الميدان",
      desc: "تتخرج بمعرفة نظرية واسعة لتتفاجأ بأن الواقع في المزارع والمشاتل يختلف تماماً، ولا تعرف من أين تبدأ."
    },
    {
      emoji: "📚",
      title: "مناهج تقليدية",
      desc: "مواد علمية قديمة لا تواكب التقنيات الحديثة في الري الذكي، التسميد الدقيق، وتشخيص الأمراض."
    },
    {
      emoji: "💸",
      title: "مخاطر الخسارة",
      desc: "تشخيص خاطئ لآفة زراعية أو خطأ في خلطة السماد قد يؤدي إلى خسارة محصول كامل في غضون أيام."
    },
    {
      emoji: "⏳",
      title: "صعوبة المواكبة",
      desc: "المعلومات متناثرة وغير موثوقة، والوقت يمر بينما تتزايد تحديات الأمن الغذائي والزراعة المستدامة."
    }
  ];

  return (
    <section className="section-padding bg-surface-white relative overflow-hidden" id="diagnosis">

      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px] opacity-30"></div>
      </div>

      <div className="container-layout relative z-10">

        {/* Header */}
        <div className="text-center w-full mx-auto mb-16">
          <div className="inline-block px-4 py-1 rounded-full bg-red-50 text-red-600 font-bold text-sm mb-6 border border-red-100">
            {data?.badge || '⚠ هل هذا يبدو مألوفاً؟'}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-heading-dark mb-6 leading-tight">
            {data?.title ? data.title : "المشكلة ليست في قدراتك،"} <br />
            <span className="text-red-500">{data?.subtitle ? data.subtitle : "المشكلة في الفجوة بين النظرية والتطبيق."}</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-500 font-medium leading-relaxed">
            {data?.description || "معظم الخريجين يمتلكون الشهادة، لكن يفتقرون للخبرة الميدانية التي يبحث عنها أصحاب المزارع والمشروعات."}
          </p>
        </div>

        {/* Pain Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
          {problems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-xl shadow-gray-200/40 hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="text-5xl lg:text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{item.emoji}</div>
              <h3 className="text-xl font-bold text-heading-dark mb-3 group-hover:text-red-500 transition-colors">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed text-base lg:text-sm">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Transition */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-4">
            <span className="text-gray-400 text-sm font-bold tracking-widest uppercase">لكن ماذا لو كان هناك حل؟</span>
            <span className="material-symbols-outlined text-4xl text-primary animate-bounce">keyboard_double_arrow_down</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Diagnosis;
