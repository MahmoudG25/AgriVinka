import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { auth } from '../../services/firebase';
import { userService } from '../../services/firestore/userService';
import { logger } from '../../utils/logger';
import { setAuthStatus, clearAuth } from '../store/slices/authSlice';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // Firestore profile
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          // Fetch additional user data from Firestore
          const profile = await userService.getProfile(user.uid);

          if (profile?.status === 'blocked') {
            await signOut(auth);
            toast.error('تم إيقاف حسابك. يرجى التواصل مع الإدارة.', { duration: 5000, id: 'auth_block' });
            setCurrentUser(null);
            setUserData(null);
            setIsAdmin(false);
            dispatch(clearAuth());
            setLoading(false);
            return;
          }

          setUserData(profile);
          const adminStatus = profile?.role === 'admin' || profile?.role === 'editor';
          setIsAdmin(adminStatus);

          // Sanitize user object for Redux (non-serializable Error fix)
          const serializableUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          };
          // Sanitize profile object (Convert Firestore Timestamps to ISO strings for Redux)
          const serializableProfile = profile ? { ...profile } : null;
          if (serializableProfile) {
            // Check common timestamp fields
            ['createdAt', 'updatedAt', 'lastLogin', 'lastLoginAt'].forEach(field => {
              if (serializableProfile[field] && typeof serializableProfile[field].toDate === 'function') {
                serializableProfile[field] = serializableProfile[field].toDate().toISOString();
              }
            });
          }

          dispatch(setAuthStatus({ user: serializableUser, profile: serializableProfile, isAdmin: adminStatus }));
        } else {
          setCurrentUser(null);
          setUserData(null);
          setIsAdmin(false);
          dispatch(clearAuth());
        }
      } catch (error) {
        logger.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [dispatch]);

  const value = {
    currentUser,
    userData,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
