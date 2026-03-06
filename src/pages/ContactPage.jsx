import React, { useState, useEffect } from 'react';
import SEOHead from '../components/common/SEOHead';
import { pageService } from '../services/firestore/pageService';
import { logger } from '../utils/logger';
import FAQ from '../components/home/FAQ';

const FALLBACK = {
  contactItems: [
    { icon: 'mail', title: 'البريد الإلكتروني', value: 'support@shamselarab.com' },
    { icon: 'schedule', title: 'ساعات العمل', value: 'الأحد - الخميس: 9 ص - 6 م' },
    { icon: 'location_on', title: 'الموقع', value: 'عبر الإنترنت — متاحون من كل مكان' },
  ]
};

const ContactPage = () => {
  const [data, setData] = useState(FALLBACK);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const fbData = await pageService.getPageData('contact');
        if (fbData?.contactItems?.length) setData(fbData);
      } catch (err) { logger.warn('Failed to load contact data:', err); }
    };
    fetch();
  }, []);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClass = "w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors";

  return (
    <main className="pt-28 pb-16 min-h-screen bg-[#f8f9fb]">
      <div className="container-narrow">

        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-heading-dark mb-6 leading-tight">
            تواصل معنا
          </h1>
          <p className="text-lg text-gray-600  mx-auto">
            لديك سؤال أو اقتراح؟ نحن هنا لمساعدتك. أرسل لنا رسالة وسنرد عليك في أقرب وقت.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {data.contactItems.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <span className="material-symbols-outlined text-3xl text-primary mb-3 block">{item.icon}</span>
              <h4 className="font-bold text-heading-dark mb-1">{item.title}</h4>
              <p className="text-gray-500 text-sm">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm">
          {submitted ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-5xl text-green-500 mb-4 block">check_circle</span>
              <h3 className="text-2xl font-bold text-heading-dark mb-2">تم إرسال رسالتك بنجاح!</h3>
              <p className="text-gray-500">سنقوم بالرد عليك في أقرب وقت ممكن.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-heading-dark mb-2">الاسم الكامل</label>
                  <input type="text" required value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClass} placeholder="أدخل اسمك" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-heading-dark mb-2">البريد الإلكتروني</label>
                  <input type="email" required value={formData.email} onChange={e => handleChange('email', e.target.value)} className={inputClass} placeholder="example@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-heading-dark mb-2">الموضوع</label>
                <input type="text" required value={formData.subject} onChange={e => handleChange('subject', e.target.value)} className={inputClass} placeholder="ما هو موضوع رسالتك؟" />
              </div>
              <div>
                <label className="block text-sm font-bold text-heading-dark mb-2">الرسالة</label>
                <textarea required rows={5} value={formData.message} onChange={e => handleChange('message', e.target.value)} className={`${inputClass} resize-none`} placeholder="اكتب رسالتك هنا..." />
              </div>
              <button type="submit" className="w-full bg-primary text-heading-dark font-bold py-3.5 rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20">
                إرسال الرسالة
              </button>
            </form>
          )}
        </div>

      </div>
      <FAQ />
    </main>
  );
};

export default ContactPage;
