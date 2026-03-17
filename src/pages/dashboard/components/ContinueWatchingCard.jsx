import React from 'react';
import { Link } from 'react-router-dom';

const ContinueWatchingCard = ({ course, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-[2rem] border border-gray-100 p-6 h-48" />
    );
  }

  if (!course) return null;

  const progress = course.enrollment.progressPercentage || 0;
  const lastLesson = course.enrollment.lastLessonTitle || '';

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-black text-heading-dark">
          التعلم الحالي
        </h2>
        <Link to="/schedule" className="text-xs font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
          عرض الجدول
          <span className="material-symbols-outlined text-[10px] rtl:rotate-180">open_in_new</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Thumbnail on left side per design? Actually RTL says image on the left from Arabic perspective. Standard RTL makes left visual, but looking at design picture, the image is on the LEFT SIDE of the card text. Actually design has: text on right, image on left. But we apply flex-row (with RTL, flex-row puts first item on RIGHT). So to put image on LEFT, image should be second item! */}
        
        {/* Info Area (Right side visually in RTL) */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-green-500 text-sm">psychiatry</span>
            <span className="text-[10px] font-bold text-gray-500">دورة الزراعة المائية المتطورة</span>
          </div>
          
          <h3 className="text-lg md:text-xl font-bold text-heading-dark mb-4 leading-relaxed">
            الدرس الثاني عشر: {lastLesson || course.title}
          </h3>

          {/* Progress row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-gray-400">مكتمل {progress}%</span>
                <span className="text-[10px] font-bold text-gray-500">تبقى 15 دقيقة من الفيديو</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                <div
                  className="h-full bg-green-700 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <Link
            to={`/courses/${course.id}/play`}
            className="inline-flex justify-center items-center px-6 py-2 bg-[#2a5c3e] text-white font-bold rounded-xl text-xs hover:bg-[#1f452d] transition-colors"
          >
            متابعة الدرس
          </Link>
        </div>

        {/* Thumbnail Area (Left side visually in RTL) */}
        <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-sm relative order-last">
          <img
            src={course.media?.thumbnail || 'https://placehold.co/600x400?text=Course'}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ContinueWatchingCard;
