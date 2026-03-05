import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Map Arabic link labels to real routes
const LINK_ROUTES = {
  // Tracks
  'الإنتاج النباتي': '/learning-paths',
  'الري والتسميد': '/learning-paths',
  'وقاية النباتات': '/learning-paths',
  'الهندسة الزراعية': '/learning-paths',
  'الزراعة الذكية': '/learning-paths',
  'المسارات التعليمية': '/learning-paths',
  'المسارات': '/learning-paths',
  'الدورات': '/learning-paths',
  // Company
  'من نحن': '/about',
  'قصتنا': '/about',
  'عن المنصة': '/about',
  'عن الشركة': '/about',
  'تواصل معنا': '/contact',
  'اتصل بنا': '/contact',
  'مركز المساعدة': '/help-center',
  'الدعم': '/help-center',
  'الأسئلة الشائعة': '/#faq',
  'اطلب دورة': '/request-course',
  'طلب دورة': '/request-course',
  // Legal
  // 'سياسة الخصوصية': '/terms',
  'شروط الاستخدام': '/terms',
  'الشروط والأحكام': '/terms',
  'سياسة الاسترداد': '/terms',
};

const resolveRoute = (label) => LINK_ROUTES[label] || '#';

const defaultFooterData = {
  description: 'منصة التدريب الزراعي الرائدة لتمكين المهندسين العرب بالمهارات الميدانية والأكاديمية المطلوبة لسوق العمل الحديث.',
  links: {
    tracks: ['الإنتاج النباتي', 'الري والتسميد', 'وقاية النباتات'],
    company: ['عن المنصة', 'تواصل معنا', 'الأسئلة الشائعة']
  },
  newsletter: {
    title: 'النشرة البريدية',
    placeholder: 'البريد الإلكتروني'
  },
  copyright: 'جميع الحقوق محفوظة © AgriVinka',
  legal: ['الشروط والأحكام', 'سياسة الخصوصية']
};

const Footer = ({ data = defaultFooterData }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const MobileAccordion = ({ title, children, sectionId }) => (
    <div className="border-b border-white/5 last:border-0 lg:border-0">
      <button
        onClick={() => toggleSection(sectionId)}
        className="flex items-center justify-between w-full py-4 lg:py-0 lg:mb-6 lg:cursor-default group"
      >
        <h4 className="font-bold text-white text-lg relative inline-block">
          {title}
          <span className="hidden lg:block absolute -bottom-2 right-0 w-8 h-1 bg-primary rounded-full"></span>
        </h4>
        <span className={`material-symbols-outlined text-gray-400 lg:hidden transition-transform duration-300 ${expandedSection === sectionId ? 'rotate-180 text-primary' : ''}`}>
          expand_more
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 lg:h-auto lg:opacity-100 ${expandedSection === sectionId ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0 lg:max-h-none lg:mb-0'}`}>
        {children}
      </div>
    </div>
  );

  return (
    <footer className="bg-heading-dark border-t border-white/5 pt-16 pb-8 font-tajawal relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-[128px]"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[128px]"></div>
      </div>

      <div className="container-layout relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">

          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">eco</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-wide">AgriVinka</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed ">
              {data?.description || defaultFooterData.description}
            </p>
          </div>

          {/* Tracks Column */}
          <MobileAccordion title="المسارات" sectionId="tracks">
            <ul className="space-y-3">
              {data.links.tracks.map((link, index) => (
                <li key={index}>
                  <Link to={resolveRoute(link)} className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-primary transition-colors"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </MobileAccordion>

          {/* Company Column */}
          <MobileAccordion title="الشركة" sectionId="company">
            <ul className="space-y-3">
              {data.links.company.map((link, index) => (
                <li key={index}>
                  <Link to={resolveRoute(link)} className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-primary transition-colors"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </MobileAccordion>

          {/* Newsletter Column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 mt-8 lg:mt-0">
            <h4 className="font-bold text-white text-lg mb-6 relative inline-block">
              {data.newsletter.title}
              <span className="absolute -bottom-2 right-0 w-8 h-1 bg-primary rounded-full"></span>
            </h4>
            <p className="text-gray-400 text-sm mb-4">اشترك لتصلك أحدث المقالات والعروض الحصرية.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pr-4 pl-10 py-3 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 text-gray-200 placeholder-gray-500 transition-all"
                  placeholder={data.newsletter.placeholder}
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">mail</span>
              </div>
              <button className="bg-primary text-heading-dark font-bold px-4 py-3 rounded-lg hover:bg-accent transition-colors shadow-lg shadow-primary/20 shrink-0">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Copyright & Legal */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>{data?.copyright || defaultFooterData.copyright}</p>
          <div className="flex gap-6">
            {(data?.legal || defaultFooterData.legal).map((item, index) => (
              <Link key={index} to={resolveRoute(item)} className="hover:text-primary transition-colors">{item}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
