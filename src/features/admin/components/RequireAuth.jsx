import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/contexts/AuthContext';

const RequireAuth = ({ children, requireAdmin = true, allowedRoles = [] }) => {
  const { currentUser, isAdmin, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login if not authenticated
    const loginPath = location.pathname.startsWith('/admin') ? '/features/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // If requires admin but user is not admin
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && userData?.role && !allowedRoles.includes(userData.role)) {
    // User is signed in and is an admin/editor, but does not have the specific required role
    return <Navigate to="/features/admin" replace />;
  }

  return children;
};

export default RequireAuth;
