import { db } from '../firebase/config';
import { logger } from '../utils/logger';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

const COLLECTION_NAME = 'courseRequests';

export const courseRequestService = {
  // Create a new course request
  create: async (data) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        status: 'pending',
        adminNote: '',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      logger.error('Error creating course request:', error);
      throw error;
    }
  },

  // Get all requests (newest first)
  getAll: async () => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      logger.error('Error fetching course requests:', error);
      throw error;
    }
  },

  // Update status and optional admin note
  update: async (id, updateData) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updateData);
    } catch (error) {
      logger.error('Error updating course request:', error);
      throw error;
    }
  }
};
