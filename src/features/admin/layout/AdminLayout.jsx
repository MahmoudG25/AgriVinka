import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';
import ToastContainer from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const SIDEBAR_KEY = 'admin_sidebar_collapsed';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next));
      } catch { }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background-alt font-display text-right" dir="rtl">
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Topbar */}
      <Topbar
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content */}
      <main
        className={`
          pt-16 pb-20 md:pb-8 px-4 md:px-6 lg:px-8
          min-h-screen transition-all duration-300
          ${isSidebarCollapsed ? 'md:mr-[72px]' : 'md:mr-64'}
        `}
      >
        <div className="py-6 max-w-[1400px]">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* Overlays */}
      <ToastContainer />
      <ConfirmModal />
    </div>
  );
};

export default AdminLayout;
