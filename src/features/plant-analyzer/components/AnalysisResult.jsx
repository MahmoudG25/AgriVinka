import React from 'react';
import { motion } from 'framer-motion';

const AnalysisResult = ({ result, onReset }) => {
  if (!result) return null;

  const { diagnosis, confidence, causes = [], careSteps = [], warnings = [], references = [] } = result;

  const isLowConfidence = confidence?.toLowerCase() === 'low';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full min-w-0 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-8"
    >
      {/* Header Area */}
      <div className={`p-8 md:p-10 text-white relative overflow-hidden ${isLowConfidence ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-primary to-secondary'}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-black/5"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
              <span className="material-symbols-outlined text-xs">psychology</span>
              {isLowConfidence ? 'تحليل غير دقيق' : 'تم التحليل بنجاح'}
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">{diagnosis}</h2>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-24 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-1000 ease-out"
                  style={{ width: isLowConfidence ? '40%' : '95%' }}
                ></div>
              </div>
              <span className="text-xs font-bold text-white/90">دقة التحليل: {isLowConfidence ? '٤٠٪' : '٩٥٪'}</span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <span className="material-symbols-outlined text-2xl">verified</span>
            <span className="text-sm font-bold">ذكاء اصطناعي موثوق</span>
          </div>
        </div>
      </div>

      {/* Disclaimers & Content */}
      <div className="p-6 md:p-8 space-y-8">

        {/* Medical Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
          <span className="material-symbols-outlined mt-0.5 shrink-0">warning</span>
          <div className="text-sm font-medium">
            <strong className="block mb-1">تنبيه هام:</strong>
            هذا التحليل تم إنشاؤه بواسطة الذكاء الاصطناعي ولا يغني عن استشارة مهندس زراعي مختص. يرجى أخذ الحيطة قبل استخدام أي مبيدات كيميائية.
          </div>
        </div>

        {/* Causes */}
        {causes.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 font-bold text-lg text-heading-dark mb-4">
              <span className="material-symbols-outlined text-red-500">pest_control</span>
              الأسباب المحتملة
            </h3>
            <ul className="space-y-2">
              {causes.map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="w-1.5 h-1.5 mt-1.5 bg-red-400 rounded-full shrink-0"></span>
                  {cause}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Care Steps */}
        {careSteps.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 font-bold text-lg text-heading-dark mb-4">
              <span className="material-symbols-outlined text-green-500">healing</span>
              خطوات العلاج والوقاية
            </h3>
            <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100">
              <ul className="space-y-3">
                {careSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 text-sm font-medium">
                    <span className="flex items-center justify-center w-5 h-5 mt-0.5 bg-green-200 text-green-700 rounded-full text-xs shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 font-bold text-lg text-heading-dark mb-3">
              <span className="material-symbols-outlined text-orange-500">gpp_maybe</span>
              تحذيرات إضافية
            </h3>
            <ul className="space-y-2">
              {warnings.map((warn, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="material-symbols-outlined text-orange-400 text-base shrink-0">error</span>
                  {warn}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* References */}
        {references.length > 0 && (
          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-bold text-sm text-gray-400 mb-3 uppercase tracking-wider">مصادر ومراجع للمزيد من القراءة</h3>
            <div className="flex flex-wrap gap-2">
              {references.map((ref, i) => (
                <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 flex justify-center">
          <Button variant="outline" onClick={onReset} className="w-full sm:w-auto">
            فحص نبتة أخرى
          </Button>
        </div>

      </div>
    </motion.div>
  );
};

export default AnalysisResult;
