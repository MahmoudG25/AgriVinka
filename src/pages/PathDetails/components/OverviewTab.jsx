import React from 'react';

const OverviewTab = ({ data }) => {
  if (!data) return null;
  const { outcomes } = data;

  return (
    <div className="space-y-12 animate-fade-in p-1">

      {/* What you will learn (Reference Box Style) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <h3 className="text-lg font-extrabold text-heading-dark mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-2xl">lightbulb</span>
          ماذا ستتعلم في هذا المسار؟
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {outcomes.map((item, idx) => (
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
      </div>

    </div>
  );
};

export default OverviewTab;
