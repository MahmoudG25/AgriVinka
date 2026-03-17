import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/contexts/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import SEOHead from '../../components/common/SEOHead';
import DashboardWelcomeBanner from './components/DashboardWelcomeBanner';
import StatsRow from './components/StatsRow';
import ContinueWatchingCard from './components/ContinueWatchingCard';
import MyCoursesGrid from './components/MyCoursesGrid';
import PendingOrdersSection from './components/PendingOrdersSection';
import AIHistorySection from './components/AIHistorySection';
import FavoritesSection from './components/FavoritesSection';
import CertificatesGrid from './components/CertificatesGrid';
import RecentActivity from './components/RecentActivity';
import ProfileSettings from './components/ProfileSettings';

const UserDashboard = () => {
  const { currentUser, userData, isAdmin } = useAuth();
  const {
    courses,
    pendingOrders, // Keeping for the hook, but removed from UI as requested
    rejectedOrders, // Keeping for the hook
    favorites,
    aiScans,
    certificates,
    stats,
    continueItem,
    recentActivities,
    loading,
  } = useDashboardData(currentUser?.uid);

  // Extend stats with certificatesCount for StatsRow
  // Many users expect 1 completed course = 1 certificate. We use Math.max so it never shows 0 if they completed courses.
  const dashStats = {
    ...stats,
    certificatesCount: Math.max(certificates.length, stats.completed),
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-12" dir="rtl">
      <SEOHead title="لوحة التحكم | AgriVinka" />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 max-w-[1440px] space-y-8">
        
        {/* Top Welcome Banner */}
        <DashboardWelcomeBanner userData={userData} continueItem={continueItem} />

        {/* Stats Row */}
        <div>
          <StatsRow stats={dashStats} loading={loading} />
        </div>

        {/* Main Layout Grid */}
        {/* Right side visually (since RTL grid starts right), bigger column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content (Right column 8/12) */}
          <div className="lg:col-span-8 space-y-8 order-last lg:order-first">
            {/* AI Analyzer Banner / History */}
            <AIHistorySection scans={aiScans} loading={loading} />

            {/* Current Learning */}
            <ContinueWatchingCard course={continueItem} loading={loading} />

            {/* My Courses */}
            <MyCoursesGrid courses={courses} loading={loading} />
          </div>

          {/* Sidebar Area (Left column 4/12) */}
          <div className="lg:col-span-4 space-y-8">
            {/* User Profile Settings (Requested by user) */}
            <ProfileSettings />

            {/* Pending & Rejected Orders (Practical Training + Purchases) */}
            <PendingOrdersSection orders={pendingOrders} rejectedOrders={rejectedOrders} />

            {/* Recent Activity */}
            <RecentActivity activities={recentActivities} />

            {/* Badges & Certificates */}
            <CertificatesGrid certificates={certificates} courses={courses} loading={loading} />

            {/* Favorite Courses */}
            <FavoritesSection favorites={favorites} loading={loading} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

