import { db } from '../firebase';
import { logger } from '../../utils/logger';
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, query, where, orderBy, getDocs, limit,
  startAfter, addDoc, getCountFromServer,
} from 'firebase/firestore';

const AI_SETTINGS_DOC = doc(db, 'ai_settings', 'global');

// ─── Global Settings ────────────────────────────────────────────────────────

export const aiAdminService = {

  getGlobalSettings: async () => {
    try {
      const snap = await getDoc(AI_SETTINGS_DOC);
      if (snap.exists()) return snap.data();
      // Return defaults if not yet configured
      return {
        assistantEnabled: true,
        maxDailyMessages: 50,
        imageAnalysisEnabled: true,
        voiceInputEnabled: true,
        voiceOutputEnabled: true,
        defaultModel: 'gemini',
        updatedAt: null,
      };
    } catch (error) {
      logger.error('aiAdminService.getGlobalSettings failed', error);
      return null;
    }
  },

  saveGlobalSettings: async (settings) => {
    try {
      await setDoc(AI_SETTINGS_DOC, {
        ...settings,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return true;
    } catch (error) {
      logger.error('aiAdminService.saveGlobalSettings failed', error);
      return false;
    }
  },

  // ─── User AI Controls ────────────────────────────────────────────────────

  updateUserAiSettings: async (userId, data) => {
    try {
      // Sanitize before writing
      const clean = JSON.parse(JSON.stringify(data));
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { ...clean, updatedAt: serverTimestamp() });
      return true;
    } catch (error) {
      logger.error('aiAdminService.updateUserAiSettings failed', error);
      return false;
    }
  },

  resetUserUsage: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        aiUsageCount: 0,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      logger.error('aiAdminService.resetUserUsage failed', error);
      return false;
    }
  },

  incrementUserUsage: async (userId) => {
    try {
      const { increment } = await import('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        aiUsageCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      // Non-blocking — don't break the chat if this fails
      logger.error('aiAdminService.incrementUserUsage failed', error);
    }
  },

  // ─── AI Logs ─────────────────────────────────────────────────────────────

  writelog: async (userId, logData) => {
    try {
      const logsRef = collection(db, 'ai_logs');
      const clean = JSON.parse(JSON.stringify(logData));
      await addDoc(logsRef, {
        userId,
        ...clean,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      // Non-blocking — don't throw
      logger.error('aiAdminService.writelog failed', error);
    }
  },

  getLogs: async ({ pageSize = 25, lastDoc = null, filterUserId = null, filterDate = null } = {}) => {
    try {
      const logsRef = collection(db, 'ai_logs');
      const constraints = [orderBy('createdAt', 'desc')];
      if (filterUserId) constraints.push(where('userId', '==', filterUserId));
      if (lastDoc) constraints.push(startAfter(lastDoc));
      constraints.push(limit(pageSize));

      const q = query(logsRef, ...constraints);
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(d => ({ id: d.id, _ref: d, ...d.data() }));
      const nextLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      return { logs, nextLastDoc };
    } catch (error) {
      logger.error('aiAdminService.getLogs failed', error);
      return { logs: [], nextLastDoc: null };
    }
  },

  // ─── Stats ───────────────────────────────────────────────────────────────

  getStats: async () => {
    try {
      const logsRef = collection(db, 'ai_logs');
      const sessionsRef = collection(db, 'ai_sessions');

      // Total AI requests (all logs)
      const totalSnap = await getCountFromServer(query(logsRef));
      const totalRequests = totalSnap.data().count;

      // Count by type breakdown
      const textQ = query(logsRef, where('type', '==', 'text'));
      const imageQ = query(logsRef, where('type', '==', 'image'));
      const voiceQ = query(logsRef, where('type', '==', 'voice'));

      const [textSnap, imageSnap, voiceSnap, sessionsSnap] = await Promise.all([
        getCountFromServer(textQ),
        getCountFromServer(imageQ),
        getCountFromServer(voiceQ),
        getCountFromServer(query(sessionsRef)),
      ]);

      return {
        totalRequests,
        textCount: textSnap.data().count,
        imageCount: imageSnap.data().count,
        voiceCount: voiceSnap.data().count,
        totalSessions: sessionsSnap.data().count,
      };
    } catch (error) {
      logger.error('aiAdminService.getStats failed', error);
      return {
        totalRequests: 0,
        textCount: 0,
        imageCount: 0,
        voiceCount: 0,
        totalSessions: 0,
      };
    }
  },
};
