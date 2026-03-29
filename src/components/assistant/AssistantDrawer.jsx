import React from 'react';
import { useAssistant } from '../../app/contexts/AssistantContext';
import AIAssistantPanel from './AIAssistantPanel';

const AssistantDrawer = () => {
  const { isOpen, closeAssistant } = useAssistant();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto" aria-modal="true" role="dialog">
      <div onClick={closeAssistant} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="absolute right-0 top-0 h-full w-full md:w-[420px] bg-white shadow-2xl border-l border-gray-200 flex flex-col">
        <AIAssistantPanel onClose={closeAssistant} />
      </div>
    </div>
  );
};

export default AssistantDrawer;
