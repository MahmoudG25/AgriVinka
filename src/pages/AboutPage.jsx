import React, { useEffect, useState } from 'react';
import SEOHead from '../components/common/SEOHead';
import { motion } from 'framer-motion';
import { contentService } from '../services/contentService';
import { aboutService, defaultAboutData } from '../services/firestore/aboutService';
import { logger } from '../utils/logger';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const fetchedData = await contentService.getAboutPage();
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

  const { hero, bridge, visionMission, stats, team, cta } = data || defaultAboutData;

  return (
    <div className="min-h-screen bg-white text-gray-800 font-tajawal overflow-hidden" dir="rtl">
      <SEOHead
        title="عن AgriVinka | تمكين الابتكار الزراعي"
        description="تعرف على رؤيتنا ومهمتنا في AgriVinka لتمكين الجيل القادم من المبتكرين الزراعيين."
        canonical={window.location.href}
      />

      {/* --- HERO SECTION --- */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${hero?.backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
          >
            {hero?.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200"
          >
            {hero?.description}
          </motion.p>
        </div>
      </section>

      {/* --- BRIDGE SECTION (Tradition & Tech) --- */}
      <section className="py-20 bg-white">
        <div className="w-full mx-auto px-4 max-w-[1240px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Images */}
            <div className="relative flex gap-4 md:gap-8">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-1/2 rounded-2xl overflow-hidden shadow-xl"
              >
                <img src={bridge?.image1} alt="Agriculture Tradition" className="w-full aspect-square object-cover" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="w-1/2 rounded-2xl overflow-hidden shadow-xl mt-12 md:mt-20"
              >
                <img src={bridge?.image2} alt="Agriculture Tech" className="w-full aspect-square object-cover" />
              </motion.div>
            </div>

            {/* Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-right"
            >
              <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
                {bridge?.badge}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-heading-dark mb-8 leading-tight">
                {bridge?.title}
              </h2>
              <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                {bridge?.description}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- VISION & VALUES SECTION --- */}
      <section className="py-20 bg-[#f9fafb]">
        <div className="w-full mx-auto px-4 max-w-[1240px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Vision (Main Card) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-8 bg-[#2d5a27] text-white p-10 md:p-16 rounded-[2rem] relative overflow-hidden flex flex-col justify-center"
            >
              <div className="absolute top-8 left-8 text-white/10">
                <span className="material-symbols-outlined text-[120px]">{visionMission?.vision?.icon}</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold mb-6 flex items-center gap-4">
                  <span className="material-symbols-outlined text-4xl">{visionMission?.vision?.icon}</span>
                  {visionMission?.vision?.title}
                </h3>
                <p className="text-xl md:text-2xl leading-relaxed text-gray-100">
                  {visionMission?.vision?.description}
                </p>
              </div>
            </motion.div>

            {/* Mission (Side Card) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-4 bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col"
            >
              <div className="mb-6 w-16 h-16 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">{visionMission?.mission?.icon}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-heading-dark mb-4">{visionMission?.mission?.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {visionMission?.mission?.description}
              </p>
            </motion.div>

            {/* Values (Small Cards) */}
            {visionMission?.values?.map((val, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                className="md:col-span-4 bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100"
              >
                <div className="mb-6 text-green-700">
                  <span className="material-symbols-outlined text-4xl">{val.icon}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-heading-dark mb-4">{val.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {val.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-20 bg-[#def0d8]/30">
        <div className="w-full mx-auto px-4 max-w-[1240px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {stats?.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-2"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-[#2d5a27]">{stat.value}</div>
                <div className="text-gray-600 font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TEAM SECTION --- */}
      <section className="py-24 bg-white">
        <div className="w-full mx-auto px-4 max-w-[1240px] text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl font-extrabold text-heading-dark mb-4">{team?.title}</h2>
            <p className="text-gray-500 text-lg">{team?.subtitle}</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-12">
            {team?.members?.map((member, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }} // Fixed the y value while I'm at it
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group w-full sm:w-[calc(50%-3rem)] lg:w-[calc(25%-3rem)] min-w-[250px] max-w-[300px]"
              >
                <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg transition-transform group-hover:scale-105">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-heading-dark mb-1">{member.name}</h3>
                <p className="text-green-700 font-medium text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20">
        <div className="w-full mx-auto px-4 max-w-[1240px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#48593d] p-12 md:p-20 rounded-[3rem] text-center text-white"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold mb-8">{cta?.title}</h2>
            <p className="text-gray-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              {cta?.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link 
                to="/register" 
                className="px-10 py-4 bg-white text-[#48593d] rounded-full font-extrabold text-lg hover:bg-gray-100 transition-all shadow-xl"
              >
                {cta?.primaryBtn}
              </Link>
              <Link 
                to="/courses" 
                className="px-10 py-4 border-2 border-white/50 text-white rounded-full font-extrabold text-lg hover:bg-white/10 transition-all"
              >
                {cta?.secondaryBtn}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
