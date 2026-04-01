import React, { useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { AppContext } from '../context/AppContext';
import { t } from '../locales/dictionary';
import { Lock, CheckCircle, XCircle } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { lang } = useContext(AppContext);
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) { setError(t(lang, 'password_too_short')); return; }
    if (password !== confirm) { setError(t(lang, 'passwords_no_match')); return; }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg === 'invalid_or_expired_token' ? t(lang, 'invalid_token') : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto mt-20 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-slate-700 dark:text-slate-300 font-semibold">{t(lang, 'invalid_token')}</p>
        <Link to="/login" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
          {t(lang, 'back_to_login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-16 animate-fade-in">
      <div className="card shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-800 border-0 transition-colors">
        {success ? (
          <div className="text-center py-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t(lang, 'password_reset_success')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {lang === 'ar' ? 'جاري تحويلك إلى صفحة الدخول...' : 'Redirecting you to login...'}
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="bg-indigo-50 dark:bg-indigo-900/40 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t(lang, 'reset_password_title')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t(lang, 'reset_password_desc')}</p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-text">{t(lang, 'new_password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 px-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    className="input-field ltr:pl-10 rtl:pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    dir="ltr"
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="label-text">{t(lang, 'confirm_password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 px-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    className="input-field ltr:pl-10 rtl:pr-10"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    dir="ltr"
                    minLength={6}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-2.5 mt-2 shadow-md shadow-indigo-200 dark:shadow-none" disabled={loading}>
                {loading ? t(lang, 'resetting') : t(lang, 'reset_password_btn')}
              </button>
            </form>

            <div className="text-center mt-5">
              <Link to="/login" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                {t(lang, 'back_to_login')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
