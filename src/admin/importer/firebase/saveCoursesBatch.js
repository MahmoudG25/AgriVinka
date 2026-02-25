import { db } from '../../../firebase/config';
import { writeBatch, doc, getDoc, collection, getDocs, query, where, documentId } from 'firebase/firestore';

/**
 * Save a batch of courses to Firestore
 * @param {Array} courses - Array of normalized course objects
 * @param {string} duplicatePolicy - 'skip' | 'overwrite'
 * @returns {Promise<{ saved: number, skipped: number, errors: Array }>}
 */
export const saveCoursesBatch = async (courses, duplicatePolicy = 'skip') => {
  const results = {
    saved: 0,
    skipped: 0,
    errors: []
  };

  if (!courses || courses.length === 0) return results;

  try {
    // Firestore batch limit is 500 operations. We'll process in chunks of 450 to be safe.
    const CHUNK_SIZE = 450;

    for (let i = 0; i < courses.length; i += CHUNK_SIZE) {
      const chunk = courses.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      let opsCount = 0;

      // Check existing documents if policy is 'skip'
      // Optimisation: Fetch all IDs in this chunk to check existence in one go (or few queries)
      // Firestore 'in' query supports up to 10 items, so we might need to check individually or just rely on individual getDocs if chunk is small,
      // but for bulk import, reading 450 docs is expensive.
      // Better approach: 
      // If 'skip', we MUST check existence.
      // If 'overwrite', we just set(..., { merge: true }).

      for (const course of chunk) {
        const docRef = doc(db, 'courses', course.id);

        if (duplicatePolicy === 'skip') {
          // Check if exists
          // Note: This makes N reads per chunk. For 50 courses, 50 reads. 
          // Acceptance: In an admin tool, this is acceptable.
          try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              results.skipped++;
              continue;
            }
          } catch (e) {
            results.errors.push(`Failed to check existence for ${course.title}: ${e.message}`);
            continue;
          }
        }

        // Add to batch (create or overwrite based on loop falling through if skip check passed)
        // If policy is overwrite, we use { merge: true } to preserve fields we might not be touching?
        // Actually, the requirements say "Strict validation", "Schema normalization". 
        // If we import, we probably want the IMPORTED data to be the source of truth for the fields provided.
        // But for safety, let's use merge: true so we don't wipe unrelated fields if schema evolves.

        batch.set(docRef, course, { merge: true });
        opsCount++;
        results.saved++;
      }

      if (opsCount > 0) {
        await batch.commit();
      }
    }

  } catch (error) {
    console.error("Batch save error:", error);
    results.errors.push(`Batch commit failed: ${error.message}`);
    // Adjust counts because the whole batch failed
    results.saved = 0;
  }

  return results;
};
