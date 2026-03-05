import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutPreview = ({ data }) => {
  // Default data from AboutPage if not provided
  const defaultStory = {
    title: "من المزرعة إلى الأكاديمية",
    content: `تأسست AgriVinka لسد الفجوة العميقة بين التعليم الجامعي النظري، وبين المهارات العملية المطلوبة بشدة في القطاع الزراعي الحديث. نحن نؤمن أن المهندس الزراعي الناجح يحتاج إلى أكثر من مجرد شهادة؛ يحتاج إلى قدرة على تشخيص الآفات، إدارة أنظمة الري والتسميد الذكية، واتخاذ قرارات تنقذ المحاصيل.

يجمع فريقنا من المدربين والخبراء سنوات طويلة من العمل الميداني والبحث العلمي، لدمج الخبرة التطبيقية في مسارات تعليمية وتدريبية منهجية وميسرة لكل شغوف بالزراعة.`,
    image1: 'https://images.unsplash.com/photo-1592982537447-6f29fb25ff71?q=80&w=2070&auto=format&fit=crop',
    image2: 'https://images.unsplash.com/photo-1628183204732-34fecad14828?q=80&w=1964&auto=format&fit=crop'
  };

  const story = {
    title: data?.title || defaultStory.title,
    content: data?.content || defaultStory.content,
    image1: data?.image1 || defaultStory.image1,
    image2: data?.image2 || defaultStory.image2,
  };

  return (
    <section className="py-24 bg-background-alt overflow-hidden relative">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C6A87C 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="container-layout">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Text Side */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-1 bg-accent"></div>
                <span className="text-accent font-bold tracking-widest uppercase text-sm">عن المنصة</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-heading-dark mb-10 leading-tight">
                {story.title}
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed whitespace-pre-line font-medium">
                {story.content}
              </div>

              {/* Quote Highlight */}
              <div className="mt-8 p-6 bg-surface-white border-r-4 border-accent rounded-l-xl shadow-sm">
                <p className="text-heading-dark font-serif italic text-xl">"الثقافة هي الشمس التي لا تغيب"</p>
              </div>

              <div className="mt-12">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-heading-dark transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1"
                >
                  <span>اقرأ المزيد عنا</span>
                  <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Image Composition Side */}
          <div className="order-1 lg:order-2 relative h-[500px] lg:h-[600px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full h-full relative"
            >
              {/* Big Image */}
              <div className="absolute top-0 left-0 w-4/5 h-4/5 rounded-3xl overflow-hidden shadow-2xl z-10 transform -rotate-3 border-4 border-white group">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                <img
                  src={story.image1}
                  alt="About Team"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Small Image */}
              <div className="absolute bottom-0 right-0 w-3/5 h-3/5 rounded-3xl overflow-hidden shadow-2xl z-20 transform rotate-3 border-4 border-white translate-x-4 translate-y-4 group">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                <img
                  src={story.image2}
                  alt="About Culture"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-white p-2 rounded-full shadow-xl animate-pulse-slow">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-accent flex items-center justify-center bg-surface-white">
                  <span className="material-symbols-outlined text-4xl text-primary">wb_sunny</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
