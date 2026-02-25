import React from 'react';
import PathOverview from './PathOverview';
import PathTimeline from './PathTimeline';

const PathCard = ({ roadmap }) => {
  return (
    <div className="relative mb-20 bg-white border-2 border-primary/20 rounded-[1rem] p-6 lg:p-10 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Right Column - Overview (Sticky) */}
        <div className="lg:col-span-4 order-1 lg:order-1">
          <PathOverview roadmap={roadmap} />
        </div>

        {/* Left Column - Timeline */}
        <div className="lg:col-span-8 order-2 lg:order-2">
          <PathTimeline modules={roadmap.modules} />
        </div>
      </div>
    </div>
  );
};

export default PathCard;
