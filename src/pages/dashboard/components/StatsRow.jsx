import React from 'react';

const statCards = [
  { key: 'enrolled', label: 'دورة مسجلة', icon: 'school', color: 'text-primary', bg: 'bg-primary/5 border-primary/10' },
  { key: 'inProgress', label: 'قيد التعلم', icon: 'play_circle', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  { key: 'completed', label: 'مكتملة', icon: 'verified', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
  { key: 'favorites', label: 'مفضلة', icon: 'favorite', color: 'text-red-400', bg: 'bg-red-50 border-red-100' },
];

const StatsRow = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-24 border border-gray-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map(card => (
        <div
          key={card.key}
          className={`rounded-2xl border p-5 flex items-center gap-4 ${card.bg} transition-shadow hover:shadow-md`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.color} bg-white shadow-sm shrink-0`}>
            <span className="material-symbols-outlined text-xl">{card.icon}</span>
          </div>
          <div>
            <span className={`block text-2xl font-black ${card.color}`}>{stats[card.key] ?? 0}</span>
            <span className="text-xs text-gray-500 font-bold">{card.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsRow;
