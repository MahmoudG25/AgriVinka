import { COLLECTIONS } from '../../constants';
import { db } from '../firebase';
import { logger } from '../../utils/logger';
import { cloudinaryService } from '../cloudinary';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp
} from 'firebase/firestore';

// Re-export the real analysis function so dashboard can use it directly
export { analyzePlantImage, PROVIDERS } from '../../features/plant-analyzer/services/analysisService';

const CACHE_TTL = 1000 * 60 * 2; // 2 minutes
const aiScansCache = new Map();


export const aiDiagnosisService = {
  /**
   * Saves a diagnosis result + image to the user's Firestore history.
   * Uploads image to Cloudinary for permanent storage.
   *
   * @param {string} userId
   * @param {{ base64: string, mimeType: string }} imageData - compressed base64 image
   * @param {string} provider - 'openai' | 'gemini' | 'grok'
   * @param {Object} analysisResult - structured result from the AI adapter
   * @returns {Promise<string>} The saved scan document ID
   */
  saveScanHistory: async (userId, imageData, provider, analysisResult) => {
    if (!userId) return null;

    try {
      const scanId = `scan_${Date.now()}`;

      // Convert base64 to a File-like Blob for Cloudinary upload
      const byteString = atob(imageData.base64);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8 = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uint8[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: imageData.mimeType });
      const file = new File([blob], `scan_${Date.now()}.jpg`, { type: imageData.mimeType });

      // Upload to Cloudinary
      let imageUrl = '';
      try {
        imageUrl = await cloudinaryService.uploadFile(file, `users/${userId}/ai-scans`);
      } catch (uploadErr) {
        logger.error('Cloudinary upload failed, saving without image URL:', uploadErr);
      }

      // Save to Firestore: users/{uid}/aiScans/{scanId}
      const scanRef = doc(db, COLLECTIONS.USERS, userId, 'aiScans', scanId);

      const scanData = {
        scanId,
        imageUrl,
        provider,
        // Legacy-compatible prediction field
        prediction: {
          name: analysisResult.diagnosis || 'غير محدد',
          confidence: analysisResult.confidence === 'High' ? 0.95 :
            analysisResult.confidence === 'Medium' ? 0.7 : 0.4,
          severity: analysisResult.confidence === 'High' ? 'high' :
            analysisResult.confidence === 'Medium' ? 'medium' : 'low',
        },
        // Full structured result
        result: {
          diagnosis: analysisResult.diagnosis || '',
          confidence: analysisResult.confidence || '',
          causes: analysisResult.causes || [],
          careSteps: analysisResult.careSteps || [],
          warnings: analysisResult.warnings || [],
          references: analysisResult.references || [],
        },
        timestamp: serverTimestamp(),
      };

      await setDoc(scanRef, scanData);
      // Invalidate cache for user's scans
      [...aiScansCache.keys()].forEach(key => {
        if (key.startsWith(`${userId}:`)) {
          aiScansCache.delete(key);
        }
      });
      return scanId;
    } catch (error) {
      logger.error('Error saving scan history for user:', userId, error);
      throw error;
    }
  },

  /**
   * Retrieves paginated scans for a user, ordered by date descending.
   *
   * @param {string} userId
   * @param {number} [pageSize=6] - Number of items per page
   * @param {import('firebase/firestore').DocumentSnapshot} [lastDoc=null] - Last document for pagination
   * @returns {Promise<{ items: Array, lastDoc: DocumentSnapshot|null, hasMore: boolean }>}
   */
  getUserScans: async (userId, pageSize = 6, lastDoc = null) => {
    try {
      if (!userId) return { items: [], lastDoc: null, hasMore: false };

      const now = Date.now();
      const cacheKey = `${userId}:${pageSize}:${lastDoc ? lastDoc.id : 'first'}`;
      const cacheEntry = aiScansCache.get(cacheKey);
      if (cacheEntry && now - cacheEntry.timestamp < CACHE_TTL) {
        return cacheEntry.data;
      }

      const scansRef = collection(db, COLLECTIONS.USERS, userId, 'aiScans');

      let q;
      if (lastDoc) {
        q = query(scansRef, orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(pageSize + 1));
      } else {
        q = query(scansRef, orderBy('timestamp', 'desc'), limit(pageSize + 1));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs;

      // If we got more than pageSize, there are more items
      const hasMore = docs.length > pageSize;
      const items = docs.slice(0, pageSize).map(d => ({
        id: d.id,
        _doc: d, // Keep the raw doc snapshot for pagination cursor
        ...d.data()
      }));

      const result = {
        items,
        lastDoc: items.length > 0 ? docs[items.length - 1] : null,
        hasMore,
      };
      aiScansCache.set(cacheKey, { data: result, timestamp: now });
      return result;
    } catch (error) {
      logger.error('Error fetching user scan history:', error);
      return { items: [], lastDoc: null, hasMore: false };
    }
  },

  /**
   * Deletes a specific scan from the user's history.
   *
   * @param {string} userId
   * @param {string} scanId
   * @returns {Promise<void>}
   */
  deleteScan: async (userId, scanId) => {
    try {
      const scanRef = doc(db, COLLECTIONS.USERS, userId, 'aiScans', scanId);
      await deleteDoc(scanRef);
      // Invalidate cache for user's scans
      [...aiScansCache.keys()].forEach(key => {
        if (key.startsWith(`${userId}:`)) {
          aiScansCache.delete(key);
        }
      });
    } catch (error) {
      logger.error('Error deleting scan:', scanId, error);
      throw error;
    }
  },
};
