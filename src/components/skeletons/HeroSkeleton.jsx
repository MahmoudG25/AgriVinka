import React from 'react';

const HeroSkeleton = () => {
  return (
    <div className="animate-pulse mb-12 w-full">
      {/* Badge Row */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>

      {/* Title */}
      <div className="h-10 md:h-12 w-3/4 bg-gray-200 rounded-lg mb-6"></div>

      {/* Description */}
      <div className="space-y-3 mb-8">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
        <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
      </div>

      {/* Metadata Row */}
      <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSkeleton;
