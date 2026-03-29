import { db } from '../firebase';
import { logger } from '../../utils/logger';
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
const CACHE_TTL = 1000 * 60 * 2; // 2 minutes

const memoryCourseById = new Map();
const memoryCourseBySlug = new Map();
let memoryAllCourses = null;
let memoryPublishedCourses = null;

const clearCourseCache = () => {
  memoryCourseById.clear();
  memoryCourseBySlug.clear();
  memoryAllCourses = null;
  memoryPublishedCourses = null;
};

export const courseService = {
  // Get all courses (Admin typically)
  getAllCourses: async () => {
    const now = Date.now();
    if (memoryAllCourses && now - memoryAllCourses.timestamp < CACHE_TTL) {
      return memoryAllCourses.data;
    }

    try {
      const coursesRef = collection(db, COLLECTION_NAME);
      const q = query(coursesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      memoryAllCourses = { data: courses, timestamp: now };
      return courses;
    } catch (error) {
      logger.error('Error fetching courses:', error);
      // Fallback without orderBy if index is missing
      const coursesRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(coursesRef);
      const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      memoryAllCourses = { data: courses, timestamp: now };
      return courses;
    }
  },

  // Get published courses with optional pagination
  getPublishedCourses: async (itemsPerPage = 12, lastVisibleDoc = null) => {
    const now = Date.now();
    if (!lastVisibleDoc && memoryPublishedCourses && memoryPublishedCourses.timestamp && (now - memoryPublishedCourses.timestamp < CACHE_TTL) && memoryPublishedCourses.itemsPerPage === itemsPerPage) {
      return memoryPublishedCourses.data;
    }

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

        if (!lastVisibleDoc) {
          memoryPublishedCourses = {
            data: {
              courses: published,
              lastVisible: fallbackSnapshot.docs[fallbackSnapshot.docs.length - 1]
            },
            timestamp: now,
            itemsPerPage
          };
        }

        return { courses: published, lastVisible: fallbackSnapshot.docs[fallbackSnapshot.docs.length - 1] };
      }

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (!lastVisibleDoc) {
        memoryPublishedCourses = { data: { courses, lastVisible }, timestamp: now, itemsPerPage };
      }

      return { courses, lastVisible };
    } catch (error) {
      logger.error('Error fetching published courses:', error);
      throw error;
    }
  },

  // Get a single course by ID
  getCourseById: async (id) => {
    try {
      const now = Date.now();
      const cacheEntry = memoryCourseById.get(id);
      if (cacheEntry && now - cacheEntry.timestamp < CACHE_TTL) {
        return cacheEntry.data;
      }
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const course = { id: docSnap.id, ...docSnap.data() };
        memoryCourseById.set(id, { data: course, timestamp: now });
        return course;
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
      const now = Date.now();
      const cacheEntry = memoryCourseBySlug.get(slug);
      if (cacheEntry && now - cacheEntry.timestamp < CACHE_TTL) {
        return cacheEntry.data;
      }

      const coursesRef = collection(db, COLLECTION_NAME);
      const q = query(coursesRef, where('seo.slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const course = { id: docSnap.id, ...docSnap.data() };
        memoryCourseBySlug.set(slug, { data: course, timestamp: now });
        return course;
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

      let courseId;
      if (customId) {
        courseId = customId;
        await setDoc(doc(db, COLLECTION_NAME, customId), dataWithTimestamp);
      } else {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), dataWithTimestamp);
        courseId = docRef.id;
      }

      // Invalidate cache
      clearCourseCache();
      return courseId;
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

      // Cache invalidation
      clearCourseCache();
      memoryCourseById.delete(id);
    } catch (error) {
      logger.error('Error updating course:', error);
      throw error;
    }
  },

  // Delete a course
  deleteCourse: async (id) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      clearCourseCache();
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
    // Invalidate course cache, as the course and module content is going to change
    clearCourseCache();

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
