import { COLLECTIONS } from '../../constants';
import { db } from '../firebase';
import { logger } from '../../utils/logger';

const CACHE_TTL = 1000 * 60 * 2; // 2 minutes
const enrollmentCache = new Map();
const roadmapEnrollmentCache = new Map();

const clearEnrollmentCache = (userId) => {
  enrollmentCache.delete(userId);
  roadmapEnrollmentCache.delete(userId);
};
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

export const enrollmentService = {
  /**
   * Enroll a user in a course
   * @param {string} userId - ID of the user
   * @param {string} courseId - ID of the course
   */
  enrollUser: async (userId, courseId) => {
    try {
      const enrollmentRef = doc(db, COLLECTIONS.USERS, userId, 'enrollments', courseId);

      const enrollmentData = {
        itemType: 'course',
        courseId,
        accessType: 'purchase',
        status: 'active',
        approvedAt: serverTimestamp(),
        progressPercent: 0,
        lastLessonId: null,
        lastPositionSeconds: 0,
        completedAt: null,
        certificateId: null,
        // Legacy fields for backward compatibility during transition
        enrolledAt: serverTimestamp(),
        lastAccessAt: serverTimestamp(),
        progressPercentage: 0,
        isCompleted: false
      };

      await setDoc(enrollmentRef, enrollmentData);
      clearEnrollmentCache(userId);
      return true;
    } catch (error) {
      logger.error('Error enrolling user in course:', error);
      throw error;
    }
  },

  /**
   * Enroll a user in a roadmap
   */
  enrollRoadmap: async (userId, roadmapId) => {
    try {
      const enrollmentRef = doc(db, COLLECTIONS.USERS, userId, 'roadmapEnrollments', roadmapId);

      const enrollmentData = {
        itemType: 'roadmap',
        roadmapId,
        accessType: 'purchase',
        status: 'active',
        approvedAt: serverTimestamp(),
        progressPercent: 0
      };

      await setDoc(enrollmentRef, enrollmentData);
      clearEnrollmentCache(userId);
      return true;
    } catch (error) {
      logger.error('Error enrolling user in roadmap:', error);
      throw error;
    }
  },

  /**
   * Check if a user is enrolled in a specific roadmap
   */
  checkRoadmapEnrollment: async (userId, roadmapId) => {
    if (!userId || !roadmapId) return false;
    try {
      const enrollmentRef = doc(db, COLLECTIONS.USERS, userId, 'roadmapEnrollments', roadmapId);
      const enrollmentSnap = await getDoc(enrollmentRef);
      return enrollmentSnap.exists();
    } catch (error) {
      logger.error('Error checking roadmap enrollment status:', error);
      return false;
    }
  },

  /**
   * Check if a user is enrolled in a specific course
   */
  checkEnrollmentStatus: async (userId, courseId) => {
    if (!userId || !courseId) return false;
    try {
      const enrollmentRef = doc(db, COLLECTIONS.USERS, userId, 'enrollments', courseId);
      const enrollmentSnap = await getDoc(enrollmentRef);
      return enrollmentSnap.exists();
    } catch (error) {
      logger.error('Error checking enrollment status:', error);
      return false;
    }
  },

  /**
   * Get all enrollments for a specific user
   */
  getUserEnrollments: async (userId) => {
    if (!userId) return [];

    const now = Date.now();
    const cacheEntry = enrollmentCache.get(userId);
    if (cacheEntry && now - cacheEntry.timestamp < CACHE_TTL) {
      return cacheEntry.data;
    }

    try {
      const enrollmentsRef = collection(db, COLLECTIONS.USERS, userId, 'enrollments');
      const snapshot = await getDocs(enrollmentsRef);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      enrollmentCache.set(userId, { data, timestamp: now });
      return data;
    } catch (error) {
      logger.error('Error getting user enrollments:', error);
      throw error;
    }
  },

  /**
   * Get all roadmap enrollments for a user
   */
  getUserRoadmapEnrollments: async (userId) => {
    if (!userId) return [];

    const now = Date.now();
    const cacheEntry = roadmapEnrollmentCache.get(userId);
    if (cacheEntry && now - cacheEntry.timestamp < CACHE_TTL) {
      return cacheEntry.data;
    }

    try {
      const enrollmentsRef = collection(db, COLLECTIONS.USERS, userId, 'roadmapEnrollments');
      const snapshot = await getDocs(enrollmentsRef);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      roadmapEnrollmentCache.set(userId, { data, timestamp: now });
      return data;
    } catch (error) {
      logger.error('Error getting user roadmap enrollments:', error);
      return [];
    }
  },

  /**
   * Get ongoing/enrolled courses with their details
   */
  getOngoingCourses: async (userId) => {
    try {
      const enrollments = await enrollmentService.getUserEnrollments(userId);
      const { courseService } = await import('./courseService');

      const fullCourses = await Promise.all(
        enrollments.map(async (enr) => {
          const courseDetails = await courseService.getCourseById(enr.courseId);
          return {
            ...courseDetails,
            enrollment: enr
          };
        })
      );

      // Filter out deleted courses
      return fullCourses.filter(c => c.id).map(c => ({ ...c, itemType: 'course' }));
    } catch (error) {
      logger.error('Error getting ongoing courses:', error);
      throw error;
    }
  },

  /**
   * Get ongoing/enrolled roadmaps with their details
   */
  getOngoingRoadmaps: async (userId) => {
    try {
      const enrollments = await enrollmentService.getUserRoadmapEnrollments(userId);
      const { roadmapService } = await import('./roadmapService');

      const fullRoadmaps = await Promise.all(
        enrollments.map(async (enr) => {
          const roadmapDetails = await roadmapService.getRoadmapBySlug(enr.roadmapId) || await roadmapService.getRoadmapById(enr.roadmapId);
          return {
            ...roadmapDetails,
            enrollment: enr,
            itemType: 'roadmap'
          };
        })
      );

      return fullRoadmaps.filter(r => r.id);
    } catch (error) {
      logger.error('Error getting ongoing roadmaps:', error);
      return [];
    }
  },

  /**
   * Update progress for a specific enrollment
   */
  updateEnrollmentProgress: async (userId, courseId, progressPercentage, isCompleted = false, lastLessonId = null) => {
    try {
      const enrollmentRef = doc(db, COLLECTIONS.USERS, userId, 'enrollments', courseId);
      const updateData = {
        progressPercentage,
        isCompleted,
        lastAccessAt: serverTimestamp()
      };
      if (lastLessonId) {
        updateData.lastLessonId = lastLessonId;
      }
      await updateDoc(enrollmentRef, updateData);
      clearEnrollmentCache(userId);
    } catch (error) {
      logger.error('Error updating enrollment progress:', error);
      throw error;
    }
  },

  /**
   * Update the certificate ID for a specific enrollment
   */
  updateEnrollmentCertificate: async (userId, courseId, certificateId) => {
    try {
      const enrollmentRef = doc(db, COLLECTIONS.USERS, userId, 'enrollments', courseId);
      await updateDoc(enrollmentRef, {
        certificateId,
        isCompleted: true,
        progressPercentage: 100,
        completedAt: serverTimestamp()
      });
      clearEnrollmentCache(userId);
    } catch (error) {
      logger.error('Error updating enrollment certificate:', error);
      throw error;
    }
  },

  /**
   * Update the last accessed timestamp (e.g. when opening a lesson)
   */
  updateLastAccess: async (userId, courseId) => {
    try {
      const enrollmentRef = doc(db, COLLECTIONS.USERS, userId, 'enrollments', courseId);
      await updateDoc(enrollmentRef, {
        lastAccessAt: serverTimestamp()
      });
      clearEnrollmentCache(userId);
    } catch (error) {
      logger.error('Error updating last access:', error);
    }
  }
};
