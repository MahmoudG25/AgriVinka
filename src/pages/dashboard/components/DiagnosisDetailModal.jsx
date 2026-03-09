import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DiagnosisDetailModal — Displays full details of a saved diagnosis scan.
 * Includes image, diagnosis, confidence, causes, care steps, warnings, references.
 * Also supports delete with inline confirmation.
 */
const DiagnosisDetailModal = ({ scan, isOpen, onClose, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  if (!isOpen || !scan) return null;

  const result = scan.result || {};
  const imageUrl = scan.imageUrl;
  const date = scan.timestamp?.seconds
    ? new Date(scan.timestamp.seconds * 1000).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
    : 'غير محدد';

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(scan.id);
    onClose();
  };

  const confidenceColor = result.confidence === 'High'
    ? 'bg-green-100 text-green-700'
    : result.confidence === 'Medium'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-red-100 text-red-700';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-4 md:inset-auto md:top-[5%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-white rounded-3xl shadow-2xl z-[101] overflow-y-auto"
          >
            {/* Header with Image */}
            <div className="relative">
              {imageUrl && (
                <div className="w-full h-48 md:h-64 bg-gray-100 overflow-hidden rounded-t-3xl">
                  <img
                    src={imageUrl}
                    alt="صورة النبات"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl text-gray-700">close</span>
              </button>

              {/* Confidence Badge */}
              {result.confidence && (
                <div className="absolute bottom-4 right-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black ${confidenceColor} shadow-sm`}>
                    ثقة: {result.confidence}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Title & Meta */}
              <div>
                <h2 className="text-2xl font-black text-heading-dark mb-2">{result.diagnosis || scan.prediction?.name || 'نتيجة التشخيص'}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    {date}
                  </span>
                  {scan.provider && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full font-bold text-gray-600">
                      {scan.provider}
                    </span>
                  )}
                </div>
              </div>

              {/* Causes */}
              {result.causes?.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-black text-heading-dark mb-3">
                    <span className="material-symbols-outlined text-red-500 text-lg">pest_control</span>
                    الأسباب المحتملة
                  </h3>
                  <ul className="space-y-2">
                    {result.causes.map((cause, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                        <span className="w-1.5 h-1.5 mt-2 bg-red-400 rounded-full shrink-0"></span>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Care Steps */}
              {result.careSteps?.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-black text-heading-dark mb-3">
                    <span className="material-symbols-outlined text-green-500 text-lg">healing</span>
                    خطوات العلاج والوقاية
                  </h3>
                  <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100">
                    <ul className="space-y-3">
                      {result.careSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 text-sm font-medium">
                          <span className="flex items-center justify-center w-5 h-5 mt-0.5 bg-green-200 text-green-700 rounded-full text-xs shrink-0 font-black">
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
              {result.warnings?.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-black text-heading-dark mb-3">
                    <span className="material-symbols-outlined text-orange-500 text-lg">gpp_maybe</span>
                    تحذيرات
                  </h3>
                  <ul className="space-y-2">
                    {result.warnings.map((warn, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                        <span className="material-symbols-outlined text-orange-400 text-base shrink-0">error</span>
                        {warn}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* References */}
              {result.references?.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-xs text-gray-400 mb-3 uppercase tracking-wider">مصادر ومراجع</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.references.map((ref, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={handleDelete}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${confirmDelete
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-red-50 text-red-500 hover:bg-red-100'
                    }`}
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  {confirmDelete ? 'تأكيد الحذف' : 'حذف'}
                </button>

                {confirmDelete && (
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DiagnosisDetailModal;
