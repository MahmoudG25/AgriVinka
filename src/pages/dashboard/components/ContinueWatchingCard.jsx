import React from 'react';
import { Link } from 'react-router-dom';

const ContinueWatchingCard = ({ course, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-2xl border border-gray-100 p-5">
        <div className="h-5 bg-gray-100 rounded w-36 mb-5" />
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-full sm:w-56 h-32 bg-gray-100 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-50 rounded w-full" />
            <div className="h-3 bg-gray-50 rounded w-1/2" />
            <div className="h-2 bg-gray-100 rounded-full w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const progress = course.enrollment.progressPercentage || 0;
  const lastLesson = course.enrollment.lastLessonTitle || '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 pb-0">
        <h2 className="text-base font-bold text-heading-dark flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-xl">play_circle</span>
          متابعة التعلم
        </h2>
      </div>
      <Link
        to={`/courses/${course.id}/play`}
        className="group flex flex-col sm:flex-row gap-5 p-5 hover:bg-gray-50/50 transition-colors"
      >
        {/* Thumbnail */}
        <div className="w-full sm:w-56 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
          <img
            src={course.media?.thumbnail || 'https://placehold.co/600x400?text=Course'}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-primary text-2xl">play_arrow</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-heading-dark group-hover:text-primary transition-colors line-clamp-1">
              {course.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
            {lastLesson && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">video_library</span>
                آخر درس: {lastLesson}
              </p>
            )}
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-500">التقدم</span>
              <span className="text-xs font-black text-primary">{progress}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-primary to-green-500 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ContinueWatchingCard;
