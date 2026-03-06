import React, { useState, useEffect } from 'react';
import SEOHead from '../components/common/SEOHead';
import { pageService } from '../services/firestore/pageService';
import { logger } from '../utils/logger';
import FAQ from '../components/home/FAQ';

const FALLBACK_SECTIONS = [
  { title: 'المقدمة', content: 'مرحبًا بك في منصة AgriVinka. باستخدامك لهذا الموقع والخدمات المرتبطة به، فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية قبل استخدام المنصة.' },
  { title: 'حساب المستخدم', content: 'أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة المرور. يجب أن تكون المعلومات المقدمة عند التسجيل دقيقة وحديثة. يحق للمنصة تعليق أو إلغاء أي حساب يخالف شروط الاستخدام.' },
  { title: 'الملكية الفكرية', content: 'جميع المحتويات المعروضة على المنصة — بما في ذلك الدورات والنصوص والفيديوهات والتصاميم — محمية بموجب قوانين حقوق الملكية الفكرية. لا يجوز نسخ أو توزيع أو إعادة نشر أي محتوى دون إذن كتابي مسبق من AgriVinka.' },
  { title: 'سياسة الدفع والاسترداد', content: 'تتم جميع عمليات الدفع بشكل آمن عبر بوابات الدفع المعتمدة. نقدم ضمان استرداد كامل خلال 30 يومًا من تاريخ الشراء إذا لم تكن راضيًا عن المحتوى. لا ينطبق الاسترداد على الدورات المجانية أو المحتوى الذي تم تحميله.' },
  { title: 'الاستخدام المقبول', content: 'يجب استخدام المنصة لأغراض تعليمية مشروعة فقط. يُحظر مشاركة بيانات الدخول مع أطراف أخرى، أو استخدام أدوات آلية لتحميل المحتوى، أو أي سلوك يضر بتجربة المستخدمين الآخرين.' },
  { title: 'تعديل الشروط', content: 'تحتفظ AgriVinka بالحق في تعديل هذه الشروط في أي وقت. سيتم إبلاغ المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة. استمرار استخدام المنصة بعد التعديل يُعتبر موافقة على الشروط المحدّثة.' },
  { title: 'سياسة الخصوصية', content: 'نحن نحترم خصوصيتك. لا نشارك بياناتك الشخصية مع أي طرف ثالث دون موافقتك. يتم استخدام البيانات فقط لتحسين تجربة التعلم وتقديم الخدمات المطلوبة. يمكنك طلب حذف بياناتك في أي وقت عبر التواصل معنا.' }
];

const TermsPage = () => {
  const [sections, setSections] = useState(FALLBACK_SECTIONS);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await pageService.getPageData('terms');
        if (data?.sections?.length) setSections(data.sections);
      } catch (err) { logger.warn('Failed to load terms data:', err); }
    };
    fetch();
  }, []);

  return (
    <>
      <SEOHead
        title="الشروط والأحكام | AgriVinka"
        description="اقرأ الشروط والأحكام الكاملة لاستخدام منصة AgriVinka."
        canonical={window.location.href}
        keywords="شروط, أحكام, سياسة, خصوصية"
      />
      <main className="pt-28 pb-16 min-h-screen bg-background-light" dir="rtl">

        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-heading-dark mb-6 leading-tight">
            الشروط والأحكام
          </h1>
          <p className="text-gray-500 text-sm">آخر تحديث: فبراير 2026</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-heading-dark mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">{i + 1}</span>
                {section.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

      <FAQ />
      </main>
    </>
  );
};

export default TermsPage;
