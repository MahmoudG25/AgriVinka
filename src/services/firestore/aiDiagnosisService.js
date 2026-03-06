import { COLLECTIONS } from '../../constants';
import { db } from '../firebase';
import { logger } from '../../utils/logger';
import { cloudinaryService } from '../cloudinary';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// Mock responses for development
const MOCK_DISEASES = [
  {
    name: "عفن الأوراق (Leaf Blight)",
    confidence: 0.92,
    symptoms: ["بقع بنية أو سوداء على الأوراق", "اصفرار حواف الأوراق", "ذبول مبكر"],
    treatment: ["إزالة الأوراق المصابة فوراً", "تحسين التهوية حول النبات", "استخدام مبيد فطري نحاسي"],
    severity: "high"
  },
  {
    name: "نقص النيتروجين (Nitrogen Deficiency)",
    confidence: 0.85,
    symptoms: ["اصفرار عام في الأوراق القديمة", "بطء في النمو", "سيقان ضعيفة"],
    treatment: ["استخدام سماد غني بالنيتروجين", "إضافة مواد عضوية للتربة", "الري المنتظم"],
    severity: "low"
  },
  {
    name: "نبات سليم (Healthy Plant)",
    confidence: 0.98,
    symptoms: ["أوراق خضراء نضرة", "نمو طبيعي", "خلو من البقع أو الحشرات"],
    treatment: ["الاستمرار في العناية الحالية", "توفير إضاءة مناسبة", "تسميد دوري خفيف"],
    severity: "none"
  },
  {
    name: "البياض الدقيقي (Powdery Mildew)",
    confidence: 0.88,
    symptoms: ["بقع بيضاء مسحوقية على الأوراق", "تجعد الأوراق", "تساقط مبكر"],
    treatment: ["تقليل الرطوبة حول النبات", "رش بمحلول بيكربونات الصوديوم", "استخدام مبيد فطري كبريتي"],
    severity: "medium"
  }
];

export const aiDiagnosisService = {
  /**
   * Analyzes a plant image using an AI API.
   * Currently mocked for development. Replace with actual API call (e.g., Plant.id).
   */
  analyzeImage: async (imageFile) => {
    try {
      // 1. Simulate API delay (2-4 seconds)
      const delay = Math.floor(Math.random() * 2000) + 2000;
      await new Promise(resolve => setTimeout(resolve, delay));

      // 2. Select a random mock result (simulating AI prediction)
      const randomIndex = Math.floor(Math.random() * MOCK_DISEASES.length);
      const prediction = MOCK_DISEASES[randomIndex];

      // 3. Return a standardized format
      return {
        id: `scan_${Date.now()}`,
        timestamp: new Date().toISOString(),
        prediction: prediction,
      };

      /*
      // --- Example of Real Integration (Plant.id) ---
      const base64Image = await fileToBase64(imageFile);
      const response = await fetch('https://api.plant.id/v2/health_assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': 'YOUR_API_KEY'
        },
        body: JSON.stringify({ images: [base64Image], disease_details: ['description', 'treatment'] })
      });
      const data = await response.json();
      return mapPlantIdResponse(data);
      */

    } catch (error) {
      logger.error('Error analyzing plant image:', error);
      throw new Error('فشل في تحليل الصورة. يرجى المحاولة مرة أخرى.');
    }
  },

  /**
   * Saves the diagnosis result and the uploaded image to the user's history in Firestore.
   */
  saveScanHistory: async (userId, imageFile, analysisResult) => {
    if (!userId) return null; // Guest user, don't save

    try {
      // 1. Upload image to Cloudinary instead of Firebase Storage
      const downloadUrl = await cloudinaryService.uploadFile(imageFile, `users/${userId}/ai-scans`);

      // 2. Save metadata to Firestore subcollection: users/{uid}/aiScans
      const scanId = analysisResult.id;
      const scanRef = doc(db, COLLECTIONS.USERS, userId, 'aiScans', scanId);

      const scanData = {
        scanId: scanId,
        imageUrl: downloadUrl,
        prediction: analysisResult.prediction,
        timestamp: serverTimestamp(),
      };

      await setDoc(scanRef, scanData);
      return scanId;
    } catch (error) {
      logger.error('Error saving scan history for user:', userId, error);
      throw error;
    }
  },

  /**
   * Retrieves all saved scans for a specific user, ordered by date.
   */
  getUserScans: async (userId) => {
    try {
      if (!userId) return [];

      const scansRef = collection(db, COLLECTIONS.USERS, userId, 'aiScans');
      const q = query(scansRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      // If index doesn't exist yet, Firestore throws an error with a link to create it.
      logger.error('Error fetching user scan history:', error);
      return []; // Return empty array gracefully if it fails (e.g. missing index)
    }
  }
};
