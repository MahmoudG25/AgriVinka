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
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

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
   * Generates a new PDF certificate, uploads it to Storage, and saves metadata to Firestore
   */
  issueCertificate: async (userId, studentName, courseId, courseTitle, instructorName = "أكاديمية نماء") => {
    try {
      // 1. Generate unique ID
      const verificationCode = `NMA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // 2. Fetch template and font
      const [templateRes, fontRes] = await Promise.all([
        fetch(TEMPLATE_URL),
        fetch(FONT_URL)
      ]);

      if (!templateRes.ok) throw new Error('Certificate template not found in /public/certificates/template.pdf');
      if (!fontRes.ok) throw new Error('Font file not found in /public/fonts/Cairo-Bold.ttf');

      const templateBytes = await templateRes.arrayBuffer();
      const fontBytes = await fontRes.arrayBuffer();

      // 3. Load PDF Document
      const pdfDoc = await PDFDocument.load(templateBytes);

      // Register fontkit to handle custom fonts (like Arabic)
      pdfDoc.registerFontkit(fontkit);
      const customFont = await pdfDoc.embedFont(fontBytes);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // 4. Draw Text (Adjust coordinates based on your specific template design)
      // Name
      firstPage.drawText(studentName, {
        x: width / 2 - (customFont.widthOfTextAtSize(studentName, 36) / 2),
        y: height / 2 + 20,
        size: 36,
        font: customFont,
        color: rgb(0.1, 0.36, 0.12), // Primary Green ish
      });

      // Course Name
      firstPage.drawText(`بإتمام دورة: ${courseTitle}`, {
        x: width / 2 - (customFont.widthOfTextAtSize(`بإتمام دورة: ${courseTitle}`, 24) / 2),
        y: height / 2 - 40,
        size: 24,
        font: customFont,
        color: rgb(0.3, 0.3, 0.3),
      });

      // Certificate ID
      firstPage.drawText(`رقم الشهادة: ${verificationCode}`, {
        x: 50,
        y: 50,
        size: 12,
        font: customFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Date
      const dateStr = new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
      firstPage.drawText(dateStr, {
        x: width - 200,
        y: 50,
        size: 14,
        font: customFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      // 5. Save PDF
      const pdfBytes = await pdfDoc.save();

      // 6. Upload to Cloudinary
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const file = new File([blob], `${verificationCode}.pdf`, { type: 'application/pdf' });

      const uploadUrl = await cloudinaryService.uploadFile(file, `Namaa-Academy/certificates`);

      // 7. Save metadata to Firestore
      const certData = {
        uid: userId,
        studentName,
        courseId,
        courseTitle,
        instructorName,
        platformName: "Namaa Academy",
        certificateUrl: uploadUrl,
        verificationCode,
        completedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'certificates', verificationCode), certData);

      return {
        id: verificationCode,
        ...certData
      };

    } catch (error) {
      logger.error('Error issuing certificate:', error);
      throw error;
    }
  }
};
