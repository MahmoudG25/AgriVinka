import React from 'react';

const ListSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-8 w-1/3 bg-gray-200 rounded-lg mb-6"></div>

      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-5 w-5 rounded-full bg-gray-200 mt-1 shrink-0"></div>
            <div className="h-5 w-full bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListSkeleton;
