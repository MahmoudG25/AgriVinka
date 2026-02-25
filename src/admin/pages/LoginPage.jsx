import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../utils/logger';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      dispatch(addToast({ type: 'success', message: 'تم تسجيل الدخول بنجاح' }));
      navigate('/admin');
    } catch (error) {
      logger.error('Login failed:', error);
      dispatch(addToast({ type: 'error', message: 'فشل تسجيل الدخول: ' + error.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-heading-dark">تسجيل دخول المشرف</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-heading-dark font-bold py-3 rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
