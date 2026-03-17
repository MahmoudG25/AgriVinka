import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../app/contexts/AuthContext';
import { courseService } from '../services/firestore/courseService';
import { enrollmentService } from '../services/firestore/enrollmentService';
import { lessonProgressService } from '../services/firestore/lessonProgressService';
import { logger } from '../utils/logger';
import SEOHead from '../components/common/SEOHead';
import { FaChevronRight, FaChevronLeft, FaPlayCircle, FaCheckCircle, FaLock, FaCertificate, FaListUl, FaTimes, FaSearch, FaUser, FaSignOutAlt, FaTachometerAlt, FaDownload, FaFilePdf, FaBookOpen, FaRegClock } from 'react-icons/fa';
import { getOrCreateCertificate } from '../features/certificates/services/certificateService.js';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData, isAdmin } = useAuth(); // userData, isAdmin if available

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [activeLesson, setActiveLesson] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  const [hasCertificate, setHasCertificate] = useState(false);
  const [certificateId, setCertificateId] = useState(null);

  // New states for redesigned player
  const [activeTab, setActiveTab] = useState('description');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef(null);

  // User avatar calculations
  const avatarUrl = currentUser?.photoURL;
  const displayName = userData?.displayName || currentUser?.displayName || currentUser?.email || 'مستخدم';
  const avatarLetter = displayName.charAt(0).toUpperCase();

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileDropdownOpen(false);
      navigate('/');
    } catch (err) {
      logger.error('Logout error:', err);
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        // 1. Verify Enrollment
        const isEnrolled = await enrollmentService.checkEnrollmentStatus(currentUser.uid, courseId);
        if (!isEnrolled) {
          navigate(`/courses/${courseId}`);
          return;
        }

        // 2. Fetch Course Details + Modules
        const courseData = await courseService.getCourseWithModules(courseId);
        setCourse(courseData);

        // 3. Use the unified sections
        const loadedModules = courseData.sections || [];
        setModules(loadedModules);

        const progressIds = await lessonProgressService.getCompletedLessons(currentUser.uid, courseId);
        setCompletedLessons(new Set(progressIds));

        // Get the exact last lesson ID they were watching
        const enrollments = await enrollmentService.getUserEnrollments(currentUser.uid);
        const thisEnrollment = enrollments.find(e => e.courseId === courseId);
        const lastLessonId = thisEnrollment?.lastLessonId;
        const certId = thisEnrollment?.certificateId;

        // Store certId
        setHasCertificate(!!certId);
        setCertificateId(certId);

        // 4. Set Initial Active Lesson
        if (loadedModules.length > 0 && loadedModules[0].lessons?.length > 0) {
          let prioritizedLesson = null;
          let firstUncompleted = null;

          for (const mod of loadedModules) {
            for (const les of (mod.lessons || [])) {
              const lesId = les.id || les.title;
              if (lesId === lastLessonId) prioritizedLesson = les;
              if (!firstUncompleted && !progressIds.includes(lesId)) {
                firstUncompleted = les;
              }
            }
          }

          const startingLesson = prioritizedLesson || firstUncompleted || loadedModules[0].lessons[0];
          setActiveLesson(startingLesson);

          // Expand the module containing the active lesson
          const activeModIndex = loadedModules.findIndex(m => m.lessons?.some(l => (l.id || l.title) === (startingLesson.id || startingLesson.title)));
          if (activeModIndex >= 0) {
            setExpandedModules({ [activeModIndex]: true });
          }
        }

        // Update last access
        await enrollmentService.updateLastAccess(currentUser.uid, courseId);

      } catch (error) {
        logger.error('Error loading course player', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, currentUser, navigate]);

  // Calculate Progress
  const totalLessons = modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);
  const completedCount = completedLessons.size;
  const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  // Sync overall progress with Firebase
  useEffect(() => {
    if (courseId && currentUser?.uid && totalLessons > 0 && course) {
      enrollmentService.updateEnrollmentProgress(
        currentUser.uid,
        courseId,
        progressPercentage,
        progressPercentage === 100,
        activeLesson?.id || activeLesson?.title
      ).catch(err => logger.error('Failed to update global progress', err));
    }
  }, [progressPercentage, courseId, currentUser, totalLessons, course, activeLesson]);

  const toggleLessonCompletion = async (lessonIdentifier, e) => {
    e?.stopPropagation();
    try {
      const newCompleted = new Set(completedLessons);
      if (newCompleted.has(lessonIdentifier)) {
        await lessonProgressService.unmarkLesson(currentUser.uid, courseId, lessonIdentifier);
        newCompleted.delete(lessonIdentifier);
      } else {
        await lessonProgressService.markLessonCompleted(currentUser.uid, courseId, lessonIdentifier, 0);
        newCompleted.add(lessonIdentifier);
      }
      setCompletedLessons(newCompleted);
    } catch (error) {
      logger.error('Error toggling completion', error);
    }
  };

  const toggleModule = (index) => {
    setExpandedModules(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  // Helper to find next and prev lessons
  const flattenLessons = modules.flatMap(m => m.lessons || []);
  const activeLessonIndex = activeLesson ? flattenLessons.findIndex(l => (l.id || l.title) === (activeLesson.id || activeLesson.title)) : -1;
  const nextLesson = activeLessonIndex >= 0 && activeLessonIndex < flattenLessons.length - 1 ? flattenLessons[activeLessonIndex + 1] : null;
  const prevLesson = activeLessonIndex > 0 ? flattenLessons[activeLessonIndex - 1] : null;

  const goToNextLesson = () => {
    if (nextLesson) setActiveLesson(nextLesson);
  };

  const goToPrevLesson = () => {
    if (prevLesson) setActiveLesson(prevLesson);
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`${course.title} - منصة التعلم`} />
      <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden font-body" dir="rtl">

        {/* --- Unified Custom Navbar --- */}
        <header className="h-[74px] bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-40 shadow-sm relative">

          {/* Right: Logo + Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-md shadow-primary/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">eco</span>
              </div>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-wide hidden sm:block">AgriVinka</span>
            </Link>
            <div className="hidden md:flex items-center gap-4 text-gray-600 font-bold border-r border-gray-200 pr-6 mr-2 h-8">
              <Link to="/dashboard" className="hover:text-primary transition-colors">دوراتي</Link>
              <Link to="/learning-paths" className="hover:text-primary transition-colors">تصفح</Link>
              {/* <Link to="/community" className="hover:text-primary transition-colors">المجتمع</Link> */}
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث عن دروس..."
                className="w-full bg-white border border-gray-200 text-sm rounded-full px-5 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-12 text-gray-700"
              />
              <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Left: Cert + Avatar / Dropdown */}
          <div className="flex items-center gap-4">

            {/* Nav Notification Icon Mock as per requirement (wait, prompt says "لا أريد أيقونة الإشعارات", so REMOVED) */}

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-100 bg-gray-50 shadow-sm overflow-hidden hover:border-primary transition-all focus:outline-none"
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  : <span className="text-primary font-black text-lg">{avatarLetter}</span>}
              </button>

              {profileDropdownOpen && (
                <div className="absolute top-[calc(100%+12px)] left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-down">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col">
                    <p className="text-[15px] font-bold text-gray-800 truncate">{displayName}</p>
                    <p className="text-[13px] text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/dashboard" className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                      <FaTachometerAlt className="text-gray-400 text-lg" />
                      الملف الشخصي
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                      <FaBookOpen className="text-gray-400 text-lg" />
                      دوراتي
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                        <FaUser className="text-gray-400 text-lg" />
                        الإعدادات
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                        <FaSignOutAlt className="text-lg" />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <FaListUl />
            </button>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* Right Sidebar (Curriculum) */}
          <aside className={`absolute lg:relative top-0 right-0 h-[calc(100vh-74px)] w-full sm:w-[320px] lg:w-[380px] bg-white border-l border-gray-100 z-30 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] lg:shadow-none'}`}>

            {/* Header + Progress */}
            <div className="p-6 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-xl text-gray-900">محتوى الدورة</h3>
                <button className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-800 transition-colors" onClick={() => setSidebarOpen(false)}>
                  <FaTimes size={16} />
                </button>
              </div>
              <div className="w-full">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                  <span>تقدم الدورة</span>
                  <span className="text-gray-700">{progressPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1A4F3E] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium">تم إكمال {completedCount} من أصل {totalLessons} درساً</p>
              </div>
            </div>

            {/* Modules List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {modules.map((module, index) => {
                const filteredLessons = (module.lessons || []).filter(lesson =>
                  lesson.title?.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (searchQuery && filteredLessons.length === 0) {
                  return null;
                }

                const moduleIsExpanded = expandedModules[index] || searchQuery.length > 0;

                return (
                  <div key={index} className="border-b border-gray-100/70 last:border-b-0">
                    <button
                      onClick={() => toggleModule(index)}
                      className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-gray-50/80 transition-colors text-right"
                    >
                      <div className="flex-1 ml-4">
                        <div className="text-[11px] font-bold text-gray-400 mb-1.5">الوحدة {index + 1}: أساسيات</div>
                        <div className="font-bold text-[14px] text-gray-800">{module.title}</div>
                      </div>
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${moduleIsExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="bg-white pb-4 pt-1 px-4 text-center">
                        {filteredLessons.map((lesson, lIndex) => {
                        const lessonId = lesson.id || lesson.title;
                        const isCompleted = completedLessons.has(lessonId);
                        const isActive = (activeLesson?.id || activeLesson?.title) === lessonId;

                        return (
                          <div
                            key={lIndex}
                            onClick={() => { setActiveLesson(lesson); setSidebarOpen(false); }}
                            className="flex items-start gap-4 p-3 rounded-2xl cursor-pointer transition-all hover:bg-gray-50 text-right group"
                          >
                            <div className="flex-1">
                              <p className={`text-[13px] leading-relaxed mb-1.5 group-hover:text-primary transition-colors ${isActive ? 'font-black text-gray-900' : (isCompleted ? 'font-bold text-gray-800' : 'font-semibold text-gray-500')}`}>
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                                {isActive && <span className="text-gray-500">قيد التشغيل •</span>}
                                <span className={isActive ? "text-gray-500" : ""}>{lesson.duration || '00:00'} دقيقة</span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => toggleLessonCompletion(lessonId, e)}
                              className={`mt-1 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors border-2 shadow-sm ${isCompleted
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : (isActive
                                    ? 'bg-transparent border-[#1A4F3E] text-[#1A4F3E]'
                                    : 'bg-gray-100 border-gray-100 text-gray-300 group-hover:border-gray-300'
                                  )
                                }`}
                            >
                              {isCompleted
                                ? <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                : (isActive ? <FaPlayCircle className="text-[#1A4F3E]" size={20} /> : null)
                              }
                            </button>
                          </div>
                        )
                      })}
                      </div>
                    </div>
                  </div>
                );
              })}
              {searchQuery && modules.every(m => !(m.lessons || []).some(l => l.title?.toLowerCase().includes(searchQuery.toLowerCase()))) && (
                <div className="p-8 text-center text-gray-500 font-bold text-sm">
                  لا توجد دروس مطابقة لبحثك "{searchQuery}"
                </div>
              )}
            </div>
          </aside>

          {/* Left Video Area */}
          <main className="flex-1 flex flex-col h-[calc(100vh-74px)] overflow-y-auto custom-scrollbar bg-gray-50/50 relative p-4 lg:p-10">

            {/* Video Player Container */}
            <div className="w-full max-w-[1000px] mx-auto rounded-[24px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 bg-[#E8E6DD] relative aspect-[16/9] shrink-0 group">
              {activeLesson ? (() => {
                const videoSrc = activeLesson.video_url || activeLesson.videoUrl || activeLesson.url;
                return videoSrc ? (
                  videoSrc.includes('youtube') || videoSrc.includes('youtu.be') ? (
                    <iframe
                      src={getEmbedUrl(videoSrc)}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video
                      src={videoSrc}
                      className="absolute inset-0 w-full h-full object-cover"
                      controls
                      autoPlay
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 p-8 text-center bg-gray-100">
                    <div>
                      <FaLock className="text-5xl mx-auto mb-5 opacity-40 text-gray-300" />
                      <p className="text-xl font-bold text-gray-800 mb-2">عذراً، لا يوجد فيديو لهذا الدرس</p>
                      <p className="text-sm font-medium">يرجى قراءة المرفقات أو الانتقال للدرس التالي.</p>
                    </div>
                  </div>
                );
              })() : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-100 font-bold text-lg">
                  حدد درساً للبدء
                </div>
              )}
            </div>

            {/* Video Controls & Title */}
            <div className="w-full max-w-[1000px] mx-auto mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{activeLesson?.title || 'جاري التحميل...'}</h2>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                <button
                  onClick={goToPrevLesson}
                  disabled={!prevLesson}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl font-bold transition-all border ${prevLesson ? 'bg-white border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50 shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed hidden md:flex'}`}
                >
                  الدرس السابق
                  <FaChevronLeft className="text-[12px]" />
                </button>
                <button
                  onClick={goToNextLesson}
                  disabled={!nextLesson}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl font-bold transition-all ${nextLesson ? 'bg-[#1A4F3E] text-white shadow-[0_4px_15px_rgba(26,79,62,0.3)] hover:brightness-110' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <FaChevronRight className="text-[12px]" />
                  الدرس التالي
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="w-full max-w-[1000px] mx-auto mt-12 border-b border-gray-200">
              <div className="flex items-center gap-10 overflow-x-auto custom-scrollbar pb-[-1px]">
                {['description', 'resources', 'qna', 'notes'].map((tab) => {
                  const titles = { description: 'الوصف', resources: 'المصادر (PDF)', qna: 'الأسئلة والأجوبة', notes: 'ملاحظاتي' };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 px-1 text-[15px] font-bold whitespace-nowrap border-b-2 transition-all duration-300 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                    >
                      {titles[tab]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="w-full max-w-[1000px] mx-auto mt-10 mb-20 px-1">
              {activeTab === 'description' && (
                <div className="animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-900 mb-5">حول هذا الدرس</h3>
                  <div className="text-gray-600 leading-[1.8] text-[15px] max-w-4xl font-medium">
                    {activeLesson?.description ? (
                      <p>{activeLesson.description}</p>
                    ) : (
                      <p>في هذا الدرس، سنستكشف المكونات الثلاثة الرئيسية لأي محلول مغذي ناجح في الزراعة المائية. سنتناول كيفية خلط العناصر الكبرى والصغرى، وأهمية الحفاظ على استقرار درجة الحرارة لضمان الامتصاص الأمثل للجذور.</p>
                    )}
                  </div>

                  {/* Mock Resources Cards in Description as requested by UI */}
                  <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex items-center justify-between border border-gray-200 rounded-3xl p-6 bg-white shadow-sm cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-[28px] text-[#1A4F3E]">table</span>
                        </div>
                        <div>
                          <p className="font-bold text-[15px] text-gray-900">جدول قياسات EC لكل نبات</p>
                          <p className="text-[12px] font-bold text-gray-400 mt-1">PDF • 1.1 MB</p>
                        </div>
                      </div>
                      <button className="w-10 h-10 rounded-full text-[#1A4F3E] group-hover:bg-[#1A4F3E]/10 flex items-center justify-center transition-colors">
                        <FaDownload size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border border-gray-200 rounded-3xl p-6 bg-white shadow-sm cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-[28px] text-[#1A4F3E]">description</span>
                        </div>
                        <div>
                          <p className="font-bold text-[15px] text-gray-900">دليل خلط المحاليل المغذية</p>
                          <p className="text-[12px] font-bold text-gray-400 mt-1">PDF • 2.4 MB</p>
                        </div>
                      </div>
                      <button className="w-10 h-10 rounded-full text-[#1A4F3E] group-hover:bg-[#1A4F3E]/10 flex items-center justify-center transition-colors">
                        <FaDownload size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="animate-fade-in flex flex-col items-center justify-center py-16 text-gray-400 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <FaBookOpen size={48} className="mb-5 opacity-40" />
                  <p className="text-xl font-bold text-gray-800">المصادر الإضافية</p>
                  <p className="text-[15px] mt-2 text-center max-w-md font-medium">جميع الملفات والأدلة المرفقة مع هذا الدرس ستضاف هنا لتتمكن من تحميلها لاحقاً.</p>
                </div>
              )}

              {activeTab === 'qna' && (
                <div className="animate-fade-in flex flex-col items-center justify-center py-16 text-gray-400 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="material-symbols-outlined text-[56px] mb-5 opacity-40">forum</span>
                  <p className="text-xl font-bold text-gray-800">الأسئلة والأجوبة</p>
                  <p className="text-[15px] mt-2 text-center max-w-md font-medium">هل لديك سؤال حول هذا الدرس؟ يمكنك إضافته هنا وسيقوم المدرب أو زملائك بالإجابة عليه.</p>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="animate-fade-in flex flex-col items-center justify-center py-16 text-gray-400 bg-white border border-gray-100 rounded-3xl shadow-sm">
                  <span className="material-symbols-outlined text-[56px] mb-5 opacity-40">edit_note</span>
                  <p className="text-xl font-bold text-gray-800">ملاحظاتي</p>
                  <p className="text-[15px] mt-2 text-center max-w-md font-medium">قم بتدوين ملاحظاتك الخاصة أثناء مشاهدة الفيديو. هذه الملاحظات خاصة بك فقط.</p>
                </div>
              )}
            </div>

          </main>

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-gray-900/60 z-20 lg:hidden backdrop-blur-sm transition-opacity"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursePlayer;
