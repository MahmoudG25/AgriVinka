import { useState, useEffect, useMemo, useRef } from 'react';
import { enrollmentService } from '../services/firestore/enrollmentService';

const DASHBOARD_CACHE_TTL = 1000 * 60 * 2; // 2 minutes
const dashboardCache = new Map();

import { orderService } from '../services/firestore/orderService';
import { favoritesService } from '../services/firestore/favoritesService';
import { aiDiagnosisService } from '../services/firestore/aiDiagnosisService';
import { certificateService } from '../services/certificateService';
import { db } from '../services/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { logger } from '../utils/logger';

/**
 * Single hook to fetch ALL dashboard data in parallel.
 * Returns memoized stats and structured data for each section.
 */
export const useDashboardData = (uid) => {
  const [courses, setCourses] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [aiScans, setAiScans] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeRequestRef = useRef(null);

  useEffect(() => {
    if (!uid) {
      setCourses([]);
      setPendingOrders([]);
      setRejectedOrders([]);
      setFavorites([]);
      setAiScans([]);
      setCertificates([]);
      setLoading(false);
      return;
    }

    // Serve from short in-memory cache when available
    const cached = dashboardCache.get(uid);
    if (cached && Date.now() - cached.timestamp < DASHBOARD_CACHE_TTL) {
      setCourses(cached.data.courses || []);
      setPendingOrders(cached.data.pendingOrders || []);
      setRejectedOrders(cached.data.rejectedOrders || []);
      setFavorites(cached.data.favorites || []);
      setAiScans(cached.data.aiScans || []);
      setCertificates(cached.data.certificates || []);
      setLoading(false);
      return;
    }

    const requestId = Symbol('dashboardRequest');
    activeRequestRef.current = requestId;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [
          coursesData,
          roadmapsData,
          ordersData,
          favsData,
          scansData,
          certsData,
          trainingData,
        ] = await Promise.allSettled([
          enrollmentService.getOngoingCourses(uid),
          enrollmentService.getOngoingRoadmaps(uid),
          orderService.getUserOrders(uid),
          favoritesService.getUserFavorites(uid),
          aiDiagnosisService.getUserScans(uid),
          certificateService.getUserCertificates(uid),
          getDocs(query(collection(db, `users/${uid}/trainingApplications`)))
        ]);

        let combinedCourses = [];

        if (coursesData.status === 'fulfilled') {
          combinedCourses = [...coursesData.value];
        } else {
          logger.error('Failed to fetch courses', coursesData.reason);
        }

        if (roadmapsData.status === 'fulfilled') {
          combinedCourses = [...combinedCourses, ...roadmapsData.value];
        } else {
          logger.error('Failed to fetch roadmaps', roadmapsData.reason);
        }

        const sorted = combinedCourses.sort((a, b) => {
          const timeA = a.enrollment.lastAccessAt?.seconds || 0;
          const timeB = b.enrollment.lastAccessAt?.seconds || 0;
          return timeB - timeA;
        });

        let newPendingOrders = [];
        let newRejectedOrders = [];

        if (ordersData.status === 'fulfilled') {
          newPendingOrders = ordersData.value.filter(o => o.status === 'pending');
          newRejectedOrders = ordersData.value.filter(o => o.status === 'rejected');
        } else {
          logger.error('Failed to fetch orders', ordersData.reason);
        }

        if (trainingData?.status === 'fulfilled') {
          const trainings = trainingData.value.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const pendingTrainings = trainings.filter(t => ['pending', 'in_review'].includes(t.status)).map(t => ({
            ...t,
            productTitle: t.trainingTitle,
            itemType: 'training',
            totalAmount: 'مجاني'
          }));
          const rejectedTrainings = trainings.filter(t => t.status === 'rejected').map(t => ({
            ...t,
            productTitle: t.trainingTitle,
            itemType: 'training',
            totalAmount: 'مجاني'
          }));

          newPendingOrders = [...newPendingOrders, ...pendingTrainings];
          newRejectedOrders = [...newRejectedOrders, ...rejectedTrainings];
        }

        const newFavorites = favsData.status === 'fulfilled' ? favsData.value : [];
        if (favsData.status !== 'fulfilled') logger.error('Failed to fetch favorites', favsData.reason);

        const newAiScans = scansData.status === 'fulfilled' ? scansData.value.items || [] : [];
        if (scansData.status !== 'fulfilled') logger.error('Failed to fetch AI scans', scansData.reason);

        const newCertificates = certsData.status === 'fulfilled' ? certsData.value : [];
        if (certsData.status !== 'fulfilled') logger.error('Failed to fetch certificates', certsData.reason);

        if (activeRequestRef.current !== requestId) return;

        setCourses(sorted);
        setPendingOrders(newPendingOrders);
        setRejectedOrders(newRejectedOrders);
        setFavorites(newFavorites);
        setAiScans(newAiScans);
        setCertificates(newCertificates);

        // Cache dashboard data for short-term reuse
        dashboardCache.set(uid, {
          data: {
            courses: sorted,
            pendingOrders: newPendingOrders,
            rejectedOrders: newRejectedOrders,
            favorites: newFavorites,
            aiScans: newAiScans,
            certificates: newCertificates,
          },
          timestamp: Date.now()
        });
      } catch (error) {
        logger.error('Dashboard data fetch error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    return () => {
      if (activeRequestRef.current === requestId) {
        activeRequestRef.current = null;
      }
    };
  }, [uid]);

  // Memoized stats
  const stats = useMemo(() => {
    const inProgress = courses.filter(c => !c.enrollment.isCompleted);
    const completed = courses.filter(c => c.enrollment.isCompleted);

    let totalHours = 0;
    courses.forEach(c => {
       const progress = (c.enrollment?.progressPercentage || 0) / 100;
       let courseHours = 0;
       const durationStr = c.meta?.duration;
       if (durationStr) {
          const match = String(durationStr).match(/(\d+)/);
          if (match) {
            courseHours = parseInt(match[1], 10);
            // If it seems to be in minutes
            if (String(durationStr).includes('دقيقة') || String(durationStr).includes('min') || courseHours > 50) {
              courseHours = courseHours / 60;
            }
          }
       }
       if (courseHours === 0) courseHours = 2.5; // fallback default
       totalHours += (courseHours * progress);
    });

    return {
      enrolled: courses.length,
      inProgress: inProgress.length,
      completed: completed.length,
      favorites: favorites.length,
      learningHours: Math.round(totalHours),
    };
  }, [courses, favorites]);

  // The most recently accessed in-progress course
  const continueItem = useMemo(() => {
    return courses.find(c => !c.enrollment.isCompleted) || null;
  }, [courses]);

  // Make Recent Activities list from user data
  const recentActivities = useMemo(() => {
    let activities = [];

    // Course Enrollments & Progress
    courses.forEach(c => {
      if (c.enrollment?.enrolledAt) {
        activities.push({
          id: `enroll-${c.id}`,
          title: 'اشتركت في دورة جديد',
          subtitle: `${c.title}`,
          icon: 'add_circle',
          color: 'text-blue-500',
          bg: 'bg-blue-50',
          timestamp: c.enrollment.enrolledAt.seconds || 0
        });
      }
      if (c.enrollment?.isCompleted) {
        activities.push({
          id: `complete-${c.id}`,
          title: 'أتممت دورة بنجاح',
          subtitle: `${c.title}`,
          icon: 'task_alt',
          color: 'text-green-600',
          bg: 'bg-green-50',
          timestamp: c.enrollment.completedAt?.seconds || c.enrollment.lastAccessAt?.seconds || c.enrollment.enrolledAt?.seconds || 0
        });
      } else if (c.enrollment?.lastAccessAt && c.enrollment?.progressPercentage > 0) {
        activities.push({
          id: `access-${c.id}`,
          title: 'تابعت التعلم',
          subtitle: `${c.title}`,
          icon: 'play_arrow',
          color: 'text-green-500',
          bg: 'bg-green-50',
          timestamp: c.enrollment.lastAccessAt.seconds || 0
        });
      }
    });

    // Certificates
    certificates.forEach(cert => {
      activities.push({
        id: `cert-${cert.id}`,
        title: 'حصلت على شهادة/وسام',
        subtitle: cert.courseName || cert.courseTitle || 'شهادة إتمام',
        icon: 'workspace_premium',
        color: 'text-purple-500',
        bg: 'bg-purple-50',
        timestamp: cert.issuedAt?.seconds || cert.issueDate?.seconds || 0
      });
    });

    // Pending Orders & Training Applications
    pendingOrders.forEach(order => {
      const isTraining = order.itemType === 'training';
      activities.push({
        id: `pend-order-${order.id}`,
        title: isTraining ? 'تقديم على تدريب عملي' : 'طلب شراء قيد المراجعة',
        subtitle: order.productTitle || order.items?.[0]?.title || 'طلب',
        icon: isTraining ? 'work' : 'hourglass_top',
        color: isTraining ? 'text-blue-600' : 'text-yellow-600',
        bg: isTraining ? 'bg-blue-50' : 'bg-yellow-50',
        timestamp: order.createdAt?.seconds || 0
      });
    });

    // Sort descending by timestamp
    activities.sort((a, b) => b.timestamp - a.timestamp);

    // Format relative time (optional) or just return the items
    // If we want string relative time we could do it in the component, but here they just want real data
    return activities.slice(0, 20).map(act => ({
       ...act,
       subtitle: new Date(act.timestamp * 1000).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }) + ' • ' + act.subtitle
    }));
  }, [courses, certificates, pendingOrders]);

  return {
    courses,
    pendingOrders,
    rejectedOrders,
    favorites,
    aiScans,
    certificates,
    stats,
    continueItem,
    recentActivities,
    loading,
  };
};
