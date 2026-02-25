import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const OutcomesSection = ({ outcomes }) => {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE = 3;
  const hasMore = outcomes.length > VISIBLE;
  const visible = expanded ? outcomes : outcomes.slice(0, VISIBLE);

  return (
    <div className="mb-8">
      <h3 className="font-bold text-gray-900 mb-4 text-sm">ماذا ستحقق بعد هذا المسار؟</h3>
      <ul className="space-y-3">
        {visible.map((outcome, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
            <span className="material-symbols-outlined text-green-500 text-lg shrink-0">check_circle</span>
            <span className="leading-snug">{outcome}</span>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-sm font-bold text-primary hover:text-heading-dark transition-colors"
        >
          <span className="material-symbols-outlined text-lg">{expanded ? 'expand_less' : 'expand_more'}</span>
          {expanded ? 'عرض أقل' : `عرض الكل (${outcomes.length})`}
        </button>
      )}
    </div>
  );
};

const PathOverview = ({ roadmap }) => {
  // Aggregate outcomes from first 2 modules if not present on roadmap
  const outcomes = roadmap.outcomes ||
    roadmap.modules?.slice(0, 2).flatMap(m => m.outcomes?.slice(0, 2)) || [];

  // Mock data for visual completeness if missing
  const rating = roadmap.rating || 4.9;
  const students = roadmap.students || 2340;
  const partnerLogos = [
    { name: 'Google', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
    { name: 'Harvard', url: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Harvard_University_shield.png' },
    { name: 'Coursera', url: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg' },
    { name: 'Meta', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' }
  ];

  return (
    <div className="h-fit sticky top-32">

      {/* Roadmap Image (New) */}
      {roadmap.image && (
        <div className="mb-6 rounded-xl overflow-hidden shadow-sm aspect-video">
          <img src={roadmap.image} alt={roadmap.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
      )}

      {/* Header Info */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
            {roadmap.level || 'مناسب للمبتدئين'}
          </span>
          {roadmap.tag && (
            <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100">
              {roadmap.tag}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
          {roadmap.title}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center text-amber-400">
            <span className="material-symbols-outlined text-lg filled">star</span>
            <span className="font-bold mr-1 text-gray-900">{rating}</span>
          </div>
          <span className="text-gray-400">({students.toLocaleString()} تقييم)</span>
          <span className="text-gray-300">|</span>
          <span>{roadmap.units_count} دورات</span>
        </div>
      </div>

      {/* Instructor */}
      {roadmap.instructor && (
        <div className="flex items-center gap-3 mb-8 p-3 rounded-xl hover:bg-gray-50 transition-colors">
          <img
            src={roadmap.instructor.image || `https://ui-avatars.com/api/?name=${roadmap.instructor.name}&background=random`}
            alt={roadmap.instructor.name}
            className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
          />
          <div>
            <p className="text-sm font-bold text-gray-900">{roadmap.instructor.name}</p>
            <p className="text-xs text-gray-500">{roadmap.instructor.role}</p>
          </div>
        </div>
      )}

      {/* Partners/Credibility */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wider">
          المشاريع داخل المسار
        </p>
        <div className="flex gap-4">
          {partnerLogos.map((logo, idx) => (
            <img key={idx} src={logo.url} alt={logo.name} className="h-5 object-contain" />
          ))}
        </div>
      </div>

      {/* Outcomes */}
      <OutcomesSection outcomes={outcomes} />

      {/* Actions */}
      <div className="space-y-3">
        <Link
          to={`/roadmaps/${roadmap.id}`}
          className="block w-full bg-gradient-to-r from-heading-dark to-[#7A5520] text-white text-center py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-heading-dark/10 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          شاهد تفاصيل المسار
        </Link>
      </div>
    </div>
  );
};

export default PathOverview;
