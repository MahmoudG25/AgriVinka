import React, { useState } from 'react';
import CourseAccordion from './CourseAccordion';
import { FaPlayCircle, FaCheckCircle, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const VISIBLE_COUNT = 4;

const PathContent = ({ data, userProgressMap = {} }) => {
  if (!data) return null;
  const { overview, skills, modules } = data;
  const [outcomesExpanded, setOutcomesExpanded] = useState(false);

  const hasOutcomes = overview?.outcomes?.length > 0;
  const hasSkills = skills?.items?.length > 0;
  const hasHiddenOutcomes = overview?.outcomes?.length > VISIBLE_COUNT;

  const visibleOutcomes = hasHiddenOutcomes && !outcomesExpanded
    ? overview.outcomes.slice(0, VISIBLE_COUNT)
    : overview?.outcomes || [];

  const hiddenOutcomes = hasHiddenOutcomes
    ? overview.outcomes.slice(VISIBLE_COUNT)
    : [];

  return (
    <div className="space-y-12">

      {/* 1. What you will learn (Roadmap Level) */}
      {hasOutcomes && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h3 className="text-lg font-extrabold text-heading-dark mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-500 text-2xl">lightbulb</span>
            ماذا ستتعلم في هذا المسار؟
          </h3>

          {/* Always-visible items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {visibleOutcomes.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-green-100 transition-colors">
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                </div>
                <span className="text-gray-600 font-medium text-xs leading-relaxed group-hover:text-gray-900 transition-colors">
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Collapsible extra items */}
          {hasHiddenOutcomes && (
            <>
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 overflow-hidden transition-all duration-500 ease-in-out ${outcomesExpanded ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                  }`}
              >
                {hiddenOutcomes.map((item, idx) => (
                  <div key={idx + VISIBLE_COUNT} className="flex gap-3 items-start group">
                    <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-green-100 transition-colors">
                      <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    </div>
                    <span className="text-gray-600 font-medium text-xs leading-relaxed group-hover:text-gray-900 transition-colors">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setOutcomesExpanded(!outcomesExpanded)}
                className="mt-5 flex items-center gap-1 text-primary font-bold text-sm hover:underline transition-colors group"
              >
                <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${outcomesExpanded ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
                {outcomesExpanded
                  ? 'عرض أقل'
                  : `عرض المزيد (${hiddenOutcomes.length}+)`
                }
              </button>
            </>
          )}
        </div>
      )}

      {/* 2. Skills (Roadmap Level) — ONLY if skills exist */}
      {hasSkills && (
        <div>
          <h3 className="text-xl font-bold text-heading-dark mb-6">المهارات المكتسبة</h3>
          <div className="flex flex-wrap gap-2">
            {skills.items.map((skill, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-white hover:border-primary/50 hover:text-primary transition-all cursor-default shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. Courses Visual Timeline (Stepper) */}
      {modules && modules.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-heading-dark mb-8">خط سير المسار التعليمي</h3>

          <div className="relative border-r-2 border-gray-100 pr-8 space-y-12">
            {modules.map((module, idx) => {
              const progress = userProgressMap[module.courseId] || 0;
              const isCompleted = progress === 100;
              const inProgress = progress > 0 && progress < 100;
              const isLocked = idx > 0 && !isCompleted && !inProgress && (userProgressMap[modules[idx - 1]?.courseId] || 0) < 100;

              return (
                <div key={module.id} className="relative group">
                  {/* Timeline Node */}
                  <div className={`absolute -right-[43px] w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-300 z-10 ${isCompleted ? 'bg-green-500 text-white' :
                      inProgress ? 'bg-primary text-white animate-pulse' :
                        isLocked ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-500 hover:bg-primary/20'
                    }`}>
                    {isCompleted ? <span className="material-symbols-outlined text-[16px] font-bold">check</span> :
                      isLocked ? <FaLock className="text-[12px]" /> :
                        <span className="font-bold text-xs">{idx + 1}</span>}
                  </div>

                  {/* Course Content Card */}
                  <div className={`bg-gray-50 rounded-2xl p-6 border transition-all duration-300 ${inProgress ? 'border-primary/30 shadow-md shadow-primary/5' :
                      'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                    } ${isLocked ? 'opacity-75 grayscale-[50%]' : ''}`}>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {/* Course Image */}
                      <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0 relative bg-gray-200">
                        {module.image ? (
                          <img src={module.image} alt={module.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">بدون صورة</div>
                        )}
                        {/* Progress Overlay */}
                        {progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-900/50">
                            <div className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${progress}%` }}></div>
                          </div>
                        )}
                      </div>

                      {/* Course Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-bold text-heading-dark leading-tight">{module.title}</h4>
                          {progress > 0 && (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                              % {progress}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                          {module.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">menu_book</span> {module.lessons_count || 0} درس</span>
                          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">trending_up</span> {module.level || 'مبتدئ'}</span>
                        </div>

                        {/* Action Area */}
                        {!isLocked && (
                          <div className="pt-3">
                            <Link
                              to={`/courses/${module.courseId}`}
                              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors ${inProgress ? 'bg-primary text-heading-dark hover:bg-primary-hover shadow-sm' :
                                  isCompleted ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                                    'bg-gray-200 text-heading-dark hover:bg-gray-300'
                                }`}
                            >
                              <FaPlayCircle />
                              {inProgress ? 'متابعة التعلم' : isCompleted ? 'مراجعة الدورة' : 'عرض الدورة'}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default PathContent;
