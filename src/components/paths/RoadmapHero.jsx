import React from 'react';
import { Link } from 'react-router-dom';

const RoadmapHero = ({ roadmap }) => {
  // Mock outcomes if not present
  const outcomes = roadmap.outcomes || roadmap.modules?.slice(0, 4).flatMap(m => m.outcomes?.slice(0, 1)) || [
    'إتقان أساسيات المجال وتطبيقها عملياً',
    'بناء مشاريع حقيقية لمعرض أعمالك',
    'فهم عميق للأدوات والتقنيات الحديثة',
    'جاهزية كاملة لسوق العمل'
  ];

  // const roadmapCertificate = roadmap.meta?.certificate ? "شهادة معتمدة" : "شهادة إتمام";

  return (
    <>
      {/* 0. Banner Image (If available) */}
      {roadmap.image && (
        <div className="w-full h-64 md:h-80 rounded-[1rem] overflow-hidden shadow-sm mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <img src={roadmap.image} alt={roadmap.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute bottom-6 right-8 z-20 text-white">
            <span className="bg-primary text-heading-dark font-bold px-3 py-1 rounded text-sm mb-2 inline-block">مسار تعليمي شامل</span>
          </div>
        </div>
      )}

      {/* 1. Main Info Card */}
      <div className="bg-white rounded-[1rem] border border-gray-100 p-8 lg:p-10 shadow-sm mb-8 relative overflow-hidden">

        <div className="flex flex-col items-start gap-6">
          {/* Badge & Rating Row */}
          <div className="flex w-full justify-between items-start">
            <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold">
              {roadmap.level || 'مستوى متقدم'}
            </span>

            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
              <span className="font-bold text-sm text-gray-900">{roadmap.rating || 4.8}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="material-symbols-outlined text-sm filled">star</span>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-heading-dark mb-4 leading-tight">
              {roadmap.title}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed">
              {roadmap.description}
            </p>
          </div>

          {/* Stats Metadata Row */}
          <div className="flex flex-wrap gap-4 lg:gap-8 mt-4 pt-6 border-t border-gray-50 w-full">
            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
              <span className="material-symbols-outlined text-amber-500 text-xl">schedule</span>
              <span>{roadmap.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
              <span className="material-symbols-outlined text-amber-500 text-xl">assignment</span>
              <span>{roadmap.modules?.length || 15} مشروع عملي</span>
            </div>
            {/* <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
              <span className="material-symbols-outlined text-amber-500 text-xl">school</span>
              <span>{roadmapCertificate}</span>
            </div> */}
            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
              <span className="material-symbols-outlined text-amber-500 text-xl">update</span>
              <span>أخر تحديث: مارس 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. "What You Will Learn" Card */}
      <div className="bg-white rounded-[1rem] border border-gray-100 p-8 lg:p-10 shadow-sm mb-12">
        <h3 className="font-bold text-xl text-heading-dark mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-2xl">lightbulb</span>
          ماذا ستتعلم في هذا المسار؟
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {outcomes.map((point, index) => (
            <div key={index} className="flex gap-3 text-gray-600">
              <span className="material-symbols-outlined text-green-500 text-xl shrink-0">check_circle</span>
              <span className="font-medium text-sm leading-relaxed">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RoadmapHero;
