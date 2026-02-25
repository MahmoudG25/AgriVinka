import React from 'react';

const SkillsTab = ({ data }) => {
  if (!data?.items) return null;

  return (
    <div className="animate-fade-in">
      <h3 className="text-2xl font-bold text-heading-dark mb-6">المهارات المكتسبة</h3>
      <div className="flex flex-wrap gap-3">
        {data.items.map((skill, idx) => (
          <span
            key={idx}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:border-primary/50 hover:text-primary transition-colors cursor-default"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillsTab;
