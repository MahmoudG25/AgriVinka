import { db } from '../firebase/config';
import { logger } from '../utils/logger';
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  addDoc,
  query,
  where,
  limit,
  serverTimestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'roadmaps';

export const roadmapService = {
  getAllRoadmaps: async () => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error('Error fetching roadmaps:', error);
      throw error;
    }
  },

  getRoadmapById: async (id) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      logger.error('Error fetching roadmap:', error);
      throw error;
    }
  },

  getRoadmapBySlug: async (slug) => {
    try {
      // First try to find by ID (in case slug is used as ID)
      const docRef = doc(db, COLLECTION_NAME, slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }

      // If not found by ID, search by seo.slug
      const q = query(collection(db, COLLECTION_NAME), where('seo.slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      logger.error('Error fetching roadmap by slug:', error);
      throw error;
    }
  },

  createRoadmap: async (data, customId = null) => {
    try {
      const dataToSave = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (customId) {
        await setDoc(doc(db, COLLECTION_NAME, customId), dataToSave);
        return customId;
      } else {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
        return docRef.id;
      }
    } catch (error) {
      logger.error('Error creating roadmap:', error);
      throw error;
    }
  },

  updateRoadmap: async (id, data) => {
    try {
      const dataToSave = {
        ...data,
        updatedAt: serverTimestamp()
      };
      await updateDoc(doc(db, COLLECTION_NAME, id), dataToSave);
    } catch (error) {
      logger.error('Error updating roadmap:', error);
      throw error;
    }
  },

  deleteRoadmap: async (id) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      logger.error('Error deleting roadmap:', error);
      throw error;
    }
  }
};
