import React from 'react';
import { MdMenuOpen, MdMenu, MdNotifications, MdPerson } from 'react-icons/md';
import clsx from 'clsx';

const Topbar = ({ isSidebarCollapsed, onToggleCollapse }) => {
  return (
    <header
      className={clsx(
        "h-16 bg-white/80 backdrop-blur-md border-b border-border-light flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 transition-all duration-300",
        isSidebarCollapsed ? "md:mr-[72px]" : "md:mr-64"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Sidebar toggle — desktop only */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-2 text-gray-400 hover:bg-gray-100 hover:text-heading-dark rounded-lg transition-colors"
          title={isSidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {isSidebarCollapsed ? <MdMenu size={22} /> : <MdMenuOpen size={22} />}
        </button>
        <h2 className="text-base font-bold text-heading-dark hidden md:block">لوحة التحكم</h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-heading-dark rounded-lg transition-colors">
          <MdNotifications size={22} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2.5 mr-1 pr-3 border-r border-gray-200">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-heading-dark leading-tight">Admin</p>
            <p className="text-[11px] text-gray-400">Super Admin</p>
          </div>
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <MdPerson size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
