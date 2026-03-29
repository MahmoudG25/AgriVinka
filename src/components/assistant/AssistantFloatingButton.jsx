import React from 'react';
import { FaRobot } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useAssistant } from '../../app/contexts/AssistantContext';

const AssistantFloatingButton = () => {
  const { openAssistant } = useAssistant();
  const location = useLocation();

  // Paths where the floating chat icon should be hidden
  const hideButton = ['/login', '/register', '/ai/assistant', '/analyzer'].some(path => location.pathname.startsWith(path));

  if (hideButton) {
    return null;
  }

  return (
    <button
      onClick={() => openAssistant()}
      className="fixed z-[9998] bottom-5 right-5 h-14 w-14 md:h-16 md:w-16 bg-gradient-to-br from-primary to-accent text-white rounded-full shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center ring-2 ring-white hover:scale-105 duration-300"
      aria-label="فتح المساعد الذكي"
      title="المساعد الذكي"
    >
      <FaRobot className="text-lg md:text-xl" />
    </button>
  );
};

export default AssistantFloatingButton;
