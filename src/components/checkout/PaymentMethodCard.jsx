import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentMethodCard = ({ method, isSelected, onSelect }) => {
  const { id, icon: Icon, title, description, disabled } = method;

  return (
    <div
      onClick={() => !disabled && onSelect(id)}
      className={`
        relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : ''}
        ${isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border-light bg-surface-white hover:border-primary/30 hover:shadow-sm'}
      `}
    >
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ml-4
        ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}
      `}>
        <Icon />
      </div>

      <div className="flex-grow">
        <h3 className={`font-bold text-lg ${isSelected ? 'text-primary' : 'text-body-text'}`}>
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-4 left-4 text-primary text-xl">
          <FaCheckCircle />
        </div>
      )}

      {/* Radio indicator for unselected state to make it look like a choice */}
      {!isSelected && !disabled && (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300 ml-2"></div>
      )}
    </div>
  );
};

export default PaymentMethodCard;
