import { db } from '../firebase';
import { logger } from '../../utils/logger';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'siteConfig';
const DOC_ID = 'global'; // Singleton document for global theme settings

const CACHE_KEY = 'namaa_theme_cache';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export const themeService = {
  // Fetch global theme settings
  getSettings: async () => {
    try {
      // 1. Check Cache
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          return cached.data;
        }
      }
    } catch (err) { /* ignore cache errors */ }

    try {
      // 2. Fetch from network
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // 3. Save to Cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        } catch (err) { /* ignore */ }

        return data;
      }

      // Default fallback if document doesn't exist yet
      return {
        colors: {
          primary: '#059669', // Default green
          secondary: '#D97706', // Default amber
        },
        typography: {
          scale: 1, // 1 = 100%
        },
        seo: {
          defaultMetaTitle: 'AgriVinka للتعليم التقني',
          defaultMetaDescription: 'تعلم البرمجة بالعربية مع كورسات مترجمة ومسارات برمجة متكاملة',
        }
      };
    } catch (error) {
      logger.error('Error fetching global theme settings:', error);
      throw error;
    }
  },

  // Update global theme settings
  updateSettings: async (data) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      await setDoc(docRef, data, { merge: true });

      // Invalidate cache
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch (err) { /* ignore */ }

      return true;
    } catch (error) {
      logger.error('Error updating global theme settings:', error);
      throw error;
    }
  },

  // Apply theme dynamically to the DOM
  applyThemeToDOM: (themeData) => {
    if (!themeData?.colors) return;

    const root = document.documentElement;
    // Map Firestore colors to CSS Variables used by Tailwind
    if (themeData.colors.primary) {
      // In a real app we'd need to generate shade variants (50-900) 
      // or rely on a smart CSS variable approach.
      root.style.setProperty('--color-primary', themeData.colors.primary);
    }
    if (themeData.colors.secondary) {
      root.style.setProperty('--color-accent', themeData.colors.secondary);
    }

    if (themeData.typography?.scale) {
      root.style.fontSize = `${100 * themeData.typography.scale}%`;
    }
  }
};
