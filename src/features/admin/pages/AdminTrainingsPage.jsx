import React, { useState } from 'react';
import SEOHead from '../../../components/common/SEOHead';
import AdminTrainingsList from './AdminTrainingsList';
import AdminTrainingApplications from './AdminTrainingApplications';

const AdminTrainingsPage = () => {
  const [activeTab, setActiveTab] = useState('trainings'); // 'trainings' or 'applications'

  return (
    <div className="p-6 w-full lg:w-11/12 mx-auto min-h-[80vh]">
      <SEOHead title="التدريب العملي | الإدارة" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading-dark mb-4">التدريب العملي</h1>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-px overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('trainings')}
            className={`px-6 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'trainings'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            إدارة التدريبات
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'applications'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            طلبات التقديم
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'trainings' ? (
          <AdminTrainingsList isTab={true} />
        ) : (
          <AdminTrainingApplications isTab={true} />
        )}
      </div>

    </div>
  );
};

export default AdminTrainingsPage;
