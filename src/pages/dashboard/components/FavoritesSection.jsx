import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const FavoritesSection = ({ favorites, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 h-48 animate-pulse" />
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-black text-heading-dark mb-6 text-center">
        الكورسات المفضلة
      </h2>

      {favorites.length > 0 ? (
        <div className="space-y-4">
          {favorites.map(course => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group flex gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-all text-right items-center"
            >
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-bold text-xs text-heading-dark group-hover:text-primary transition-colors truncate">
                  {course.title}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1 truncate">
                  {course.duration || '6 ساعات'} • {course.lessonsCount || '12 درساً'} 
                </p>
              </div>
              
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                <img
                  src={course.media?.thumbnail || 'https://placehold.co/600x400?text=Course'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-2xl">
          <p className="text-gray-500 font-medium text-xs mb-2">لا توجد دورات مفضلة</p>
          <button onClick={() => navigate('/courses')} className="text-primary font-bold text-xs hover:underline">
            تصفح الدورات
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;
