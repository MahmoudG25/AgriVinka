import { COLLECTIONS } from '../../constants';
import { db } from '../firebase';
import { logger } from '../../utils/logger';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

export const lessonProgressService = {
  /**
   * Mark a specific lesson as completed for a user in a course
   */
  markLessonCompleted: async (userId, courseId, lessonId, watchedSeconds = 0) => {
    try {
      const progressRef = doc(db, COLLECTIONS.USERS, userId,
        'enrollments', courseId,
        'lessonProgress', lessonId
      );

      await setDoc(progressRef, {
        lessonId,
        completed: true,
        watchedSeconds,
        lastUpdatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      logger.error('Error marking lesson as completed:', error);
      throw error;
    }
  },

  /**
   * Unmark a lesson (e.g., if user wants to review it again)
   */
  unmarkLesson: async (userId, courseId, lessonId) => {
    try {
      const progressRef = doc(db, COLLECTIONS.USERS, userId,
        'enrollments', courseId,
        'lessonProgress', lessonId
      );

      await deleteDoc(progressRef);
      return true;
    } catch (error) {
      logger.error('Error unmarking lesson:', error);
      throw error;
    }
  },

  /**
   * Get all completed lessons for a specific course enrollment
   * Returns an array of completed lesson IDs
   */
  getCompletedLessons: async (userId, courseId) => {
    try {
      const progressCollection = collection(db, COLLECTIONS.USERS, userId,
        'enrollments', courseId,
        'lessonProgress'
      );

      const snapshot = await getDocs(progressCollection);
      return snapshot.docs.filter(doc => doc.data().completed).map(doc => doc.id);
    } catch (error) {
      logger.error('Error getting completed lessons:', error);
      return [];
    }
  }
};
