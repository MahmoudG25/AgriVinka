import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdClass,
  MdShoppingCart,
  MdPeople,
  MdApps,
  MdClose,
  MdMap,
  MdAssignment,
  MdLibraryBooks,
  MdWork,
  MdSettings,
  MdCampaign,
  MdHome,
  MdDashboardCustomize,
  MdPalette,
  MdInfo,
  MdLogout
} from 'react-icons/md';
import clsx from 'clsx';
import { signOut } from 'firebase/auth';
import { auth } from '../../../services/firebase';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../app/store/slices/uiSlice';

const PRIMARY_TABS = [
  { label: 'الرئيسية', path: '/features/admin', icon: MdDashboard, end: true },
  { label: 'الدورات', path: '/features/admin/courses', icon: MdClass },
  { label: 'الطلبات', path: '/features/admin/orders', icon: MdShoppingCart },
  { label: 'المستخدمين', path: '/features/admin/users', icon: MdPeople },
];

const MORE_LINKS = [
  { label: 'تحرير الرئيسية', path: '/features/admin/home', icon: MdHome },
  { label: 'منشئ الصفحات', path: '/features/admin/builder', icon: MdDashboardCustomize },
  { label: 'تخصيص الهوية', path: '/features/admin/theme', icon: MdPalette },
  { label: 'تحرير من نحن', path: '/features/admin/about', icon: MdInfo },
  { label: 'المسارات', path: '/features/admin/roadmaps', icon: MdMap },
  { label: 'التدريب العملي', path: '/features/admin/trainings', icon: MdAssignment },
  { label: 'الكورسات المطلوبة', path: '/features/admin/course-requests', icon: MdLibraryBooks },
  { label: 'الشهادات', path: '/features/admin/certificates', icon: MdWork },
  { label: 'إعدادات الشهادات', path: '/features/admin/certificate-settings', icon: MdSettings },
  { label: 'شريط العروض', path: '/features/admin/top-offer-bar', icon: MdCampaign },
];

const MobileBottomNav = () => {
  const [showMore, setShowMore] = useState(false);
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
      {/* More Sheet Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Sheet */}
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-50 md:hidden bg-white rounded-t-2xl shadow-xl transition-transform duration-300 ease-out",
          showMore ? "translate-y-0" : "translate-y-full"
        )}
        style={{ maxHeight: '70vh' }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border-light">
          <h3 className="text-sm font-bold text-heading-dark">المزيد</h3>
          <button
            onClick={() => setShowMore(false)}
            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
          >
            <MdClose size={20} />
          </button>
        </div>
        <nav className="overflow-y-auto p-3 pb-safe" style={{ maxHeight: 'calc(70vh - 56px)' }}>
          <div className="grid grid-cols-3 gap-2">
            {MORE_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setShowMore(false)}
                className={({ isActive }) => clsx(
                  "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-center transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <link.icon size={22} />
                <span className="text-[11px] font-medium leading-tight">{link.label}</span>
              </NavLink>
            ))}
          </div>
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full mt-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium border-t border-border-light"
          >
            <MdLogout size={20} />
            <span>تسجيل خروج</span>
          </button>
        </nav>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 md:hidden bg-white border-t border-border-light pb-safe">
        <div className="flex items-center justify-around h-16">
          {PRIMARY_TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) => clsx(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-gray-400"
              )}
            >
              {({ isActive }) => (
                <>
                  <tab.icon size={22} />
                  <span className={clsx(
                    "text-[10px] font-medium",
                    isActive && "font-bold"
                  )}>{tab.label}</span>
                  {isActive && (
                    <span className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
          {/* More Button */}
          <button
            onClick={() => setShowMore(true)}
            className={clsx(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
              showMore ? "text-primary" : "text-gray-400"
            )}
          >
            <MdApps size={22} />
            <span className="text-[10px] font-medium">المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
