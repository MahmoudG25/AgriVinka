import React from 'react';

const RecentActivity = ({ activities = [] }) => {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col h-[400px]">
      <h2 className="text-base font-black text-heading-dark mb-6 text-center shrink-0">
        النشاط الأخير
      </h2>

      {activities.length === 0 ? (
        <div className="text-center py-6 flex-1 flex items-center justify-center">
          <p className="text-xs text-gray-500 font-medium">لا توجد أنشطة حديثة لعرضها.</p>
        </div>
      ) : (
        <div className="space-y-6 overflow-y-auto flex-1 pl-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 group cursor-pointer text-right justify-end">
              <div className="flex-1 min-w-0 flex flex-col items-end">
                <h3 className="text-sm font-bold text-heading-dark group-hover:text-primary transition-colors">
                  {activity.title}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1 truncate max-w-full text-right" dir="auto">
                  {activity.subtitle}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg} ${activity.color}`}>
                <span className="material-symbols-outlined text-lg">{activity.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
