import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import SEOHead from '../../components/common/SEOHead';
import DashboardHeader from './components/DashboardHeader';
import StatsRow from './components/StatsRow';
import ContinueWatchingCard from './components/ContinueWatchingCard';
import MyCoursesGrid from './components/MyCoursesGrid';
import PendingOrdersSection from './components/PendingOrdersSection';
import AIHistorySection from './components/AIHistorySection';
import FavoritesSection from './components/FavoritesSection';
import CertificatesGrid from './components/CertificatesGrid';
import ProfileSettings from './components/ProfileSettings';

const UserDashboard = () => {
  const { currentUser, userData, isAdmin } = useAuth();
  const {
    courses,
    pendingOrders,
    rejectedOrders,
    favorites,
    aiScans,
    certificates,
    stats,
    continueItem,
    loading,
  } = useDashboardData(currentUser?.uid);

  return (
    <div className="min-h-screen bg-background-alt pt-24 pb-12">
      <SEOHead title="لوحة التحكم | أكاديمية نماء" />

      <div className="w-full px-4 md:px-8 lg:px-[5%]">
        {/* Compact Header */}
        <DashboardHeader userData={userData} isAdmin={isAdmin} />

        {/* Stats Row */}
        <div className="mt-6">
          <StatsRow stats={stats} loading={loading} />
        </div>

        {/* Main Content Grid: 2/3 content + 1/3 sidebar on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* Left: Primary content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Watching */}
            <ContinueWatchingCard course={continueItem} loading={loading} />

            {/* Pending Orders */}
            <PendingOrdersSection orders={pendingOrders} rejectedOrders={rejectedOrders} />

            {/* My Courses Grid */}
            <MyCoursesGrid courses={courses} loading={loading} />

            {/* Certificates */}
            <CertificatesGrid certificates={certificates} loading={loading} />
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Profile Settings */}
            <ProfileSettings />

            {/* AI History */}
            <AIHistorySection scans={aiScans} loading={loading} />

            {/* Favorites */}
            <FavoritesSection favorites={favorites} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
