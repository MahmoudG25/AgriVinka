import { authService } from '../authService';
import { certificateService } from '../certificateService';
import { cloudinaryService } from '../cloudinary';
import { createCertificatePdf } from '../createCertificatePdf';
import * as dbStorage from '../dbStorage';
import { normalizeMediaLink } from '../mediaLinkService';
import { pageService } from '../firestore/pageService';
import { themeService } from '../firestore/themeService';
import { userService } from '../firestore/userService';
import { courseService } from '../firestore/courseService';
import { roadmapService } from '../firestore/roadmapService';
import { enrollmentService } from '../firestore/enrollmentService';
import { aiDiagnosisService } from '../firestore/aiDiagnosisService';
import { orderService } from '../firestore/orderService';
import { favoritesService } from '../firestore/favoritesService';
import { courseRequestService } from '../firestore/courseRequestService';
import { adminStatsService } from '../firestore/adminStatsService';

export const firebaseAdapter = {
  auth: authService,
  certificate: certificateService,
  cloudinary: cloudinaryService,
  createCertificatePdf,
  dbStorage,
  mediaLinkService: { normalizeMediaLink },
  content: {
    page: pageService,
    theme: themeService,
  },
  user: userService,
  course: courseService,
  roadmap: roadmapService,
  enrollment: enrollmentService,
  aiDiagnosis: aiDiagnosisService,
  order: orderService,
  favorites: favoritesService,
  courseRequest: courseRequestService,
  adminStats: adminStatsService,
};
