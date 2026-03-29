import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import TopOfferBar from '../../components/common/TopOfferBar';
import Footer from '../../components/layout/Footer';
import AuthShell from '../../components/auth/AuthShell';
import { pageService } from '../../services/firestore/pageService';
import { logger } from '../../utils/logger';

// Lazy load pages for better performance
const Home = lazy(() => import('../../pages/Home'));
const PathsPage = lazy(() => import('../../pages/PathsPage'));
const CoursesPage = lazy(() => import('../../pages/CoursesPage'));
const RoadmapDetails = lazy(() => import('../../pages/RoadmapDetails'));
const CourseDetails = lazy(() => import('../../pages/CourseDetails'));
const PaymentSubmission = lazy(() => import('../../pages/Checkout/PaymentSubmission'));
const OrderUnderReview = lazy(() => import('../../pages/Checkout/OrderUnderReview'));
const OrderSuccess = lazy(() => import('../../pages/Checkout/OrderSuccess'));
const AboutPage = lazy(() => import('../../pages/AboutPage'));
const ContactPage = lazy(() => import('../../pages/ContactPage'));
const TermsPage = lazy(() => import('../../pages/TermsPage'));
const HelpCenterPage = lazy(() => import('../../pages/HelpCenterPage'));
const RequestCoursePage = lazy(() => import('../../pages/RequestCoursePage'));
const AIAssistantPage = lazy(() => import('../../pages/ai/AIAssistantPage'));
const PracticalTrainingPage = lazy(() => import('../../pages/PracticalTrainingPage'));
const ApplyTrainingPage = lazy(() => import('../../pages/ApplyTrainingPage'));
const PlantAnalyzerPage = lazy(() => import('../../features/plant-analyzer/pages/PlantAnalyzerPage'));
const MyAnalysesPage = lazy(() => import('../../features/plant-analyzer/pages/MyAnalysesPage'));

// Auth Pages
const LoginPage = lazy(() => import('../../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../../pages/auth/RegisterPage'));
const ResetPasswordPage = lazy(() => import('../../pages/auth/ResetPasswordPage'));
const UserDashboard = lazy(() => import('../../pages/dashboard/UserDashboard'));
const UserPracticalTrainingPage = lazy(() => import('../../pages/dashboard/UserPracticalTrainingPage'));
const CoursePlayer = lazy(() => import('../../pages/CoursePlayer'));
const PathPlayer = lazy(() => import('../../pages/PathPlayer'));
const CertificateVerification = lazy(() => import('../../pages/CertificateVerification'));
const CertificateViewPage = lazy(() => import('../../features/certificates/pages/CertificateViewPage.jsx'));

import RequireAuth from '../../features/admin/components/RequireAuth';

// Loading skeleton component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="animate-pulse space-y-4">
      <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

const PublicRoutes = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pageData, setPageData] = useState(null);

  const location = useLocation();
  const isPlayerRoute = location.pathname.includes('/play');
  const isAuthRoute = ['/login', '/register', '/reset-password'].includes(location.pathname);
  const isAnalyzerRoute = location.pathname === '/analyzer' || location.pathname === '/my-analyses' || location.pathname === '/ai/assistant';

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const data = await pageService.getPageData('home');
        setPageData(data);
      } catch (error) {
        logger.error("Failed to fetch page data:", error);
      }
    };
    fetchPageData();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  if (!pageData) {
    return <PageLoader />;
  }

  return (
    <div dir="rtl" className="bg-surface-white dark:bg-background-dark font-display text-body-text dark:text-gray-100 antialiased selection:bg-primary/30 min-h-screen transition-colors duration-300">
      {!isPlayerRoute && !isAuthRoute && !isAnalyzerRoute && (
        <>
          <TopOfferBar />
          <Navbar
            data={pageData.navbar}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
        </>
      )}

      <div className={`w-full ${!isPlayerRoute && !isAuthRoute && !isAnalyzerRoute ? 'min-h-[calc(100vh-80px)]' : 'min-h-screen'}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learning-paths" element={<PathsPage />} />
            <Route path="/roadmaps/:id" element={<RoadmapDetails />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/checkout/payment" element={<PaymentSubmission />} />
            <Route path="/checkout/review" element={<OrderUnderReview />} />
            <Route path="/checkout/success" element={<OrderSuccess />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/request-course" element={<RequestCoursePage />} />
            <Route path="/verify/:certificateId" element={<CertificateVerification />} />
            <Route path="/certificate/:certificateId" element={<CertificateViewPage />} />
            <Route path="/ai/assistant" element={<AIAssistantPage />} />
            <Route path="/practical-training" element={<PracticalTrainingPage />} />
            <Route path="/analyzer" element={<PlantAnalyzerPage />} />

            <Route element={<AuthShell />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            <Route path="/dashboard" element={
              <RequireAuth requireAdmin={false}>
                <UserDashboard />
              </RequireAuth>
            } />
            <Route path="/dashboard/practical-training" element={
              <RequireAuth requireAdmin={false}>
                <UserPracticalTrainingPage />
              </RequireAuth>
            } />
            <Route path="/my-analyses" element={
              <RequireAuth requireAdmin={false}>
                <MyAnalysesPage />
              </RequireAuth>
            } />
            <Route path="/courses/:courseId/play" element={
              <RequireAuth requireAdmin={false}>
                <CoursePlayer />
              </RequireAuth>
            } />
            <Route path="/roadmaps/:id/play" element={
              <RequireAuth requireAdmin={false}>
                <PathPlayer />
              </RequireAuth>
            } />
            <Route path="/practical-training/apply/:trainingId" element={
              <RequireAuth requireAdmin={false}>
                <ApplyTrainingPage />
              </RequireAuth>
            } />
          </Routes>
        </Suspense>
      </div>

      {!isPlayerRoute && !isAuthRoute && !isAnalyzerRoute && <Footer data={pageData.footer} />}
    </div>
  );
};

export default PublicRoutes;
