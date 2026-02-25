import React from 'react';
import { ImageWithFallback } from '../../../utils/imageUtils';

const InstructorWidget = ({ data }) => {
  if (!data) return null;
  const { name, role, image, bio } = data;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-[1rem] text-center">
      <h3 className="font-bold text-heading-dark mb-6 text-sm">مدرب المسار</h3>

      <div className="flex flex-col items-center">
        <div className="relative mb-3">
          <ImageWithFallback
            src={image}
            fallbackSrc={`https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff`}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        <h4 className="font-bold text-heading-dark text-base mb-1">{name}</h4>
        <p className="text-xs text-amber-600 font-medium mb-4">{role}</p>

        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-4">
          {bio}
        </p>


      </div>
    </div>
  );
};

export default InstructorWidget;
