import React from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useAssistant } from '../../app/contexts/AssistantContext';

const AssistantFloatingButton = () => {
  const { isOpen, openAssistant, closeAssistant } = useAssistant();
  const location = useLocation();

  // Paths where the floating chat icon should be hidden
  const hideButton = ['/login', '/register', '/ai/assistant', '/analyzer'].some(path => location.pathname.startsWith(path));

  if (hideButton) {
    return null;
  }

  return (
    <button
      onClick={() => isOpen ? closeAssistant() : openAssistant()}
      className="fixed z-[10000] bottom-5 right-5 h-14 w-14 md:h-16 md:w-16 bg-gradient-to-br from-primary to-accent text-white rounded-full shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center ring-2 ring-white hover:scale-105 duration-300"
      aria-label={isOpen ? "إغلاق المساعد الذكي" : "فتح المساعد الذكي"}
      title="المساعد الذكي"
    >
      {isOpen ? (
        <FaTimes className="text-xl md:text-2xl" />
      ) : (
        <FaRobot className="text-lg md:text-xl" />
      )}
    </button>
  );
};

export default AssistantFloatingButton;
