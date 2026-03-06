import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import SEOHead from '../../components/common/SEOHead';

/* ─── Stagger Animation Helpers ─── */
const stagger = {
  parent: { animate: { transition: { staggerChildren: 0.06 } } },
  child: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  },
};

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return;
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await authService.resetPassword(email);
      setMessage('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني. الرجاء تفقد صندوق الوارد.');
    } catch (err) {
      setError('حدث خطأ. تأكد من صحة البريد الإلكتروني وأنه مسجل لدينا.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="استعادة كلمة المرور | AgriVinka" />

      <motion.div variants={stagger.parent} initial="initial" animate="animate" className="space-y-6">
        {/* Heading */}
        <motion.div variants={stagger.child}>
          <h2 className="text-2xl sm:text-3xl font-black text-heading-dark mb-1">استعادة كلمة المرور 🔑</h2>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإنشاء كلمة مرور جديدة.
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

        {/* Success */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium border border-green-200 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-green-600 shrink-0 text-lg">check_circle</span>
            {message}
          </motion.div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <motion.div variants={stagger.child}>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-base font-bold text-white bg-heading-dark hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  إرسال الرابط
                  <span className="material-symbols-outlined rtl:rotate-180 text-lg">send</span>
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* Back to Login */}
        <motion.div variants={stagger.child} className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-heading-dark transition-colors">
            <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
            العودة لتسجيل الدخول
          </Link>
        </motion.div>
      </motion.div>
    </>
  );
};

export default ResetPasswordPage;
