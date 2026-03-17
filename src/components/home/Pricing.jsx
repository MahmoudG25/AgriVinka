import React from 'react';
import { motion } from 'framer-motion';

const DEFAULT_PLANS = [
  {
    id: 'plan-basic',
    title: 'الخطة الأساسية',
    price: '99',
    period: '/شهرياً',
    badge: 'ابدأ الآن',
    features: ['الوصول لـ 5 دورات مجاناً', 'شهادة إتمام لكل دورة', 'دعم عبر البريد الإلكتروني', 'تحديثات المحتوى'],
    highlight: false,
    buttonText: 'ابدأ الآن',
  },
  {
    id: 'plan-pro',
    title: 'الخطة الاحترافية',
    price: '299',
    originalPrice: '499',
    period: '/شهرياً',
    badge: '👑 الأكثر طلباً',
    features: ['وصول كامل لجميع الدورات', 'مسارات تعليمية متكاملة', 'شهادات معتمدة', 'دعم مباشر مع المدربين', 'مشاريع عملية ميدانية'],
    highlight: true,
    buttonText: 'اشترك الآن',
  },
  {
    id: 'plan-premium',
    title: 'الخطة الشاملة',
    price: '599',
    originalPrice: '999',
    period: '/سنوياً',
    badge: '🏆 القيمة الأعلى',
    features: ['كل ما في الخطة الاحترافية', 'جلسات تدريب فردية شهرية', 'عضوية منتدى الخبراء', 'أولوية في التدريب العملي', 'وصول مدى الحياة للمحتوى'],
    highlight: false,
    buttonText: 'تواصل معنا',
  },
];

const Pricing = ({ data }) => {
  const plans = (data?.plans && data.plans.length > 0) ? data.plans : DEFAULT_PLANS;
  const title = data?.title || 'استثمر في مستقبلك الزراعي';
  const subtitle = data?.subtitle || 'خطط مرنة تناسب جميع المستويات، مع ضمان استرداد الأموال خلال 30 يوماً.';

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="pricing">

      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px] relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 border border-primary/20">
            💳 خطط وأسعار
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">{subtitle}</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => {
            const isPopular = plan.highlight !== undefined ? plan.highlight : index === 1;

            return (
              <motion.div
                key={plan.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative rounded-3xl overflow-hidden flex flex-col transition-all duration-300
                  ${isPopular
                    ? 'shadow-2xl ring-2 ring-primary scale-105 z-10'
                    : 'shadow-md hover:shadow-xl'
                  }
                `}
              >
                {/* Background image */}
                {plan.image ? (
                  <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
                    <img
                      src={plan.image}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Translucent overlay to keep text readable */}
                    <div className={`absolute inset-0 ${isPopular
                      ? 'bg-gradient-to-br from-gray-900/85 via-gray-900/80 to-gray-900/75'
                      : 'bg-gradient-to-br from-white/88 via-white/82 to-white/78'
                    }`} />
                  </div>
                ) : (
                  <div className={`absolute inset-0 rounded-3xl ${isPopular ? 'bg-gray-900' : 'bg-white'}`} />
                )}

                {/* Popular badge */}
                {isPopular && (
                  <div className="relative z-10 text-center pt-4">
                    <span className="inline-block bg-primary text-white text-xs font-black px-5 py-1.5 rounded-full shadow-md">
                      {plan.badge || '👑 الأكثر طلباً'}
                    </span>
                  </div>
                )}

                {/* Card content */}
                <div className="relative z-10 p-7 flex flex-col flex-1">

                  {/* Plan name */}
                  <h3 className={`text-xl font-black mb-1 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.title}
                  </h3>
                  {plan.subtitle && (
                    <p className={`text-sm mb-5 ${isPopular ? 'text-gray-300' : 'text-gray-500'}`}>
                      {plan.subtitle}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-2">
                      <span className={`text-5xl font-black leading-none ${isPopular ? 'text-primary' : 'text-gray-900'}`}>
                        {plan.price}
                      </span>
                      <span className={`text-base font-bold mb-1 ${isPopular ? 'text-gray-300' : 'text-gray-400'}`}>
                        ج.م{plan.period || '/شهرياً'}
                      </span>
                    </div>
                    {plan.originalPrice && (
                      <p className={`text-sm mt-1 line-through ${isPopular ? 'text-gray-500' : 'text-gray-400'}`}>
                        بدلاً من {plan.originalPrice} ج.م
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1 text-right">
                    {(plan.features || []).map((feature, i) => (
                      <li key={i} className={`flex items-center gap-2.5 text-sm font-medium ${isPopular ? 'text-gray-200' : 'text-gray-700'}`}>
                        <span className={`material-symbols-outlined text-lg shrink-0 ${isPopular ? 'text-primary' : 'text-green-600'}`}>
                          check_circle
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button className={`
                    w-full py-3.5 rounded-xl font-black text-base transition-all duration-300 hover:-translate-y-0.5 active:scale-95
                    ${isPopular
                      ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30'
                      : 'bg-gray-900 text-white hover:bg-gray-700'
                    }
                  `}>
                    {plan.buttonText || 'اشترك الآن'}
                  </button>

                  {/* Guarantee */}
                  <p className={`text-xs text-center mt-3 flex items-center justify-center gap-1 ${isPopular ? 'text-gray-400' : 'text-gray-400'}`}>
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    ضمان استرداد الأموال لمدة 30 يوماً
                  </p>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default React.memo(Pricing);
