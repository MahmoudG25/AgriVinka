import React, { useState, useEffect, useMemo } from 'react';
import SEOHead from '../../components/common/SEOHead';
import { useParams } from 'react-router-dom';
import { ROADMAP_CONFIGS } from '../../data/roadmapConfigs';
import { roadmapService } from '../../services/roadmapService';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import { adaptPathData } from './utils/pathAdapter';

// Components
import HeroSection from './components/HeroSection';
import Sidebar from './components/Sidebar';
import PathContent from './components/PathContent';
import PathBreadcrumbs from './components/PathBreadcrumbs';
import FAQ from '../../components/home/FAQ';

// Skeletons
import HeroSkeleton from '../../components/skeletons/HeroSkeleton';
import SidebarSkeleton from '../../components/skeletons/SidebarSkeleton';
import AccordionSkeleton from '../../components/skeletons/AccordionSkeleton'; // Using for content area as placeholder

const PathDetailsPage = () => {
  const { id } = useParams(); // id is actually the slug
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roadmapConfig, setRoadmapConfig] = useState(null);
  const [courses, setCourses] = useState([]);
  const [userProgressMap, setUserProgressMap] = useState({}); // { courseId: progressPercentage }
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ── 1. Resolve roadmap config ──
        // Priority: frontend config → Firebase
        let config = null;

        if (ROADMAP_CONFIGS[id]) {
          // Hardcoded frontend config
          config = { ...ROADMAP_CONFIGS[id] };
        } else {
          // Fetch from Firebase 'roadmaps' collection via slug
          const firebaseRoadmap = await roadmapService.getRoadmapBySlug(id);
          if (firebaseRoadmap) {
            // Normalize Firebase doc
            config = {
              id: firebaseRoadmap.id,
              title: firebaseRoadmap.title || '',
              description: firebaseRoadmap.description || '',
              price: firebaseRoadmap.price || null,
              discount: firebaseRoadmap.discount || 0,
              level: firebaseRoadmap.level || '',
              instructor: firebaseRoadmap.instructor || null,
              seo: firebaseRoadmap.seo,
              // Derive courseIds
              courseIds: firebaseRoadmap.courseIds
                || (firebaseRoadmap.modules || [])
                  .map(m => typeof m === 'string' ? m : m.courseId)
                  .filter(Boolean)
            };
          }
        }

        if (!config || !config.courseIds || config.courseIds.length === 0) {
          setError('هذا المسار غير موجود');
          return;
        }

        setRoadmapConfig(config);

        // ── 2. Fetch courses by IDs (preserving order) ──
        const coursePromises = config.courseIds.map(async (courseId) => {
          try {
            return await courseService.getCourseById(courseId);
          } catch (err) {
            logger.warn(`Failed to fetch course: ${courseId}`, err);
            return null;
          }
        });

        const results = await Promise.all(coursePromises);
        setCourses(results.filter(Boolean));

        // ── 3. Fetch User Progress & Status ──
        if (currentUser?.uid && config.id) {
          // Check Roadmap Enrollment
          const enrolled = await enrollmentService.checkRoadmapEnrollment(currentUser.uid, config.id);
          setIsEnrolled(enrolled);

          // Check Roadmap Order Status
          const existingOrder = await orderService.checkExistingOrder(currentUser.uid, config.id);
          if (existingOrder) {
            setOrderStatus(existingOrder.status);
          } else {
            const allOrders = await orderService.getUserOrders(currentUser.uid);
            const rejected = allOrders.find(o => o.itemId === config.id && o.status === 'rejected');
            if (rejected) setOrderStatus('rejected');
          }

          // Fetch Course Progress for Roadmap Content
          if (config.courseIds.length > 0) {
            const enrollments = await enrollmentService.getUserEnrollments(currentUser.uid);
            const progressMap = {};
            enrollments.forEach(enr => {
              progressMap[enr.courseId] = enr.progressPercent || enr.progressPercentage || 0;
            });
            setUserProgressMap(progressMap);
          }
        }

      } catch (err) {
        logger.error('Error loading roadmap:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 3. Compose normalized UI model
  const normalizedData = useMemo(
    () => adaptPathData(roadmapConfig, courses),
    [roadmapConfig, courses]
  );

  const nextCourseId = useMemo(() => {
    if (!courses || courses.length === 0) return null;
    if (!userProgressMap) return courses[0].id;

    // Find first course that is not 100% complete
    for (const course of courses) {
      if (userProgressMap[course.id] !== 100) {
        return course.id;
      }
    }
    return courses[0].id; // Fallback if all completed
  }, [courses, userProgressMap]);

  // 4. Structured Data (JSON-LD)
  const roadmapSchema = useMemo(() => {
    if (!roadmapConfig || !courses.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": roadmapConfig.title,
      "description": roadmapConfig.description,
      "itemListElement": courses.map((course, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "Course",
          "url": `https://namaa-academy.com/courses/${course.id}`,
          "name": course.title,
          "description": course.description
        }
      }))
    };
  }, [roadmapConfig, courses]);

  if (loading) {
    return (
      <div className="bg-[#fcfdfd] min-h-screen pt-8 pb-16 ">
        <div className="container-layout">
          {/* Breadcrumb Skeleton */}
          <div className="h-4 w-48 bg-gray-200 rounded mb-8 animate-pulse"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Right Column: Hero + Content (8 cols) */}
            <div className="lg:col-span-8">
              <HeroSkeleton />
              <div className="mt-12 space-y-8">
                <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                <AccordionSkeleton />
              </div>
            </div>

            {/* Left Column: Sticky Sidebar (4 cols) */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-4">
                <SidebarSkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !roadmapConfig) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 text-lg font-medium">
        {error || 'المسار غير موجود'}
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={roadmapConfig?.seo?.metaTitle || `${roadmapConfig?.title || 'مسار برمجة'} | AgriVinka`}
        description={roadmapConfig?.seo?.metaDescription || roadmapConfig?.description || 'تعلم من خلال مسار برمجة منظم ومتكامل'}
        canonical={window.location.href}
        keywords={roadmapConfig?.seo?.keywords || `${roadmapConfig?.title}, مسار, برمجة, تعلم`}
        structuredData={roadmapSchema}
      />
      <div className="bg-[#fcfdfd] min-h-screen pt-8 pb-16" dir="rtl">
        <div className="container-layout">
          {/* 1. Breadcrumbs */}
          <PathBreadcrumbs title={normalizedData.meta.title} />

          {/* 2. Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Right Column: Hero + Content (8 cols) */}
            <div className="lg:col-span-8">
              <HeroSection data={normalizedData.hero} meta={normalizedData.meta} />
              <div className="mt-12">
                <PathContent data={normalizedData} userProgressMap={userProgressMap} />
              </div>
            </div>

            {/* Left Column: Sticky Sidebar (4 cols) */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-4">
                <Sidebar
                  data={normalizedData.sidebar}
                  roadmapId={roadmapConfig.id}
                  isEnrolled={isEnrolled}
                  orderStatus={orderStatus}
                  nextCourseId={nextCourseId}
                />
              </div>
            </div>

          </div>
        </div>

        <FAQ />

      </div>
    </>
  );
};

export default PathDetailsPage;
