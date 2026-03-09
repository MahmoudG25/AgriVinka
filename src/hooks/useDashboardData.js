import { useState, useEffect, useMemo } from 'react';
import { enrollmentService } from '../services/firestore/enrollmentService';
import { orderService } from '../services/firestore/orderService';
import { favoritesService } from '../services/firestore/favoritesService';
import { aiDiagnosisService } from '../services/firestore/aiDiagnosisService';
import { certificateService } from '../services/certificateService';
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

  useEffect(() => {
    if (!uid) return;

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
        ] = await Promise.allSettled([
          enrollmentService.getOngoingCourses(uid),
          enrollmentService.getOngoingRoadmaps(uid),
          orderService.getUserOrders(uid),
          favoritesService.getUserFavorites(uid),
          aiDiagnosisService.getUserScans(uid),
          certificateService.getUserCertificates(uid),
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
        setCourses(sorted);

        if (ordersData.status === 'fulfilled') {
          setPendingOrders(ordersData.value.filter(o => o.status === 'pending'));
          setRejectedOrders(ordersData.value.filter(o => o.status === 'rejected'));
        } else {
          logger.error('Failed to fetch orders', ordersData.reason);
        }

        if (favsData.status === 'fulfilled') {
          setFavorites(favsData.value);
        } else {
          logger.error('Failed to fetch favorites', favsData.reason);
        }

        if (scansData.status === 'fulfilled') {
          setAiScans(scansData.value.items || []);
        } else {
          logger.error('Failed to fetch AI scans', scansData.reason);
        }

        if (certsData.status === 'fulfilled') {
          setCertificates(certsData.value);
        } else {
          logger.error('Failed to fetch certificates', certsData.reason);
        }
      } catch (error) {
        logger.error('Dashboard data fetch error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [uid]);

  // Memoized stats
  const stats = useMemo(() => {
    const inProgress = courses.filter(c => !c.enrollment.isCompleted);
    const completed = courses.filter(c => c.enrollment.isCompleted);
    return {
      enrolled: courses.length,
      inProgress: inProgress.length,
      completed: completed.length,
      favorites: favorites.length,
    };
  }, [courses, favorites]);

  // The most recently accessed in-progress course
  const continueItem = useMemo(() => {
    return courses.find(c => !c.enrollment.isCompleted) || null;
  }, [courses]);

  return {
    courses,
    pendingOrders,
    rejectedOrders,
    favorites,
    aiScans,
    certificates,
    stats,
    continueItem,
    loading,
  };
};
