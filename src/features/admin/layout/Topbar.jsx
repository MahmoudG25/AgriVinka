import React from 'react';
import { MdMenuOpen, MdMenu, MdNotifications, MdPerson } from 'react-icons/md';
import clsx from 'clsx';
import { useAuth } from '../../../app/contexts/AuthContext';

const Topbar = ({ isSidebarCollapsed, onToggleCollapse }) => {
  const { userData } = useAuth();

  // Determine user role label
  const getRoleLabel = (role) => {
    switch(role) {
      case 'admin': return 'Super Admin';
      case 'editor': return 'Editor';
      case 'instructor': return 'Instructor';
      default: return 'User';
    }
  };

  const userRole = getRoleLabel(userData?.role);

  return (
    <header
      className={clsx(
        "h-16 bg-white/90 backdrop-blur-md border-b border-border-light flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 transition-all duration-300",
        isSidebarCollapsed ? "md:mr-[72px]" : "md:mr-64"
      )}
    >
      {/* Right Side (visually on the right in RTL) */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-heading-dark hidden md:block">لوحة التحكم</h2>
        {/* Sidebar toggle — desktop only */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-2 text-gray-500 hover:bg-gray-100 hover:text-heading-dark rounded-lg transition-colors"
          title={isSidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {isSidebarCollapsed ? <MdMenu size={24} /> : <MdMenuOpen size={24} />}
        </button>
      </div>

      {/* Left Side (visually on the left in RTL) */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-heading-dark rounded-full transition-colors flex items-center justify-center">
          <MdNotifications size={24} />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-heading-dark leading-tight group-hover:text-primary transition-colors">
              {userData?.displayName || 'Admin'}
            </p>
            <p className="text-[11px] font-medium text-gray-400 mt-0.5">{userRole}</p>
          </div>
          
          {userData?.photoURL ? (
            <img 
              src={userData.photoURL} 
              alt={userData.displayName || 'User Avatar'} 
              className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 shadow-sm">
              <MdPerson size={22} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
