import React from 'react';
import { MdMenu, MdNotifications, MdPerson } from 'react-icons/md';

const Topbar = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 lg:mr-64 sticky top-0 z-10 transition-all">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full md:hidden"
        >
          <MdMenu size={24} />
        </button>
        <h2 className="text-lg font-bold text-heading-dark hidden md:block">لوحة التحكم</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <MdNotifications size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-heading-dark">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
            <MdPerson size={24} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
