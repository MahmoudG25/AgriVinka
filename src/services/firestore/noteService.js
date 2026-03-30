import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../../utils/logger';

const NOTES_COLLECTION = 'lesson_notes';

export const noteService = {
  /**
   * Get personal note for a specific lesson
   * @param {string} userId 
   * @param {string} lessonId 
   * @returns {string|null} The content of the note, or null if none
   */
  async getNote(userId, lessonId) {
    try {
      const docId = `${userId}_${lessonId}`;
      const docRef = doc(db, NOTES_COLLECTION, docId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data().content || '';
      }
      return '';
    } catch (error) {
      logger.error('Error getting note', error);
      return '';
    }
  },

  /**
   * Save personal note for a specific lesson
   * @param {string} userId 
   * @param {string} lessonId 
   * @param {string} content 
   */
  async saveNote(userId, lessonId, content) {
    try {
      const docId = `${userId}_${lessonId}`;
      const docRef = doc(db, NOTES_COLLECTION, docId);
      
      const noteData = {
        userId,
        lessonId,
        content,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, noteData, { merge: true });
      return true;
    } catch (error) {
      logger.error('Error saving note', error);
      throw error;
    }
  }
};
