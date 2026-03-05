import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import SEOHead from '../../components/common/SEOHead';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
// Logo removed

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  if (currentUser) {
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await authService.login(email, password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      let msg = 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'تم حظر الحساب مؤقتاً بسبب كثرة المحاولات. حاول لاحقاً.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      <SEOHead title="تسجيل الدخول | AgriVinka" />

      {/* === Left Panel: Decorative (hidden on mobile) === */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-heading-dark via-gray-900 to-black items-center justify-center overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 text-center px-16">
          <div className="mb-10 flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
              <span className="material-symbols-outlined text-white text-5xl">eco</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            مرحباً بك في <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AgriVinka</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            منصتك للتدريب التقني المتميز. تعلّم من الخبراء وابنِ مستقبلك المهني.
          </p>

          {/* Social proof */}
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-3xl font-black text-white">+10k</p>
              <p className="text-gray-500 text-sm font-medium">طالب</p>
            </div>
            <div className="border-r border-white/10"></div>
            <div>
              <p className="text-3xl font-black text-white">+50</p>
              <p className="text-gray-500 text-sm font-medium">دورة</p>
            </div>
            <div className="border-r border-white/10"></div>
            <div>
              <p className="text-3xl font-black text-accent">4.9</p>
              <p className="text-gray-500 text-sm font-medium">تقييم</p>
            </div>
          </div>
        </div>
      </div>

      {/* === Right Panel: Form === */}
      <div className="flex-1 flex flex-col justify-center bg-background-alt relative overflow-hidden">
        {/* Mobile background shapes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 lg:hidden"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/5 rounded-full blur-[80px] pointer-events-none translate-y-1/2 lg:hidden"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 w-full px-6 py-12 sm:px-12 lg:px-16 xl:px-24"
        >
          {/* Logo (Mobile only) */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-md shadow-primary/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">eco</span>
              </div>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-wide">AgriVinka</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-heading-dark mb-2">تسجيل الدخول</h2>
            <p className="text-gray-500 font-medium">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="font-bold text-primary hover:text-accent transition-colors">
                أنشئ حساباً مجانياً
              </Link>
            </p>
          </div>

          {/* Google Login */}
          <GoogleSignInButton
            onSuccess={() => navigate(location.state?.from?.pathname || '/dashboard', { replace: true })}
            onError={(msg) => setError(msg)}
          />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-background-alt text-gray-400 font-medium">أو باستخدام البريد الإلكتروني</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-xl">mail</span>
                </div>
                <input
                  type="email"
                  required
                  dir="ltr"
                  className="block w-full pr-10 pl-3 py-3 font-mono text-left border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 hover:bg-white transition-colors text-sm text-gray-900 font-medium outline-none"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-xl">lock</span>
                </div>
                <input
                  type="password"
                  required
                  dir="ltr"
                  className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 hover:bg-white transition-colors text-sm text-gray-900 font-medium outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                <span className="text-sm text-gray-700">تذكرني</span>
              </label>
              <Link to="/reset-password" className="text-sm font-bold text-primary hover:text-accent transition-colors">
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow text-lg font-bold text-white bg-primary hover:bg-heading-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  تسجيل الدخول
                  <span className="material-symbols-outlined rtl:rotate-180">login</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
