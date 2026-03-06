import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roadmapService } from '../../services/firestore/roadmapService';
import CardSkeleton from '../skeletons/CardSkeleton';
import { ImageWithFallback } from '../../utils/imageUtils';

const PathsGrid = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setLoading(true);
        const data = await roadmapService.getAllRoadmaps();
        setRoadmaps(data);
      } catch (error) {
        console.error("Failed to fetch roadmaps:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-96">
            <CardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return <div className="text-center py-12 text-gray-500">لا توجد مسارات متاحة حالياً.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {roadmaps.map((roadmap) => {
        // Safe accessors for new/old schema compatibility
        const price = roadmap.pricing?.price || roadmap.price;
        const discount = roadmap.pricing?.discount_percentage || roadmap.discount;
        const duration = roadmap.meta?.duration || roadmap.duration;
        const level = roadmap.meta?.level || roadmap.level;
        const unitsCount = roadmap.meta?.courses_count || (roadmap.courses ? roadmap.courses.length : roadmap.units_count) || 0;
        const image = roadmap.media?.thumbnail || roadmap.image;

        return (
          <div key={roadmap.id} className="bg-white rounded-card border border-border-light shadow-soft hover:shadow-hover hover:border-primary/30 transition-all duration-300 group flex flex-col h-full">
            <div className="relative h-48 overflow-hidden rounded-t-card">
              <ImageWithFallback
                alt={roadmap.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={image}
                fallbackSrc="https://placehold.co/600x400?text=No+Image"
              />
              {roadmap.tag && (
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm text-heading-dark border border-border-light">
                  {roadmap.tag}
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-heading-dark/90 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur-sm">
                {level || 'Beginner'}
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-primary/80"></span>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">مسار تعليمي</span>
              </div>

              <h3 className="text-xl font-bold text-heading-dark mb-3 group-hover:text-primary transition-colors line-clamp-1">
                {roadmap.title}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                {roadmap.description}
              </p>

              <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-border-light">
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="material-symbols-outlined text-lg text-primary/80">timer</span>
                  <span className="text-xs font-medium">{duration || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="material-symbols-outlined text-lg text-primary/80">library_books</span>
                  <span className="text-xs font-medium">{unitsCount} دورات</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-light flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-medium mb-0.5">تبدأ من</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-heading-dark">{price > 0 ? `$${price}` : 'مجاني'}</span>
                    {discount > 0 && (
                      <span className="text-xs text-red-400 line-through decoration-red-400/50">${price + (price * discount / 100)}</span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/roadmaps/${roadmap.id}`}
                  className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
                >
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PathsGrid;
