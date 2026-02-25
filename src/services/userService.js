import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { logger } from '../utils/logger';

export const userService = {
  /**
   * Get a user's profile by UID
   * @param {string} uid 
   * @returns {Promise<Object|null>}
   */
  async getProfile(uid) {
    if (!uid) return null;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Create a new user profile in Firestore
   * @param {string} uid 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createProfile(uid, data) {
    if (!uid) throw new Error('UID is required');
    try {
      const docRef = doc(db, 'users', uid);

      const newProfile = {
        displayName: data.displayName || '',
        email: data.email || '',
        photoURL: data.photoURL || '',
        role: data.role || 'student', // student | admin | editor
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: { language: 'ar', theme: 'light' },
        subscriptionStatus: 'none',
        purchasedCourses: []
      };

      await setDoc(docRef, newProfile);
      return { id: uid, ...newProfile };
    } catch (error) {
      logger.error('Error creating user profile:', error);
      throw error;
    }
  },

  /**
   * Update an existing user profile
   * @param {string} uid 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateProfile(uid, data) {
    if (!uid) throw new Error('UID is required');
    try {
      const docRef = doc(db, 'users', uid);
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      await updateDoc(docRef, updateData);
      return updateData;
    } catch (error) {
      logger.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Update strictly the last login timestamp
   * @param {string} uid 
   */
  async updateLastLogin(uid) {
    if (!uid) return;
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, { lastLoginAt: new Date() });
    } catch (error) {
      logger.error('Error updating last login:', error);
      // Suppress error since this is purely tracking
    }
  },

  /**
   * Get all users (Admin only)
   * @returns {Promise<Array>}
   */
  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      logger.error('Error fetching all users:', error);
      // Fallback without orderBy if index is missing
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  /**
   * Update a user's role (Admin only)
   * @param {string} uid 
   * @param {string} role - 'student' | 'admin' | 'editor'
   */
  async updateUserRole(uid, role) {
    if (!uid) throw new Error('UID is required');
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, { role, updatedAt: new Date() });
    } catch (error) {
      logger.error('Error updating user role:', error);
      throw error;
    }
  }
};
