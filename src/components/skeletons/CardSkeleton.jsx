import React from 'react';

const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm animate-pulse h-full flex flex-col">
      {/* Image Placeholder */}
      <div className="h-[240px] w-full bg-gray-200 relative">
        <div className="absolute top-4 right-4 h-6 w-20 bg-gray-300 rounded-lg"></div>
        <div className="absolute bottom-4 left-4 h-6 w-16 bg-gray-300 rounded-lg"></div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="h-8 w-3/4 bg-gray-200 rounded-lg mb-4"></div>

        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
          <div className="h-6 w-20 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
