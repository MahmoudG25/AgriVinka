import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { APP_URL } from '../../../constants/env';
import { logger } from '../../../utils/logger';

const CERTIFICATES_COLLECTION = 'certificates';
const CERTIFICATES_PUBLIC_COLLECTION = 'certificates_public';
const TEMPLATE_VERSION = 'v1';

function generateSerialNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `NMA-${date}-${rand}`;
}

/**
 * Create a new certificate document with metadata only (no PDF upload).
 * Idempotent on (userId, courseId).
 *
 * @param {{ userId: string; courseId: string; studentName: string; courseName: string; instructorName: string }} input
 * @returns {Promise<import('../types').Certificate>}
 */
export async function getOrCreateCertificate(input) {
  const { userId, courseId, studentName, courseName, instructorName } = input;

  // 1) Check for existing certificate (idempotent)
  const existingQuery = query(
    collection(db, CERTIFICATES_COLLECTION),
    where('userId', '==', userId),
    where('courseId', '==', courseId)
  );

  const existingSnap = await getDocs(existingQuery);
  if (!existingSnap.empty) {
    const docSnap = existingSnap.docs[0];
    const data = /** @type {any} */ (docSnap.data());
    return { id: docSnap.id, ...data };
  }

  // 2) Create new certificate metadata
  const certRef = doc(collection(db, CERTIFICATES_COLLECTION));
  const certificateId = certRef.id;

  const baseUrl = APP_URL || window.location.origin;
  const verificationUrl = `${baseUrl}/verify/${certificateId}`;
  const serialNumber = generateSerialNumber();
  const nowTs = serverTimestamp();

  /** @type {any} */
  const certData = {
    userId,
    courseId,
    studentName,
    courseName,
    instructorName,
    issuedAt: nowTs,
    serialNumber,
    status: 'valid',
    verificationUrl,
    templateVersion: TEMPLATE_VERSION,
    createdAt: nowTs,
    updatedAt: nowTs,
  };

  await setDoc(certRef, certData);

  // 3) Write a public, safe subset for verification
  const publicRef = doc(db, CERTIFICATES_PUBLIC_COLLECTION, certificateId);
  const publicData = {
    studentName,
    courseName,
    instructorName,
    issuedAt: nowTs,
    serialNumber,
    status: 'valid',
    templateVersion: TEMPLATE_VERSION,
  };
  await setDoc(publicRef, publicData);

  logger.info?.('Created new certificate', { certificateId, userId, courseId });

  return { id: certificateId, ...certData };
}

/**
 * Load a private certificate document (for the logged-in user).
 *
 * @param {string} id
 * @returns {Promise<import('../types').Certificate | null>}
 */
export async function getCertificateById(id) {
  const ref = doc(db, CERTIFICATES_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = /** @type {any} */ (snap.data());
  return { id: snap.id, ...data };
}

/**
 * Load the public-safe certificate document for verification page.
 *
 * @param {string} id
 * @returns {Promise<import('../types').PublicCertificate | null>}
 */
export async function getPublicCertificateById(id) {
  // Preferred: read from dedicated public collection
  const publicRef = doc(db, CERTIFICATES_PUBLIC_COLLECTION, id);
  const publicSnap = await getDoc(publicRef);
  if (publicSnap.exists()) {
    const data = /** @type {any} */ (publicSnap.data());
    return { id: publicSnap.id, ...data };
  }

  // Backwards-compatible fallback: map from legacy/private certificate
  const privateRef = doc(db, CERTIFICATES_COLLECTION, id);
  const privateSnap = await getDoc(privateRef);
  if (!privateSnap.exists()) return null;

  const raw = /** @type {any} */ (privateSnap.data());

  const mapped = {
    studentName: raw.studentName || raw.userName || '',
    courseName: raw.courseName || raw.courseTitle || '',
    instructorName: raw.instructorName || 'AgriVinka',
    issuedAt: raw.issuedAt || raw.completionDate || raw.completedAt || serverTimestamp(),
    serialNumber: raw.serialNumber || raw.certificateCode || id,
    status: raw.status || 'valid',
    templateVersion: raw.templateVersion || TEMPLATE_VERSION,
  };

  return { id: privateSnap.id, ...mapped };
}

