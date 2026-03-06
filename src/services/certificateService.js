import { db } from './firebase';
import { logger } from '../utils/logger';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { cloudinaryService } from './cloudinary';
import { createCertificatePdf, TEMPLATE_VERSION } from './createCertificatePdf';
import { APP_URL } from '../constants/env';

/**
 * Generate a unique serial number: NMA-YYYYMMDD-XXXXX
 */
function generateSerialNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `NMA-${date}-${rand}`;
}

/**
 * Generate a unique certificate code for use as document ID.
 */
function generateCertificateCode() {
  return `NMA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export const certificateService = {
  /**
   * Retrieves a certificate by its unique code for public verification.
   * Only returns non-sensitive fields for public display.
   */
  getCertificateByCode: async (code) => {
    try {
      const certRef = doc(db, 'certificates', code);
      const snapshot = await getDoc(certRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (error) {
      logger.error('Error fetching certificate:', error);
      throw error;
    }
  },

  /**
   * Retrieves all certificates for a specific user.
   */
  getUserCertificates: async (userId) => {
    try {
      const certsQuery = query(
        collection(db, 'certificates'),
        where('uid', '==', userId)
      );
      const snapshot = await getDocs(certsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error('Error fetching user certificates:', error);
      throw error;
    }
  },

  /**
   * Retrieves all certificates (admin use).
   */
  getAllCertificates: async () => {
    try {
      const certsQuery = query(collection(db, 'certificates'));
      const snapshot = await getDocs(certsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error('Error fetching all certificates:', error);
      throw error;
    }
  },

  /**
   * Check if a certificate already exists for a user + course combo.
   * Returns the existing certificate or null.
   */
  getExistingCertificate: async (userId, courseId) => {
    try {
      const certsQuery = query(
        collection(db, 'certificates'),
        where('uid', '==', userId),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(certsQuery);
      if (!snapshot.empty) {
        const existing = snapshot.docs[0];
        return { id: existing.id, ...existing.data() };
      }
      return null;
    } catch (error) {
      logger.error('Error checking existing certificate:', error);
      return null;
    }
  },

  /**
   * Generates a new PDF certificate, uploads it to Cloudinary (raw),
   * and saves metadata to Firestore.
   * 
   * IDEMPOTENT: If a certificate already exists for this user + course,
   * returns the existing record instead of regenerating.
   * 
   * @param {string} userId Firebase Auth UID
   * @param {string} studentName Student's display name
   * @param {string} courseId Firestore course document ID
   * @param {string} courseTitle Course display title
   * @param {string} instructorName Instructor display name
   * @returns {Promise<Object>} Certificate record with id, pdfUrl, etc.
   */
  issueCertificate: async (userId, studentName, courseId, courseTitle, instructorName = "AgriVinka") => {
    try {
      // ── 0. Idempotency Check ──
      const existing = await certificateService.getExistingCertificate(userId, courseId);
      if (existing) {
        logger.info(`Certificate already exists for user=${userId} course=${courseId}: ${existing.id}`);
        return existing;
      }

      // ── 1. Generate unique IDs ──
      const certificateCode = generateCertificateCode();
      const serialNumber = generateSerialNumber();
      const now = new Date();
      const baseUrl = APP_URL || window.location.origin;
      const verificationUrl = `${baseUrl}/verify/${certificateCode}`;

      // ── 2. Generate PDF ──
      const pdfBytes = await createCertificatePdf({
        studentName,
        courseTitle,
        completionDate: now,
        issueDate: now,
        instructorName,
        certificateCode,
        serialNumber,
        verificationUrl
      });

      // ── 3. Upload raw PDF to Cloudinary ──
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const file = new File([blob], `${certificateCode}.pdf`, { type: 'application/pdf' });

      const uploadRes = await cloudinaryService.uploadPdf(file, userId);
      const pdfUrl = uploadRes.secureUrl;
      const pdfPublicId = uploadRes.publicId;

      // ── 4. Save metadata to Firestore ──
      const certData = {
        uid: userId,
        userId,
        courseId,
        courseTitle,
        studentName,
        instructorName,
        platformName: "AgriVinka / AgriVinka",
        issuedAt: serverTimestamp(),
        completionDate: serverTimestamp(),
        certificateCode,
        serialNumber,
        pdfUrl,
        pdfPublicId,
        verificationUrl,
        status: 'valid',
        locale: 'ar',
        templateVersion: TEMPLATE_VERSION,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'certificates', certificateCode), certData);

      return {
        id: certificateCode,
        ...certData
      };

    } catch (error) {
      logger.error('Error issuing certificate:', error);
      throw error;
    }
  }
};
