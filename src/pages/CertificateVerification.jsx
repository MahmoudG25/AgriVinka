import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateService } from '../services/certificateService';
import SEOHead from '../components/common/SEOHead';
import { FaCheckCircle, FaTimesCircle, FaDownload, FaSpinner, FaChevronLeft } from 'react-icons/fa';

const CertificateVerification = () => {
  const { code } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setLoading(true);
        const certData = await certificateService.getCertificateByCode(code);
        if (certData) {
          setCertificate(certData);
        } else {
          setError('لم يتم العثور على شهادة بهذا الرمز. يرجى التأكد من الرمز والمحاولة مرة أخرى.');
        }
      } catch (err) {
        setError('حدث خطأ أثناء التحقق من الشهادة. يرجى المحاولة لاحقاً.');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      verifyCertificate();
    }
  }, [code]);

  return (
    <div className="min-h-[80vh] bg-background-alt py-20 flex flex-col items-center justify-center relative overflow-hidden">
      <SEOHead title="التحقق من الشهادة | أكاديمية نماء" />

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container-narrow relative z-10 w-full  px-4">

        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src="/logo.png" alt="أكاديمية نماء" className="h-16 mx-auto drop-shadow-md" />
          </Link>
          <h1 className="text-3xl font-black text-heading-dark mb-2">التحقق من الشهادات</h1>
          <p className="text-gray-500 font-medium">نظام التحقق الإلكتروني من صحة وموثوقية الشهادات الصادرة عن الأكاديمية.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-heading-dark p-6 text-center border-b border-gray-800">
            <div className="text-sm text-gray-400 font-bold mb-1 tracking-wider uppercase">رمز التحقق</div>
            <div className="text-2xl font-mono text-accent font-bold tracking-widest">{code}</div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-primary">
                <FaSpinner className="animate-spin text-4xl mb-4" />
                <p className="font-bold text-gray-500">جاري التحقق من قاعدة البيانات...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaTimesCircle className="text-red-500 text-4xl" />
                </div>
                <h2 className="text-2xl font-bold text-heading-dark mb-2">الشهادة غير صالحة</h2>
                <p className="text-gray-500 mb-8">{error}</p>
                <Link to="/" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-100 text-heading-dark font-bold rounded-xl hover:bg-gray-200 transition-colors w-full sm:w-auto">
                  العودة للرئيسية
                  <FaChevronLeft className="text-sm" />
                </Link>
              </div>
            ) : certificate ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping opacity-20"></div>
                  <FaCheckCircle className="text-green-500 text-5xl relative z-10" />
                </div>

                <h2 className="text-2xl font-bold text-heading-dark mb-2">الشهادة موثقة وصالحة</h2>
                <p className="text-gray-500 font-medium mb-8">تم إصدار هذه الشهادة بنجاح ومسجلة رسمياً في سجلات أكاديمية نماء.</p>

                <div className="bg-gray-50 rounded-2xl p-6 text-right space-y-4 mb-8 border border-gray-100">
                  <div>
                    <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">اسم المتدرب</span>
                    <strong className="text-lg text-heading-dark">{certificate.userName}</strong>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">الدورة التدريبية</span>
                    <strong className="text-lg text-primary">{certificate.courseName}</strong>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">تاريخ الإصدار</span>
                    <strong className="text-lg text-heading-dark">
                      {certificate.issuedAt?.toDate ? certificate.issuedAt.toDate().toLocaleDateString('ar-EG') : new Date().toLocaleDateString('ar-EG')}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={certificate.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover hover:-translate-y-1 transition-all"
                  >
                    <FaDownload />
                    تحميل نسخة الـ PDF
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificateVerification;
