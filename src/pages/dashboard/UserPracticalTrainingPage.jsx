import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import SEOHead from '../../components/common/SEOHead';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaSpinner, FaEye, FaTimes, FaInbox } from 'react-icons/fa';
import { logger } from '../../utils/logger';

const STATUS_MAP = {
  'pending': { label: 'جاري المراجعة', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  'in_review': { label: 'قيد التقييم', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  'approved': { label: 'تم القبول', color: 'text-green-600 bg-green-50 border-green-200' },
  'rejected': { label: 'مرفوض', color: 'text-red-600 bg-red-50 border-red-200' },
  'need_info': { label: 'مطلوب بيانات', color: 'text-orange-600 bg-orange-50 border-orange-200' },
};

const UserPracticalTrainingPage = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to users/{uid}/trainingApplications subcollection
    const appsRef = collection(db, `users/${currentUser.uid}/trainingApplications`);
    const q = query(appsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsData = [];
      snapshot.forEach(doc => {
        appsData.push({ id: doc.id, ...doc.data() });
      });
      // Sort client-side
      appsData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setApplications(appsData);
      setLoading(false);
    }, (error) => {
      logger.error('Error fetching user training applications:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-28 pb-20 px-4 md:px-8">
      <SEOHead title="طلبات التدريب العملي | AgriVinka" />

      <div className="w-full lg:w-11/12 mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="text-gray-400 hover:text-primary transition-colors">
            <FaArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-heading-dark dark:text-gray-900">
              طلبات التدريب العملي
            </h1>
            <p className="text-gray-500 text-sm mt-1">تابع حالة طلبات تقديمك للتدريبات وورش العمل</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-primary">
              <FaSpinner className="animate-spin text-4xl" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FaInbox />
              </div>
              <h3 className="text-xl font-bold text-gray-500 mb-2">لا توجد طلبات تقديم</h3>
              <p className="text-gray-400 mb-6">لم تقم بالتقديم على أي تدريب عملي حتى الآن.</p>
              <Link to="/practical-training" className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-accent transition-colors">
                تصفح التدريبات المتاحة
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400">
                    <th className="py-4 px-6 font-bold truncate">اسم التدريب</th>
                    <th className="py-4 px-6 font-bold truncate whitespace-nowrap">تاريخ التقديم</th>
                    <th className="py-4 px-6 font-bold truncate">الحالة</th>
                    <th className="py-4 px-6 font-bold truncate">رسالة الإدارة</th>
                    <th className="py-4 px-6 font-bold text-center">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {applications.map(app => {
                    const statusInfo = STATUS_MAP[app.status] || STATUS_MAP['pending'];
                    return (
                      <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-heading-dark dark:text-gray-200">{app.trainingTitle}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(app.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {app.adminMessage ? (
                            <p className="text-gray-600 dark:text-gray-300 truncate max-w-[150px]" title={app.adminMessage}>
                              {app.adminMessage}
                            </p>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <FaEye size={18} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Details */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedApp(null)}></div>
          <div className="relative bg-white dark:bg-gray-800 w-11/12 md:w-7/12 lg:w-5/12 rounded-2xl shadow-2xl flex flex-col overflow-y-auto animate-fade-in-down border border-gray-100 dark:border-gray-700" style={{ maxHeight: '90vh' }}>

            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-heading-dark dark:text-gray-100">تفاصيل الطلب</h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-heading-dark dark:hover:text-gray-100 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">اسم التدريب</p>
                  <p className="font-bold text-heading-dark dark:text-gray-100">{selectedApp.trainingTitle}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الحالة</p>
                  <p className="font-bold text-heading-dark dark:text-gray-100">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] ${STATUS_MAP[selectedApp.status]?.color || STATUS_MAP['pending'].color}`}>
                      {STATUS_MAP[selectedApp.status]?.label || 'جاري المراجعة'}
                    </span>
                  </p>
                </div>
              </div>

              {selectedApp.adminMessage && (
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <p className="text-xs font-bold text-blue-800 dark:text-blue-400 mb-1">رسالة الإدارة:</p>
                  <p className="text-sm text-blue-900 dark:text-blue-300">{selectedApp.adminMessage}</p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">بيانات المتقدم</h4>

                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">الاسم</span>
                    <span className="font-medium text-heading-dark dark:text-gray-200">{selectedApp.fullName}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">رقم الهاتف</span>
                    <span className="font-medium text-heading-dark dark:text-gray-200" dir="ltr">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">الرقم القومي</span>
                    <span className="font-medium text-heading-dark dark:text-gray-200" dir="ltr">{selectedApp.nationalId}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">الجامعة</span>
                    <span className="font-medium text-heading-dark dark:text-gray-200">{selectedApp.university}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">الكلية</span>
                    <span className="font-medium text-heading-dark dark:text-gray-200">{selectedApp.faculty}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">التخصص</span>
                    <span className="font-medium text-heading-dark dark:text-gray-200">{selectedApp.specialization}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">الفرقة</span>
                    <span className="font-medium text-heading-dark dark:text-gray-200">{selectedApp.gradeYear} {selectedApp.graduateYear ? `(${selectedApp.graduateYear})` : ''}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserPracticalTrainingPage;
