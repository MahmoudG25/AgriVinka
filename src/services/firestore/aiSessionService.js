import { db } from '../firebase';
import { logger } from '../../utils/logger';
import { collection, doc, getDoc, updateDoc, addDoc, serverTimestamp, query, orderBy, getDocs, deleteDoc, where } from 'firebase/firestore';

export const aiSessionService = {
  getUserSessions: async (userId) => {
    try {
      const sessionsRef = collection(db, 'ai_sessions');
      const q = query(sessionsRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error('aiSessionService.getUserSessions failed', error);
      return [];
    }
  },

  getSession: async (userId, sessionId) => {
    try {
      const docRef = doc(db, 'ai_sessions', sessionId);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().userId === userId) {
        return { id: snap.id, ...snap.data() };
      }
      return null;
    } catch (error) {
      logger.error('aiSessionService.getSession failed', error);
      return null;
    }
  },

  createSession: async (userId, title = 'محادثة جديدة') => {
    try {
      if (!userId) throw new Error('userId is required');
      const sessionsRef = collection(db, 'ai_sessions');
      const dataTemplate = {
        userId,
        title,
        pinned: false,
        state: 'idle',
        pendingAction: null,
        pendingData: null,
        lastIntent: null,
      };
      
      // Remove any undefined keys cleanly
      const data = JSON.parse(JSON.stringify(dataTemplate));
      data.createdAt = serverTimestamp();
      data.updatedAt = serverTimestamp();
      
      const docRef = await addDoc(sessionsRef, data);
      return { id: docRef.id, ...data };
    } catch (error) {
      logger.error('aiSessionService.createSession failed', error);
      throw error;
    }
  },

  updateSession: async (userId, sessionId, updates) => {
    try {
      const docRef = doc(db, 'ai_sessions', sessionId);
      const cleanUpdates = JSON.parse(JSON.stringify(updates));
      await updateDoc(docRef, { ...cleanUpdates, updatedAt: serverTimestamp() });
      return true;
    } catch (error) {
      logger.error('aiSessionService.updateSession failed', error);
      return false;
    }
  },

  deleteSession: async (userId, sessionId) => {
    try {
      const docRef = doc(db, 'ai_sessions', sessionId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      logger.error('aiSessionService.deleteSession failed', error);
      return false;
    }
  },

  addMessage: async (userId, sessionId, message) => {
    try {
      const messagesRef = collection(db, 'ai_sessions', sessionId, 'messages');
      // Strip any deeply nested 'undefined' values (like payload.analysisResult)
      const sanitizedMessage = JSON.parse(JSON.stringify(message));
      
      const data = {
        ...sanitizedMessage,
        userId,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(messagesRef, data);
      return { id: docRef.id, ...data };
    } catch (error) {
      logger.error('aiSessionService.addMessage failed', error);
      throw error;
    }
  },

  getMessages: async (userId, sessionId, limitCount = 100) => {
    try {
      const messagesRef = collection(db, 'ai_sessions', sessionId, 'messages');
      // orderBy createdAt asc for chronological display
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          // Normalise Firestore Timestamp → ISO string so renders work the same as local messages
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? new Date().toISOString(),
        };
      });
      return msgs.slice(0, limitCount);
    } catch (error) {
      logger.error('aiSessionService.getMessages failed', error);
      return [];
    }
  },
};
