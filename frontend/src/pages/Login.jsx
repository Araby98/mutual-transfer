import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { AppContext } from '../context/AppContext';
import { t } from '../locales/dictionary';
import { LogIn, Mail, Lock } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { lang } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      login(res.data.user, res.data.token);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'email_not_verified') {
        setError(t(lang, 'email_not_verified'));
        setIsUnverified(true);
      } else {
        setError(t(lang, 'check_creds'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 md:mt-20">
      <div className="card shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
        <div className="text-center mb-8">
          <div className="bg-indigo-50 dark:bg-indigo-900/40 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
            <LogIn className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">{t(lang, 'welcome_back')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">{t(lang, 'login_desc')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            {isUnverified && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/verify-email', { state: { email, autoSend: true } })}
                  className="px-4 py-2 text-xs font-bold bg-white dark:bg-red-950 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 rounded shadow-sm border border-red-200 dark:border-red-800 transition-colors"
                >
                  {lang === 'ar' ? 'قم بتأكيد حسابك أو اطلب رمزًا جديدًا' : 'Verify Account / Get Code'}
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-text">{t(lang, 'email_address')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 px-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                className="input-field ltr:pl-10 rtl:pr-10"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label-text mb-0">{t(lang, 'password')}</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
              >
                {t(lang, 'forgot_password')}
              </Link>
            </div>
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
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-2 py-2.5 shadow-md shadow-indigo-200 dark:shadow-none"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t(lang, 'signing_in')}
              </span>
            ) : t(lang, 'login')}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400 transition-colors">
          <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
            {t(lang, 'dont_have_acct')}
          </Link>
        </div>
      </div>
    </div>
  );
}
