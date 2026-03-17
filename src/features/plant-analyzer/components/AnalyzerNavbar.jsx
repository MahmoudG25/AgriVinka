import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../../services/firebase';
import { FaSignOutAlt, FaTachometerAlt, FaUser } from 'react-icons/fa';
import { logger } from '../../../utils/logger';

const AnalyzerNavbar = () => {
  const navigate = useNavigate();
  const { currentUser, userData, isAdmin } = useAuth();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
    } catch (err) {
      logger.error('Logout error:', err);
    }
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const avatarUrl = currentUser?.photoURL;
  const displayName = userData?.displayName || currentUser?.displayName || currentUser?.email || 'مستخدم';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <nav className="sticky top-0 w-full z-50 bg-surface-white/90 backdrop-blur-md border-b border-border-light shadow-sm h-16 md:h-20 transition-all duration-300">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] h-full flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-md shadow-primary/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">eco</span>
            </div>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-wide">AgriVinka</span>
          </Link>
        </div>

        {/* Desktop Links — only الرئيسية and تحليلاتي */}
        <div className="hidden md:flex items-center gap-8 text-lg font-medium text-body-text/80">
          <Link to="/" className="hover:text-primary transition-colors font-bold">الرئيسية</Link>
          <Link to="/my-analyses" className="hover:text-primary transition-colors font-bold">تحليلاتي</Link>
        </div>

        {/* Right Side: Auth */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 group focus:outline-none"
                aria-label="قائمة الملف الشخصي"
                aria-expanded={profileDropdownOpen}
              >
                <div className="w-10 h-10 rounded-full border-2 border-primary/30 overflow-hidden bg-primary/10 flex items-center justify-center shadow-md group-hover:border-primary transition-colors">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                    : <span className="text-primary font-black text-lg">{avatarLetter}</span>}
                </div>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute top-[calc(100%+10px)] left-0 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-down">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-bold text-heading-dark truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    {isAdmin && <span className="inline-block mt-1 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">مدير النظام</span>}
                  </div>

                  <div className="py-1">
                    <Link to="/" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-heading-dark hover:bg-primary/5 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-gray-400 text-base">home</span>
                      الرئيسية
                    </Link>
                    <Link to="/my-analyses" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-heading-dark hover:bg-primary/5 hover:text-primary transition-colors">
                      <FaTachometerAlt className="text-gray-400" size={14} />
                      تحليلاتي
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-heading-dark hover:bg-primary/5 hover:text-primary transition-colors">
                        <FaUser className="text-gray-400" size={14} />
                        الإدارة
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                        <FaSignOutAlt size={14} />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 rounded-full font-bold text-sm text-heading-dark hover:text-primary border border-gray-200 hover:border-primary/40 transition-all">
                تسجيل الدخول
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-full font-bold text-sm bg-primary text-white hover:bg-accent transition-colors shadow-sm shadow-primary/20">
                إنشاء حساب
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-heading-dark"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen
              ? <span className="material-symbols-outlined text-xl">close</span>
              : <span className="material-symbols-outlined text-xl">menu</span>}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-surface-white border-t border-gray-100 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-6 py-8 space-y-6">
            {currentUser ? (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-full border-2 border-primary/30 overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                    : <span className="text-primary font-black text-xl">{avatarLetter}</span>}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-heading-dark truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={handleLinkClick} className="flex-1 text-center py-3 rounded-xl border border-gray-200 font-bold text-heading-dark hover:border-primary transition-colors">تسجيل الدخول</Link>
                <Link to="/register" onClick={handleLinkClick} className="flex-1 text-center py-3 rounded-xl bg-primary text-white font-bold hover:bg-accent transition-colors">إنشاء حساب</Link>
              </div>
            )}

            <hr className="border-gray-100" />

            <div className="space-y-1">
              <Link to="/" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-lg font-bold text-heading-dark hover:bg-primary/10 hover:text-primary transition-colors">الرئيسية</Link>
              <Link to="/my-analyses" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-lg font-bold text-heading-dark hover:bg-primary/10 hover:text-primary transition-colors">تحليلاتي</Link>
            </div>

            <hr className="border-gray-100" />

            {currentUser ? (
              <button onClick={handleLogout} className="w-full text-center bg-red-50 text-red-500 border border-red-100 px-6 py-3.5 rounded-xl font-bold hover:bg-red-100 transition-colors text-lg flex items-center justify-center gap-2">
                <FaSignOutAlt size={16} />
                تسجيل الخروج
              </button>
            ) : (
              <Link to="/analyzer" onClick={handleLinkClick} className="block w-full text-center bg-heading-dark text-white px-6 py-3.5 rounded-xl font-bold hover:bg-primary transition-colors shadow-lg text-lg">
                فحص نبتة
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default AnalyzerNavbar;
