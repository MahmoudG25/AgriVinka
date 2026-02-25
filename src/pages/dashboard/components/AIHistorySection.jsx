import React from 'react';
import { Link } from 'react-router-dom';

const AIHistorySection = ({ scans, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="h-5 bg-gray-100 rounded w-40 mb-5" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-50">
              <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-heading-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">psychology</span>
          سجل التشخيص الذكي
        </h2>
        <Link to="/ai/diagnose" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          تشخيص جديد <span className="material-symbols-outlined text-xs rtl:rotate-180">arrow_forward</span>
        </Link>
      </div>

      {scans.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {scans.map(scan => (
            <div key={scan.id} className="group flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-primary/20 transition-colors">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                <img
                  src={scan.imageUrl || 'https://placehold.co/100x100'}
                  alt="Scan"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col flex-1 justify-center min-w-0">
                <h3 className="font-bold text-xs text-heading-dark truncate">{scan.prediction?.name}</h3>
                <div className="flex items-center gap-2 text-[10px] mt-1">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${scan.prediction?.severity === 'high' ? 'bg-red-100 text-red-700' :
                      scan.prediction?.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                    ثقة {scan.prediction?.confidence ? Math.round(scan.prediction.confidence * 100) : 0}%
                  </span>
                  <span className="text-gray-400" dir="ltr">
                    {scan.timestamp?.seconds ? new Date(scan.timestamp.seconds * 1000).toLocaleDateString('ar-EG') : 'الآن'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">biotech</span>
          <p className="text-gray-500 font-medium text-sm mb-1">لم تقم بأي تشخيص ذكي حتى الآن</p>
          <p className="text-xs text-gray-400 mb-4">استخدم الذكاء الاصطناعي لتشخيص محاصيلك</p>
          <Link to="/ai/diagnose" className="px-5 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-heading-dark transition-colors">
            ابدأ التشخيص
          </Link>
        </div>
      )}
    </div>
  );
};

export default AIHistorySection;
