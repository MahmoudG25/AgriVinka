import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import SEOHead from '../../components/common/SEOHead';
import { logger } from '../../utils/logger';
import DataTable from '../components/DataTable';
import { useDispatch } from 'react-redux';
import { addToast, openModal } from '../../store/slices/uiSlice';

const AdminTrainingsList = ({ isTab = false }) => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const trainingsRef = collection(db, 'trainings');
    // For sorting, we can try orderBy but if index is missing we fallback
    const q = query(trainingsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      // Sort client-side to avoid index issues
      data.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });

      setTrainings(data);
      setLoading(false);
    }, (error) => {
      logger.error('Error fetching admin trainings:', error);
      dispatch(addToast({ type: 'error', message: 'فشل تحميل بيانات التدريبات' }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleDelete = (training) => {
    dispatch(openModal({
      type: 'CONFIRM',
      props: {
        title: 'حذف التدريب',
        message: `هل أنت متأكد من حذف تدريب "${training.title}"؟ لا يمكن التراجع عن هذا الإجراء وسيظل أي طلب تقديم مرتبط به موجوداً في قاعدة البيانات.`,
        confirmText: 'حذف',
        isDestructive: true,
        onConfirm: async () => {
          try {
            await deleteDoc(doc(db, 'trainings', training.id));
            dispatch(addToast({ type: 'success', message: 'تم حذف التدريب بنجاح' }));
          } catch (error) {
            logger.error("Error deleting training:", error);
            dispatch(addToast({ type: 'error', message: 'حدث خطأ أثناء החذف' }));
          }
        }
      }
    }));
  };

  const columns = [
    {
      header: 'عنوان التدريب',
      accessor: 'title',
      render: (item) => (
        <div>
          <p className="font-bold text-heading-dark line-clamp-1" title={item.title}>{item.title}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{item.shortDescription || '-'}</p>
        </div>
      )
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (item) => {
        const statuses = {
          open: { label: 'مفتوح للتقديم', color: 'bg-green-100 text-green-700' },
          closed: { label: 'مغلق', color: 'bg-red-100 text-red-700' },
          draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-700' },
        };
        const status = statuses[item.status] || statuses.draft;
        return (
          <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold ${status.color}`}>
            {status.label}
          </span>
        );
      }
    },
    {
      header: 'المدة',
      accessor: 'duration',
      render: (item) => <span className="text-sm font-medium">{item.duration || '-'}</span>
    },
    {
      header: 'المقاعد',
      accessor: 'seatsInfo',
      render: (item) => (
        <div className="text-sm">
          <p className="text-gray-800 font-bold">{item.totalSeats || 0}</p>
          <p className="text-xs text-gray-400">الإجمالي</p>
        </div>
      )
    },
    {
      header: 'تاريخ الإضافة',
      accessor: 'createdAt',
      render: (item) => (
        <span className="text-xs text-gray-500">
          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('ar-EG') : '-'}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={isTab ? "w-full" : "p-6 w-full lg:w-11/12 mx-auto"}>
      {!isTab && <SEOHead title="إدارة التدريبات | AgriVinka" />}

      {!isTab && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-heading-dark">إدارة برامج التدريب العملي</h1>
          <p className="text-gray-500 text-sm mt-1">إضافة، تعديل وحذف الفرص التدريبية المتاحة للطلاب.</p>
        </div>
      )}

      <DataTable
        title="التدريبات الحالية"
        data={trainings}
        columns={columns}
        onDelete={handleDelete}
        onEdit="/admin/trainings" // Will navigate to /admin/trainings/:id
        createLink="/admin/trainings/new"
      />
    </div>
  );
};

export default AdminTrainingsList;
