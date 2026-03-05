import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import SEOHead from '../../components/common/SEOHead';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
// Logo removed

const RegisterPage = () => {
  const [name, setName] = useState('');
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
    if (!name || !email || !password) {
      setError('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await authService.register(email, password, name);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      let msg = 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.';
      if (err.code === 'auth/email-already-in-use') msg = 'البريد الإلكتروني مسجل لدينا بالفعل.';
      else if (err.code === 'auth/invalid-email') msg = 'صيغة البريد الإلكتروني غير صحيحة.';
      else if (err.code === 'auth/weak-password') msg = 'كلمة المرور ضعيفة جداً.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      <SEOHead title="إنشاء حساب جديد | AgriVinka" />

      {/* === Left Panel: Decorative (hidden on mobile) === */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-heading-dark via-gray-900 to-black items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 text-center px-16">
          <div className="mb-10 flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
              <span className="material-symbols-outlined text-white text-5xl">eco</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            انضم إلى آلاف <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">الطلاب الناجحين</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            ابدأ رحلتك التعليمية اليوم واحصل على مهارات سوق العمل من خبراء متخصصين.
          </p>

          {/* Benefits list */}
          <div className="text-right space-y-4">
            {[
              { icon: 'school', text: 'أكثر من 50 دورة تدريبية متخصصة' },
              { icon: 'workspace_premium', text: 'شهادات معتمدة عند الإتمام' },
              { icon: 'all_inclusive', text: 'وصول مدى الحياة للمحتوى' },
              { icon: 'support_agent', text: 'دعم مستمر من فريق المنصة' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                </div>
                <span className="text-gray-300 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === Right Panel: Form === */}
      <div className="flex-1 flex flex-col justify-center bg-background-alt relative overflow-hidden">
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
            <h2 className="text-3xl font-black text-heading-dark mb-2">إنشاء حساب جديد</h2>
            <p className="text-gray-500 font-medium">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="font-bold text-primary hover:text-accent transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </div>

          {/* Google */}
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
              <span className="px-3 bg-background-alt text-gray-400 font-medium">أو سجل باستخدام البريد الإلكتروني</span>
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
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">الاسم الكامل</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-xl">person</span>
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 hover:bg-white transition-colors text-sm text-gray-900 font-medium outline-none"
                  placeholder="أحمد محمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

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
                  placeholder="••••••••  (6 أحرف على الأقل)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Terms */}
            <p className="text-sm text-gray-500 font-medium">
              بتسجيلك، أنت توافق على{' '}
              <Link to="/terms" className="text-primary hover:text-accent underline font-bold">شروط الاستخدام</Link>
            </p>

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
                  إنشاء حساب
                  <span className="material-symbols-outlined rtl:rotate-180">person_add</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
