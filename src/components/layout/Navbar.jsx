import React, { useState, useRef, useEffect } from 'react';
import { logger } from '../../utils/logger';
// Logo removed
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/firestore/orderService';
import { FaSearch, FaBars, FaTimes, FaUser, FaSignOutAlt, FaTachometerAlt, FaBoxOpen } from 'react-icons/fa';
import { useAuth } from '../../app/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useTopOfferBar } from '../../hooks/useTopOfferBar';

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
    { text: 'المسارات', href: '/learning-paths' },
    { text: 'الكورسات', href: '/courses' },
    { text: 'التدريب العملي', href: '/practical-training' },
    { text: 'عن المنصة', href: '/about' }
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

  const { offerData, loading: offerLoading } = useTopOfferBar();
  const [isOfferVisible, setIsOfferVisible] = useState(false);

  const dropdownRef = useRef(null);

  // Check offer bar visibility state
  useEffect(() => {
    if (offerLoading || !offerData || !offerData.enabled) {
      setIsOfferVisible(false);
      return;
    }

    const dismissedOfferId = localStorage.getItem('dismissedOfferId');
    if (dismissedOfferId === offerData.offerId) {
      setIsOfferVisible(false);
      return;
    }

    setIsOfferVisible(true);
  }, [offerData, offerLoading]);

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

  const offerBarHeight = document.getElementById('top-offer-bar')?.offsetHeight || 0;

  return (
    <nav className={`sticky top-0 w-full z-50 transition-all duration-300 border-b border-border-light shadow-sm h-16 md:h-20 ${mobileMenuOpen ? 'bg-surface-white' : 'bg-surface-white/90 backdrop-blur-md'}`}
      style={{ top: isOfferVisible ? `${offerBarHeight}px` : '0px' }}
    >
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

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-lg font-medium text-body-text/80">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <Link to="/courses" className="hover:text-primary transition-colors">الكورسات</Link>
          <Link to="/learning-paths" className="hover:text-primary transition-colors">المسارات</Link>
          <Link to="/practical-training" className="hover:text-primary transition-colors">التدريب العملي</Link>
          {data?.links && data.links
            .filter(link => !['الرئيسية', 'المسارات', 'المسارات التعليمية', 'الكورسات', 'التدريب العملي'].includes(link.text))
            .map((link, index) => (
              <Link key={index} to={resolveHref(link)} className="hover:text-primary transition-colors">
                {link.text}
              </Link>
            ))}
        </div>

        {/* Right Side: Search + Auth */}
        <div className="flex items-center gap-3">




          {/* === AUTH SECTION === */}
          {currentUser ? (
            /* --- Logged-in: Profile Avatar + Dropdown --- */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 group focus:outline-none"
                aria-label="قائمة الملف الشخصي"
                aria-expanded={profileDropdownOpen}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full border-2 border-primary/30 overflow-hidden bg-primary/10 flex items-center justify-center shadow-md group-hover:border-primary transition-colors">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                    : <span className="text-primary font-black text-lg">{avatarLetter}</span>}
                </div>
                <span className="hidden lg:block text-sm font-bold text-heading-dark w-24 truncate">{displayName.split(' ')[0]}</span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute top-[calc(100%+10px)] left-0 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-down">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-bold text-heading-dark truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    {isAdmin && <span className="inline-block mt-1 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">مدير النظام</span>}
                  </div>

                  <div className="py-1">
                    {/* Dashboard */}
                    <Link to="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-heading-dark hover:bg-primary/5 hover:text-primary transition-colors">
                      <FaTachometerAlt className="text-gray-400" size={14} />
                      لوحة التحكم
                    </Link>

                    {/* Practical Training Dashboard */}
                    <Link to="/dashboard/practical-training" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-heading-dark hover:bg-primary/5 hover:text-primary transition-colors">
                      <FaUser className="text-gray-400" size={14} />
                      طلبات التدريب
                    </Link>

                    {/* Admin Panel */}
                    {isAdmin && (
                      <Link to="/admin" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-heading-dark hover:bg-primary/5 hover:text-primary transition-colors">
                        <FaUser className="text-gray-400" size={14} />
                        الإدارة
                      </Link>
                    )}

                    {/* Order Tracking */}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <div className="px-4 py-2">
                        <p className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">تتبع طلب</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder="رقم الطلب..."
                            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary"
                          />
                          <button onClick={handleSearch} className="text-primary hover:text-accent transition-colors">
                            <FaBoxOpen size={14} />
                          </button>
                        </div>
                        {searchError && <p className="text-red-500 text-[10px] mt-1">{searchError}</p>}
                      </div>
                    </div>

                    {/* Logout */}
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
            /* --- Guest: Login + Register buttons --- */
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full font-bold text-sm text-heading-dark hover:text-primary border border-gray-200 hover:border-primary/40 transition-all"
              >
                تسجيل الدخول
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full font-bold text-sm bg-primary text-white hover:bg-accent transition-colors shadow-sm shadow-primary/20"
              >
                إنشاء حساب
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-heading-dark"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* ===== Mobile Menu ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-surface-white border-t border-gray-100 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-6 py-8 space-y-6">

            {/* Mobile User Info */}
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
                <Link to="/login" onClick={handleLinkClick} className="flex-1 text-center py-3 rounded-xl border border-gray-200 font-bold text-heading-dark hover:border-primary transition-colors">
                  تسجيل الدخول
                </Link>
                <Link to="/register" onClick={handleLinkClick} className="flex-1 text-center py-3 rounded-xl bg-primary text-white font-bold hover:bg-accent transition-colors">
                  إنشاء حساب
                </Link>
              </div>
            )}

            <hr className="border-gray-100" />

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              <Link to="/" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-lg font-bold text-heading-dark hover:bg-primary/10 hover:text-primary transition-colors">الرئيسية</Link>
              <Link to="/courses" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-lg font-bold text-heading-dark hover:bg-primary/10 hover:text-primary transition-colors">الكورسات</Link>
              <Link to="/learning-paths" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-lg font-bold text-heading-dark hover:bg-primary/10 hover:text-primary transition-colors">المسارات</Link>
              <Link to="/practical-training" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-lg font-bold text-heading-dark hover:bg-primary/10 hover:text-primary transition-colors">التدريب العملي</Link>
              {data?.links && data.links
                .filter(link => !['الرئيسية', 'المسارات', 'المسارات التعليمية', 'الكورسات', 'التدريب العملي'].includes(link.text))
                .map((link, index) => (
                  <Link key={index} to={resolveHref(link)} onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-lg font-bold text-heading-dark hover:bg-primary/10 hover:text-primary transition-colors">
                    {link.text}
                  </Link>
                ))}

              {/* Logged-in extra links on mobile */}
              {currentUser && (
                <>
                  <Link to="/dashboard" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-lg font-bold text-heading-dark hover:bg-primary/10 hover:text-primary transition-colors">لوحة التحكم</Link>
                  <Link to="/dashboard/practical-training" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-lg font-bold text-heading-dark hover:bg-primary/10 hover:text-primary transition-colors">طلبات التدريب</Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={handleLinkClick} className="block px-4 py-3 rounded-xl text-lg font-bold text-heading-dark hover:bg-primary/10 hover:text-primary transition-colors">الإدارة</Link>
                  )}
                </>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Mobile Order Search — only for logged-in users */}
            {currentUser && (
              <div className="relative">
                <label htmlFor="search-input-mobile" className="block text-sm font-bold text-gray-500 mb-2">تتبع طلبك</label>
                <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-primary focus-within:bg-white transition-all">
                  <input
                    type="text"
                    id="search-input-mobile"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSearchError(''); }}
                    onKeyDown={handleSearch}
                    placeholder="أدخل رقم الطلب"
                    className="bg-transparent border-none outline-none text-base w-full text-heading-dark placeholder-gray-400"
                    disabled={isSearching}
                  />
                  <button onClick={handleSearch} disabled={isSearching} className="text-gray-400 hover:text-primary transition-colors" aria-label="بحث عن الطلب">
                    {isSearching ? <span className="animate-spin block w-4 h-4 border-2 border-primary border-t-transparent rounded-full" aria-hidden="true"></span> : <FaSearch aria-hidden="true" />}
                  </button>
                </div>
                {searchError && <div className="mt-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg px-3 py-2 border border-red-100">{searchError}</div>}
              </div>
            )}

            {/* Mobile CTA / Logout */}
            {currentUser ? (
              <button onClick={handleLogout} className="w-full text-center bg-red-50 text-red-500 border border-red-100 px-6 py-3.5 rounded-xl font-bold hover:bg-red-100 transition-colors text-lg flex items-center justify-center gap-2">
                <FaSignOutAlt size={16} />
                تسجيل الخروج
              </button>
            ) : (
              <Link to="/request-course" onClick={handleLinkClick} className="block w-full text-center bg-heading-dark text-white px-6 py-3.5 rounded-xl font-bold hover:bg-primary transition-colors shadow-lg text-lg">
                اطلب كورس
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
