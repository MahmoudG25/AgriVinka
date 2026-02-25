import React from 'react';

const SidebarSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Pricing Card Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="h-12 w-1/2 bg-gray-200 rounded-lg mb-6"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-6"></div>

        <div className="space-y-3 mb-6">
          <div className="h-14 w-full bg-gray-200 rounded-xl"></div>
          <div className="h-12 w-full bg-gray-200 rounded-xl"></div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructor/Generic Widget Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
        <div className="h-20 w-20 rounded-full bg-gray-200 mb-4"></div>
        <div className="h-6 w-1/2 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default SidebarSkeleton;
