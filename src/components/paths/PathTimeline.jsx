import React from 'react';
import PathModule from './PathModule';

const PathTimeline = ({ modules = [] }) => {
  return (
    <div className="py-2">
      {modules.map((module, index) => (
        <PathModule
          key={module.id || index}
          module={module}
          isFirst={index === 0}
          isLast={index === modules.length - 1}
        />
      ))}

      {/* End of Journey Marker */}
      <div className="relative mr-0 md:mr-10 flex items-center gap-4 opacity-50">
        <div className="hidden md:flex flex-col items-center absolute -right-[21px] -top-8 h-full">
          <div className="w-[2px] h-8 bg-gray-200"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </div>
        <div className="p-4 rounded-[1rem] border border-gray-200 bg-gray-50 w-full text-center shadow-sm">
          <p className="text-sm text-gray-400 font-medium">تم إكمال المسار التعليمي</p>
        </div>
      </div>
    </div>
  );
};

export default PathTimeline;
