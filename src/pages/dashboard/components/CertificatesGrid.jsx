import React from 'react';
import { Link } from 'react-router-dom';

const CertificatesGrid = ({ certificates, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="h-5 bg-gray-100 rounded w-32 mb-5" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-50 p-4 bg-gray-50">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-50 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-100 rounded-lg w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!certificates || certificates.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-base font-bold text-heading-dark flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-amber-500 text-xl">workspace_premium</span>
        شهاداتي
        <span className="text-xs text-gray-400 font-medium">({certificates.length})</span>
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map(cert => (
          <div
            key={cert.id}
            className="relative rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white p-4 hover:shadow-md transition-all group"
          >
            {/* Certificate icon */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-heading-dark truncate">{cert.courseName}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {cert.issuedAt?.seconds
                    ? new Date(cert.issuedAt.seconds * 1000).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '-'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {cert.pdfUrl && (
                <a
                  href={cert.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-amber-500 text-white font-bold rounded-lg text-xs text-center hover:bg-amber-600 transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">download</span>
                  تحميل
                </a>
              )}
              <Link
                to={`/verify/${cert.id}`}
                className="flex-1 py-2 bg-gray-100 text-heading-dark font-bold rounded-lg text-xs text-center hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">link</span>
                تحقق
              </Link>
            </div>

            {/* Code */}
            <p className="text-[9px] text-gray-300 mt-2 text-center font-mono" dir="ltr">{cert.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificatesGrid;
