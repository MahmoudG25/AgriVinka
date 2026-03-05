import React, { useEffect, useState } from 'react';
import SEOHead from '../components/common/SEOHead';
import { motion } from 'framer-motion';
import { aboutService, defaultAboutData } from '../services/aboutService';
import { logger } from '../utils/logger';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const fetchedData = await aboutService.getAboutPage();
        setData(fetchedData);
      } catch (err) {
        logger.error('Error loading about page:', err);
        setData(defaultAboutData);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>;

  const { hero, quote, story } = data || defaultAboutData;

  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800 font-tajawal overflow-hidden" dir="rtl">
      <SEOHead
        title="عن AgriVinka | مبادراتنا وقصتنا"
        description="تعرف على مبادرات AgriVinka الثقافية وقصتنا في دعم المحتوى العربي."
        canonical={window.location.href}
      />

      {/* --- SECTION 1: INITIATIVES (DARK) --- */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-[#4A3B2A] to-[#2E241B] text-white overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>

        <div className="container-layout relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Image Card (e.g. Book) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1 flex justify-center lg:justify-end"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group w-[90%] md:w-[80%] lg:w-[450px] h-[450px] mx-auto lg:mx-0 lg:ml-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img
                src={hero?.image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80'}
                alt="Cultural Initiatives"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 aspect-[3/4]"
              />
              <div className="absolute bottom-6 right-6 z-20">
                <p className="font-serif italic text-accent text-base">"الثقافة هي الشمس التي لا تغيب"</p>
              </div>
            </div>
            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-accent/10 rounded-full blur-3xl -z-10"></div>
          </motion.div>

          {/* Right: Content & Initiatives List */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="order-1 lg:order-2 text-right"
          >
            <motion.h1
              variants={fadeUp}
              className="text-3xl lg:text-4xl font-bold mb-4 text-white"
            >
              مبادراتنا الثقافية
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-gray-300 text-base lg:text-lg mb-8 leading-relaxed "
            >
              {hero?.description || 'نحن لا نكتفي بنقل الخبر، بل نصنع الحدث. تهدف مبادرات "AgriVinka" إلى دعم المبدعين، توثيق التراث، وتعزيز الحوار الثقافي.'}
            </motion.p>

            <div className="space-y-6">
              {(hero?.initiatives || []).map((init, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="flex items-start gap-4 group"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent shadow-lg group-hover:bg-accent group-hover:text-[#2E241B] transition-all duration-300">
                    <span className="material-symbols-outlined text-xl">{init.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-accent group-hover:text-white transition-colors mb-1">
                      {init.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                      {init.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* --- SECTION 2: QUOTE (WHITE) --- */}
      <section className="py-10 bg-[#FDFBF7] relative">
        <div className="container-layout text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-6xl text-accent font-serif opacity-30">“</span>
            <h2 className="text-2xl md:text-4xl font-serif text-heading-dark leading-relaxed mx-auto mb-8 relative z-10">
              {quote?.text}
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-accent"></div>
              <span className="font-bold text-gray-600">{quote?.author}</span>
              <div className="h-px w-12 bg-accent"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 3: STORY (LIGHT) --- */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container-layout">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Image Composition (Order 2 on mobile, Order 1 on Desktop if LTR, but in RTL grid, first item is Right) */}
            {/* Wait, in RTL: Col 1 is Right, Col 2 is Left.
                The design has Text on Right, Images on Left.
                So in the code (RTL), the first div should be the Text (Right), second div the Images (Left). 
            */}

            {/* Right: Text Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-right order-1"
            >
              <motion.div variants={fadeUp} className="flex items-center gap-4 mb-4">
                <span className="text-accent font-bold text-lg">قصتنا</span>
                <div className="h-1 w-12 bg-accent rounded-full"></div>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="text-4xl lg:text-5xl font-extrabold text-heading-dark mb-8 leading-tight"
              >
                {story?.title || 'قصة AgriVinka'}
              </motion.h2>

              <motion.div
                variants={fadeUp}
                className="text-gray-600 leading-loose text-lg mb-8 whitespace-pre-line font-medium space-y-6"
              >
                {story?.content || (
                  <>
                    <p>
                      تأسست منصة AgriVinka لتكون منارة إعلامية وثقافية تجمع شتات المبدعين العرب. انطلقنا من فكرة بسيطة: أن المحتوى العربي يستحق أن يقدم بأعلى معايير الجودة والاحترافية.
                    </p>
                    <p>
                      فريقنا يتكون من نخبة من الكتاب، الفنانين، والمطورين الشغوفين بإبراز الوجه المشرق لحضارتنا. نسعى لبناء مجتمع تفاعلي يثري المحتوى العربي على الإنترنت.
                    </p>
                  </>
                )}
              </motion.div>

              <motion.div variants={fadeUp}>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-full hover:bg-primary-hover hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-bold text-lg shadow-glow"
                >
                  <span>انضم إلى فريقنا</span>
                  <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Left: Image Composition */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] lg:h-[600px] w-full flex items-center justify-center lg:justify-start order-2"
            >
              {/* Image 1 (Back/Top-Left) */}
              <div className="absolute top-0 right-10 w-4/5 h-4/5 z-10 transform -rotate-3 transition-transform hover:rotate-0 duration-500">
                <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-white">
                  <img
                    src={story?.image1 || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80'}
                    alt="Team Interaction"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Image 2 (Front/Bottom-Right) */}
              <div className="absolute bottom-10 left-10 w-3/5 h-3/5 z-20 transform rotate-3 transition-transform hover:rotate-0 duration-500">
                <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-white">
                  <img
                    src={story?.image2 || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80'}
                    alt="Focus"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Decorative Badge (Center Overlap) */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-white p-2 rounded-full shadow-xl animate-pulse-slow">
                <div className="border-2 border-dashed border-accent rounded-full w-20 h-20 flex items-center justify-center bg-white">
                  <span className="material-symbols-outlined text-accent text-4xl">verified</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
