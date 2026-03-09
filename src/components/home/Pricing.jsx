import React from 'react';
import { motion } from 'framer-motion';

const Pricing = ({ data }) => {
  const plans = data?.plans || [];
  const title = data?.title || 'استثمارك في مستقبلك';
  const subtitle = data?.subtitle || 'خطط مرنة تناسب احتياجاتك، مع ضمان استرداد الأموال لمدة 30 يوم.';

  return (
    <section className="section-padding bg-surface-white relative overflow-hidden" id="pricing">

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] relative z-10">

        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-heading-dark mb-6">
            {title}
          </h2>
          <p className="text-xl text-body-text/70 font-medium  mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Pricing Cards - Swipe on Mobile, Grid on Desktop */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 hide-scroll md:grid md:grid-cols-3 md:gap-8 md:pb-0 md:mx-0 md:px-0 md:overflow-visible items-start">
          {plans.map((plan, index) => {
            // Check for explicit highlight from Admin, otherwise fallback to middle item
            const isPopular = plan.highlight !== undefined ? plan.highlight : index === 1;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`
                  snap-center shrink-0 w-[85vw] md:w-auto relative p-6 md:p-8 rounded-[32px] transition-all duration-300 flex flex-col
                  ${isPopular
                    ? 'bg-heading-dark text-white shadow-2xl scale-100 md:scale-105 border-2 border-primary z-10'
                    : 'bg-white text-heading-dark border border-border-light shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {/* Background Image from DB */}
                {plan.image && (
                  <div className="absolute inset-0 pointer-events-none">
                    <img src={plan.image} alt="" className="w-full h-full object-cover opacity-10" loading="lazy" decoding="async" />
                    <div className={`absolute inset-0 ${isPopular ? 'bg-heading-dark/1' : 'bg-white/1'}`}></div>
                  </div>
                )}

                {isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg border border-white/20">
                    👑 الأكثر طلباً
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-4 ${isPopular ? 'text-white' : 'text-heading-dark'}`}>
                    {plan.title}
                  </h3>

                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`text-5xl font-black ${isPopular ? 'text-primary' : 'text-heading-dark'}`}>
                      {plan.price}
                    </span>
                    <span className="text-lg opacity-70">ج.م</span>
                  </div>

                  {plan.originalPrice && (
                    <span className="text-sm line-through opacity-50 font-bold block">
                      بدلاً من {plan.originalPrice} ج.م
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-10 text-right">
                  {(plan.features || []).map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm md:text-base font-medium opacity-90">
                      <span className={`material-symbols-outlined shrink-0 ${isPopular ? 'text-primary' : 'text-green-600'}`}>check_circle</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button className={`
                  w-full py-4 rounded-xl font-black text-lg transition-all duration-300 shadow-lg transform hover:-translate-y-1 active:scale-95
                  ${isPopular
                    ? 'bg-primary text-heading-dark hover:bg-white hover:text-primary ring-4 ring-primary/30'
                    : 'bg-heading-dark text-white hover:bg-primary'
                  }
                `}>
                  {plan.buttonText || "اشترك الآن"}
                </button>

                {/* Guarantee text */}
                <div className="mt-4 text-center text-xs opacity-60 font-bold flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  ضمان استرداد الأموال لمدة 30 يوم
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
