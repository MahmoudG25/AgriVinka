import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RequireAuth from '../components/RequireAuth';
import AdminLayout from '../layout/AdminLayout';

// Lazy load admin pages for better code splitting
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const CoursesListPage = lazy(() => import('../pages/CoursesListPage'));
const CourseEditPage = lazy(() => import('../pages/CourseEditPage'));
const RoadmapsListPage = lazy(() => import('../pages/RoadmapsListPage'));
const RoadmapEditPage = lazy(() => import('../pages/RoadmapEditPage'));
const ImportCoursesPage = lazy(() => import('../importer/ImportCoursesPage'));
const HomeEditPage = lazy(() => import('../pages/HomeEditPage'));
const AboutEditPage = lazy(() => import('../pages/AboutEditPage'));
const OrdersListPage = lazy(() => import('../pages/OrdersListPage'));
const CourseRequestsPage = lazy(() => import('../pages/CourseRequestsPage'));
const UsersListPage = lazy(() => import('../pages/UsersListPage'));
const PageBuilder = lazy(() => import('../pages/PageBuilder'));
const ThemeManager = lazy(() => import('../pages/ThemeManager'));
const AdminTrainingsPage = lazy(() => import('../pages/AdminTrainingsPage'));
const AdminTrainingEdit = lazy(() => import('../pages/AdminTrainingEdit'));

// Loading skeleton
const AdminPageLoader = () => (
  <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background-alt">
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-gray-300 rounded"></div>
      <div className="h-4 w-64 bg-gray-300 rounded"></div>
    </div>
  </div>
);

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

      <Route path="/" element={
        <RequireAuth>
          <AdminLayout />
        </RequireAuth>
      }>
        <Route index element={
          <Suspense fallback={<AdminPageLoader />}>
            <DashboardPage />
          </Suspense>
        } />

        <Route path="home" element={
          <Suspense fallback={<AdminPageLoader />}>
            <HomeEditPage />
          </Suspense>
        } />

        <Route path="builder" element={
          <Suspense fallback={<AdminPageLoader />}>
            <PageBuilder />
          </Suspense>
        } />

        <Route path="theme" element={
          <Suspense fallback={<AdminPageLoader />}>
            <ThemeManager />
          </Suspense>
        } />

        <Route path="about" element={
          <Suspense fallback={<AdminPageLoader />}>
            <AboutEditPage />
          </Suspense>
        } />

        <Route path="orders" element={
          <Suspense fallback={<AdminPageLoader />}>
            <OrdersListPage />
          </Suspense>
        } />

        <Route path="courses" element={
          <Suspense fallback={<AdminPageLoader />}>
            <CoursesListPage />
          </Suspense>
        } />

        <Route path="courses/import" element={
          <Suspense fallback={<AdminPageLoader />}>
            <ImportCoursesPage />
          </Suspense>
        } />

        <Route path="courses/new" element={
          <Suspense fallback={<AdminPageLoader />}>
            <CourseEditPage />
          </Suspense>
        } />

        <Route path="courses/:id" element={
          <Suspense fallback={<AdminPageLoader />}>
            <CourseEditPage />
          </Suspense>
        } />

        <Route path="roadmaps" element={
          <Suspense fallback={<AdminPageLoader />}>
            <RoadmapsListPage />
          </Suspense>
        } />

        <Route path="roadmaps/new" element={
          <Suspense fallback={<AdminPageLoader />}>
            <RoadmapEditPage />
          </Suspense>
        } />

        <Route path="roadmaps/:id" element={
          <Suspense fallback={<AdminPageLoader />}>
            <RoadmapEditPage />
          </Suspense>
        } />

        <Route path="course-requests" element={
          <Suspense fallback={<AdminPageLoader />}>
            <CourseRequestsPage />
          </Suspense>
        } />

        <Route path="trainings" element={
          <Suspense fallback={<AdminPageLoader />}>
            <AdminTrainingsPage />
          </Suspense>
        } />

        <Route path="trainings/:id" element={
          <Suspense fallback={<AdminPageLoader />}>
            <AdminTrainingEdit />
          </Suspense>
        } />

        <Route path="users" element={
          <Suspense fallback={<AdminPageLoader />}>
            <UsersListPage />
          </Suspense>
        } />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
