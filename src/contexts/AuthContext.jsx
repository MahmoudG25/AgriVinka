import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../firebase/config';
import { userService } from '../services/userService';
import { logger } from '../utils/logger';
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
          setUserData(profile);
          const adminStatus = profile?.role === 'admin' || profile?.role === 'editor';
          setIsAdmin(adminStatus);

          dispatch(setAuthStatus({ user, profile, isAdmin: adminStatus }));
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
