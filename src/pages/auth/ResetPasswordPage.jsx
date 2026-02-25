import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import SEOHead from '../../components/common/SEOHead';

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
    <div className="min-h-screen bg-background-alt flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEOHead title="استعادة كلمة المرور | أكاديمية نماء" />

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2"></div>

      <div className="sm:mx-auto sm:w-full  relative z-10">
        <Link to="/" className="flex justify-center mb-6 drop-shadow-sm group">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-4xl">eco</span>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-black text-heading-dark">
          استعادة كلمة المرور
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإنشاء كلمة مرور جديدة.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full  relative z-10"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 rounded-3xl sm:px-10 border border-gray-100">

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium border border-green-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 shrink-0">check_circle</span>
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-xl">mail</span>
                </div>
                <input
                  type="email"
                  required
                  dir="ltr"
                  className="block w-full pr-10 pl-3 py-3 font-mono text-left border-gray-200 rounded-xl focus:ring-primary focus:border-primary sm:text-sm bg-gray-50 hover:bg-white transition-colors"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-primary hover:bg-heading-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    إرسال الرابط
                    <span className="material-symbols-outlined rtl:rotate-180">send</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <Link to="/login" className="font-bold text-gray-500 hover:text-heading-dark transition-colors text-sm flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
                العودة لتسجيل الدخول
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
