import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addToast, openModal } from '../../store/slices/uiSlice';
import { userService } from '../../services/userService';
import { enrollmentService } from '../../services/enrollmentService';
import { logger } from '../../utils/logger';
import { MdSearch, MdPeople, MdShield, MdEdit } from 'react-icons/md';

const ROLE_OPTIONS = [
  { value: 'student', label: 'طالب', color: 'bg-blue-100 text-blue-700' },
  { value: 'editor', label: 'محرر', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'admin', label: 'مدير', color: 'bg-red-100 text-red-700' }
];

const getRoleBadge = (role) => {
  const opt = ROLE_OPTIONS.find(r => r.value === role) || ROLE_OPTIONS[0];
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${opt.color}`}>
      {opt.label}
    </span>
  );
};

const UsersListPage = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollmentCounts, setEnrollmentCounts] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);

      // Fetch enrollment counts for each user (fire in parallel)
      const countsMap = {};
      await Promise.all(
        data.map(async (user) => {
          try {
            const enrollments = await enrollmentService.getUserEnrollments(user.id);
            countsMap[user.id] = enrollments.length;
          } catch {
            countsMap[user.id] = 0;
          }
        })
      );
      setEnrollmentCounts(countsMap);
    } catch (error) {
      logger.error('Failed to fetch users:', error);
      dispatch(addToast({ type: 'error', message: 'فشل تحميل المستخدمين' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(u =>
      (u.displayName || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.role || '').toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handleChangeRole = useCallback((user) => {
    dispatch(openModal({
      type: 'CONFIRM',
      props: {
        title: 'تغيير الدور',
        message: `تغيير دور "${user.displayName || user.email}" الحالي: ${user.role || 'student'}`,
        confirmText: 'حفظ',
        isDestructive: false,
        showInput: true,
        inputLabel: 'الدور الجديد (student / editor / admin)',
        inputPlaceholder: 'student',
        onConfirm: async (newRole) => {
          const validRoles = ['student', 'editor', 'admin'];
          if (!validRoles.includes(newRole)) {
            dispatch(addToast({ type: 'error', message: 'الدور غير صالح. استخدم: student, editor, admin' }));
            return;
          }
          try {
            await userService.updateUserRole(user.id, newRole);
            dispatch(addToast({ type: 'success', message: `تم تحديث الدور إلى ${newRole}` }));
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
          } catch (error) {
            logger.error('Failed to update role:', error);
            dispatch(addToast({ type: 'error', message: 'فشل تحديث الدور' }));
          }
        }
      }
    }));
  }, [dispatch]);

  const formatDate = (val) => {
    if (!val) return '-';
    if (val.seconds) return new Date(val.seconds * 1000).toLocaleDateString('ar-EG');
    if (val instanceof Date) return val.toLocaleDateString('ar-EG');
    return new Date(val).toLocaleDateString('ar-EG');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-heading-dark">إدارة المستخدمين</h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading-dark flex items-center gap-2">
          <MdPeople className="text-primary" />
          إدارة المستخدمين ({users.length})
        </h1>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-1/3">
        <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="بحث بالاسم أو البريد..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-4 pr-10 py-3 rounded-xl border border-border-light focus:outline-none focus:border-primary w-full bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-background-alt text-gray-500 font-medium">
              <tr>
                <th className="p-4">المستخدم</th>
                <th className="p-4">الدور</th>
                <th className="p-4">تاريخ التسجيل</th>
                <th className="p-4">آخر دخول</th>
                <th className="p-4">الدورات المسجلة</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            (user.displayName || 'U')[0]
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-heading-dark">{user.displayName || 'بدون اسم'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(user.lastLoginAt)}</td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-primary">
                        {enrollmentCounts[user.id] ?? '...'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleChangeRole(user)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        title="تغيير الدور"
                      >
                        <MdShield size={18} />
                        <span className="text-xs hidden sm:inline">تغيير الدور</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    لا يوجد مستخدمون
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersListPage;
