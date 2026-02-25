import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../../../utils/imageUtils';

const CourseAccordion = ({ module, onToggle, isOpen: controlledOpen }) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Support both controlled and uncontrolled modes
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <div className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden mb-4 ${isOpen ? 'border-primary/20 shadow-md ring-1 ring-primary/5' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>

      {/* Header (Always Visible) */}
      <div
        onClick={handleToggle}
        className="p-4 md:p-5 flex items-center justify-between cursor-pointer group select-none"
      >
        <div className="flex items-center gap-5">
          {/* Thumbnail */}
          <div className="w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
            {module.image ? (
              <ImageWithFallback
                src={module.image}
                alt={module.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                fallbackSrc="https://placehold.co/100x100?text=No+Img"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
            )}
          </div>

          {/* Title & Meta */}
          <div>
            <h4 className="font-bold text-heading-dark text-base md:text-lg mb-1 group-hover:text-primary transition-colors">
              {module.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>الدورة رقم {module.order}</span>
              {module.duration && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{module.duration}</span>
                </>
              )}
              {module.lessonsCount > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{module.lessonsCount} درس</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 transition-all duration-300 ${isOpen ? 'rotate-180 bg-primary/10 text-primary' : 'group-hover:bg-gray-100'}`}>
          <span className="material-symbols-outlined">expand_more</span>
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isOpen ? 'max-h-[600px]' : 'max-h-0'}`}>
        <div className="p-6 md:p-8 pt-0 border-t border-gray-50 bg-[#fbfbfb]">

          <div className="grid grid-cols-1 gap-6 mt-6">

            {/* Section 1: What you will learn */}
            {module.outcomes && module.outcomes.length > 0 && (
              <div>
                <h5 className="font-bold text-heading-dark text-sm mb-4">ما ستتعلمه</h5>
                <div className="space-y-2">
                  {module.outcomes.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="material-symbols-outlined text-heading-dark text-sm mt-0.5 shrink-0">check</span>
                      <span className="text-gray-600 font-medium text-xs leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Skills */}
            {module.skills && module.skills.length > 0 && (
              <div>
                <h5 className="font-bold text-heading-dark text-sm mb-4">المهارات التي ستكتسبها</h5>
                <div className="flex flex-wrap gap-2">
                  {module.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-xs font-bold hover:border-primary/30 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Sections count */}
            {module.sectionsCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <span className="material-symbols-outlined text-sm text-amber-500">folder</span>
                <span>{module.sectionsCount} أقسام</span>
                {module.lessonsCount > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{module.lessonsCount} درس</span>
                  </>
                )}
              </div>
            )}

            {/* CTA: View Course Details */}
            <Link
              to={`/courses/${module.id}`}
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-primary/10 text-primary font-bold text-sm rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
            >
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
              عرض تفاصيل الدورة
            </Link>

          </div>

        </div>
      </div>

    </div>
  );
};

export default CourseAccordion;
