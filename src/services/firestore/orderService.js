import { db } from '../firebase';
import { logger } from '../../utils/logger';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { enrollmentService } from './enrollmentService';

const COLLECTION_NAME = 'orders';

export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const data = {
        ...orderData,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
      return docRef.id;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  },

  // Check for existing pending/approved order (prevents duplicates)
  checkExistingOrder: async (userId, itemId) => {
    if (!userId || !itemId) return null;
    try {
      const ordersRef = collection(db, COLLECTION_NAME);
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        where('itemId', '==', itemId)
      );
      const snapshot = await getDocs(q);
      const match = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .find(o => o.status === 'pending' || o.status === 'approved');
      return match || null;
    } catch (error) {
      logger.error('Error checking existing order:', error);
      return null;
    }
  },

  // Get all orders (admin)
  getOrders: async (filters = {}) => {
    try {
      const ordersRef = collection(db, COLLECTION_NAME);
      let q;
      try {
        q = query(ordersRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (indexErr) {
        // Fallback if index missing
        logger.warn('Orders index missing, fetching without order', indexErr);
        const snapshot = await getDocs(ordersRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (error) {
      logger.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get orders for a specific user (student dashboard)
  getUserOrders: async (userId) => {
    try {
      const ordersRef = collection(db, COLLECTION_NAME);
      const q = query(ordersRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error('Error fetching user orders:', error);
      return [];
    }
  },

  // Approve an order AND create enrollment for the student
  approveOrder: async (orderId, order) => {
    try {
      // 1. Update order status
      const docRef = doc(db, COLLECTION_NAME, orderId);
      const updateData = {
        status: 'approved',
        approvedAt: serverTimestamp()
      };
      await updateDoc(docRef, updateData);

      // 2. Create enrollment if userId and itemId exist
      if (order.userId && order.itemId) {
        if (order.itemType === 'roadmap') {
          await enrollmentService.enrollRoadmap(order.userId, order.itemId);
          logger.info(`Roadmap enrollment created: user=${order.userId} roadmap=${order.itemId}`);
        } else {
          await enrollmentService.enrollUser(order.userId, order.itemId);
          logger.info(`Course enrollment created: user=${order.userId} course=${order.itemId}`);
        }
      } else {
        logger.warn('Order approved but missing userId or itemId. No enrollment created.', { orderId });
      }
    } catch (error) {
      logger.error('Error approving order:', error);
      throw error;
    }
  },

  // Reject an order explicitly
  rejectOrder: async (orderId) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, orderId);
      await updateDoc(docRef, {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Error rejecting order:', error);
      throw error;
    }
  },

  // Update order status
  updateStatus: async (orderId, newStatus) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, orderId);
      const updateData = { status: newStatus };
      await updateDoc(docRef, updateData);
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  },

  // Find order by ID (code only)
  findOrder: async (searchQuery) => {
    try {
      const trimmed = searchQuery.trim();
      const q = query(collection(db, COLLECTION_NAME), where('__name__', '==', trimmed));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docData = snap.docs[0];
        return { id: docData.id, ...docData.data() };
      }

      return null;
    } catch (error) {
      logger.error('Error searching order:', error);
      throw error;
    }
  },

  // Delete order
  deleteOrder: async (orderId) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, orderId));
    } catch (error) {
      logger.error('Error deleting order:', error);
      throw error;
    }
  }
};
