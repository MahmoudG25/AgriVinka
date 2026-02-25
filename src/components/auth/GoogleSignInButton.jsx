import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { logger } from '../../utils/logger';

const GoogleSignInButton = ({ onSuccess, onError, text = "المتابعة باستخدام Google" }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await authService.loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch (error) {
      logger.error('Google Sign-In Error:', error);
      let msg = 'حدث خطأ أثناء تسجيل الدخول بـ Google. يرجى المحاولة مرة أخرى.';
      if (error.code === 'auth/popup-closed-by-user') {
        msg = 'تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        msg = 'يوجد حساب مرتبط بهذا البريد الإلكتروني مسبقاً.';
      }
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex justify-center items-center gap-3 py-3 px-4 rounded-xl shadow-sm bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <>
          {/* Google G Logo SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
            </g>
          </svg>
          {text}
        </>
      )}
    </button>
  );
};

export default GoogleSignInButton;
