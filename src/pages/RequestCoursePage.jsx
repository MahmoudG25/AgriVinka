import React, { useState } from 'react';
import { courseRequestService } from '../services/firestore/courseRequestService';
import { logger } from '../utils/logger';
import FAQ from '../components/home/FAQ';

const RequestCoursePage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', courseName: '', courseLink: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await courseRequestService.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        courseName: form.courseName.trim(),
        courseLink: form.courseLink.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      alert('حدث خطأ، حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full p-3 rounded-xl border border-gray-200 bg-white focus:border-primary focus:outline-none transition-colors text-heading-dark placeholder-gray-400";

  return (
    <main className="pt-28 pb-16 min-h-screen bg-[#f8f9fb]">
      <div className="container-narrow">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-heading-dark mb-4 leading-tight">
            اطلب دورة تدريبية
          </h1>
          <p className="text-gray-600 text-lg  mx-auto">
            أخبرنا بالدورة التي تبحث عنها وسنعمل على توفيرها لك
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm">
          {submitted ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-5xl text-green-500 mb-4 block">check_circle</span>
              <h3 className="text-2xl font-bold text-heading-dark mb-2">تم إرسال طلبك بنجاح!</h3>
              <p className="text-gray-500 mb-6">سنراجع طلبك ونعمل على توفير الدورة في أقرب وقت.</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', courseName: '', courseLink: '', message: '' }); }}
                className="text-primary font-bold hover:underline"
              >
                إرسال طلب آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-heading-dark mb-2">الاسم الكامل <span className="text-red-400">*</span></label>
                <input type="text" required value={form.name} onChange={e => handleChange('name', e.target.value)} className={inputClass} placeholder="أدخل اسمك الكامل" />
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-heading-dark mb-2">البريد الإلكتروني</label>
                  <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} className={inputClass} placeholder="example@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-heading-dark mb-2">رقم الهاتف</label>
                  <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} className={inputClass} placeholder="05xxxxxxxxx" />
                </div>
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-sm font-bold text-heading-dark mb-2">اسم الدورة المطلوبة <span className="text-red-400">*</span></label>
                <input type="text" required value={form.courseName} onChange={e => handleChange('courseName', e.target.value)} className={inputClass} placeholder="مثال: React Native للمبتدئين" />
              </div>

              {/* Course Link */}
              <div>
                <label className="block text-sm font-bold text-heading-dark mb-2">رابط الدورة (اختياري)</label>
                <input type="url" value={form.courseLink} onChange={e => handleChange('courseLink', e.target.value)} className={inputClass} placeholder="https://www.udemy.com/course/..." dir="ltr" />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-heading-dark mb-2">ملاحظات إضافية</label>
                <textarea rows={3} value={form.message} onChange={e => handleChange('message', e.target.value)} className={`${inputClass} resize-none`} placeholder="أي تفاصيل إضافية تود مشاركتها..." />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-heading-dark font-bold py-3.5 rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
            </form>
          )}
        </div>

      </div>

      <FAQ />
    </main>
  );
};

export default RequestCoursePage;
