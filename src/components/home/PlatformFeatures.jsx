import React from 'react';
import { motion } from 'framer-motion';

const defaultFeatures = [
  {
    icon: 'smart_toy',
    title: 'المساعد الذكي للزراعة',
    description: 'تحدث مع مساعدنا الذكي المدعوم بالذكاء الاصطناعي لتحليل الأمراض، والحصول على إرشادات زراعية فورية ودقيقة.',
    color: 'text-primary',
    bg: 'bg-primary-light'
  },
  {
    icon: 'school',
    title: 'كورسات زراعية متخصصة',
    description: 'تعلم من نخبة المهندسين والخبراء في مختلف المجالات الزراعية عبر مسارات تعليمية وتدريب عملي.',
    color: 'text-accent',
    bg: 'bg-purple-50'
  },
  {
    icon: 'auto_awesome',
    title: 'توصيات ذكية مخصصة',
    description: 'احصل على توصيات ذكية وخطط زراعية مخصصة بناءً على احتياجات محصولك وبيانات منطقتك.',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  }
];

const PlatformFeatures = ({ data }) => {
  const features = data?.features?.length > 0 ? data.features : defaultFeatures;

  return (
    <section className="section-padding bg-white relative w-full border-b border-border-light" id="features">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 border border-primary/20">
            {data?.badge || 'المميزات الأساسية'}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-heading-dark mb-6 leading-tight">
            {data?.title || 'ماذا يقدم AgriVinka؟'}
          </h2>
          <p className="text-lg text-body-text/80 font-medium leading-relaxed">
            {data?.subtitle || 'منصة زراعية متكاملة توفر لك كل ما تحتاجه للنجاح، من الاستشارات المدعومة بالذكاء الاصطناعي إلى الكورسات التعليمية المتخصصة.'}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8 justify-center">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white rounded-[2rem] p-8 border border-border-light shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 ${feature.bg || 'bg-primary/10'}`}>
                <span className={`material-symbols-outlined text-3xl ${feature.color || 'text-primary'}`}>
                  {feature.icon || 'star'}
                </span>
              </div>
              <h3 className="text-xl font-black text-heading-dark mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-body-text/80 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
