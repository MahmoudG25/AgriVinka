import React, { useState } from 'react';
import OverviewTab from './OverviewTab';
import ContentTab from './ContentTab';
import SkillsTab from './SkillsTab';

const TabsSection = ({ data }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'content', label: 'المحتوى الدراسي' },
    { id: 'skills', label: 'المهارات' },
  ];

  return (
    <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-sm border border-gray-200 min-h-[500px]">

      {/* Header / Nav */}
      <div className="border-b border-gray-200 px-6 md:px-8">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-5 font-bold text-sm md:text-base border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-heading-dark text-heading-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-800'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 md:p-8">
        {activeTab === 'overview' && <OverviewTab data={data.overview} />}
        {activeTab === 'content' && <ContentTab data={data.content} />}
        {activeTab === 'skills' && <SkillsTab data={data.skills} />}
      </div>

    </div>
  );
};

export default TabsSection;
