import React from 'react';
import PricingWidget from './PricingWidget';
import InstructorWidget from './InstructorWidget';
import DeliveryWidget from './DeliveryWidget';

const Sidebar = ({ data, roadmapId, isEnrolled, orderStatus, nextCourseId }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">

      {/* 1. Pricing Card */}
      <PricingWidget
        data={data.pricing}
        roadmapId={roadmapId}
        isEnrolled={isEnrolled}
        orderStatus={orderStatus}
        nextCourseId={nextCourseId}
      />

      {/* 2. Instructor Card */}
      <InstructorWidget data={data.instructor} />

      {/* 3. Delivery Method */}
      <DeliveryWidget data={data.delivery} />

    </div>
  );
};

export default Sidebar;
