import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,    // Firebase auth user subset
  profile: null, // Firestore user profile
  isAdmin: false,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthStatus: (state, action) => {
      const { user, profile, isAdmin } = action.payload;
      state.user = user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null;

      if (profile) {
        // Serialize Firebase Timestamps if they exist to avoid Redux non-serializable value errors
        const serializedProfile = { ...profile };
        if (serializedProfile.lastLoginAt && typeof serializedProfile.lastLoginAt.toMillis === 'function') {
          serializedProfile.lastLoginAt = serializedProfile.lastLoginAt.toMillis();
        }
        if (serializedProfile.createdAt && typeof serializedProfile.createdAt.toMillis === 'function') {
          serializedProfile.createdAt = serializedProfile.createdAt.toMillis();
        }
        state.profile = serializedProfile;
      } else {
        state.profile = null;
      }

      state.isAdmin = !!isAdmin;
      state.isAuthenticated = !!user;
    },
    clearAuth: (state) => {
      state.user = null;
      state.profile = null;
      state.isAdmin = false;
      state.isAuthenticated = false;
    }
  }
});

export const { setAuthStatus, clearAuth } = authSlice.actions;

export default authSlice.reducer;
