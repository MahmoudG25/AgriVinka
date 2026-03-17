import React from 'react';

const statCards = [
  { key: 'enrolled', label: 'الكورسات المسجلة', icon: 'auto_stories', color: 'text-blue-500', bg: 'bg-blue-50' },
  { key: 'completed', label: 'الكورسات المكتملة', icon: 'verified', color: 'text-green-500', bg: 'bg-green-50' },
  { key: 'learningHours', label: 'ساعات التعلم', icon: 'schedule', color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'certificatesCount', label: 'الشهادات المكتسبة', icon: 'workspace_premium', color: 'text-purple-500', bg: 'bg-purple-50' },
];

const StatsRow = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse bg-white rounded-[2rem] h-32 border border-gray-100 shadow-sm" />
        ))}
      </div>
    );
  }

  const displayStats = {
    ...stats,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {statCards.map(card => (
        <div
          key={card.key}
          className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md"
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color} ${card.bg} shadow-sm mb-4`}>
            <span className="material-symbols-outlined text-2xl">{card.icon}</span>
          </div>
          <span className="text-xs text-gray-500 font-bold mb-2">{card.label}</span>
          <span className="block text-3xl font-black text-heading-dark">{displayStats[card.key] ?? 0}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsRow;
