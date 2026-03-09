import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { logger } from '../../../utils/logger';

const DashboardHeader = ({ userData, isAdmin }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      logger.error('Error logging out:', error);
    }
  };

  const roleBadge = {
    admin: { label: 'مدير', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    editor: { label: 'محرر', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    student: { label: 'طالب', color: 'bg-green-100 text-green-700 border-green-200' },
  };

  const role = userData?.role || 'student';
  const badge = roleBadge[role] || roleBadge.student;

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Avatar + Info */}
        <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-full border-2 border-primary/20 overflow-hidden bg-primary flex items-center justify-center shrink-0">
            {userData?.photoURL ? (
              <img src={userData.photoURL} alt={userData.displayName} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            ) : (
              <span className="text-2xl font-bold text-white">{userData?.displayName?.[0] || 'ن'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-heading-dark truncate">{userData?.displayName || 'مستخدم جديد'}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium truncate" dir="ltr">{userData?.email}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {isAdmin && (
            <button
              onClick={() => navigate('/features/admin')} // TODO: change this to /admin
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-heading-dark text-white font-bold rounded-xl text-sm hover:bg-primary transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">shield</span>
              لوحة الإدارة
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-3 py-2.5 bg-red-50 text-red-500 font-bold rounded-xl text-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
            title="تسجيل الخروج"
          >
            <span className="material-symbols-outlined text-base rtl:rotate-180">logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
