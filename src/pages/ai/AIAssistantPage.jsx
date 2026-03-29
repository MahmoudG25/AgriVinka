import React, { useMemo, useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaTachometerAlt, FaBook, FaCertificate, FaHeart, FaCog, FaQuestionCircle, FaUser, FaUsersCog, FaSignOutAlt } from 'react-icons/fa';
import { FiMenu, FiX, FiMessageSquare, FiMoreVertical, FiEdit2, FiTrash2, FiStar } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { aiSessionService } from '../../services/firestore/aiSessionService';
import AIAssistantPanel from '../../components/assistant/AIAssistantPanel';
import SEOHead from '../../components/common/SEOHead';
import siteLogo from '../../assets/Gemini_Generated_Image_n78kqfn78kqfn78k (1).png';

const AIAssistantPage = () => {
  const navigate = useNavigate();
  const { currentUser, userData, isAdmin } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Modal States
  const [renameModalData, setRenameModalData] = useState(null); // { id, newName }
  const [deleteModalData, setDeleteModalData] = useState(null); // id
  
  const userMenuRef = useRef(null);
  const chatContextMenuRef = useRef(null);

  // Fetch chats from Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchChats = async () => {
      if (!currentUser?.uid) return;
      setIsLoadingChats(true);
      const data = await aiSessionService.getUserSessions(currentUser.uid);
      if (isMounted) {
        setConversations(data);
        if (data.length > 0 && !activeConversationId) {
          setActiveConversationId(data[0].id);
        }
        setIsLoadingChats(false);
      }
    };
    fetchChats();
    return () => { isMounted = false; };
  }, [currentUser?.uid, activeConversationId]);

  const activeConversation = useMemo(
    () => conversations.find((conv) => conv.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0; // The query already sorts by updatedAt desc
    });
  }, [conversations]);

  const createNewConversation = async () => {
    if (!currentUser?.uid) {
      setActiveConversationId(null);
      return;
    }
    
    try {
      const newSession = await aiSessionService.createSession(currentUser.uid, 'محادثة جديدة');
      setConversations((prev) => [newSession, ...prev]);
      setActiveConversationId(newSession.id);
      if(window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      console.error('Failed to create session upfront:', err);
    }
  };

  const handleNewSessionCreated = (newSession) => {
    setConversations((prev) => [newSession, ...prev]);
    setActiveConversationId(newSession.id);
  };

  const handleSessionUpdated = (updatedSession) => {
    setConversations(prev => prev.map(c => c.id === updatedSession.id ? updatedSession : c));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideContext = (event) => {
      if (chatContextMenuRef.current && !chatContextMenuRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    if (activeDropdownId) {
      document.addEventListener("mousedown", handleClickOutsideContext);
    }
    return () => document.removeEventListener("mousedown", handleClickOutsideContext);
  }, [activeDropdownId]);

  const openRenameModal = (id, currentTitle, e) => {
    e.stopPropagation();
    setActiveDropdownId(null);
    setRenameModalData({ id, newName: currentTitle });
  };

  const confirmRename = async () => {
    if (renameModalData && renameModalData.newName.trim() && currentUser?.uid) {
      const newTitle = renameModalData.newName.trim();
      const success = await aiSessionService.updateSession(currentUser.uid, renameModalData.id, { title: newTitle });
      if (success) {
        setConversations(prev => prev.map(c => c.id === renameModalData.id ? { ...c, title: newTitle } : c));
      }
    }
    setRenameModalData(null);
  };

  const openDeleteModal = (id, e) => {
    e.stopPropagation();
    setActiveDropdownId(null);
    setDeleteModalData(id);
  };

  const confirmDelete = async () => {
    if (deleteModalData && currentUser?.uid) {
      const success = await aiSessionService.deleteSession(currentUser.uid, deleteModalData);
      if (success) {
        setConversations(prev => prev.filter(c => c.id !== deleteModalData));
        if (activeConversationId === deleteModalData) {
          const remaining = conversations.filter(c => c.id !== deleteModalData);
          setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    }
    setDeleteModalData(null);
  };

  const togglePinConversation = async (id, e) => {
    e.stopPropagation();
    setActiveDropdownId(null);
    if (!currentUser?.uid) return;
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      const newPinned = !conv.pinned;
      const success = await aiSessionService.updateSession(currentUser.uid, id, { pinned: newPinned });
      if (success) {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: newPinned } : c));
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleLinkClick = () => {
    setShowUserMenu(false);
  };

  const avatarUrl = currentUser?.photoURL;
  const displayName = userData?.displayName || currentUser?.displayName || currentUser?.email || 'مستخدم';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <SEOHead
        title="المساعد الزراعي - AgriVinka"
        description="أسأل المساعد الزراعي."
      />

      {/* Main container: Full height/width column layout */}
      <div dir="rtl" className="flex h-screen w-screen flex-col overflow-hidden bg-white text-gray-800">
        
        {/* Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 z-10 shadow-sm relative">
          
          {/* Right side: Logo Only */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={siteLogo} alt="AgriVinka Logo" className="h-10 md:h-12 w-auto object-contain group-hover:scale-105 transition-transform" />
            </Link>
          </div>

          {/* Left side: Menu Toggle & User Dropdown */}
          <div className="flex items-center gap-3">
            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((p) => !p)}
                className="flex items-center justify-center overflow-hidden rounded-full hover:ring-2 hover:ring-primary/50 transition-all border border-gray-200 p-1"
                aria-label="قائمة الملف الشخصي"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shadow-sm">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : (currentUser ? <span className="text-primary font-bold text-sm">{avatarLetter}</span> : <FaUserCircle className="w-full h-full text-gray-400" />)}
                </div>
              </button>
              
              {showUserMenu && currentUser && (
                <div className="absolute left-0 top-[calc(100%+8px)] w-72 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 z-50 animate-fade-in-down origin-top-left overflow-hidden">
                  
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
                          <Link to="/features/admin" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary transition-all">
                              <FaTachometerAlt size={14} />
                            </div>
                            لوحة تحكم الإدارة
                          </Link>

                          <Link to="/features/admin/trainings" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-primary transition-all">
                              <FaUser size={14} />
                            </div>
                            طلبات التدريب
                          </Link>

                          <Link to="/features/admin/users" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
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
              
              {showUserMenu && !currentUser && (
                <div className="absolute left-0 top-[calc(100%+8px)] w-48 rounded-2xl bg-white shadow-xl border border-gray-100 z-50 p-2">
                  <Link to="/login" className="block w-full px-4 py-2.5 text-right hover:bg-gray-50 text-gray-700 transition-colors rounded-xl font-bold">تسجيل الدخول</Link>
                  <Link to="/register" className="block w-full px-4 py-2.5 text-right hover:bg-gray-50 text-gray-700 transition-colors rounded-xl font-bold">إنشاء حساب</Link>
                </div>
              )}
            </div>

            {/* Sidebar Toggle Button (Now on Left) */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              title="القائمة الجانبية"
            >
              {isSidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {/* Workspace: Sidebar + Chat Panel */}
        <div className="flex flex-1 overflow-hidden flex-row-reverse relative">
          
          {/* Sidebar */}
          {isSidebarOpen && (
            <aside
              className={`absolute right-0 top-0 z-40 h-full w-[280px] shrink-0 border-l border-gray-300 bg-gray-100 shadow-2xl transition-transform duration-300 md:relative md:shadow-none translate-x-0`}
            >
              <div className="flex h-full flex-col p-3">
                {/* New Chat Button */}
                <button
                  onClick={createNewConversation}
                  className="flex items-center gap-2 rounded-xl bg-white border border-gray-300 px-3 py-2.5 text-sm font-bold hover:bg-primary/5 hover:border-primary/30 transition-all mb-4 text-gray-800 shadow-sm"
                  dir="rtl"
                >
                  <span className="flex-1 text-right">محادثة جديدة</span>
                  <FiMessageSquare className="w-5 h-5 text-gray-500" />
                </button>
                
                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar pb-10">
                  <div className="text-xs font-bold text-gray-500 mb-2 px-2 mt-2">الدردشات السابقة</div>
                  {sortedConversations.map((conv) => (
                    <div key={conv.id} className="relative group">
                      <button
                        onClick={() => {
                          setActiveConversationId(conv.id);
                          if(window.innerWidth < 768) setIsSidebarOpen(false); // Mobile only
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-[14.5px] transition-colors ${
                          activeConversationId === conv.id
                            ? 'bg-white border-gray-200 border text-primary font-bold shadow-sm'
                            : 'text-gray-700 hover:bg-white/60 border border-transparent'
                        }`}
                      >
                        <FiMessageSquare className={`w-4 h-4 shrink-0 ${activeConversationId === conv.id ? 'text-primary' : 'text-gray-400'}`} />
                        <span className="truncate flex-1">{conv.title}</span>
                        {conv.pinned && <FiStar className="w-3.5 h-3.5 shrink-0 text-amber-400 fill-amber-400" />}
                      </button>

                      {/* Hover action button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(activeDropdownId === conv.id ? null : conv.id);
                        }}
                        className={`absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 shadow-sm transition-all ${activeDropdownId === conv.id ? 'flex z-10' : 'hidden group-hover:flex z-10'}`}
                        title="خيارات الدردشة"
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </button>

                      {/* Context Dropdown */}
                      {activeDropdownId === conv.id && (
                        <div ref={chatContextMenuRef} className="absolute left-8 top-full mt-1 w-44 rounded-xl bg-white shadow-xl border border-gray-100 py-1 z-50 text-sm overflow-hidden">
                          <button
                            onClick={(e) => openRenameModal(conv.id, conv.title, e)}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-right text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                          >
                            <FiEdit2 className="w-[15px] h-[15px] text-gray-400" /> تغيير الاسم
                          </button>
                          <button
                            onClick={(e) => togglePinConversation(conv.id, e)}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-right text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                          >
                            <FiStar className={`w-[15px] h-[15px] ${conv.pinned ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} /> {conv.pinned ? 'إلغاء التثبيت' : 'تثبيت'}
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={(e) => openDeleteModal(conv.id, e)}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-right text-red-600 hover:bg-red-50 transition-colors font-bold"
                          >
                            <FiTrash2 className="w-[15px] h-[15px] text-red-500" /> حذف
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoadingChats ? (
                     <div className="text-center text-xs font-medium text-gray-400 mt-8 px-4 animate-pulse">جاري تحميل المحادثات...</div>
                  ) : sortedConversations.length === 0 && (
                     <div className="text-center text-xs font-medium text-gray-400 mt-8 px-4">لا توجد محادثات سابقة.</div>
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* Overlay for mobile when sidebar is open */}
          {isSidebarOpen && (
            <div
              className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex min-h-full flex-1 flex-col overflow-hidden bg-white relative">
            <AIAssistantPanel
              key={activeConversationId || 'empty'}
              conversationId={activeConversationId}
              conversationTitle={activeConversation?.title || 'محادثة جديدة'}
              onSessionCreated={handleNewSessionCreated}
              onSessionUpdated={handleSessionUpdated}
            />
          </main>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden border border-gray-100" dir="rtl">
            <h3 className="text-xl font-black text-gray-900 mb-2">حذف المحادثة</h3>
            <p className="text-gray-500 text-[14.5px] mb-7 leading-relaxed font-medium">هل أنت متأكد من رغبتك في حذف هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسح جميع الرسائل المرتبطة بها نهائياً.</p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-white font-bold hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 transition-all"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setDeleteModalData(null)}
                className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-gray-700 font-bold hover:bg-gray-200 transition-all border border-transparent hover:border-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 overflow-hidden border border-gray-100" dir="rtl">
            <h3 className="text-xl font-black text-gray-900 mb-5">تغيير اسم المحادثة</h3>
            <input
              type="text"
              value={renameModalData.newName}
              onChange={(e) => setRenameModalData({...renameModalData, newName: e.target.value})}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRename();
                if (e.key === 'Escape') setRenameModalData(null);
              }}
              className="w-full text-[15px] font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all mb-7"
              placeholder="أدخل الاسم الجديد..."
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={confirmRename}
                className="flex-[1.5] rounded-xl bg-primary px-4 py-3 text-white font-bold hover:bg-accent hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                حفظ التغييرات
              </button>
              <button
                onClick={() => setRenameModalData(null)}
                className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-gray-700 font-bold hover:bg-gray-200 transition-all border border-transparent hover:border-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantPage;
