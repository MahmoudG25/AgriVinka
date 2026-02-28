import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdClass,
  MdMap,
  MdImage,
  MdSettings,
  MdLogout,
  MdPeople,
  MdLibraryBooks,
  MdInfo,
  MdDashboardCustomize,
  MdPalette,
  MdWork,
  MdAssignment
} from 'react-icons/md';
import clsx from 'clsx';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';

const Sidebar = ({ isOpen, onClose }) => {
  const links = [
    { label: 'الرئيسية', path: '/admin', icon: MdDashboard, end: true },
    { label: 'تحرير الرئيسية', path: '/admin/home', icon: MdSettings },
    { label: 'منشئ الصفحات', path: '/admin/builder', icon: MdDashboardCustomize }, // New Link
    { label: 'تخصيص الهوية', path: '/admin/theme', icon: MdPalette }, // New Link
    { label: 'تحرير من نحن', path: '/admin/about', icon: MdInfo },
    { label: 'الدورات', path: '/admin/courses', icon: MdClass },
    { label: 'المسارات', path: '/admin/roadmaps', icon: MdMap },
    { label: 'الطلبات', path: '/admin/orders', icon: MdPeople },
    { label: 'الكورسات المطلوبة', path: '/admin/course-requests', icon: MdLibraryBooks },
    { label: 'التدريب العملي', path: '/admin/trainings', icon: MdAssignment },
    { label: 'المستخدمين', path: '/admin/users', icon: MdPeople },
  ];

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(addToast({ type: 'success', message: 'تم تسجيل الخروج' }));
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside
        className={clsx(
          "fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-30 transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full" // RTL: translate-x-full hides it to the right
        )}
      >
        <div className="h-16 flex items-center justify-center border-b border-border-light">
          <h1 className="text-xl font-bold text-heading-dark">أكاديمية نماء <span className="text-primary text-xs">Admin</span></h1>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-gray-200">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              onClick={() => window.innerWidth < 768 && onClose()}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-heading-dark"
              )}
            >
              <link.icon size={22} className="shrink-0" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <MdLogout size={22} />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
