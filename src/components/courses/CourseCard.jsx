import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ScaleCard } from '../../utils/motion';
import { ImageWithFallback } from '../../utils/imageUtils';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../../app/contexts/AuthContext';
import { favoritesService } from '../../services/firestore/favoritesService';

const CourseCard = ({ course }) => {
  const {
    id,
    title,
    description,
    image,
    category,
    price,
    rating = 4.8,
    students = 0,
    lessons = 0,
    duration = '0h',
    level = 'مبتدئ'
  } = course;

  // Resolve image from various potential keys
  const displayImage = image || course.media?.thumbnail || course.preview_image || '';

  // Resolve lessons count
  const displayLessons = lessons || course.lessons_count || (course.sections ? course.sections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0) : 0);

  // Helper to parse price safely
  const parsePrice = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const clean = String(val).replace(/[^0-9.]/g, ''); // Remove currency symbols, commas, etc.
    return parseFloat(clean) || 0;
  };

  const resolvedPrice = parsePrice(price || course.pricing?.price || course.meta?.price || course.cost);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (currentUser?.uid && id) {
      favoritesService.isFavorite(currentUser.uid, id).then(setIsFav);
    }
  }, [currentUser, id]);

  const handleFavToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const result = await favoritesService.toggleFavorite(currentUser.uid, id);
      setIsFav(result);
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  return (
    <ScaleCard
      className="group bg-white rounded-2xl overflow-hidden border border-border-light shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full relative"
    >
      <Link to={`/courses/${id}`} className="block h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={displayImage || 'https://via.placeholder.com/640x360?text=Shams+Al-Arab'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-white/95 backdrop-blur-sm text-heading-dark text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
              {category || 'عام'}
            </span>
          </div>

          {/* Level Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-black/30 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/20">
              {level}
            </span>
          </div>

          {/* Favorite Heart */}
          <button
            onClick={handleFavToggle}
            className={`absolute bottom-4 left-4 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 shadow-sm z-10 ${isFav
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/80 text-gray-400 hover:text-red-400 hover:bg-white'
              }`}
          >
            {isFav ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">

          {/* Header Stats (Rating & Lessons) */}
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-3">
            <div className="flex items-center gap-1 text-accent">
              <span className="material-symbols-outlined text-base fill-current">star</span>
              <span className="text-gray-700 font-bold">{rating}</span>
              <span className="text-gray-400">({students})</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
              <span className="material-symbols-outlined text-sm">play_circle</span>
              <span>{displayLessons} درس</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-heading-dark mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>

          <p className="text-sm text-body-text/80 line-clamp-2 mb-4 flex-1">
            {description}
          </p>

          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
            {/* Price */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">السعر</span>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-primary">
                  {resolvedPrice > 0 ? resolvedPrice.toLocaleString('en-US') : 'مجاني'}
                </span>
                {resolvedPrice > 0 && <span className="text-xs text-gray-500 font-bold">ج.م</span>}
              </div>
            </div>

            {/* CTA */}
            <button className="cursor-pointer flex-1 bg-heading-dark text-white text-sm font-bold py-2.5 rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2 group/btn">
              <span>عرض التفاصيل</span>
              <span className="material-symbols-outlined text-sm rtl:rotate-180 group-hover/btn:-translate-x-1 transition-transform">arrow_right_alt</span>
            </button>
          </div>

        </div>
      </Link>
    </ScaleCard>
  );
};

export default CourseCard;
