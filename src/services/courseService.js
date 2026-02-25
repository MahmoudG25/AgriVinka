import { db } from '../firebase/config';
import { logger } from '../utils/logger';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  setDoc
} from 'firebase/firestore';

const COLLECTION_NAME = 'courses';

export const courseService = {
  // Get all courses (Admin typically)
  getAllCourses: async () => {
    try {
      const coursesRef = collection(db, COLLECTION_NAME);
      const q = query(coursesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error('Error fetching courses:', error);
      // Fallback without orderBy if index is missing
      const coursesRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(coursesRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  // Get published courses with optional pagination
  getPublishedCourses: async (itemsPerPage = 12, lastVisibleDoc = null) => {
    try {
      const coursesRef = collection(db, COLLECTION_NAME);
      let q = query(
        coursesRef,
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        limit(itemsPerPage)
      );

      if (lastVisibleDoc) {
        q = query(q, startAfter(lastVisibleDoc));
      }

      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (indexError) {
        logger.warn('Index missing for getPublishedCourses. Falling back to client-side filtering.', indexError);
        const fbq = query(coursesRef, limit(itemsPerPage * 3)); // Fallback query
        const fallbackSnapshot = await getDocs(fbq);

        const allDocs = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const published = allDocs
          .filter(c => c.isPublished === true)
          .sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          })
          .slice(0, itemsPerPage);

        return { courses: published, lastVisible: fallbackSnapshot.docs[fallbackSnapshot.docs.length - 1] };
      }

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { courses, lastVisible };
    } catch (error) {
      logger.error('Error fetching published courses:', error);
      throw error;
    }
  },

  // Get a single course by ID
  getCourseById: async (id) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      logger.error('Error fetching course:', error);
      throw error;
    }
  },

  // Get course by slug (for SEO-friendly URLs)
  getCourseBySlug: async (slug) => {
    try {
      const coursesRef = collection(db, COLLECTION_NAME);
      const q = query(coursesRef, where('seo.slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      logger.error('Error fetching course by slug:', error);
      throw error;
    }
  },

  // Create a new course
  createCourse: async (courseData, customId = null) => {
    try {
      const dataWithTimestamp = {
        ...courseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (customId) {
        await setDoc(doc(db, COLLECTION_NAME, customId), dataWithTimestamp);
        return customId;
      } else {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), dataWithTimestamp);
        return docRef.id;
      }
    } catch (error) {
      logger.error('Error creating course:', error);
      throw error;
    }
  },

  // Update a course
  updateCourse: async (id, courseData) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...courseData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error updating course:', error);
      throw error;
    }
  },

  // Delete a course
  deleteCourse: async (id) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      logger.error('Error deleting course:', error);
      throw error;
    }
  },

  // --- Subcollection: Modules/Lessons ---

  // Get all modules for a course
  getCourseModules: async (courseId) => {
    try {
      const modulesRef = collection(db, `${COLLECTION_NAME}/${courseId}/modules`);
      const q = query(modulesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.lessons) {
          data.lessons = data.lessons.map(l => ({ ...l, video_url: l.video_url || l.videoUrl || l.url || '' }));
        }
        return { id: doc.id, ...data };
      });
    } catch (error) {
      logger.error('Error fetching course modules:', error);
      // Fallback
      const modulesRef = collection(db, `${COLLECTION_NAME}/${courseId}/modules`);
      const snapshot = await getDocs(modulesRef);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.lessons) {
          data.lessons = data.lessons.map(l => ({ ...l, video_url: l.video_url || l.videoUrl || l.url || '' }));
        }
        return { id: doc.id, ...data };
      }).sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  },

  // Create a new module
  addCourseModule: async (courseId, moduleData) => {
    try {
      const docRef = await addDoc(collection(db, `${COLLECTION_NAME}/${courseId}/modules`), moduleData);
      return docRef.id;
    } catch (error) {
      logger.error('Error adding course module:', error);
      throw error;
    }
  },

  // Update a module
  updateCourseModule: async (courseId, moduleId, moduleData) => {
    try {
      const docRef = doc(db, `${COLLECTION_NAME}/${courseId}/modules`, moduleId);
      await updateDoc(docRef, moduleData);
    } catch (error) {
      logger.error('Error updating course module:', error);
      throw error;
    }
  },

  // Delete a module
  deleteCourseModule: async (courseId, moduleId) => {
    try {
      await deleteDoc(doc(db, `${COLLECTION_NAME}/${courseId}/modules`, moduleId));
    } catch (error) {
      logger.error('Error deleting course module:', error);
      throw error;
    }
  },

  // --- Migration-safe helpers ---

  /**
   * Get a course with its modules from subcollection (fallback to embedded sections).
   * This is the safe read method for CoursePlayer and CourseEditPage.
   */
  getCourseWithModules: async (courseId) => {
    try {
      const course = await courseService.getCourseById(courseId);
      if (!course) return null;

      // Try subcollection first
      const modules = await courseService.getCourseModules(courseId);

      if (modules && modules.length > 0) {
        // Subcollection exists → use it, ignore embedded sections
        course.sections = modules;
        course._modulesSource = 'subcollection';
      } else if (course.sections && course.sections.length > 0) {
        // Fallback to embedded array
        course._modulesSource = 'embedded';
      } else {
        course.sections = [];
        course._modulesSource = 'empty';
      }

      return course;
    } catch (error) {
      logger.error('Error in getCourseWithModules:', error);
      throw error;
    }
  },

  /**
   * Save course metadata + write sections to subcollection.
   * Strips sections from main doc to avoid bloat.
   */
  saveCourseWithModules: async (courseId, courseData, isNew = false) => {
    try {
      const { sections, ...courseMetadata } = courseData;
      // Remove internal flags
      delete courseMetadata._modulesSource;
      delete courseMetadata.id;

      // Calculate lessons count for indexing/display before stripping sections
      courseMetadata.lessons_count = sections ? sections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0) : 0;

      // 1. Save/update course document WITHOUT sections
      if (isNew) {
        courseId = await courseService.createCourse(courseMetadata);
      } else {
        await courseService.updateCourse(courseId, courseMetadata);
      }

      // 2. Sync modules subcollection
      if (sections && sections.length > 0) {
        // Delete existing modules first (clean sync)
        await courseService.deleteCourseModules(courseId);

        // Write each section as a module doc
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          const moduleData = {
            title: section.title || '',
            order: i,
            lessons: (section.lessons || []).map((l, lIdx) => ({
              id: l.id || `lesson-${lIdx}`,
              title: l.title || '',
              duration: l.duration || '0:00',
              free_preview: l.free_preview || false,
              video_url: l.video_url || l.videoUrl || l.url || '',
              videoUrl: l.video_url || l.videoUrl || l.url || '', // Store both for backward compatibility
              order: lIdx
            }))
          };

          // Use the existing section.id as the doc ID for stable references
          const moduleId = section.id || `module-${i}`;
          await setDoc(doc(db, `${COLLECTION_NAME}/${courseId}/modules`, moduleId), moduleData);
        }
      }

      return courseId;
    } catch (error) {
      logger.error('Error in saveCourseWithModules:', error);
      throw error;
    }
  },

  /**
   * Delete all modules in a course subcollection.
   */
  deleteCourseModules: async (courseId) => {
    try {
      const modulesRef = collection(db, `${COLLECTION_NAME}/${courseId}/modules`);
      const snapshot = await getDocs(modulesRef);
      const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      logger.error('Error deleting all course modules:', error);
      throw error;
    }
  }
};
