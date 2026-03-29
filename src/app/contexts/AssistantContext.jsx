import React, { createContext, useContext, useCallback, useState } from 'react';

const AssistantContext = createContext(null);

export const AssistantProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const openAssistant = useCallback((sessionId = null) => {
    if (sessionId) setActiveSessionId(sessionId);
    setIsOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <AssistantContext.Provider value={{ isOpen, activeSessionId, setActiveSessionId, openAssistant, closeAssistant, toggleAssistant }}>
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
