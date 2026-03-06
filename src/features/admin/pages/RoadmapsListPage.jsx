import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logger } from '../../../utils/logger';
import { openModal, addToast } from '../../../app/store/slices/uiSlice';
import DataTable from '../components/DataTable';
import { roadmapService } from '../../../services/firestore/roadmapService';

const RoadmapsListPage = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const data = await roadmapService.getAllRoadmaps();
      setRoadmaps(data);
    } catch (error) {
      logger.error('Failed to fetch roadmaps:', error);
      dispatch(addToast({ type: 'error', message: 'فشل تحميل المسارات' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleDelete = (roadmap) => {
    dispatch(openModal({
      type: 'CONFIRM',
      props: {
        title: 'حذف المسار',
        message: `هل أنت متأكد من حذف مسار "${roadmap.title}"؟`,
        confirmText: 'حذف',
        isDestructive: true,
        onConfirm: async () => {
          try {
            await roadmapService.deleteRoadmap(roadmap.id);
            dispatch(addToast({ type: 'success', message: 'تم حذف المسار بنجاح' }));
            fetchRoadmaps();
          } catch (error) {
            logger.error('Delete failed:', error);
            dispatch(addToast({ type: 'error', message: 'فشل حذف المسار' }));
          }
        }
      }
    }));
  };

  if (loading) return <div>Loading...</div>;

  const columns = [
    {
      header: 'المسار',
      accessor: 'title',
      render: (item) => (
        <div>
          <p className="font-bold text-heading-dark text-sm">{item.title}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
        </div>
      )
    },
    {
      header: 'عدد الدورات',
      accessor: 'courseIds',
      render: (item) => <span className="text-sm font-bold text-primary">{item.courseIds?.length || item.modules?.length || 0} دورات</span>
    },
    {
      header: 'المستوى',
      accessor: 'level',
      render: (item) => <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{item.level}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="إدارة المسارات"
        data={roadmaps}
        columns={columns}
        onDelete={handleDelete}
        onEdit="/features/admin/roadmaps"
        createLink="/features/admin/roadmaps/new"
      />
    </div>
  );
};

export default RoadmapsListPage;
