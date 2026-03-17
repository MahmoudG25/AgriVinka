import React from 'react';
import { motion } from 'framer-motion';

const defaultFeatures = [
  {
    icon: 'school',
    title: 'خبراء زراعيين',
    description: 'تعلم من نخبة المهندسين والخبراء في مختلف المجالات الزراعية بخبرات عملية ممتدة.',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    icon: 'psychiatry',
    title: 'الذكاء الاصطناعي',
    description: 'استخدم أداة فاحص النباتات الذكية لاكتشاف الأمراض وعلاجها بسرعة ودقة.',
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  {
    icon: 'eco',
    title: 'تدريب عملي ميداني',
    description: 'لا نكتفي بالنظري! نوفر فرص تدريب عملي في مزارع حقيقية لتطبيق ما تعلمته.',
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  },
  {
    icon: 'workspace_premium',
    title: 'شهادات معتمدة',
    description: 'احصل على شهادات إتمام موثقة تعزز سيرتك الذاتية وتفتح لك أبواب العمل.',
    color: 'text-purple-600',
    bg: 'bg-purple-50'
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
            {data?.badge || 'لماذا تختار منصتنا؟'}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-heading-dark mb-6 leading-tight">
            {data?.title || 'طريقك الأمثل لاحتراف المجال الزراعي'}
          </h2>
          <p className="text-lg text-body-text/80 font-medium leading-relaxed">
            {data?.subtitle || 'نقدم لك بيئة تعليمية متكاملة تجمع بين المعرفة الأكاديمية والممارسة العملية الحقيقية باستخدام أحدث التقنيات.'}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
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
