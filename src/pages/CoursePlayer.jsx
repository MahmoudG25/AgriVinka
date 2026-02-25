import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import { lessonProgressService } from '../services/lessonProgressService';
import { certificateService } from '../services/certificateService';
import { logger } from '../utils/logger';
import SEOHead from '../components/common/SEOHead';
import { FaChevronRight, FaPlayCircle, FaCheckCircle, FaLock, FaCertificate, FaListUl, FaTimes } from 'react-icons/fa';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [activeLesson, setActiveLesson] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

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

        // 2. Fetch Course Details + Modules (subcollection with fallback)
        const courseData = await courseService.getCourseWithModules(courseId);
        setCourse(courseData);

        // 3. Use the unified sections (from subcollection or embedded)
        const loadedModules = courseData.sections || [];
        setModules(loadedModules);

        const progressIds = await lessonProgressService.getCompletedLessons(currentUser.uid, courseId);
        setCompletedLessons(new Set(progressIds));

        // Let's get the exact last lesson ID they were watching
        const enrollments = await enrollmentService.getUserEnrollments(currentUser.uid);
        const thisEnrollment = enrollments.find(e => e.courseId === courseId);
        const lastLessonId = thisEnrollment?.lastLessonId;

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
  const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedLessons.size / totalLessons) * 100);

  // Sync overall progress with Firebase
  useEffect(() => {
    if (courseId && currentUser?.uid && totalLessons > 0 && course) {
      enrollmentService.updateEnrollmentProgress(
        currentUser.uid,
        courseId,
        progressPercentage,
        progressPercentage === 100,
        activeLesson?.id || activeLesson?.title
      ).then(async () => {
        // Auto-generate certificate logic on 100%
        if (progressPercentage === 100 && course) {
          try {
            const enrollments = await enrollmentService.getUserEnrollments(currentUser.uid);
            const enr = enrollments.find(e => e.courseId === courseId);
            if (!enr?.certificateId) {
              const studentName = currentUser.displayName || 'طالب نماء';
              const cert = await certificateService.issueCertificate(
                currentUser.uid,
                studentName,
                course.id,
                course.title,
                course.instructorName || 'أكاديمية نماء'
              );
              await enrollmentService.updateEnrollmentCertificate(currentUser.uid, courseId, cert.id);
            }
          } catch (certError) {
            logger.error('Failed to issue certificate', certError);
          }
        }
      }).catch(err => logger.error('Failed to update global progress', err));
    }
  }, [progressPercentage, courseId, currentUser, totalLessons, course, activeLesson]);

  const toggleLessonCompletion = async (lessonIdentifier, e) => {
    e?.stopPropagation(); // Prevent selecting the lesson if clicking the checkbox
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

  if (loading || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`${course.title} - منصة التعلم`} />
      <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden font-body">

        {/* Top Navbar */}
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors">
              <FaChevronRight className="text-gray-300" />
            </Link>
            <h1 className="font-bold text-lg hidden sm:block truncate ">{course.title}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
              <div className="text-sm font-medium text-gray-300">% {progressPercentage} مكتمل</div>
              <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {progressPercentage === 100 && (
              <button
                onClick={async () => {
                  if (!course || !currentUser) return;
                  try {
                    const { certificateService } = await import('../services/certificateService');
                    let currentEnrollment = await enrollmentService.getUserEnrollments(currentUser.uid).then(res => res.find(e => e.courseId === courseId));
                    if (currentEnrollment?.certificateId) {
                      navigate(`/dashboard`);
                      return;
                    }
                    alert('جاري إصدار الشهادة... يرجى الانتظار لحين تحميل خطوط الطباعة');
                    const newCert = await certificateService.issueCertificate(
                      currentUser.uid,
                      currentUser.displayName || 'متدرب نماء',
                      course.id,
                      course.title
                    );

                    // Update enrollment
                    await enrollmentService.updateEnrollmentCertificate(currentUser.uid, course.id, newCert.id);

                    alert('تم إصدار الشهادة بنجاح! يمكنك تحميلها من لوحة التحكم.');
                    navigate('/dashboard');

                  } catch (err) {
                    logger.error('Failed to issue certificate', err);
                    alert('عفواً، لا يمكن إصدار الشهادة حالياً لعدم توفر متطلبات الطباعة في الخادم.');
                  }
                }}
                className="flex items-center gap-2 bg-accent text-heading-dark px-4 py-2 rounded-lg font-bold hover:shadow-glow transition-all"
              >
                <FaCertificate />
                طلب الشهادة
              </button>
            )}

            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-gray-700 rounded-full"
              onClick={() => setSidebarOpen(true)}
            >
              <FaListUl />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* Video Player Area */}
          <main className="flex-1 flex flex-col relative">
            <div className="flex-1 bg-black relative">
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
                      className="absolute inset-0 w-full h-full object-contain"
                      controls
                      autoPlay
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 p-8 text-center">
                    <div>
                      <FaLock className="text-4xl mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-bold text-white mb-2">عذراً، لا يوجد فيديو لهذا الدرس</p>
                      <p>يرجى قراءة المرفقات أو الانتقال للدرس التالي.</p>
                    </div>
                  </div>
                );
              })() : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  حدد درساً للبدء
                </div>
              )}
            </div>

            <div className="h-24 shrink-0 bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{activeLesson?.title || 'جاري التحميل...'}</h2>
                <p className="text-sm text-gray-400 mt-1">{activeLesson?.duration || '00:00'}</p>
              </div>

              {activeLesson && (
                <button
                  onClick={() => toggleLessonCompletion(activeLesson.id || activeLesson.title)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${completedLessons.has(activeLesson.id || activeLesson.title)
                    ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                    : 'bg-primary hover:bg-primary-hover text-white'
                    }`}
                >
                  <FaCheckCircle className={completedLessons.has(activeLesson.id || activeLesson.title) ? '' : 'opacity-50'} />
                  {completedLessons.has(activeLesson.id || activeLesson.title) ? 'مكتمل' : 'تحديد كمكتمل'}
                </button>
              )}
            </div>
          </main>

          {/* Sidebar / Curriculum */}
          <aside className={`absolute lg:relative top-0 right-0 h-full w-full sm:w-80 lg:w-96 bg-gray-800 border-l border-gray-700 z-30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/95 sticky top-0 z-10 backdrop-blur">
              <h3 className="font-bold text-lg">محتوى الدورة</h3>
              <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100%-65px)] custom-scrollbar">
              {modules.map((module, index) => (
                <div key={index} className="border-b border-gray-700/50">
                  <button
                    onClick={() => toggleModule(index)}
                    className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors text-right"
                  >
                    <div className="flex-1 ml-4">
                      <div className="text-xs text-gray-400 mb-1">القسم {index + 1}</div>
                      <div className="font-bold text-[15px]">{module.title}</div>
                    </div>
                    {/* Module Progress indicator could go here */}
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${expandedModules[index] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-gray-800/50 py-2">
                      {(module.lessons || []).map((lesson, lIndex) => {
                        const lessonId = lesson.id || lesson.title;
                        const isCompleted = completedLessons.has(lessonId);
                        const isActive = (activeLesson?.id || activeLesson?.title) === lessonId;

                        return (
                          <div
                            key={lIndex}
                            onClick={() => { setActiveLesson(lesson); setSidebarOpen(false); }}
                            className={`flex items-start gap-3 p-3 mx-2 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-primary/20 border border-primary/30' : 'hover:bg-gray-700'
                              }`}
                          >
                            <button
                              onClick={(e) => toggleLessonCompletion(lessonId, e)}
                              className={`mt-0.5 shrink-0 ${isCompleted ? 'text-primary' : 'text-gray-500 hover:text-white'}`}
                            >
                              <FaCheckCircle />
                            </button>

                            <div className="flex-1">
                              <p className={`text-sm mb-1 ${isActive ? 'font-bold text-white' : 'text-gray-300'}`}>
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <FaPlayCircle className="text-[10px]" />
                                <span>{lesson.duration}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div
              className="absolute inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursePlayer;
