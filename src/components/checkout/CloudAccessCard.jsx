import React, { useState } from 'react';
import { FaRegCopy, FaCheck, FaLock, FaArrowLeft } from 'react-icons/fa6';
import { BsCollectionPlay } from 'react-icons/bs';

const CloudAccessCard = () => {
  const [copied, setCopied] = useState(false);
  const cloudLink = "https://cloud.shamsalarab.com/access/k92";

  const handleCopy = () => {
    navigator.clipboard.writeText(cloudLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-white p-8 rounded-3xl shadow-sm border border-border-light relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-heading-dark">الوصول للمحتوى</h2>
        <div className="w-12 h-12 bg-background-alt rounded-full flex items-center justify-center text-heading-dark text-xl">
          <BsCollectionPlay />
        </div>
      </div>

      <div className="mb-8">
        <p className="text-gray-500 mb-2 text-sm">رابط المكتبة السحابية الخاص بك</p>
        <div className="bg-background-alt p-2 rounded-xl flex items-center justify-between border border-border-light">
          <button
            onClick={handleCopy}
            className="bg-primary hover:bg-heading-dark text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
          >
            {copied ? <FaCheck /> : <FaRegCopy />}
            {copied ? 'تم النسخ' : 'نسخ'}
          </button>
          <code className="flex-grow text-center text-gray-600 font-mono text-sm dir-ltr truncate px-4">
            {cloudLink}
          </code>
        </div>
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 justify-end">
          <FaLock className="text-[10px]" />
          هذا الرابط آمن وصالح لمدة 24 ساعة فقط
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <h3 className="font-bold text-heading-dark text-sm">خطوات التفعيل السريع:</h3>

        <div className="flex items-start gap-4">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">1</span>
          <div>
            <p className="font-bold text-heading-dark text-sm">افتح الرابط أعلاه</p>
            <p className="text-xs text-gray-500 mt-1">سيتم توجيهك إلى بوابة التنزيل الآمنة.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">2</span>
          <div>
            <p className="font-bold text-heading-dark text-sm">أدخل كلمة المرور</p>
            <p className="text-xs text-gray-500 mt-1">استخدم كلمة المرور التي وصلتك في البريد الإلكتروني.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">3</span>
          <div>
            <p className="font-bold text-heading-dark text-sm">ابدأ التصفح</p>
            <p className="text-xs text-gray-500 mt-1">يمكنك تنزيل المواد أو مشاهدتها مباشرة.</p>
          </div>
        </div>
      </div>

      <button className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-accent transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
        فتح المحتوى الآن
        <FaArrowLeft />
      </button>
    </div>
  );
};

export default CloudAccessCard;
