import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdClass,
  MdMap,
  MdSettings,
  MdLogout,
  MdPeople,
  MdLibraryBooks,
  MdInfo,
  MdDashboardCustomize,
  MdPalette,
  MdAssignment,
  MdCampaign,
  MdShoppingCart,
  MdWork,
  MdChevronRight,
  MdChevronLeft,
  MdHome,
  MdSmartToy
} from 'react-icons/md';
import clsx from 'clsx';
import { signOut } from 'firebase/auth';
import { auth } from '../../../services/firebase';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../app/store/slices/uiSlice';
import { useAuth } from '../../../app/contexts/AuthContext';

const NAV_SECTIONS = [
  {
    label: 'الرئيسية',
    items: [
      { label: 'لوحة المعلومات', path: '/features/admin', icon: MdDashboard, end: true },
      { label: 'تحرير الرئيسية', path: '/features/admin/home', icon: MdHome },
      { label: 'منشئ الصفحات', path: '/features/admin/builder', icon: MdDashboardCustomize, roles: ['admin'] },
      { label: 'تخصيص الهوية', path: '/features/admin/theme', icon: MdPalette, roles: ['admin'] },
      { label: 'تحرير من نحن', path: '/features/admin/about', icon: MdInfo },
    ],
  },
  {
    label: 'المحتوى',
    items: [
      { label: 'الدورات', path: '/features/admin/courses', icon: MdClass },
      { label: 'المسارات', path: '/features/admin/roadmaps', icon: MdMap },
      { label: 'التدريب العملي', path: '/features/admin/trainings', icon: MdAssignment },
    ],
  },
  {
    label: 'الإدارة',
    items: [
      { label: 'الطلبات', path: '/features/admin/orders', icon: MdShoppingCart, roles: ['admin'] },
      { label: 'الكورسات المطلوبة', path: '/features/admin/course-requests', icon: MdLibraryBooks },
      { label: 'المستخدمين', path: '/features/admin/users', icon: MdPeople, roles: ['admin'] },
      { label: 'الشهادات', path: '/features/admin/certificates', icon: MdWork, roles: ['admin'] },
    ],
  },
  {
    label: 'الإعدادات',
    items: [
      { label: 'شريط العروض', path: '/features/admin/top-offer-bar', icon: MdCampaign },
      { label: 'إعدادات الشهادات', path: '/features/admin/certificate-settings', icon: MdSettings, roles: ['admin'] },
      { label: 'المساعد الذكي', path: '/features/admin/ai-assistant', icon: MdSmartToy, roles: ['admin'] },
    ],
  },
];

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const dispatch = useDispatch();
  const { userData } = useAuth(); // Retrieve active user role

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(addToast({ type: 'success', message: 'تم تسجيل الخروج' }));
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userRole = userData?.role || 'student';

  return (
    <aside
      className={clsx(
        "fixed top-0 right-0 h-full bg-white border-l border-border-light z-30 transition-all duration-300 ease-in-out hidden md:flex flex-col",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className={clsx(
        "h-16 flex items-center border-b border-border-light shrink-0",
        isCollapsed ? "justify-center px-2" : "px-5"
      )}>
        {isCollapsed ? (
          <span className="text-lg font-bold text-primary">A</span>
        ) : (
          <h1 className="text-lg font-bold text-heading-dark">
            AgriVinka <span className="text-primary text-xs font-medium">Admin</span>
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-thumb-gray-200">
        {NAV_SECTIONS.map((section) => {
          // Filter items based on user role
          const visibleItems = section.items.filter(
            (item) => !item.roles || item.roles.includes(userRole)
          );

          if (visibleItems.length === 0) return null; // Hide section entirely if empty

          return (
            <div key={section.label} className="mb-1">
              {/* Section Header — only visible when expanded */}
              {!isCollapsed && (
                <p className="px-5 pt-4 pb-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {section.label}
                </p>
              )}
              {isCollapsed && <div className="my-2 mx-3 border-t border-border-light" />}

              {visibleItems.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  title={isCollapsed ? link.label : undefined}
                  className={({ isActive }) => clsx(
                    "flex items-center gap-3 mx-2 rounded-lg transition-all duration-150 font-medium text-sm group relative",
                    isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-500 hover:bg-gray-50 hover:text-heading-dark"
                  )}
                >
                  <link.icon size={20} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">{link.label}</span>}

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <span className="absolute right-full mr-2 px-2.5 py-1 bg-heading-dark text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                      {link.label}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer: Collapse toggle + Logout */}
      <div className="border-t border-border-light shrink-0">
        {/* Logout */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'تسجيل خروج' : undefined}
          className={clsx(
            "flex items-center gap-3 w-full text-red-500 hover:bg-red-50 transition-colors text-sm font-medium",
            isCollapsed ? "justify-center px-0 py-3" : "px-5 py-3"
          )}
        >
          <MdLogout size={20} />
          {!isCollapsed && <span>تسجيل خروج</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className={clsx(
            "flex items-center gap-2 w-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors text-xs border-t border-border-light",
            isCollapsed ? "justify-center px-0 py-3" : "px-5 py-2.5"
          )}
        >
          {isCollapsed ? <MdChevronLeft size={20} /> : <MdChevronRight size={20} />}
          {!isCollapsed && <span>طي القائمة</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
