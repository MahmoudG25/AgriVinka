import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdCloudUpload } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { logger } from '../../../utils/logger';
import { openModal, addToast } from '../../../app/store/slices/uiSlice';
import DataTable from '../components/DataTable';
import { courseService } from '../../../services/firestore/courseService';

const CoursesListPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Fetch all courses (both published and unpublished for admin)
      const data = await courseService.getAllCourses(false);
      setCourses(data);
    } catch (error) {
      logger.error('Failed to fetch courses:', error);
      dispatch(addToast({ type: 'error', message: 'فشل تحميل الدورات' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = (course) => {
    dispatch(openModal({
      type: 'CONFIRM',
      props: {
        title: 'حذف الدورة',
        message: `هل أنت متأكد من حذف دورة "${course.title}"؟ لا يمكن التراجع عن هذا الإجراء.`,
        confirmText: 'حذف',
        isDestructive: true,
        onConfirm: async () => {
          try {
            await courseService.deleteCourse(course.id);
            dispatch(addToast({ type: 'success', message: 'تم حذف الدورة بنجاح' }));
            fetchCourses(); // Refresh list
          } catch (error) {
            console.error("Delete failed:", error);
            dispatch(addToast({ type: 'error', message: 'فشل حذف الدورة' }));
          }
        }
      }
    }));
  };

  if (loading) return <div>Loading...</div>;

  const data = courses.map(course => ({
    ...course,
    instructorName: course.instructor?.name || 'Unknown'
  }));

  const columns = [
    {
      header: 'الدورة',
      accessor: 'title',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.media?.thumbnail ? (
            <img src={item.media.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">N/A</div>
          )}
          <div>
            <p className="font-bold text-heading-dark text-sm line-clamp-1">{item.title}</p>
            <p className="text-xs text-gray-500">{item.short_title || item.id}</p>
          </div>
        </div>
      )
    },
    {
      header: 'المدرب',
      accessor: 'instructorName',
      render: (item) => <span className="text-sm text-gray-600">{item.instructorName}</span>
    },
    {
      header: 'السعر',
      accessor: 'price',
      render: (item) => (
        <div className="text-sm">
          {item.pricing?.price > 0 ? (
            <>
              <span className="font-bold text-heading-dark">${item.pricing.price}</span>
              {item.pricing.original_price > item.pricing.price && (
                <span className="text-xs text-gray-400 line-through mr-2">${item.pricing.original_price}</span>
              )}
            </>
          ) : (
            <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">مجاني</span>
          )}
        </div>
      )
    },
    {
      header: 'عدد الدروس',
      accessor: 'lessonsCount',
      render: (item) => {
        // Calculate total lessons - fallback to embedded sections if lessons_count isn't precomputed
        const count = item.lessons_count || item.sections?.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0) || 0;
        return <span className="text-sm text-gray-500">{count} درس</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="إدارة الدورات"
        data={data}
        columns={columns}
        onDelete={handleDelete}
        onEdit="/features/admin/courses"
        createLink="/features/admin/courses/new"
        extraActions={
          <Link
            to="/features/admin/courses/import"
            className="flex items-center gap-2 bg-white text-heading-dark border border-border-light font-bold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MdCloudUpload size={20} />
            <span>استيراد</span>
          </Link>
        }
      />
    </div>
  );
};

export default CoursesListPage;
