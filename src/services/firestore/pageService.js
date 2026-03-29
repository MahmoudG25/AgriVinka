import { db } from '../firebase';
import { logger } from '../../utils/logger';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'pages';

const CACHE_PREFIX = 'namaa_page_cache_';
const CACHE_TTL = 1000 * 60 * 2; // 2 minutes

const memoryPageCache = new Map();

export const pageService = {
  // Get page data by document ID (e.g., 'home')
  getPageData: async (pageId) => {
    const cacheKey = `${CACHE_PREFIX}${pageId}`;

    // In-memory cache layer
    const memoryEntry = memoryPageCache.get(pageId);
    if (memoryEntry && Date.now() - memoryEntry.timestamp < CACHE_TTL) {
      return memoryEntry.data;
    }
    try {
      // 1. Check cache
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          return cached.data;
        }
      }
    } catch { /* ignore */ }

    try {
      // 2. Fetch from network
      const docRef = doc(db, COLLECTION_NAME, pageId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();

        // 3. Save to in-memory cache
        memoryPageCache.set(pageId, { data, timestamp: Date.now() });

        // 4. Save to localStorage fallback
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
        } catch { /* ignore */ }
        return data;
      }
      return null;
    } catch (error) {
      logger.error(`Error fetching page ${pageId}:`, error);
      throw error;
    }
  },

  // Update page data
  updatePageData: async (pageId, data) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, pageId);
      // setDoc with merge:true is safer if document doesn't exist yet
      await setDoc(docRef, data, { merge: true });

      // Invalidate caches
      memoryPageCache.delete(pageId);
      try {
        localStorage.removeItem(`${CACHE_PREFIX}${pageId}`);
      } catch { /* ignore */ }
    } catch (error) {
      logger.error(`Error updating page ${pageId}:`, error);
      throw error;
    }
  }
};
