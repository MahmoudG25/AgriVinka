import React from 'react';
import { ImageWithFallback } from '../../utils/imageUtils';

const PathModule = ({ module, isLast, isFirst }) => {
  // Construct image path if not full url
  const imagePath = module.image?.startsWith('http') || module.image?.startsWith('/')
    ? module.image
    : `/src/assets/coures-photo/${module.image}`;

  return (
    <div className="relative pl-0">
      {/* Timeline Connector */}
      <div className="hidden md:flex flex-col items-center absolute -right-[21px] top-0 h-full">
        <div className="w-[2px] h-8 bg-gray-200"></div>
        <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center z-10">
          <span className="material-symbols-outlined text-amber-600 text-xl">school</span>
        </div>
        {!isLast && <div className="w-[2px] flex-grow bg-gray-200"></div>}
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-8 mr-0 md:mr-10 group relative overflow-hidden">
        {/* Progress Bar (Decoration) */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 w-1/3 rounded-r-full"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Thumbnail */}
          <div className="w-full md:w-48 h-40 md:h-32 rounded-xl overflow-hidden shrink-0 relative bg-gray-100 border border-gray-100">
            {module.image ? (
              <ImageWithFallback
                src={imagePath}
                alt={module.title}
                className="w-full h-full object-cover"
                fallbackSrc="https://placehold.co/600x400/f3f4f6/9ca3af?text=No+Image"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                <span className="material-symbols-outlined text-4xl">image</span>
              </div>
            )}
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
              {module.duration || '2h 15m'}
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow pt-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                {module.title}
              </h3>
            </div>

            <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
              {module.description}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-full border border-gray-200 font-medium">
                {module.level || 'Beginner'}
              </span>
              <span className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-base">play_circle</span>
                {module.lessons_count || 12} دروس
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathModule;
