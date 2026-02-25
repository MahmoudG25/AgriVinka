import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const FavoritesSection = ({ favorites, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="h-5 bg-gray-100 rounded w-32 mb-5" />
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-50">
              <div className="w-16 h-12 rounded-lg bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-2 bg-gray-50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-base font-bold text-heading-dark flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-red-400 text-xl">favorite</span>
        الدورات المفضلة
        {favorites.length > 0 && (
          <span className="text-xs text-gray-400 font-medium">({favorites.length})</span>
        )}
      </h2>

      {favorites.length > 0 ? (
        <div className="space-y-2">
          {favorites.map(course => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-sm transition-all bg-gray-50/30 hover:bg-white"
            >
              <div className="w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                <img
                  src={course.media?.thumbnail || 'https://placehold.co/600x400?text=Course'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs text-heading-dark group-hover:text-primary transition-colors truncate">{course.title}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{course.description}</p>
              </div>
              <span className="material-symbols-outlined text-red-300 text-lg shrink-0 group-hover:text-red-500 transition-colors">favorite</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">favorite_border</span>
          <p className="text-gray-500 font-medium text-sm mb-1">لم تضف أي دورة إلى المفضلة بعد</p>
          <button onClick={() => navigate('/courses')} className="mt-3 text-primary font-bold text-xs hover:underline">
            تصفح الدورات
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;
