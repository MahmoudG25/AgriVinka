import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { name: 'الرئيسية', icon: 'home', to: '/' },
    { name: 'الكورسات', icon: 'menu_book', to: '/courses' },
    { name: 'المسارات', icon: 'school', to: '/learning-paths' },
    { name: 'الأسعار', icon: 'workspace_premium', to: '/#pricing', isHash: true },
    { name: 'عن المنصة', icon: 'person', to: '/about' }
  ];

  const handleHashLink = (e, to) => {
    if (to.startsWith('/#')) {
      const id = to.substring(2);
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (location.pathname !== '/') {
        // Allow navigation if not on home, it will just go to home then scroll
        // handled by react-router-hash-link or standard behavior usually
      }
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[80px] bg-white/90 backdrop-blur-xl border-t border-gray-200 z-50 md:hidden pb-safe">
      <div className="grid grid-cols-5 h-full items-center justify-items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.isHash ? '/' : item.to} // Hash links go to home first
            onClick={(e) => item.isHash && handleHashLink(e, item.to)}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-300
              ${isActive && !item.isHash ? 'text-primary' : 'text-gray-400 hover:text-heading-dark'}
              ${item.isHash && location.hash === item.to.substring(1) ? 'text-primary' : ''}
            `}
          >
            <span className={`material-symbols-outlined text-2xl mb-0.5 ${item.name === 'المسارات' ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
