import { COLLECTIONS } from '../../constants';
import { db } from '../firebase';
import { logger } from '../../utils/logger';
import {
  collection,
  query,
  where,
  getCountFromServer
} from 'firebase/firestore';

/**
 * Admin Stats Service
 * Uses Firestore's getCountFromServer for efficient aggregation
 * without reading full collections.
 */
export const adminStatsService = {
  /**
   * Total registered users count
   */
  getTotalUsersCount: async () => {
    try {
      const snapshot = await getCountFromServer(collection(db, COLLECTIONS.USERS));
      return snapshot.data().count;
    } catch (error) {
      logger.error('Error counting users:', error);
      return 0;
    }
  },

  /**
   * Total certificates issued (= completed courses)
   */
  getTotalCertificatesCount: async () => {
    try {
      const snapshot = await getCountFromServer(collection(db, COLLECTIONS.CERTIFICATES));
      return snapshot.data().count;
    } catch (error) {
      logger.error('Error counting certificates:', error);
      return 0;
    }
  },

  /**
   * Count of pending orders
   */
  getPendingOrdersCount: async () => {
    try {
      const q = query(collection(db, COLLECTIONS.ORDERS), where('status', '==', 'pending'));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      logger.error('Error counting pending orders:', error);
      return 0;
    }
  },

  /**
   * Total orders count (all statuses)
   */
  getTotalOrdersCount: async () => {
    try {
      const snapshot = await getCountFromServer(collection(db, COLLECTIONS.ORDERS));
      return snapshot.data().count;
    } catch (error) {
      logger.error('Error counting orders:', error);
      return 0;
    }
  },

  /**
   * Fetch all admin dashboard stats in parallel
   */
  getAdminDashboardStats: async () => {
    const results = await Promise.allSettled([
      adminStatsService.getTotalUsersCount(),
      adminStatsService.getTotalCertificatesCount(),
      adminStatsService.getPendingOrdersCount(),
      adminStatsService.getTotalOrdersCount()
    ]);

    return {
      totalUsers: results[0].status === 'fulfilled' ? results[0].value : 0,
      totalCompleted: results[1].status === 'fulfilled' ? results[1].value : 0,
      pendingOrders: results[2].status === 'fulfilled' ? results[2].value : 0,
      totalOrders: results[3].status === 'fulfilled' ? results[3].value : 0,
    };
  }
};
