import React from 'react';
import { Link } from 'react-router-dom';

const ContentTab = ({ data }) => {
  if (!data?.modules) return null;

  return (
    <div className="animate-fade-in p-1">

      <h3 className="text-2xl font-extrabold text-heading-dark mb-8 border-r-4 border-amber-500 pr-4">
        خريطة المسار
      </h3>

      <div className="space-y-8">
        {/* Phase 1 Header (Simulated based on reference) */}
        <div className="flex items-baseline justify-between mb-4">
          <h4 className="text-lg font-bold text-amber-500">المرحلة الأولى: التأسيس القوي</h4>
          <span className="text-xs text-gray-400 font-medium">مدة المرحلة: 4 أسابيع</span>
        </div>

        {data.modules.map((module, index) => (
          <div key={module.id} className={`
             relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden group
             ${module.isLocked
              ? 'border-gray-100 opacity-90'
              : 'border-white shadow-md hover:shadow-lg hover:-translate-y-1 border-r-4 border-r-green-500'}
          `}>

            {/* Progress Bar (Visual only for now) */}
            {!module.isLocked && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-100">
                <div className="h-full bg-amber-400 w-[45%] rounded-r-full"></div>
              </div>
            )}

            <div className="p-6 md:p-7 flex items-center justify-between gap-6">

              {/* Right: Content */}
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  {module.isLocked ? (
                    <span className="bg-gray-100 text-gray-400 p-2 rounded-full">
                      <span className="material-symbols-outlined text-lg">lock</span>
                    </span>
                  ) : (
                    <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-green-100">
                      مجاني
                    </span>
                  )}

                  <h4 className={`text-lg font-bold ${module.isLocked ? 'text-gray-500' : 'text-heading-dark'}`}>
                    {module.title}
                  </h4>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed ">
                  {module.description}
                </p>

                {!module.isLocked && (
                  <div className="mt-4 text-[10px] text-amber-500 font-bold">
                    45% مكتمل
                  </div>
                )}
              </div>

              {/* Left: Action Icon */}
              <div className="shrink-0 hidden sm:flex">
                {module.isLocked ? (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </div>
                ) : (
                  <Link to={`/courses/${module.courseId}`} className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors cursor-pointer shadow-sm">
                    <span className="material-symbols-outlined text-xl rtl:rotate-180">play_arrow</span>
                  </Link>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Phase 2 Mock (Visual spacer) */}
      <div className="mt-12 flex items-baseline justify-between mb-4 pt-8 border-t border-gray-100 border-dashed">
        <h4 className="text-lg font-bold text-gray-800">المرحلة الثانية: البرمجة التفاعلية</h4>
        <span className="text-xs text-gray-400 font-medium">مدة المرحلة: 6 أسابيع</span>
      </div>

    </div>
  );
};

export default ContentTab;
