import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = ({ testimonials, data }) => {
  // Fallback data if no testimonials provided
  const items = (testimonials && testimonials.length > 0) ? testimonials : (data?.items && data.items.length > 0 ? data.items : [
    {
      name: "م. أحمد عبد الله",
      role: "مهندس زراعي - مزارع النور",
      image: "https://i.pravatar.cc/150?u=12",
      content: "الدورات غيرت نظرتي لتشخيص الآفات تماماً. الآن أعتمد على منهجية علمية وفرت علينا الكثير من المبيدات الخاطئة.",
      rating: 5
    },
    {
      name: "سارة محمد",
      role: "طالبة بكلية الزراعة",
      image: "https://i.pravatar.cc/150?u=5",
      content: "كانت عندي رهبة من الجانب العملي لأن دراستنا أغلبها نظري، لكن مسار المهندس الشامل أعطاني الثقة للنزول للميدان.",
      rating: 5
    },
    {
      name: "خالد سعيد",
      role: "متخصص ري ذكي",
      image: "https://i.pravatar.cc/150?u=8",
      content: "المحتوى هنا لا يقارن بأي منصة أخرى. الشرح مبني على خبرة حقيقية ومواقف من واقع العمل في المزارع الكبيرة.",
      rating: 5
    }
  ]);

  const [expandedId, setExpandedId] = React.useState(null);

  const toggleExpand = (index) => {
    setExpandedId(expandedId === index ? null : index);
  };

  return (
    <section className="section-padding bg-background-alt relative overflow-hidden" id="testimonials">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-heading-dark mb-6">
            {data?.title || <>قصص نجاح <span className="text-primary">حقيقية</span></>}
          </h2>
          <p className="text-xl text-body-text/70 font-medium  mx-auto leading-relaxed">
            {data?.subtitle || 'انضم إلى آلاف الطلاب الذين غيروا حياتهم المهنية معنا.'}
          </p>
        </div>

        {/* Swipe Container (Mobile Slider / Desktop Grid) */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 hide-scroll md:grid md:grid-cols-3 md:gap-8 md:pb-0 md:mx-0 md:px-0 md:overflow-visible">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="snap-center shrink-0 w-[85vw] md:w-auto bg-white p-6 md:p-8 rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 border border-border-light group h-full flex flex-col"
              onClick={() => toggleExpand(index)}
            >
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 p-0.5 shrink-0">
                  <img src={item.image || `https://i.pravatar.cc/150?u=${index}`} alt={item.name} className="w-full h-full rounded-full object-cover" loading="lazy" decoding="async" />
                </div>
                <div>
                  <h4 className="font-bold text-heading-dark text-lg">{item.name}</h4>
                  <p className="text-sm text-gray-400 font-medium">{item.role || 'طالب متميز'}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex text-accent mb-4 text-sm">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>

              {/* Content */}

              <div className="relative">
                <p className={`text-body-text/80 leading-relaxed font-medium transition-all duration-300 ${expandedId === index ? '' : 'line-clamp-4 md:line-clamp-none'}`}>
                  "{item.content}"
                </p>
                {item.content.length > 100 && (
                  <button className="text-primary text-sm font-bold mt-2 md:hidden">
                    {expandedId === index ? 'عرض أقل' : 'قراءة المزيد'}
                  </button>
                )}
              </div>

              {/* Verified Badge */}
              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center gap-2 text-green-600 text-xs font-bold">
                <span className="material-symbols-outlined text-base">verified</span>
                طالب موثق
              </div>

            </motion.div>
          ))}
        </div>

        {/* Social Proof Strip */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Can add company logos here if students work there */}
        </div>

      </div>
    </section>
  );
};

export default React.memo(Testimonials);
