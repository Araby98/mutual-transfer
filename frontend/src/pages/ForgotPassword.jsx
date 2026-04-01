import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { t } from '../locales/dictionary';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const { lang } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 animate-fade-in">
      <div className="mb-4">
        <Link to="/login" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors font-medium text-sm">
          <ArrowLeft className="w-4 h-4 rtl:hidden" />
          <ArrowRight className="w-4 h-4 hidden rtl:block" />
          {t(lang, 'back_to_login')}
        </Link>
      </div>

      <div className="card shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-800 border-0 transition-colors">
        {sent ? (
          <div className="text-center py-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t(lang, 'reset_email_sent')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {/* prettier explanation */}
              {lang === 'ar'
                ? 'إذا كان البريد مسجلًا لدينا، ستجد الرابط في صندوق الوارد خلال دقائق.'
                : "If this email is registered, you'll receive a link shortly. Check your spam folder too."}
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="bg-indigo-50 dark:bg-indigo-900/40 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Mail className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t(lang, 'forgot_password_title')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t(lang, 'forgot_password_desc')}</p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
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

              <button type="submit" className="btn btn-primary w-full py-2.5 shadow-md shadow-indigo-200 dark:shadow-none" disabled={loading}>
                {loading ? t(lang, 'sending') : t(lang, 'send_reset_link')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
