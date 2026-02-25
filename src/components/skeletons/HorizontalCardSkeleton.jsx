import React from 'react';

const HorizontalCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse flex items-start gap-4 h-full">
      {/* Thumbnail */}
      <div className="w-14 h-14 bg-gray-200 rounded-xl shrink-0"></div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-3">
        {/* Title */}
        <div className="h-5 w-3/4 bg-gray-200 rounded"></div>

        {/* Description */}
        <div className="space-y-1">
          <div className="h-3 w-full bg-gray-200 rounded"></div>
          <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
        </div>

        {/* Meta */}
        <div className="flex gap-3 mt-3">
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalCardSkeleton;
