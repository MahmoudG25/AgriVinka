import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEOHead from "../../../components/common/SEOHead";
import { getCertificateById } from "../services/certificateService.js";
import { downloadCertificatePdf } from "../services/pdfService.js";

const CertificateViewPage = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!certificateId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCertificateById(certificateId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setError("لم يتم العثور على الشهادة.");
        } else {
          setCertificate(data);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("حدث خطأ أثناء تحميل بيانات الشهادة.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  const handleDownload = async () => {
    if (!certificate) return;
    setDownloading(true);
    try {
      await downloadCertificatePdf(certificate);
    } catch (err) {
      console.error(err);
      alert("تعذر تحميل ملف الشهادة. حاول مرة أخرى لاحقاً.");
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "-";
    if (ts.toDate) {
      return ts.toDate().toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return new Date(ts).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className=" bg-background-alt py-16">
      <SEOHead title="عرض الشهادة | AgriVinka" />
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] px-4">
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-heading-dark mb-2">
              شهادتك المعتمدة
            </h1>
            <p className="text-sm text-gray-500">
              يمكنك هنا معاينة تفاصيل شهادتك وتحميل نسخة PDF في أي وقت.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-heading-dark text-sm font-bold hover:bg-gray-200"
          >
            <span className="material-symbols-outlined text-base">
              arrow_back
            </span>
            لوحة التحكم
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 md:p-8">
          {loading && (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-50 rounded w-1/3" />
              <div className="h-32 bg-gray-50 rounded-xl" />
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12">
              <p className="text-red-600 font-bold mb-4">{error}</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-heading-dark font-bold hover:bg-accent"
              >
                العودة للوحة التحكم
              </Link>
            </div>
          )}

          {!loading && !error && certificate && (
            <div className="grid gap-8 md:grid-cols-2 items-start ">
              <div>
                <div className="border border-amber-100 rounded-2xl bg-linear-to-br from-amber-50/60 to-white p-5 mb-6">
                  <p className="text-xs text-gray-500 mb-1">الدورة التدريبية</p>
                  <h2 className="text-xl font-bold text-heading-dark mb-3">
                    {certificate.courseName || certificate.courseTitle}
                  </h2>
                  <p className="text-xs text-gray-500 mb-1">اسم المتدرب</p>
                  <p className="text-base font-semibold text-heading-dark mb-3">
                    {certificate.studentName}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">المحاضر</p>
                  <p className="text-sm font-medium text-heading-dark">
                    {certificate.instructorName || "AgriVinka"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">تاريخ الإصدار</p>
                    <p className="font-medium text-heading-dark">
                      {formatDate(certificate.issuedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الرقم التسلسلي</p>
                    <p
                      className="font-mono text-xs text-heading-dark"
                      dir="ltr"
                    >
                      {certificate.serialNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">حالة الشهادة</p>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${certificate.status === "valid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {certificate.status === "valid" ? "verified" : "cancel"}
                      </span>
                      {certificate.status === "valid" ? "صالحة" : "ملغاة"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">رابط التحقق</p>
                    <Link
                      to={`/verify/${certificate.id}`}
                      className="text-xs font-medium text-primary underline underline-offset-2 break-all"
                    >
                      {window.location.origin}/verify/{certificate.id}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
                  <p className="text-sm font-semibold text-heading-dark mb-2">
                    معاينة الشهادة
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    هذه معاينة نصية لبيانات الشهادة. التصميم الكامل يظهر داخل
                    ملف PDF.
                  </p>
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-xs text-gray-500 leading-relaxed">
                    <p>
                      This is to certify that{" "}
                      <strong>{certificate.studentName}</strong> has
                      successfully completed the course{" "}
                      <strong>{certificate.courseName}</strong> with AgriVinka
                      Academy.
                    </p>
                    <p className="mt-3">
                      Certificate ID:{" "}
                      <span className="font-mono">{certificate.id}</span>
                    </p>
                    <p>
                      Serial:{" "}
                      <span className="font-mono">
                        {certificate.serialNumber}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-heading-dark font-bold hover:bg-accent disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-base">
                    {downloading ? "hourglass_top" : "download"}
                  </span>
                  {downloading ? "جاري تجهيز ملف PDF..." : "تحميل الشهادة PDF"}
                </button>

                <Link
                  to={`/verify/${certificate.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-heading-dark text-sm font-bold hover:bg-gray-200"
                >
                  <span className="material-symbols-outlined text-base">
                    qr_code_2
                  </span>
                  الانتقال لصفحة التحقق
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateViewPage;
