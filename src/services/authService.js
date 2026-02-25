import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseAuthProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { userService } from './userService';
import { logger } from '../utils/logger';

const googleProvider = new GoogleAuthProvider();
// Optional: add custom parameters if needed
// googleProvider.setCustomParameters({ prompt: 'select_account' });

export const authService = {
  /**
   * Register a new user with email and password
   * @param {string} email 
   * @param {string} password 
   * @param {string} displayName 
   * @returns {Promise<Object>} Firebase User
   */
  async register(email, password, displayName) {
    try {
      // 1. Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update auth profile
      await updateFirebaseAuthProfile(user, { displayName });

      // 3. Send verification email
      await sendEmailVerification(user);

      // 4. Create Firestore profile
      await userService.createProfile(user.uid, {
        email: user.email,
        displayName,
        photoURL: user.photoURL
      });

      return user;
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Login with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} Firebase User
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login
      await userService.updateLastLogin(user.uid);

      return user;
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Login or Register with Google popup
   * @returns {Promise<Object>} Firebase User
   */
  async loginWithGoogle() {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const profile = await userService.getProfile(user.uid);

      if (!profile) {
        // First time login -> Create profile
        await userService.createProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        // Existing user -> Update last login
        await userService.updateLastLogin(user.uid);
      }

      return user;
    } catch (error) {
      logger.error('Google sign-in error:', error);
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Send password reset email
   * @param {string} email 
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  },

  /**
   * Resend email verification
   * @param {Object} user - Firebase Auth User
   */
  async resendVerificationEmail(user) {
    try {
      if (user) {
        await sendEmailVerification(user);
      }
    } catch (error) {
      logger.error('Resend verification error:', error);
      throw error;
    }
  }
};
