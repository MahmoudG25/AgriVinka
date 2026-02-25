import React from 'react';

const CourseSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-video w-full bg-gray-200 relative">
        <div className="absolute top-4 right-4 w-20 h-6 bg-gray-300 rounded-full"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-1 gap-4">

        {/* Title */}
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-1"></div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded-md w-full"></div>
          <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div className="w-16 h-4 bg-gray-100 rounded-md"></div>
          <div className="w-16 h-4 bg-gray-100 rounded-md"></div>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between mt-2 gap-4">
          <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
        </div>

      </div>
    </div>
  );
};

export default CourseSkeleton;
