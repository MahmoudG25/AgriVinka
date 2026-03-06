import React from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import SEOHead from '../../../components/common/SEOHead';
import { usePublicCertificate } from '../hooks/usePublicCertificate.js';

const CertificateVerificationPage = () => {
  const { certificateId } = useParams();
  const { certificate, loading, error } = usePublicCertificate(certificateId);

  const verificationUrl = `${window.location.origin}/verify/${certificateId || ''}`;

  const formatDate = (ts) => {
    if (!ts) return '-';
    if (ts.toDate) {
      return ts.toDate().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return new Date(ts).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-[80vh] bg-background-alt py-20 flex flex-col items-center justify-center relative overflow-hidden">
      <SEOHead title="التحقق من الشهادة | AgriVinka" />

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-narrow relative z-10 w-full px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">eco</span>
            </div>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-wide">AgriVinka</span>
          </Link>
          <h1 className="text-3xl font-black text-heading-dark mb-2">التحقق من الشهادات</h1>
          <p className="text-gray-500 font-medium">
            نظام التحقق الإلكتروني من صحة وموثوقية الشهادات الصادرة عن الأكاديمية.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-heading-dark p-6 text-center border-b border-gray-800">
            <div className="text-sm text-gray-400 font-bold mb-1 tracking-wider uppercase">رمز التحقق</div>
            <div className="text-2xl font-mono text-accent font-bold tracking-widest" dir="ltr">
              {certificateId}
            </div>
          </div>

          <div className="p-8">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 text-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary mb-4" />
                <p className="font-bold text-gray-500">جاري التحقق من قاعدة البيانات...</p>
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-red-500 text-4xl">error</span>
                </div>
                <h2 className="text-2xl font-bold text-heading-dark mb-2">الشهادة غير صالحة</h2>
                <p className="text-gray-500 mb-8">لم يتم العثور على شهادة بهذا الرمز. يرجى التأكد من الرابط.</p>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-100 text-heading-dark font-bold rounded-xl hover:bg-gray-200 transition-colors w-full sm:w-auto"
                >
                  العودة للرئيسية
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </Link>
              </div>
            )}

            {!loading && !error && certificate && (
              <div className="grid gap-6 md:grid-cols-[2fr,1.2fr] items-center">
                <div>
                  <div className="mb-4">
                    <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">اسم المتدرب</span>
                    <p className="text-lg font-bold text-heading-dark">{certificate.studentName}</p>
                  </div>
                  <div className="mb-4">
                    <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">الدورة التدريبية</span>
                    <p className="text-lg font-bold text-primary">{certificate.courseName}</p>
                  </div>
                  <div className="mb-4">
                    <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">المحاضر</span>
                    <p className="text-base font-semibold text-heading-dark">
                      {certificate.instructorName || 'AgriVinka'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">تاريخ الإصدار</span>
                      <p className="text-sm text-heading-dark">{formatDate(certificate.issuedAt)}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">الرقم التسلسلي</span>
                      <p className="text-xs font-mono text-heading-dark" dir="ltr">
                        {certificate.serialNumber}
                      </p>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">حالة الشهادة</span>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${certificate.status === 'valid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {certificate.status === 'valid' ? 'verified' : 'cancel'}
                        </span>
                        {certificate.status === 'valid' ? 'صالحة' : 'ملغاة'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                    <QRCode
                      value={verificationUrl}
                      size={160}
                      bgColor="transparent"
                      fgColor="#111827"
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                    امسح رمز الاستجابة السريعة للتحقق من صحة الشهادة من أي جهاز متصل بالإنترنت.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerificationPage;

