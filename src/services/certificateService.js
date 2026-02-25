import { db } from '../firebase/config';
import { logger } from '../utils/logger';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { cloudinaryService } from './cloudinaryService';
import { createCertificatePdf } from './createCertificatePdf';

// We need an Arabic font for pdf-lib to render Arabic text correctly.
// A common approach is to host the font file (e.g. Cairo-Bold.ttf) in public/fonts/
const FONT_URL = '/fonts/Cairo-Bold.ttf';
const TEMPLATE_URL = '/certificates/template.pdf';

export const certificateService = {
  /**
   * Retrieves a certificate by its unique code for public verification
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
   * Retrieves all certificates for a specific user
   */
  getUserCertificates: async (userId) => {
    try {
      const certsQuery = query(
        collection(db, 'certificates'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(certsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      logger.error('Error fetching user certificates:', error);
      throw error;
    }
  },

  /**
   * Generates a new PDF certificate, uploads it to Cloudinary, and saves metadata to Firestore
   */
  issueCertificate: async (userId, studentName, courseId, courseTitle, instructorName = "أكاديمية نماء") => {
    try {
      // 1. Generate unique ID
      const certificateCode = `NMA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const now = new Date();

      // 2. Generate PDF using advanced creator
      const pdfBytes = await createCertificatePdf({
        studentName,
        courseTitle,
        completionDate: now,
        issueDate: now,
        instructorName,
        certificateCode
      });

      // 3. Upload raw PDF to Cloudinary
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const file = new File([blob], `${certificateCode}.pdf`, { type: 'application/pdf' });

      const uploadRes = await cloudinaryService.uploadPdf(file, userId);
      const pdfUrl = uploadRes.secureUrl;

      // 4. Save metadata to Firestore exactly matching requested schema
      const certData = {
        uid: userId,
        courseId,
        courseTitle,
        studentName,
        instructorName,
        platformName: "Namaa Academy",
        completionDate: serverTimestamp(),
        issueDate: serverTimestamp(),
        certificateCode,
        pdfUrl,
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
