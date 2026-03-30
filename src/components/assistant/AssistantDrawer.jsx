import React from 'react';
import { useAssistant } from '../../app/contexts/AssistantContext';
import AIAssistantPanel from './AIAssistantPanel';

const AssistantDrawer = () => {
  const { isOpen, closeAssistant } = useAssistant();

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay (Hidden on Desktop) */}
      <div 
        onClick={closeAssistant} 
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm md:hidden" 
        aria-hidden="true"
      />
      
      {/* Chat Window Container */}
      <div 
        className="fixed z-[9999] flex flex-col bg-white shadow-2xl border-gray-200 overflow-hidden transition-all duration-300
          w-full h-full inset-0 transform translate-x-0
          md:w-[400px] md:h-[650px] md:bottom-8 md:right-5 md:top-auto md:left-auto md:rounded-[2rem] md:border"
        role="dialog"
        aria-modal="true"
      >
        {/* Chat Header */}
        <div className="flex-shrink-0 h-[64px] bg-white border-b border-gray-100 flex items-center justify-between px-5 z-20 shadow-sm relative">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
             </div>
             <span className="font-bold text-gray-800 text-lg">المساعد الذكي</span>
          </div>
          <button onClick={closeAssistant} className="h-9 w-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors" title="إغلاق">
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        {/* Chat Panel */}
        <div className="flex-1 min-h-0 relative bg-slate-50">
          <AIAssistantPanel onClose={closeAssistant} />
        </div>
      </div>
    </>
  );
};

export default AssistantDrawer;
