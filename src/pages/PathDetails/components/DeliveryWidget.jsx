import React from 'react';

const DeliveryWidget = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-[#f0f6ff] border border-blue-100 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-500 text-white rounded-full p-1 mt-1 shrink-0">
          <span className="material-symbols-outlined text-base">info</span>
        </div>
        <div>
          <h4 className="font-bold text-blue-900 text-sm mb-2">{data.type}</h4>
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            {data.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryWidget;
