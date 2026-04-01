import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../App';
import { t } from '../locales/dictionary';
import { Mail, ShieldCheck, CheckCircle, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const { lang } = useContext(AppContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Resend state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  // Pre-fill email from navigation state (Register -> CheckEmail -> VerifyEmail)
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, { email, code });
      setSuccess(true);
      
      // Auto login with the data returned from backend
      if (resp.data.token && resp.data.user) {
        login(resp.data.user, resp.data.token);
        
        // Short delay to show success icon, then redirect to dashboard
        setTimeout(() => {
          if (resp.data.user.isAdmin) {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 1500);
      } else {
        // Fallback for success without token (redirect to login)
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg === 'invalid_token'
        ? (t(lang, 'verify_email_fail') || 'Invalid or expired code. Please try again.')
        : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setError('Enter your email first to resend the code.'); return; }
    setResendLoading(true);
    setResendDone(false);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, { email });
      setResendDone(true);
      setCode('');
    } catch {
      setResendDone(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 animate-fade-in">
      <div className="card shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-800 border-0 transition-colors">

        {success ? (
          <div className="text-center py-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {lang === 'ar' ? 'تم التحقق من البريد! جاري تحويلك...' : 'Email verified! Redirecting to dashboard...'}
            </h2>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="bg-indigo-50 dark:bg-indigo-900/40 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t(lang, 'check_email_title')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{t(lang, 'check_email_desc')}</p>
            </div>

            {resendDone && (
              <div className="mb-5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {t(lang, 'resend_sent')}
              </div>
            )}

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              {/* Email field */}
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

              {/* OTP code input */}
              <div>
                <label className="label-text">{t(lang, 'enter_code')}</label>
                <input
                  type="text"
                  className="input-field text-center text-3xl font-bold tracking-[0.5em] py-4"
                  placeholder="------"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full py-2.5 shadow-md shadow-indigo-200 dark:shadow-none" disabled={loading || code.length < 6}>
                {loading ? t(lang, 'verifying') : t(lang, 'verify_code_btn')}
              </button>
            </form>

            {/* Resend */}
            <div className="mt-5 text-center border-t border-slate-100 dark:border-slate-700 pt-5">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                {resendLoading ? t(lang, 'resending') : t(lang, 'resend_verification')}
              </button>
            </div>

            <div className="text-center mt-3">
              <Link to="/login" className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {t(lang, 'back_to_login')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
