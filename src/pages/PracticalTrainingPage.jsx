import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import SEOHead from '../components/common/SEOHead';
import TrainingCard from '../components/training/TrainingCard';
import { logger } from '../utils/logger';

const PracticalTrainingPage = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        // Get directly since we import above
        const trainingsRef = collection(db, 'trainings');
        const q = query(
          trainingsRef,
          where('status', '==', 'open')
        );

        const snapshot = await getDocs(q);
        const fetchedTrainings = [];
        snapshot.forEach(doc => {
          fetchedTrainings.push({ id: doc.id, ...doc.data() });
        });

        // Sort client side
        fetchedTrainings.sort((a, b) => {
          const dateA = a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const dateB = b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return dateB - dateA;
        });

        setTrainings(fetchedTrainings);
      } catch (error) {
        logger.error("Error fetching practical trainings:", error);
        // Fallback for missing index: fetch without orderBy
        try {
          const trainingsRef = collection(db, 'trainings');
          const q = query(trainingsRef, where('status', '==', 'open'));
          const snapshot = await getDocs(q);
          const fetchedTrainings = [];
          snapshot.forEach(doc => {
            fetchedTrainings.push({ id: doc.id, ...doc.data() });
          });
          // Sort client side
          fetchedTrainings.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
          setTrainings(fetchedTrainings);
        } catch (fallbackError) {
          logger.error("Fallback error:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-28 pb-20">
      <SEOHead
        title="التدريب العملي | AgriVinka"
        description="فرص التدريب العملي المتاحة لطلاب وخريجي كليات الزراعة."
      />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">

        {/* Page Header */}
        <div className="mb-10 text-center w-full md:w-8/12 lg:w-6/12 mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-heading-dark dark:text-gray-900 mb-4">
            فرص التدريب العملي
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            تصفح أحدث فرص التدريب وورش العمل الميدانية وسجل الآن لتطوير مهاراتك بشكل عملي.
          </p>
        </div>

        {/* List of Trainings */}
        {loading ? (
          <div className="flex flex-col gap-6 w-full md:w-10/12 lg:w-8/12 mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
                <div className="w-full md:w-32 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : typeof trainings !== 'undefined' && trainings.length > 0 ? (
          <div className="flex flex-col gap-6 w-full md:w-10/12 lg:w-8/12 mx-auto">
            {trainings.map(training => (
              <TrainingCard key={training.id} training={training} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-full md:w-10/12 lg:w-8/12 mx-auto">
            <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">لا توجد تدريبات متاحة حالياً</h3>
            <p className="text-gray-400 dark:text-gray-500">يرجى العودة لاحقاً لمتابعة أحدث الفرص التدريبية.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PracticalTrainingPage;
