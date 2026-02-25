import React from 'react';
import { FaCheck } from 'react-icons/fa6';

const CheckoutSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'السلة' }, // Cart
    { id: 2, label: 'الدفع' }, // Payment
    { id: 3, label: 'التأكيد' }, // Confirmation
  ];

  return (
    <div className="w-full mx-auto mb-12">
      <div className="relative flex items-center justify-between">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full" />

        {/* Active Line Progress - Calculated based on current step */}
        <div
          className="absolute top-1/2 right-0 h-1 bg-green-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
                  ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                      ? 'bg-primary border-primary text-white shadow-lg scale-110'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
              >
                {isCompleted ? <FaCheck /> : step.id}
              </div>
              <span
                className={`absolute top-12 text-sm font-medium whitespace-nowrap transition-colors duration-300
                  ${isActive || isCompleted ? 'text-heading-dark' : 'text-gray-400'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutSteps;
