import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useDispatch } from 'react-redux';
import ToastContainer from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  return (
    <div className="min-h-screen bg-background-alt font-display text-right" dir="rtl">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="p-4 md:p-8 lg:mr-64 min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>

      <ToastContainer />
      <ConfirmModal />
    </div>
  );
};

export default AdminLayout;
