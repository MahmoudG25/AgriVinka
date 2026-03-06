import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { useAuth } from '../../app/contexts/AuthContext';
import SEOHead from '../../components/common/SEOHead';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

/* ─── Stagger Animation Helpers ─── */
const stagger = {
  parent: { animate: { transition: { staggerChildren: 0.06 } } },
  child: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  },
};

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
    <>
      <SEOHead title="تسجيل الدخول | AgriVinka" />

      <motion.div variants={stagger.parent} initial="initial" animate="animate" className="space-y-6">
        {/* Heading */}
        <motion.div variants={stagger.child}>
          <h2 className="text-2xl sm:text-3xl font-black text-heading-dark mb-1">مرحباً بعودتك 👋</h2>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            سجّل دخولك لمتابعة رحلتك التعليمية في عالم الزراعة.
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-red-500 shrink-0 text-lg">error</span>
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <motion.div variants={stagger.child}>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-xl">mail</span>
              </div>
              <input
                type="email"
                required
                dir="ltr"
                className="block w-full pr-11 pl-4 py-3 font-mono text-left border border-gray-200 rounded-xl bg-gray-50/80 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-gray-900 font-medium outline-none placeholder:text-gray-400"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div variants={stagger.child}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-gray-700">كلمة المرور</label>
              <Link to="/reset-password" className="text-xs font-bold text-primary hover:text-accent transition-colors">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-xl">lock</span>
              </div>
              <input
                type="password"
                required
                dir="ltr"
                className="block w-full pr-11 pl-4 py-3 border border-gray-200 rounded-xl bg-gray-50/80 hover:bg-white focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-gray-900 font-medium outline-none placeholder:text-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div variants={stagger.child}>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-base font-bold text-white bg-heading-dark hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </motion.div>
        </form>

        {/* Divider */}
        <motion.div variants={stagger.child} className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-400 font-medium">أو</span>
          </div>
        </motion.div>

        {/* Google */}
        <motion.div variants={stagger.child}>
          <GoogleSignInButton
            onSuccess={() => navigate(location.state?.from?.pathname || '/dashboard', { replace: true })}
            onError={(msg) => setError(msg)}
            text="المتابعة باستخدام Google"
          />
        </motion.div>

        {/* Switch to Register */}
        <motion.p variants={stagger.child} className="text-center text-sm text-gray-500 font-medium">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="font-bold text-primary hover:text-accent transition-colors">
            أنشئ حساباً مجانياً
          </Link>
        </motion.p>
      </motion.div>
    </>
  );
};

export default LoginPage;
