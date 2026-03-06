import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdSchool } from 'react-icons/md';
import { useAuth } from '../../../app/contexts/AuthContext';
import { enrollmentService } from '../../../services/firestore/enrollmentService';
import toast from 'react-hot-toast';
import { getOrCreateCertificate } from '../../../features/certificates/services/certificateService.js';
import { downloadCertificatePdf } from '../../../features/certificates/services/pdfService.js';

const MyCoursesGrid = ({ courses, loading }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div>
        <h2 className="text-base font-bold text-heading-dark flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-primary text-xl">library_books</span>
          مساحة التعلم
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-50 overflow-hidden">
              <div className="h-36 bg-gray-100" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-2 bg-gray-50 rounded-full w-full" />
                <div className="h-8 bg-gray-100 rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-base font-bold text-heading-dark flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-primary text-xl">library_books</span>
          مساحة التعلم
        </h2>
        <div className="py-14 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">school</span>
          <p className="text-gray-500 font-medium mb-1">لم تسجل في أي دورة أو مسار بعد</p>
          <p className="text-xs text-gray-400 mb-4">ابدأ رحلتك التعليمية مع AgriVinka</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-heading-dark transition-colors"
          >
            تصفح الدورات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-bold text-heading-dark flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-primary text-xl">library_books</span>
        مساحة التعلم
        <span className="text-xs text-gray-400 font-medium mr-1">({courses.length})</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map(course => {
          const isRoadmap = course.itemType === 'roadmap' || course.roadmapId;
          const progress = course.enrollment?.progressPercent || course.enrollment?.progressPercentage || 0;
          const isCompleted = course.enrollment?.isCompleted || progress === 100;
          const isFree = !course.pricing?.price || course.pricing?.price === 0;

          const actionLink = isRoadmap ? `/roadmaps/${course.id}/play` : `/courses/${course.id}/play`;

          const generateCert = async (courseId, courseTitle, instructorName) => {
            if (!currentUser) return;
            try {
              toast.loading('جاري إصدار الشهادة وتحميلها...', { id: 'cert_grid' });

              const cert = await getOrCreateCertificate({
                userId: currentUser.uid,
                courseId,
                studentName: currentUser.displayName || 'AgriVinka Trainee',
                courseName: courseTitle,
                instructorName: instructorName || 'AgriVinka',
              });

              await enrollmentService.updateEnrollmentCertificate(currentUser.uid, courseId, cert.id);
              await downloadCertificatePdf(cert);

              toast.success('تم إصدار الشهادة وتحميل ملف PDF بنجاح', { id: 'cert_grid' });
            } catch (err) {
              console.error(err);
              toast.error('فشل إصدار الشهادة، حاول مرة أخرى لاحقاً', { id: 'cert_grid' });
            }
          };

          return (
            <div
              key={course.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all group ${isCompleted ? 'border-green-100' : 'border-gray-100'
                }`}
            >
              {/* Thumbnail */}
              <div className="relative h-36 overflow-hidden bg-gray-100">
                <img
                  src={course.media?.thumbnail || course.thumbnail || course.image || 'https://placehold.co/600x400?text=Content'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Status badge */}
                <div className="absolute top-3 right-3 flex gap-1">
                  {isRoadmap && (
                    <span className="bg-purple-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      مسار
                    </span>
                  )}
                  {isCompleted ? (
                    <span className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      مكتمل
                    </span>
                  ) : isFree ? (
                    <span className="bg-primary/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      مجاناً
                    </span>
                  ) : (
                    <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      مدفوع
                    </span>
                  )}
                </div>
                {/* Completed overlay */}
                {isCompleted && (
                  <div className="absolute inset-0 bg-green-600/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-500 text-4xl bg-white rounded-full shadow-sm">check_circle</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-heading-dark text-sm line-clamp-1 mb-3">{course.title}</h3>

                {/* Progress bar */}
                {!isCompleted && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">التقدم</span>
                      <span className="font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <>
                      {course.enrollment?.certificateId ? (
                        <>
                          <Link
                            to={`/verify/${course.enrollment.certificateId}`}
                            className="flex-1 py-1 px-2 bg-green-50 text-green-600 font-bold rounded-lg text-[10px] text-center hover:bg-green-100 transition-colors flex flex-col items-center justify-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-sm">workspace_premium</span>
                            عرض
                          </Link>
                          <button
                            onClick={() => generateCert(course.id, course.title, course.instructorName)}
                            className="flex-1 py-1 px-2 bg-amber-50 text-amber-600 font-bold rounded-lg text-[10px] text-center hover:bg-amber-100 transition-colors flex flex-col items-center justify-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-sm">autorenew</span>
                            تحديث
                          </button>
                        </>
                      ) : !isRoadmap ? (
                        <button
                          onClick={() => generateCert(course.id, course.title, course.instructorName)}
                          className="flex-1 py-2 bg-yellow-50 text-yellow-600 font-bold rounded-lg text-xs text-center hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">workspace_premium</span>
                          طلب الشهادة
                        </button>
                      ) : null}

                      <Link
                        to={actionLink}
                        className="flex-1 py-2 bg-gray-100 text-heading-dark font-bold rounded-lg text-xs text-center hover:bg-gray-200 transition-colors"
                      >
                        مراجعة
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={actionLink}
                      className="w-full py-2 bg-primary text-white font-bold rounded-lg text-xs text-center hover:bg-heading-dark transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      متابعة التعلم
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div >
    </div >
  );
};

export default MyCoursesGrid;
