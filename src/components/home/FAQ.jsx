import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const DEFAULT_QUESTIONS = [
  {
    q: "هل الكورسات تغني عن التدريب الميداني؟",
    a: "الكورسات مصممة لتكون المحاكي الأقرب للواقع الميداني، حيث نعتمد على دراسة حالات حقيقية من مزارع ومختبرات لتجهيزك وتسهيل فرصك في التدريب أو العمل."
  },
  {
    q: "ما الفرق بين اختيار باقة مسار واختيار كورس منفرد؟",
    a: "المسار هو خطة دراسية متكاملة تأخذك من الصفر وحتى إتقان تخصص معين (مثل الإنتاج النباتي)، بينما الكورس يركز على مهارة محددة (مثل الري والتسميد)."
  },
  {
    q: "هل يوجد دعم إذا واجهتني مشكلة في تشخيص آفة معينة؟",
    a: "نعم، بمجرد اشتراكك ستحصل على وصول لمجتمع AgriVinka الزراعي حيث يتواجد مهندسون وخبراء للرد على استفساراتك وحالتك الدراسية."
  },
  {
    q: "هل الشهادات معتمدة؟",
    a: "جميع شهاداتنا موثقة ويمكن إضافتها مباشرة لملفك المهني في LinkedIn أو سيرتك الذاتية لتعزيز فرصك الوظيفية كمهندس زراعي."
  },
  {
    q: "كيف يمكنني الدفع؟",
    a: "نوفر بوابات دفع آمنة محلية ودولية تناسب جميع الدول العربية لتسهيل انضمامك لأي مسار."
  }
];

const FAQ = ({ data }) => {
  // Use database questions if available, fallback to defaults
  // Admin stores as {question, answer}, normalize to {q, a}
  const questions = (Array.isArray(data) && data.length > 0)
    ? data.map(item => ({ q: item.question || item.q, a: item.answer || item.a }))
    : DEFAULT_QUESTIONS;

  const [activeIndex, setActiveIndex] = useState(0); // Open first one by default

  return (
    <section className="section-padding bg-white" id="faq">
      <div className="container-narrow">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-heading-dark mb-6">
            أسئلة تتكرر كثيراً
          </h2>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            جمعنا لك إجابات لأهم التساؤلات التي قد تدور في ذهنك.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {questions.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/50 bg-surface-white">
              <button
                className="w-full flex items-center justify-between p-6 md:p-8 text-start focus:outline-none focus:bg-gray-50 active:bg-gray-100"
                onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
              >
                <span className={`text-xl font-bold transition-colors ${activeIndex === index ? 'text-primary' : 'text-heading-dark'}`}>
                  {item.q}
                </span>
                <span className={`material-symbols-outlined transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-primary' : 'text-gray-400'}`}>
                  expand_more
                </span>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed font-medium border-t border-gray-100 pt-4">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Support Card */}
        <div className="mt-16 bg-background-alt p-8 rounded-3xl border border-border-light text-center flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-start">
            <h4 className="text-xl font-bold text-heading-dark mb-2">لم تجد إجابة لسؤالك؟</h4>
            <p className="text-gray-500 font-medium">فريق الدعم لدينا جاهز لمساعدتك في أي وقت.</p>
          </div>
          <Link to="/contact" className="px-8 py-3 bg-white text-heading-dark border border-gray-200 font-bold rounded-xl hover:bg-heading-dark hover:text-white transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined">headset_mic</span>
            تحدث معنا
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FAQ;
