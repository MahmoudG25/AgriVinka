import React, { useState, useEffect } from 'react';
import SEOHead from '../components/common/SEOHead';
import { Link } from 'react-router-dom';
import { pageService } from '../services/pageService';
import { logger } from '../utils/logger';
import FAQ from '../components/home/FAQ';

const FALLBACK = {
  categories: [
    {
      icon: 'play_circle',
      title: 'البدء في التعلم',
      items: ['كيف أسجل في دورة؟', 'كيف أختار المسار المناسب لي؟', 'هل أحتاج خبرة سابقة؟']
    },
    {
      icon: 'payments',
      title: 'الدفع والاشتراكات',
      items: ['ما طرق الدفع المتاحة؟', 'كيف أسترد أموالي؟', 'هل يوجد خصومات للطلاب؟']
    },
    {
      icon: 'workspace_premium',
      title: 'الشهادات',
      items: ['كيف أحصل على الشهادة؟', 'هل الشهادات معتمدة؟', 'أين أجد شهاداتي؟']
    },
    {
      icon: 'devices',
      title: 'الدعم التقني',
      items: ['الفيديو لا يعمل', 'مشكلة في تسجيل الدخول', 'كيف أغير كلمة المرور؟']
    },
  ]
};

const HelpCenterPage = () => {
  const [data, setData] = useState(FALLBACK);

  useEffect(() => {
    const fetch = async () => {
      try {
        const fbData = await pageService.getPageData('help-center');
        if (fbData?.categories?.length) setData(fbData);
      } catch (err) { logger.warn('Failed to load help-center data:', err); }
    };
    fetch();
  }, []);

  return (
    <>
      <SEOHead
        title="مركز المساعدة | أكاديمية نماء"
        description="جد إجابات لأسئلتك الشائعة والدعم الفني في مركز مساعدة أكاديمية نماء."
        canonical={window.location.href}
        keywords="مساعدة, أسئلة شائعة, دعم, FAQ"
      />
      <main className="pt-28 pb-16 min-h-screen bg-[#f8f9fb]" dir="rtl">
        <div className="container-narrow">

          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-extrabold text-heading-dark mb-6 leading-tight">
              مركز المساعدة
            </h1>
            <p className="text-lg text-gray-600 mx-auto">
              ابحث عن إجابات لأسئلتك أو تواصل مع فريق الدعم
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
            {data.categories.map((cat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl text-primary">{cat.icon}</span>
                  </div>
                  <h3 className="font-bold text-heading-dark text-lg">{cat.title}</h3>
                </div>
                <ul className="space-y-2">
                  {cat.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="material-symbols-outlined text-sm text-gray-400">chevron_left</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-4 block">support_agent</span>
            <h3 className="text-xl font-bold text-heading-dark mb-2">لم تجد ما تبحث عنه؟</h3>
            <p className="text-gray-500 text-sm mb-6">تواصل مع فريق الدعم مباشرة وسنساعدك في أقرب وقت</p>
            <Link to="/contact" className="inline-block bg-primary text-heading-dark font-bold px-8 py-3 rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20">
              تواصل معنا
            </Link>
          </div>

        </div>
        <FAQ />
      </main>
    </>
  );
};

export default HelpCenterPage;
