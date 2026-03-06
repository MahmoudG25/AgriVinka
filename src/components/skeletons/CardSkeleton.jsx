import React from 'react';

/**
 * CardSkeleton — shimmer-animated loading placeholder for course/path cards.
 * Uses a CSS gradient animation instead of plain pulse for a more premium feel.
 */
const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm h-full flex flex-col">
      {/* Image Placeholder */}
      <div className="h-[240px] w-full bg-gray-100 relative overflow-hidden">
        <div className="skeleton-shimmer absolute inset-0" />
        <div className="absolute top-4 right-4 h-6 w-20 bg-gray-200 rounded-lg" />
        <div className="absolute bottom-4 left-4 h-6 w-16 bg-gray-200 rounded-lg" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="h-8 w-3/4 bg-gray-100 rounded-lg mb-4 skeleton-shimmer" />

        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-gray-100 rounded skeleton-shimmer" />
          <div className="h-4 w-2/3 bg-gray-100 rounded skeleton-shimmer" style={{ animationDelay: '0.15s' }} />
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
          <div className="h-6 w-20 bg-gray-100 rounded-lg skeleton-shimmer" style={{ animationDelay: '0.3s' }} />
          <div className="h-10 w-28 bg-gray-100 rounded-xl skeleton-shimmer" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
