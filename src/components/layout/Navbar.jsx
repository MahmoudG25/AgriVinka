import React, { useState, useRef, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/firestore/orderService';
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaTachometerAlt,
  FaBoxOpen,
  FaBook,
  FaCertificate,
  FaHeart,
  FaCog,
  FaQuestionCircle,
  FaBell,
  FaUsersCog
} from 'react-icons/fa';
import { useAuth } from '../../app/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

// Map known Arabic link labels to real routes
const NAVBAR_LINK_ROUTES = {
  'الرئيسية': '/',
  'المسارات التعليمية': '/learning-paths',
  'المسارات': '/learning-paths',
  'خرائط الطريق': '/learning-paths',
  'الكورسات': '/courses',
  'التدريب العملي': '/practical-training',
  'عن المنصة': '/about',
  'من نحن': '/about',
  'تواصل معنا': '/contact',
  'مركز المساعدة': '/help-center',
};

const resolveHref = (link) => NAVBAR_LINK_ROUTES[link.text] || link.href || '/';

// Returns true if input looks like a phone number (digits only, 7+ chars)
const isPhoneLike = (str) => /^\d{7,}$/.test(str.replace(/[\s\-\+]/g, ''));

const defaultNavbarData = {
  logo: 'AgriVinka',
  links: [
    { text: 'الرئيسية', href: '/' },
    { text: 'الكورسات', href: '/courses' },
    { text: 'المسارات', href: '/learning-paths' },
    { text: 'التدريب العملي', href: '/practical-training' },
  ]
};

const Navbar = ({ data = defaultNavbarData }) => {
  const navigate = useNavigate();
  const { currentUser, userData, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      if (isPhoneLike(trimmed)) {
        setSearchError('يرجى إدخال رقم الطلب فقط، وليس رقم الهاتف.');
        return;
      }

      setSearchError('');
      setIsSearching(true);
      try {
        const order = await orderService.findOrder(trimmed);
        if (order) {
          navigate('/checkout/review', { state: { order } });
          setSearchQuery('');
          setMobileMenuOpen(false);
          setProfileDropdownOpen(false);
        } else {
          setSearchError('لم يتم العثور على طلب بهذا الرقم.');
        }
      } catch (error) {
        logger.error('Search error:', error);
        setSearchError('حدث خطأ غير متوقع.');
      } finally {
        setIsSearching(false);
      }
    }
  };

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

  // User avatar: photo URL from Google login or first letter of name/email
  const avatarUrl = currentUser?.photoURL;
  const displayName = userData?.displayName || currentUser?.displayName || currentUser?.email || 'مستخدم';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // Handle Search Bar globally (center component)
  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim();
      if (query) {
        // simple jump to courses with query in state or url could work, 
        // but based on instructions: "Search bar for searching courses and lessons"
        // keep it UI-wise first, navigation to courses page if needed.
        // currently AgriVinka's course search is internal to CoursesPage.
        navigate('/courses', { state: { searchQuery: query } });
      }
    }
  };

  return (
    <nav className={`sticky top-0 w-full z-50 transition-all duration-300 border-b border-gray-100 shadow-sm h-16 md:h-20 ${mobileMenuOpen ? 'bg-white' : 'bg-white/95 backdrop-blur-xl'}`}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] h-full flex items-center justify-between">
        
        {/* RIGHT SIDE: Logo */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl">eco</span>
            </div>
            <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-wide whitespace-nowrap">AgriVinka</span>
          </Link>
        </div>

        {/* CENTER: Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center justify-center flex-1 gap-2 text-[15px] font-medium text-gray-600 px-6">
            <Link to="/" className="px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">الرئيسية</Link>
            <Link to="/courses" className="px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">الكورسات</Link>
            <Link to="/learning-paths" className="px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">المسارات</Link>
            <Link to="/practical-training" className="px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors whitespace-nowrap">التدريب العملي</Link>
            <Link to="/analyzer" className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-primary hover:bg-green-100 rounded-lg transition-all font-semibold whitespace-nowrap">
              <span className="material-symbols-outlined text-sm">psychiatry</span>
              فاحص النباتات
            </Link>
        </div>

        {/* LEFT SIDE: Notifications + User Auth */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">

          {/* Notifications Icon (Mock) */}
          {currentUser && (
            <button className="hidden sm:flex relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors focus:outline-none">
              <FaBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          )}

          {/* === AUTH SECTION === */}
          {currentUser ? (
            /* --- Logged-in: Profile Avatar + Dropdown --- */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 group focus:outline-none p-1 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="قائمة الملف الشخصي"
                aria-expanded={profileDropdownOpen}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full border border-gray-200 overflow-hidden bg-primary/10 flex items-center justify-center shadow-sm group-hover:border-primary/50 transition-colors">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                    : <span className="text-primary font-bold text-sm">{avatarLetter}</span>}
                </div>
              </button>

              {/* Dropdown Menu (SaaS Style) */}
              {profileDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden z-50 animate-fade-in-down origin-top-left">

                  {/* USER PROFILE SECTION */}
                  <div className="p-4 bg-white border-b border-gray-100/80 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-gray-100 overflow-hidden bg-primary/5 flex items-center justify-center shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-primary font-bold text-lg">{avatarLetter}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate" title={displayName}>{displayName}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5" title={currentUser.email}>{currentUser.email}</p>
                    </div>
                    {/* Role Badge */}
                    <div className="shrink-0 flex self-start mt-1">
                      {isAdmin ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold bg-purple-50 text-purple-600 rounded-md border border-purple-100">مدير النظام</span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold bg-green-50 text-primary rounded-md border border-green-100">طالب</span>
                      )}
                    </div>
                  </div>

                  <div className="p-2 space-y-0.5 max-h-[60vh] overflow-y-auto custom-scrollbar">

                    {/* MAIN NAVIGATION SECTION */}
                    <div className="py-1">
                      <Link to="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary transition-all">
                          <FaTachometerAlt size={14} />
                        </div>
                        لوحة التحكم
                      </Link>

                      <Link to="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary transition-all">
                          <FaBook size={14} />
                        </div>
                        كورساتي
                      </Link>

                      <Link to="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary transition-all">
                          <FaCertificate size={14} />
                        </div>
                        الشهادات
                      </Link>

                      <Link to="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-red-500 transition-all">
                          <FaHeart size={14} />
                        </div>
                        المفضلة
                      </Link>
                    </div>

                    {/* ADMIN SECTION */}
                    {isAdmin && (
                      <>
                        <div className="h-px bg-gray-100 my-1 mx-2"></div>
                        <div className="py-1">
                          <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">أدوات الإدارة</p>
                          <Link to="/admin" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary transition-all">
                              <FaTachometerAlt size={14} />
                            </div>
                            لوحة تحكم الإدارة
                          </Link>

                          <Link to="/dashboard/practical-training" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary transition-all">
                              <FaUser size={14} />
                            </div>
                            طلبات التدريب
                          </Link>

                          <Link to="/admin/users" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary transition-all">
                              <FaUsersCog size={14} />
                            </div>
                            إدارة النظام
                          </Link>
                        </div>
                      </>
                    )}

                    {/* UTILITY SECTION */}
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <div className="py-1">
                      <Link to="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary transition-all">
                          <FaCog size={14} />
                        </div>
                        إعدادات الحساب
                      </Link>
                      <Link to="/help-center" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary transition-all">
                          <FaQuestionCircle size={14} />
                        </div>
                        مركز المساعدة
                      </Link>
                    </div>

                    {/* ORDER TRACKING */}
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <div className="px-3 py-3">
                      <p className="text-[11px] font-bold text-gray-500 mb-2">تتبع طلباتك</p>
                      <div className="flex relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={handleSearch}
                          placeholder="رقم الطلب (مثال: #1234)"
                          className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pr-3 pl-10 py-2 outline-none focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all font-mono"
                        />
                        <button
                          onClick={handleSearch}
                          className="absolute left-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                        >
                          <FaSearch size={12} />
                        </button>
                      </div>
                      {searchError && <p className="text-red-500 text-[10px] mt-1.5 px-1">{searchError}</p>}
                    </div>

                  </div>

                  {/* LOGOUT */}
                  <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <FaSignOutAlt size={14} />
                      </div>
                      تسجيل الخروج
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            /* --- Guest: Login + Register buttons --- */
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 font-bold text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
              >
                تسجيل الدخول
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl font-bold text-sm bg-primary text-white hover:bg-accent hover:shadow-lg hover:shadow-primary/20 transition-all border border-transparent"
              >
                إنشاء حساب
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[64px] md:top-[80px] z-40 bg-white border-t border-gray-100 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-6 py-6 pb-24 space-y-6">
            {currentUser ? (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden bg-primary/5 flex items-center justify-center shrink-0">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                    : <span className="text-primary font-black text-xl">{avatarLetter}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email}</p>
                </div>
                {/* Role Badge */}
                <div className="shrink-0">
                  {isAdmin ? (
                    <span className="inline-block px-2 py-1 text-[10px] font-bold bg-purple-100 text-purple-700 rounded-lg">مدير</span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-[10px] font-bold bg-green-100 text-primary rounded-lg">طالب</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={handleLinkClick} className="flex-1 text-center py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  دخول
                </Link>
                <Link to="/register" onClick={handleLinkClick} className="flex-1 text-center py-3 rounded-xl bg-primary text-white font-bold hover:bg-accent hover:shadow-lg hover:shadow-primary/20 transition-all">
                  حساب جديد
                </Link>
              </div>
            )}

            <div className="h-px bg-gray-100" />

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              <Link to="/" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-[15px] font-bold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">الرئيسية</Link>
              <Link to="/courses" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-[15px] font-bold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">الكورسات</Link>
              <Link to="/analyzer" onClick={handleLinkClick} className="flex items-center gap-2 px-4 py-3 mb-1 mt-1 rounded-xl text-[15px] font-bold bg-green-50 text-primary border border-green-100 hover:bg-green-100 transition-all">
                <span className="material-symbols-outlined mb-0.5">psychiatry</span>
                فاحص أمراض النبات الذكي
              </Link>
              <Link to="/learning-paths" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-[15px] font-bold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">المسارات التعليمية</Link>
              <Link to="/practical-training" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-[15px] font-bold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">التدريب العملي</Link>
            </div>

            {/* Mobile User specific Links */}
            {currentUser && (
              <>
                <div className="h-px bg-gray-100" />
                <div className="space-y-1">
                  <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">حسابي</p>
                  <Link to="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                    <FaTachometerAlt className="text-gray-400" /> لوحة التحكم
                  </Link>
                  <Link to="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                    <FaBook className="text-gray-400" /> مقرراتي والشهادات
                  </Link>
                </div>
              </>
            )}

            {isAdmin && (
              <>
                <div className="h-px bg-gray-100" />
                <div className="space-y-1">
                  <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">الإدارة</p>
                  <Link to="/admin" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                    <FaTachometerAlt className="text-gray-400" /> لوحة تحكم الإدارة
                  </Link>
                  <Link to="/admin/users" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                    <FaUsersCog className="text-gray-400" /> إدارة النظام
                  </Link>
                </div>
              </>
            )}

            <div className="h-px bg-gray-100" />

            {/* Mobile Order Search */}
            {currentUser && (
              <div className="relative bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <label htmlFor="search-input-mobile" className="block text-sm font-bold text-gray-700 mb-2">تتبع طلباتك</label>
                <div className="flex items-center bg-white rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <input
                    type="text"
                    id="search-input-mobile"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSearchError(''); }}
                    onKeyDown={handleSearch}
                    placeholder="رقم الطلب..."
                    className="bg-transparent border-none outline-none text-sm w-full text-gray-800 placeholder-gray-400 px-4 py-3 font-mono"
                    disabled={isSearching}
                  />
                  <button onClick={handleSearch} disabled={isSearching} className="text-gray-400 hover:text-primary px-4 transition-colors">
                    {isSearching ? <span className="animate-spin block w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></span> : <FaSearch />}
                  </button>
                </div>
                {searchError && <div className="mt-2 text-red-600 text-xs font-medium px-1">{searchError}</div>}
              </div>
            )}

            {/* Mobile Logout */}
            {currentUser && (
              <button onClick={handleLogout} className="w-full mt-4 text-center bg-red-50 text-red-600 px-6 py-4 rounded-xl font-bold hover:bg-red-100 transition-colors text-[15px] flex items-center justify-center gap-2">
                <FaSignOutAlt />
                تسجيل الخروج
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

