import React from 'react';

const AccordionSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-1/3 bg-gray-200 rounded-lg"></div>
        <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3 w-2/3">
                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccordionSkeleton;
