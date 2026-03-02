import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SEOHead from '../components/common/SEOHead';
import {
  FaChevronLeft,
  FaStar,
  FaStarHalfAlt,
  FaPlay,
  FaLock,
  FaCheckCircle,
  FaChevronDown,
  FaShoppingBag,
  FaCartPlus,
  FaGraduationCap,
  FaClock,
  FaCertificate,
  FaPlayCircle,
  FaInfinity,
  FaMobileAlt,
  FaClipboardList,
  FaCloudDownloadAlt,
  FaLightbulb,
  FaBookOpen,
  FaArrowLeft,
  FaHeart,
  FaRegHeart
} from 'react-icons/fa';
import { courseService } from '../services/courseService';
import { roadmapService } from '../services/roadmapService';
import { enrollmentService } from '../services/enrollmentService';
import { favoritesService } from '../services/favoritesService';
import { orderService } from '../services/orderService';
import FAQ from '../components/home/FAQ';
import { useAuth } from '../contexts/AuthContext';
import HeroSkeleton from '../components/skeletons/HeroSkeleton';
import SidebarSkeleton from '../components/skeletons/SidebarSkeleton';
import AccordionSkeleton from '../components/skeletons/AccordionSkeleton';
import { ImageWithFallback } from '../utils/imageUtils';
import { logger } from '../utils/logger';
import { useIssueCertificate } from '../modules/certificates/hooks/useIssueCertificate.js';

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedRoadmaps, setRelatedRoadmaps] = useState([]);

  const [expandedSectionId, setExpandedSectionId] = useState('intro'); // Default expanded, checking first section id
  const [visibleSectionsCount, setVisibleSectionsCount] = useState(5);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showAllLearningPoints, setShowAllLearningPoints] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userEnrollment, setUserEnrollment] = useState(null); // New state for full enrollment object
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [enrolling, setEnrolling] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null); // null | 'pending' | 'rejected'
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { issueAndDownload, isLoading: issuingCertificate } = useIssueCertificate();

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        // Fetch Course
        const fetchedCourse = await courseService.getCourseWithModules(courseId);
        setCourse(fetchedCourse);

        if (fetchedCourse) {
          // Fetch Roadmaps to find relations
          const allRoadmaps = await roadmapService.getAllRoadmaps();
          const related = allRoadmaps.filter(r =>
            (r.modules || r.courses || []).some(c => c.courseId === fetchedCourse.id)
          );
          setRelatedRoadmaps(related);
        }
      } catch (error) {
        logger.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollment = async () => {
      if (currentUser?.uid && courseId) {
        setEnrolling(true); // Indicate that enrollment check is in progress
        try {
          // Check actual full enrollment object for certificate ID
          const enrollments = await enrollmentService.getUserEnrollments(currentUser.uid);
          const thisEnrollment = enrollments.find(e => e.courseId === courseId);

          if (thisEnrollment) {
            setIsEnrolled(true);
            setProgressPercentage(thisEnrollment.progressPercentage || thisEnrollment.progressPercent || 0);
            setUserEnrollment(thisEnrollment); // Store the full enrollment object
          } else {
            setIsEnrolled(false);
            setProgressPercentage(0);
            setUserEnrollment(null);
          }
        } catch (error) {
          logger.error('Error checking enrollment:', error);
          setIsEnrolled(false);
          setProgressPercentage(0);
          setUserEnrollment(null);
        } finally {
          setEnrolling(false); // Reset enrolling state
        }
      } else {
        setIsEnrolled(false);
        setProgressPercentage(0);
        setUserEnrollment(null);
      }
    };

    // Check if user already has a pending/rejected order for this course
    const checkOrder = async () => {
      if (currentUser?.uid && courseId) {
        const existing = await orderService.checkExistingOrder(currentUser.uid, courseId);
        if (existing) {
          setOrderStatus(existing.status); // 'pending' or 'approved'
        } else {
          // Check for rejected orders too
          const allOrders = await orderService.getUserOrders(currentUser.uid);
          const rejected = allOrders.find(o => o.itemId === courseId && o.status === 'rejected');
          if (rejected) setOrderStatus('rejected');
        }
      }
    };

    fetchCourseData();
    checkEnrollment();
    checkOrder();

    // Check favorite status
    const checkFav = async () => {
      if (currentUser?.uid && courseId) {
        const fav = await favoritesService.isFavorite(currentUser.uid, courseId);
        setIsFavorite(fav);
      }
    };
    checkFav();
  }, [courseId, currentUser]);

  const handleEnrollFree = async () => {
    if (!currentUser) {
      // Redirect to login or show modal
      alert("الرجاء تسجيل الدخول أولاً للالتحاق بالدورة");
      return;
    }
    setEnrolling(true);
    try {
      await enrollmentService.enrollUser(currentUser.uid, course.id);
      setIsEnrolled(true);
      // Optional: Navigate to course player immediately
    } catch (err) {
      logger.error('Error auto-enrolling in free course', err);
      alert("حدث خطأ أثناء التسجيل. كرر المحاولة لاحقاً.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setFavLoading(true);
    try {
      const result = await favoritesService.toggleFavorite(currentUser.uid, courseId);
      setIsFavorite(result);
    } catch (err) {
      logger.error('Error toggling favorite', err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleShowMoreSections = () => {
    setVisibleSectionsCount((prev) => prev + 5);
  };

  const generateCertificateAndView = async () => {
    if (!currentUser || !course) {
      return;
    }
    try {
      toast.loading('جاري إصدار الشهادة وتحميلها...', { id: 'cert' });

      const studentName = currentUser.displayName || 'متدرب نماء';
      const newCert = await issueAndDownload({
        userId: currentUser.uid,
        courseId: course.id,
        studentName,
        courseName: course.title,
        instructorName: course.instructor?.name || 'Namaa Academy',
      });

      if (newCert) {
        await enrollmentService.updateEnrollmentCertificate(currentUser.uid, course.id, newCert.id);
        setUserEnrollment(prev => ({ ...prev, certificateId: newCert.id }));
        toast.success('تم إصدار الشهادة وتحميل ملف PDF بنجاح', { id: 'cert' });
      } else {
        toast.error('تعذر إصدار الشهادة. حاول مرة أخرى لاحقاً.', { id: 'cert' });
      }
    } catch (err) {
      logger.error('Failed to issue certificate', err);
      toast.error('عفواً، فشل إصدار الشهادة. حاول مجدداً لاحقاً', { id: 'cert' });
    }
  };

  if (loading) {
    return (
      <div className="bg-background-alt min-h-screen transition-colors duration-300">
        <main className="container-layout py-8 md:py-12">
          {/* Breadcrumbs Skeleton */}
          <div className="h-4 w-64 bg-gray-200 rounded mb-8 animate-pulse"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-8 space-y-8">
              <HeroSkeleton />
              {/* Video Skeleton */}
              <div className="relative rounded-2xl overflow-hidden aspect-video shadow-lg bg-gray-200 animate-pulse"></div>
              {/* Accordion Skeleton */}
              <AccordionSkeleton />
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-4 relative">
              <div className="sticky top-24 space-y-6">
                <SidebarSkeleton />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-heading-dark mb-4">الدورة غير موجودة</h2>
        <Link
          to="/learning-paths"
          className="bg-primary text-heading-dark px-6 py-2 rounded-lg font-bold hover:bg-accent transition-colors"
        >
          تصفح الدورات الأخرى
        </Link>
      </div>
    );
  }

  const toggleSection = (id) => {
    setExpandedSectionId(expandedSectionId === id ? null : id);
  };

  // Safe access to nested properties
  const price = course.pricing?.price ?? course.price ?? 0;
  const originalPrice = course.pricing?.original_price ?? course.original_price;
  const discount = course.pricing?.discount_percentage ?? course.discount ?? 0;
  const duration = course.meta?.duration || course.duration;
  const level = course.meta?.level || course.level;
  const certificate = course.meta?.certificate || course.certificate;
  const rating = course.meta?.rating ?? course.rating ?? 0;
  const reviewsCount = course.meta?.reviews_count ?? course.reviews_count ?? 0;
  const thumbnail = course.media?.thumbnail || course.preview_image || "https://placehold.co/600x400?text=No+Preview+Available";
  const videoUrl = course.media?.preview_video || null;



  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.seo?.metaTitle || course.title,
    "description": course.seo?.metaDescription || course.description?.substring(0, 160),
    "provider": {
      "@type": "Organization",
      "name": "أكاديمية نماء",
      "sameAs": window.location.origin
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "courseWorkload": duration
    },
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "EGP"
    }
  };

  return (
    <>
      <SEOHead
        title={course.seo?.metaTitle || `${course.title} | أكاديمية نماء`}
        description={course.seo?.metaDescription || course.description?.substring(0, 160) || `تعرف على ${course.title}`}
        canonical={window.location.href}
        keywords={course.seo?.keywords || `${course.title}, دورة تعليمية, أكاديمية نماء`}
        structuredData={courseSchema}
      />
      <div className="bg-background-alt text-heading-dark transition-colors duration-300 min-h-screen">
        <main className="container-layout py-8 md:py-12">

          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-yellow-600 mb-8 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-primary transition">الرئيسية</Link>
            <FaChevronLeft className="text-xs mx-2" />
            <Link to="/learning-paths" className="hover:text-primary transition">المسارات التعليمية</Link>
            <FaChevronLeft className="text-xs mx-2" />
            <span className="font-semibold text-heading-dark">{course.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Main Content - Right Column */}
            <div className="lg:col-span-8 space-y-8">

              {/* Header Card */}
              <div className="bg-surface-white rounded-2xl p-6 md:p-8 shadow-sm border border-border-light relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-blue-100">
                      <FaGraduationCap className="text-sm" />
                      مستوى {level}
                    </span>
                    <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-amber-100">
                      <FaClock className="text-sm" />
                      {duration} تدريبية
                    </span>
                    {certificate && (
                      <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-green-100">
                        <FaCertificate className="text-sm" />
                        شهادة معتمدة
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-extrabold text-heading-dark mb-4 leading-tight">
                    {course.title}
                  </h1>

                  <p className="text-yellow-800/80 text-lg mb-6 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 border-t border-border-light pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-0.5 rounded-full border-2 border-primary">
                        <ImageWithFallback
                          alt={course.instructor.name}
                          className="h-12 w-12 rounded-full object-cover"
                          src={course.instructor.image}
                          fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&background=random`}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-yellow-600 mb-0.5">المحاضر</p>
                        <p className="font-bold text-heading-dark text-sm">{course.instructor.name}</p>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-border-light mx-2"></div>
                    <div className="flex items-center gap-1 text-primary">
                      <span className="font-bold text-lg text-heading-dark ml-1">{rating}</span>
                      <div className="flex text-sm text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          i < Math.floor(rating) ? <FaStar key={i} /> :
                            i < rating ? <FaStarHalfAlt key={i} /> :
                              <FaStar key={i} className="text-gray-300" />
                        ))}
                      </div>
                      <span className="text-xs text-yellow-600 mr-2">({reviewsCount.toLocaleString()} تقييم)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Video / Thumbnail */}
              <div className="relative rounded-2xl overflow-hidden aspect-video shadow-lg bg-black">
                {isVideoPlaying && videoUrl ? (
                  <video
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <div
                    className="relative w-full h-full group cursor-pointer"
                    onClick={() => videoUrl && setIsVideoPlaying(true)}
                  >
                    <ImageWithFallback
                      alt={course.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition duration-300"
                      src={thumbnail}
                      fallbackSrc="https://placehold.co/800x450?text=No+Preview"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-primary/90 text-white rounded-full p-5 shadow-xl transform group-hover:scale-110 transition duration-300 backdrop-blur-sm">
                        <FaPlay size={28} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-md">
                      {videoUrl ? 'مشاهدة المقدمة' : 'لا يوجد فيديو معاينة'}
                    </div>
                  </div>
                )}
              </div>

              {/* What you'll learn */}
              <div className="bg-surface-white rounded-2xl p-6 md:p-8 shadow-sm border border-border-light relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>

                <h2 className="text-2xl font-bold text-heading-dark mb-6 flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FaLightbulb className="text-xl" />
                  </div>
                  ماذا ستتعلم في هذه الدورة؟
                </h2>

                <div className={`grid md:grid-cols-2 gap-4 transition-all duration-500 ease-in-out ${showAllLearningPoints ? 'max-h-[1000px] opacity-100' : 'max-h-[240px] overflow-hidden'}`}>
                  {(course.learning_points || []).slice(0, showAllLearningPoints ? undefined : 4).map((point, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-background-alt/50 transition-colors duration-200">
                      <FaCheckCircle className="text-primary mt-1 text-sm min-w-[16px] shrink-0" />
                      <span className="text-heading-dark/80 font-medium leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>

                {(course.learning_points || []).length > 4 && (
                  <div className="mt-6 text-center relative z-10">
                    {!showAllLearningPoints && (
                      <div className="absolute -top-24 left-0 w-full h-24 bg-gradient-to-t from-surface-white to-transparent pointer-events-none"></div>
                    )}
                    <button
                      onClick={() => setShowAllLearningPoints(!showAllLearningPoints)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-background-alt text-heading-dark font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md group/btn"
                    >
                      <span>{showAllLearningPoints ? 'عرض أقل' : 'عرض المزيد'}</span>
                      <FaChevronDown className={`transition-transform duration-300 ${showAllLearningPoints ? 'rotate-180' : 'group-hover/btn:translate-y-1'}`} />
                    </button>
                  </div>
                )}
              </div>

              {/* Course Content Accordion */}
              <div className="bg-surface-white rounded-2xl p-6 md:p-8 shadow-sm border border-border-light">
                <div className="flex flex-wrap justify-between items-end mb-6">
                  <h2 className="text-2xl font-bold text-heading-dark flex items-center gap-2">
                    <FaBookOpen className="text-primary" />
                    محتوى الدورة
                  </h2>
                  <div className="text-sm text-yellow-600">
                    <span>{(course.sections || []).length} أقسام</span> • <span>{(course.sections || []).reduce((acc, sec) => acc + (sec.lessons ? sec.lessons.length : 0), 0)} درس</span> • <span>{duration}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {(course.sections || []).slice(0, visibleSectionsCount).map((section) => (
                    <div key={section.id} className={`border ${expandedSectionId === section.id ? 'border-primary/30' : 'border-border-light'} rounded-xl overflow-hidden bg-background-alt`}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex flex-wrap justify-between items-center p-4 gap-2 transition text-right ${expandedSectionId === section.id ? 'bg-primary/5 hover:bg-primary/10' : 'bg-surface-white hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <FaChevronDown className={`text-heading-dark transform transition-transform duration-300 ${expandedSectionId === section.id ? 'rotate-180' : ''}`} />
                          <span className="font-bold text-lg text-heading-dark">{section.title}</span>
                        </div>
                        <span className="text-sm text-yellow-600">{section.lessons ? section.lessons.length : 0} دروس • {section.duration}</span>
                      </button>

                      {expandedSectionId === section.id && (
                        <div className="p-4 space-y-3 bg-surface-white border-t border-primary/10 animate-fade-in">
                          {section.lessons && section.lessons.map((lesson, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center py-2 gap-2 border-b border-border-light last:border-0 last:pb-0">
                              <div className="flex items-center gap-3 text-heading-dark">
                                {lesson.free_preview ? (
                                  <FaPlayCircle className="text-primary text-sm" />
                                ) : (
                                  <FaLock className="text-gray-400 text-sm" />
                                )}
                                <span className={`text-sm ${lesson.free_preview ? 'hover:underline cursor-pointer' : 'text-gray-500'}`}>
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {lesson.free_preview && (
                                  <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">معاينة مجانية</span>
                                )}
                                <span className="text-xs text-gray-400">{lesson.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}


                </div>

                {visibleSectionsCount < (course.sections || []).length && (
                  <button
                    onClick={handleShowMoreSections}
                    className="w-full mt-6 py-3 border border-border-light text-heading-dark font-bold rounded-xl hover:bg-background-alt transition"
                  >
                    عرض باقي الأقسام ({Math.max(0, (course.sections || []).length - visibleSectionsCount)} متبقي)
                  </button>
                )}
              </div>

            </div>

            {/* Sidebar - Left Column */}
            <div className="lg:col-span-4 relative">
              <div className="sticky top-24 space-y-6">

                {/* Pricing Card */}
                <div className="bg-surface-white rounded-2xl shadow-lg border border-border-light p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-primary to-yellow-600"></div>
                  <div className="flex flex-wrap items-end gap-2 mb-6">
                    {price === 0 ? (
                      <span className="text-4xl font-extrabold text-green-600">مجاناً</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-heading-dark">{price} ج.م</span>
                        <span className="text-lg text-gray-400 line-through mb-1">{originalPrice} ج.م</span>
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mb-2 mr-auto">خصم {discount}%</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-red-500 text-sm mb-6 font-medium animate-pulse">
                    <FaClock className="text-sm" />
                    <span>ينتهي العرض خلال 12 ساعة</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {isEnrolled ? (
                      progressPercentage === 100 ? (
                        <>
                          <div className="w-full bg-green-50 border-2 border-green-300 text-green-700 font-bold py-3 rounded-xl flex justify-center items-center gap-2 text-sm text-center">
                            <span className="material-symbols-outlined text-lg">verified</span>
                            لقد أتممت هذه الدورة بنجاح
                          </div>
                          {userEnrollment?.certificateId ? (
                            <Link to={`/verify/${userEnrollment.certificateId}`} className="w-full bg-accent hover:bg-yellow-500 text-heading-dark font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/30 transform transition active:scale-95 flex justify-center items-center gap-2">
                              <span className="material-symbols-outlined">workspace_premium</span>
                              عرض الشهادة
                            </Link>
                          ) : (
                            <button onClick={generateCertificateAndView} className="w-full bg-accent hover:bg-yellow-500 text-heading-dark font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/30 transform transition active:scale-95 flex justify-center items-center gap-2">
                              <span className="material-symbols-outlined">workspace_premium</span>
                              إصدار الشهادة
                            </button>
                          )}
                          <Link to={`/courses/${course.id}/play`} className="w-full bg-gray-100 hover:bg-gray-200 text-heading-dark font-bold py-3 rounded-xl mt-2 flex justify-center items-center gap-2">
                            <FaPlayCircle />
                            مراجعة الدورة / المحتوى
                          </Link>
                        </>
                      ) : progressPercentage > 0 ? (
                        <Link to={`/courses/${course.id}/play`} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/30 transform transition active:scale-95 flex justify-center items-center gap-2">
                          <FaPlayCircle />
                          متابعة التعلم ({progressPercentage}%)
                        </Link>
                      ) : (
                        <Link to={`/courses/${course.id}/play`} className="w-full bg-primary hover:bg-accent text-heading-dark font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transform transition active:scale-95 flex justify-center items-center gap-2">
                          <FaPlayCircle />
                          ابدأ التعلم الآن
                        </Link>
                      )
                    ) : price === 0 ? (
                      <button
                        onClick={handleEnrollFree}
                        disabled={enrolling}
                        className="w-full bg-primary hover:bg-accent text-heading-dark font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transform transition active:scale-95 flex justify-center items-center gap-2"
                      >
                        <FaPlayCircle />
                        {enrolling ? 'جاري التسجيل...' : 'ابدأ التعلم الآن (مجاناً)'}
                      </button>
                    ) : orderStatus === 'pending' ? (
                      <div className="w-full bg-yellow-50 border-2 border-yellow-300 text-yellow-700 font-bold py-4 rounded-xl flex justify-center items-center gap-2">
                        <FaClock className="text-lg" />
                        قيد المراجعة — سيتم تفعيل الدورة بعد موافقة الإدارة
                      </div>
                    ) : orderStatus === 'rejected' ? (
                      <>
                        <div className="w-full bg-red-50 border-2 border-red-300 text-red-600 font-bold py-3 rounded-xl flex justify-center items-center gap-2 mb-2">
                          <FaLock className="text-sm" />
                          تم رفض الطلب السابق
                        </div>
                        <Link to={`/checkout/payment?id=${course.id}&type=course`} className="w-full bg-primary hover:bg-accent text-heading-dark font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transform transition active:scale-95 flex justify-center items-center gap-2">
                          <FaShoppingBag />
                          إعادة الشراء
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to={`/checkout/payment?id=${course.id}&type=course`} className="w-full bg-primary hover:bg-accent text-heading-dark font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transform transition active:scale-95 flex justify-center items-center gap-2">
                          <FaShoppingBag />
                          اشترِ الآن
                        </Link>
                        <button className="w-full bg-transparent border-2 border-heading-dark text-heading-dark hover:bg-background-alt font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                          <FaCartPlus />
                          أضف للسلة
                        </button>
                      </>
                    )}
                  </div>

                  <div className="text-center text-xs text-gray-400 mb-4">
                    ضمان استرداد الأموال لمدة 30 يومًا
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favLoading}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 mb-6 ${isFavorite
                      ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                      : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400 hover:bg-red-50/50'
                      }`}
                  >
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                    {isFavorite ? 'في المفضلة' : 'أضف للمفضلة'}
                  </button>

                  <div className="border-t border-border-light pt-4 space-y-3">
                    <h3 className="font-bold text-heading-dark mb-2">تشمل هذه الدورة:</h3>
                    {[
                      { icon: FaInfinity, text: "وصول مدى الحياة" },
                      { icon: FaMobileAlt, text: "دخول من الجوال والحاسوب" },
                      { icon: FaClipboardList, text: "واجبات وتطبيقات عملية" },
                      { icon: FaCloudDownloadAlt, text: "موارد قابلة للتحميل" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-yellow-700">
                        <item.icon className="text-primary text-base" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Roadmaps Sections */}
                {relatedRoadmaps.map((roadmap) => {
                  const rPrice = roadmap.pricing?.price || roadmap.price;
                  const rDuration = roadmap.meta?.duration || roadmap.duration;

                  return (
                    <div key={roadmap.id} className="bg-gradient-to-br from-heading-dark to-gray-900 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden group">
                      <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition"></div>
                      <div className="absolute bottom-0 right-0 w-40 h-40 bg-black/10 rounded-full blur-xl"></div>

                      <div className="relative z-10">
                        <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold mb-4 backdrop-blur-sm border border-white/10">
                          مسار تعليمي متكامل
                        </div>
                        <h3 className="text-xl font-bold mb-2">هذه الدورة جزء من مسار:</h3>
                        <p className="text-2xl font-extrabold text-primary mb-4">{roadmap.title}</p>

                        <div className="flex items-center justify-between mb-4 bg-black/20 p-3 rounded-lg">
                          <span className="text-sm text-gray-300">قيمة المسار ({rDuration}):</span>
                          <div>
                            <span className="text-lg font-bold">{rPrice} ج.م</span>
                          </div>
                        </div>

                        <Link
                          to={`/roadmaps/${roadmap.id}`}
                          className="w-full bg-white text-heading-dark font-bold py-3 rounded-xl hover:bg-gray-100 transition shadow-lg flex items-center justify-center gap-2"
                        >
                          <span>عرض تفاصيل المسار</span>
                          <FaArrowLeft className="text-sm" />
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {/* Instructor Mini Profile */}
                <div className="bg-surface-white rounded-2xl p-6 border border-border-light text-center">
                  <ImageWithFallback
                    alt={course.instructor.name}
                    className="h-20 w-20 rounded-full border-4 border-background-alt shadow-md object-cover mx-auto mb-3 -mt-10 bg-white"
                    src={course.instructor.image}
                    fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&background=random`}
                  />
                  <h4 className="font-bold text-lg text-heading-dark">{course.instructor.name}</h4>
                  <p className="text-sm text-yellow-600 mb-4">{course.instructor.title}</p>
                  <p className="text-sm text-yellow-700 mb-4 line-clamp-3">
                    {course.instructor.bio}
                  </p>
                  <button className="text-primary font-bold text-sm hover:underline">عرض الملف الشخصي</button>
                </div>

              </div>
            </div>

          </div>

          <FAQ />

        </main>
      </div>
    </>
  );
};

export default CourseDetails;
