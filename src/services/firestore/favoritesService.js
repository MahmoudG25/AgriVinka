import { COLLECTIONS } from '../../constants';
import { db } from '../firebase';
import { logger } from '../../utils/logger';
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp
} from 'firebase/firestore';

export const favoritesService = {
  /**
   * Toggle a course in/out of favorites
   * @returns {boolean} true if added, false if removed
   */
  toggleFavorite: async (userId, courseId) => {
    if (!userId || !courseId) return false;
    try {
      const favRef = doc(db, COLLECTIONS.USERS, userId, 'favorites', courseId);
      const snap = await getDoc(favRef);

      if (snap.exists()) {
        await deleteDoc(favRef);
        return false; // Removed
      } else {
        await setDoc(favRef, {
          courseId,
          addedAt: serverTimestamp()
        });
        return true; // Added
      }
    } catch (error) {
      logger.error('Error toggling favorite:', error);
      throw error;
    }
  },

  /**
   * Check if a course is favorited by a user
   */
  isFavorite: async (userId, courseId) => {
    if (!userId || !courseId) return false;
    try {
      const favRef = doc(db, COLLECTIONS.USERS, userId, 'favorites', courseId);
      const snap = await getDoc(favRef);
      return snap.exists();
    } catch (error) {
      logger.error('Error checking favorite:', error);
      return false;
    }
  },

  /**
   * Get all favorites for a user with full course data
   */
  getUserFavorites: async (userId) => {
    if (!userId) return [];
    try {
      const favsRef = collection(db, COLLECTIONS.USERS, userId, 'favorites');
      const snapshot = await getDocs(favsRef);
      const favorites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch full course data for each favorite
      const { courseService } = await import('./courseService');
      const courses = await Promise.all(
        favorites.map(async (fav) => {
          try {
            const course = await courseService.getCourseById(fav.courseId);
            return course ? { ...course, favoritedAt: fav.addedAt } : null;
          } catch {
            return null;
          }
        })
      );

      return courses.filter(Boolean);
    } catch (error) {
      logger.error('Error fetching user favorites:', error);
      return [];
    }
  }
};
