import { collection, doc, addDoc, getDocs, getDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../../utils/logger';

const COMMENTS_COLLECTION = 'lesson_comments';

export const commentService = {
  /**
   * Add a new comment (or reply) to a lesson
   * @param {string} lessonId 
   * @param {string} userId 
   * @param {string} userName 
   * @param {string} userAvatar 
   * @param {string} content 
   * @param {string|null} parentId - null if top-level comment, ID of parent if reply
   */
  async addComment(lessonId, userId, userName, userAvatar, content, parentId = null) {
    try {
      const commentData = {
        lessonId,
        userId,
        userName,
        userAvatar,
        content,
        parentId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        repliesCount: 0
      };
      
      const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData);
      
      // If it's a reply, increment repliesCount on parent
      if (parentId) {
        const parentRef = doc(db, COMMENTS_COLLECTION, parentId);
        await runTransaction(db, async (transaction) => {
          const parentDoc = await transaction.get(parentRef);
          if (parentDoc.exists()) {
            const currentCount = parentDoc.data().repliesCount || 0;
            transaction.update(parentRef, { repliesCount: currentCount + 1 });
          }
        });
      }
      
      return { id: docRef.id, ...commentData, createdAt: new Date() };
    } catch (error) {
      logger.error('Error adding comment', error);
      throw error;
    }
  },

  /**
   * Get all comments for a lesson, grouped by top-level and replies
   * @param {string} lessonId 
   */
  async getCommentsByLesson(lessonId) {
    try {
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('lessonId', '==', lessonId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const allComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      // Separate top-level and replies
      const topLevel = allComments.filter(c => !c.parentId);
      const replies = allComments.filter(c => c.parentId);
      
      // Map replies to their parents
      const nestedComments = topLevel.map(comment => {
        return {
          ...comment,
          replies: replies.filter(r => r.parentId === comment.id).sort((a,b) => a.createdAt - b.createdAt)
        };
      });
      
      return nestedComments;
    } catch (error) {
      logger.error('Error getting comments', error);
      // Fallback mapping if index is missing
      if (error.message.includes('index')) {
         logger.warn('Index missing, running unindexed query');
         const q = query(collection(db, COMMENTS_COLLECTION), where('lessonId', '==', lessonId));
         const snapshot = await getDocs(q);
         const allComments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
         })).sort((a,b) => b.createdAt - a.createdAt);
         
         const topLevel = allComments.filter(c => !c.parentId);
         const replies = allComments.filter(c => c.parentId);
         return topLevel.map(comment => ({
           ...comment,
           replies: replies.filter(r => r.parentId === comment.id).sort((a,b) => a.createdAt - b.createdAt)
         }));
      }
      throw error;
    }
  },

  async deleteComment(commentId, parentId = null) {
     try {
       await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
       if (parentId) {
         // Decrement on parent
         const parentRef = doc(db, COMMENTS_COLLECTION, parentId);
         await runTransaction(db, async (transaction) => {
           const parentDoc = await transaction.get(parentRef);
           if (parentDoc.exists()) {
             const currentCount = Math.max((parentDoc.data().repliesCount || 0) - 1, 0);
             transaction.update(parentRef, { repliesCount: currentCount });
           }
         });
       }
       return true;
     } catch(e) {
       logger.error('Error deleting comment', e);
       throw e;
     }
  }
};
