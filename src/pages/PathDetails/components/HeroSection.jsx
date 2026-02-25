import React from 'react';

const HeroSection = ({ data, meta }) => {
  if (!data) return null;

  const { title, description, level, duration, coursesCount } = data;

  return (
    <div className="mb-12">

      {/* 1. Badge Row */}
      <div className="flex items-center gap-3 mb-5">
        {level && (
          <span className="bg-[#eef2ff] text-[#4f46e5] px-3 py-1 rounded-full text-xs font-bold border border-[#e0e7ff]">
            {level}
          </span>
        )}
        {coursesCount > 0 && (
          <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
            {coursesCount} دورات
          </span>
        )}
      </div>

      {/* 2. Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3a2d21] mb-6 leading-tight">
        {title}
      </h1>

      {/* 3. Description */}
      <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed font-medium">
        {description}
      </p>

      {/* 4. Metadata Row — ONLY real, derivable data */}
      <div className="flex flex-wrap gap-y-3 gap-x-6 text-xs md:text-sm font-medium text-gray-500 border-t border-gray-100 pt-6">

        {duration && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-amber-500">schedule</span>
            <span>{duration}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-amber-500">workspace_premium</span>
          <span>شهادة معتمدة</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-amber-500">language</span>
          <span>{meta?.language || 'العربية'}</span>
        </div>

      </div>

    </div>
  );
};

export default HeroSection;
