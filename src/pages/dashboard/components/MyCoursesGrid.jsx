import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-black text-heading-dark">كورساتي</h2>
          <span className="text-xs text-gray-400 font-medium">مشاهدة الكل</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-[2rem] border border-gray-50 overflow-hidden h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 p-8">
        <h2 className="text-base font-black text-heading-dark mb-5">كورساتي</h2>
        <div className="py-14 text-center rounded-2xl bg-gray-50/50">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">school</span>
          <p className="text-gray-500 font-medium mb-1">لم تسجل في أي دورة أو مسار بعد</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-6 py-2.5 bg-[#2a5c3e] text-white font-bold rounded-full text-sm hover:bg-[#1f452d] transition-colors"
          >
            تصفح الدورات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-black text-heading-dark">كورساتي</h2>
        <Link to="/courses" className="text-xs text-gray-400 font-medium hover:text-primary transition-colors">مشاهدة الكل</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {courses.map(course => {
          const isRoadmap = course.itemType === 'roadmap' || course.roadmapId;
          const progress = course.enrollment?.progressPercent || course.enrollment?.progressPercentage || 0;
          const isCompleted = course.enrollment?.isCompleted || progress === 100;
          const levelBadgeInfo = course.level ? (course.level === 'beginner' ? 'مبتدئ' : course.level === 'intermediate' ? 'متوسط' : 'متقدم') : 'مبتدئ ومتقدم';

          const actionLink = isRoadmap ? `/roadmaps/${course.id}/play` : `/courses/${course.id}/play`;

          // Generate Certificate function keeping old logic intact
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
              className={`bg-white rounded-[2rem] border overflow-hidden shadow-sm hover:shadow-md transition-all group ${isCompleted ? 'border-green-100' : 'border-gray-100'
                }`}
            >
              {/* Thumbnail */}
              <div className="relative h-40 overflow-hidden bg-gray-100 p-2">
                <img
                  src={course.media?.thumbnail || course.thumbnail || course.image || 'https://placehold.co/600x400?text=Course'}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-[1.5rem] group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Level badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 text-heading-dark text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                    {levelBadgeInfo}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-heading-dark text-sm line-clamp-2 mb-2 min-h-[40px] leading-relaxed">{course.title}</h3>
                
                <div className="flex items-center gap-1.5 mb-4 text-xs text-gray-500 font-medium">
                   <span className="material-symbols-outlined text-sm">person</span>
                   <span>{course.instructorName || 'مدرب معتمد'}</span>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400 font-bold">التقدم</span>
                    <span className="font-bold text-heading-dark">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2a5c3e] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <>
                      {course.enrollment?.certificateId ? (
                         <button
                           onClick={() => generateCert(course.id, course.title, course.instructorName)}
                           className="flex-1 py-2.5 border-2 border-[#2a5c3e] text-[#2a5c3e] font-bold rounded-full text-xs text-center hover:bg-[#2a5c3e] hover:text-white transition-colors flex justify-center items-center gap-1"
                         >
                           <span className="material-symbols-outlined text-sm">download</span>
                           شهادة
                         </button>
                      ) : !isRoadmap ? (
                        <button
                          onClick={() => generateCert(course.id, course.title, course.instructorName)}
                          className="flex-1 py-2.5 border-2 border-amber-500 text-amber-600 font-bold rounded-full text-xs text-center hover:bg-amber-500 hover:text-white transition-colors"
                        >
                          طلب الشهادة
                        </button>
                      ) : null}

                      <Link
                        to={actionLink}
                        className="flex-1 py-2.5 border-2 border-gray-200 text-heading-dark font-bold rounded-full text-xs text-center hover:bg-gray-50 transition-colors"
                      >
                        مراجعة
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={actionLink}
                      className="w-full py-2.5 border-2 border-gray-200 text-heading-dark font-bold rounded-full text-xs text-center hover:border-[#2a5c3e] hover:text-[#2a5c3e] transition-colors"
                    >
                      استمرار
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCoursesGrid;
