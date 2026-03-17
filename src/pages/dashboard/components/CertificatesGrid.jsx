import React from 'react';
import { Link } from 'react-router-dom';
import { downloadCertificatePdf } from '../../../features/certificates/services/pdfService.js';

import { useNavigate } from 'react-router-dom';

const CertificatesGrid = ({ certificates, courses = [], loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 h-32 animate-pulse" />
    );
  }

  // If there are no certificates, display empty state
  const completedCourses = courses.filter(c => c.enrollment?.isCompleted);
  const claimedCourseIds = certificates?.map(c => c.courseId) || [];
  const unclaimedCourses = completedCourses.filter(c => !claimedCourseIds.includes(c.id));

  const hasAnyCertificates = (certificates && certificates.length > 0) || unclaimedCourses.length > 0;

  if (!hasAnyCertificates) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 text-center">
        <h2 className="text-base font-black text-heading-dark mb-4">الأوسمة والشهادات</h2>
        <p className="text-xs text-gray-400">لا توجد أوسمة بعد</p>
      </div>
    );
  }

  const handleDownload = async (cert, e) => {
    e.preventDefault();
    try {
      await downloadCertificatePdf(cert);
    } catch (err) {
      console.error('Failed to download certificate PDF', err);
      alert('تعذر تحميل ملف الشهادة. حاول مرة أخرى لاحقاً.');
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-black text-heading-dark mb-6 text-center">
        الأوسمة والشهادات
      </h2>

      <div className="flex flex-col gap-4">
        {/* Render Issued Certificates */}
        {certificates.map((cert, index) => {
          const styles = [
            "bg-green-50 text-green-600 border-green-100",
            "bg-blue-50 text-blue-600 border-blue-100",
            "bg-amber-50 text-amber-500 border-amber-100",
            "bg-purple-50 text-purple-600 border-purple-100"
          ];
          const style = styles[index % styles.length];

          return (
            <Link
              key={cert.id}
              to={`/certificate/${cert.id}`}
              title={`شهادة: ${cert.courseName || cert.courseTitle}`}
              className="relative rounded-2xl border p-4 flex items-center justify-between hover:shadow-md transition-all group bg-white border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${style}`}>
                  <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                    workspace_premium
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-heading-dark line-clamp-1">
                    {cert.courseName || cert.courseTitle || 'شهادة إتمام'}
                  </h3>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">event</span>
                    <span>{cert.issuedAt ? new Date(cert.issuedAt?.seconds ? cert.issuedAt.seconds * 1000 : cert.issuedAt).toLocaleDateString('ar-EG') : 'تم الإصدار'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => handleDownload(cert, e)}
                className="flex items-center shrink-0 gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-gray-100 group-hover:border-primary/20"
                title="تحميل"
              >
                <span className="text-xs font-bold hidden sm:inline-block">تحميل</span>
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
            </Link>
          );
        })}

        {/* Render Unclaimed Completed Courses */}
        {unclaimedCourses.map((course, index) => {
          const offset = (certificates?.length || 0) + index;
          const styles = [
            "bg-green-50 text-green-600 border-green-100",
            "bg-blue-50 text-blue-600 border-blue-100",
            "bg-amber-50 text-amber-500 border-amber-100",
            "bg-purple-50 text-purple-600 border-purple-100"
          ];
          const style = styles[offset % styles.length];

          return (
            <button
              key={`unclaimed-${course.id}`}
              onClick={() => {
                // The old route was `/course/${course.seo?.slug || course.id}` but PublicRoutes has `/courses/:courseId`
                navigate(`/courses/${course.seo?.slug || course.id}`);
              }}
              title={`اصدار شهادة: ${course.title}`}
              className="relative rounded-2xl border p-4 flex items-center justify-between hover:shadow-md transition-all group bg-white border-gray-100 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 text-right w-full"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${style}`}>
                  <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                    workspace_premium
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-heading-dark line-clamp-1">
                    {course.title || 'دورة مكتملة'}
                  </h3>
                  <div className="text-xs text-amber-500 mt-1 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    <span>متاحة للاستخراج</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center shrink-0 gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors border border-gray-100 group-hover:border-amber-200">
                <span className="text-xs font-bold hidden sm:inline-block"> تفاصيل الكورس</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CertificatesGrid;
