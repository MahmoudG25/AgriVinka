/**
 * Centralized Application Constants
 * DO NOT change string values here unless migrating the underlying Firestore architecture.
 */

export const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  ROADMAPS: 'roadmaps',
  ENROLLMENTS: 'enrollments',
  ORDERS: 'orders',
  PAGES: 'pages',
  ADMIN_STATS: 'adminStats',
  LESSON_PROGRESS: 'lessonProgress',
  COURSE_REQUESTS: 'courseRequests',
  FAVORITES: 'favorites',
  THEME_SETTINGS: 'themeSettings',
  CERTIFICATES: 'certificates',
  TEMPLATE_SETTINGS: 'templateSettings',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  PATHS: '/learning-paths',
  ABOUT: '/about',
  CONTACT: '/contact',
};
