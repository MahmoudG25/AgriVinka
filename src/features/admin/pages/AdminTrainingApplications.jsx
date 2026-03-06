import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../../services/firebase';
import { collection, onSnapshot, doc, writeBatch, orderBy, query } from 'firebase/firestore';
import SEOHead from '../../../components/common/SEOHead';
import { logger } from '../../../utils/logger';
import { exportToExcel } from '../../../utils/excelExport';
import { FaSearch, FaFilter, FaFileExcel, FaEdit, FaTimes, FaSpinner } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../app/store/slices/uiSlice';

const STATUS_OPTIONS = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'pending', label: 'جاري المراجعة' },
  { value: 'in_review', label: 'قيد التقييم' },
  { value: 'approved', label: 'تم القبول' },
  { value: 'rejected', label: 'مرفوض' },
  { value: 'need_info', label: 'مطلوب بيانات' }
];

const AdminTrainingApplications = ({ isTab = false }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [editForm, setEditForm] = useState({ status: '', adminMessage: '' });

  const dispatch = useDispatch();

  useEffect(() => {
    const appsRef = collection(db, 'trainingApplications');
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
      logger.error('Error fetching admin training applications:', error);
    });

    return () => unsubscribe();
  }, []);

  const openEditModal = (app) => {
    setSelectedApp(app);
    setEditForm({
      status: app.status || 'pending',
      adminMessage: app.adminMessage || ''
    });
  };

  const closeEditModal = () => {
    setSelectedApp(null);
    setEditForm({ status: '', adminMessage: '' });
  };

  const handleUpdate = async () => {
    if (!selectedApp) return;
    try {
      setUpdating(true);
      const batch = writeBatch(db);

      const updateData = {
        status: editForm.status,
        adminMessage: editForm.adminMessage.trim(),
        updatedAt: new Date()
      };

      // Update global application
      const globalRef = doc(db, 'trainingApplications', selectedApp.id);
      batch.update(globalRef, updateData);

      // Update user's subcollection copy
      const userRef = doc(db, `users/${selectedApp.uid}/trainingApplications`, selectedApp.id);
      batch.update(userRef, updateData);

      await batch.commit();

      dispatch(addToast({ type: 'success', message: 'تم تحديث حالة الطلب بنجاح' }));
      closeEditModal();
    } catch (error) {
      logger.error("Error updating training application:", error);
      dispatch(addToast({ type: 'error', message: 'حدث خطأ أثناء التحديث.' }));
    } finally {
      setUpdating(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        (app.fullName && app.fullName.toLowerCase().includes(lowerSearch)) ||
        (app.phone && app.phone.includes(lowerSearch)) ||
        (app.university && app.university.toLowerCase().includes(lowerSearch)) ||
        (app.nationalId && app.nationalId.includes(lowerSearch));

      return matchesStatus && matchesSearch;
    });
  }, [applications, searchTerm, filterStatus]);

  const handleExportExcel = () => {
    if (filteredApplications.length === 0) {
      dispatch(addToast({ type: 'error', message: 'لا توجد بيانات للتصدير' }));
      return;
    }

    const exportData = filteredApplications.map(app => ({
      "الاسم بالكامل": app.fullName || '',
      "رقم الهاتف": app.phone || '',
      "البريد الإلكتروني": app.email || '',
      "الرقم القومي": app.nationalId || '',
      "الجامعة": app.university || '',
      "الكلية": app.faculty || '',
      "التخصص": app.specialization || '',
      "الفرقة": app.gradeYear + (app.graduateYear ? ` (${app.graduateYear})` : ''),
      "اسم التدريب": app.trainingTitle || '',
      "تاريخ التقديم": app.createdAt?.toDate ? app.createdAt.toDate().toLocaleDateString('ar-EG') : '',
      "الحالة": STATUS_OPTIONS.find(o => o.value === app.status)?.label || app.status,
      "رسالة الإدارة": app.adminMessage || ''
    }));

    const dateStr = new Date().toISOString().split('T')[0];
    exportToExcel(exportData, `training_applications_${dateStr}`);
    dispatch(addToast({ type: 'success', message: 'تم تصدير البيانات بنجاح' }));
  };

  return (
    <div className={isTab ? "w-full" : "p-6 w-full lg:w-11/12 mx-auto min-h-[80vh]"}>
      {!isTab && <SEOHead title="إدارة طلبات التدريب العملي | AgriVinka" />}

      <div className={`flex flex-col md:flex-row items-start md:items-center gap-4 mb-8 ${isTab ? 'justify-end' : 'justify-between'}`}>
        {!isTab && (
          <div>
            <h1 className="text-2xl font-bold text-heading-dark">طلبات التدريب العملي</h1>
            <p className="text-gray-500 text-sm mt-1">مراجعة وتحديث حالات تقديم التدريب العملي</p>
          </div>
        )}

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <FaFileExcel /> تصدير Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters Panel */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="البحث بالاسم، الهاتف، الجامعة، أو الرقم القومي..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none transition-colors"
            />
          </div>
          <div className="w-full md:w-64 relative">
            <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none transition-colors appearance-none bg-white"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-primary w-full">
              <FaSpinner className="animate-spin text-4xl" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-20 text-gray-500">لا توجد طلبات مطابقة للبحث أو الفلتر.</div>
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold">
                <tr>
                  <th className="py-3 px-4 truncate">المتقدم</th>
                  <th className="py-3 px-4 truncate">رقم الهاتف</th>
                  <th className="py-3 px-4 truncate">التدريب</th>
                  <th className="py-3 px-4 truncate">الجامعة والكلية</th>
                  <th className="py-3 px-4 truncate">الحالة</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-heading-dark line-clamp-1" title={app.fullName}>{app.fullName}</p>
                        <p className="text-xs text-gray-500 line-clamp-1" title={app.email}>{app.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4" dir="ltr">
                      <span className="text-gray-600 block text-right">{app.phone}</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-800 font-medium line-clamp-1" title={app.trainingTitle}>{app.trainingTitle}</p>
                      <p className="text-xs text-gray-400">
                        {app.createdAt?.toDate ? app.createdAt.toDate().toLocaleDateString('ar-EG') : ''}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-800 line-clamp-1 text-xs" title={`${app.university} - ${app.faculty}`}>
                        {app.university} - {app.faculty}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {app.specialization} ({app.gradeYear})
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold border
                        ${app.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            app.status === 'need_info' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                      >
                        {STATUS_OPTIONS.find(o => o.value === app.status)?.label || app.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => openEditModal(app)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                        title="تعديل الحالة / إضافة رد"
                      >
                        <FaEdit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEditModal}></div>
          <div className="relative bg-white w-11/12 md:w-6/12 lg:w-4/12 rounded-2xl shadow-2xl flex flex-col animate-fade-in-down border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-heading-dark">تحديث حالة الطلب</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:bg-gray-100 rounded-lg p-1.5 transition-colors">
                <FaTimes />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                <p className="text-gray-500 mb-1">المتقدم: <strong className="text-gray-800">{selectedApp.fullName}</strong></p>
                <p className="text-gray-500">التدريب: <strong className="text-gray-800">{selectedApp.trainingTitle}</strong></p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الحالة الجديدة</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors appearance-none bg-white font-medium"
                >
                  {STATUS_OPTIONS.filter(o => o.value !== 'all').map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رسالة للمتقدم (اختياري)</label>
                <textarea
                  value={editForm.adminMessage}
                  onChange={(e) => setEditForm(prev => ({ ...prev, adminMessage: e.target.value }))}
                  rows="4"
                  placeholder="اكتب ملاحظاتك لتظهر للمستخدم في لوحة التحكم..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-colors resize-none"
                ></textarea>
                <p className="text-[11px] text-gray-400 mt-1">هذه الرسالة ستظهر للمستخدم في تفاصيل طلبه.</p>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeEditModal}
                disabled={updating}
                className="px-5 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-accent transition-colors disabled:opacity-50"
              >
                {updating ? <><FaSpinner className="animate-spin" /> جاري الحفظ...</> : 'حفظ التحديثات'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTrainingApplications;
