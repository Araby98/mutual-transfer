import React, { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { AppContext } from '../context/AppContext';
import { t } from '../locales/dictionary';
import { API_BASE_URL } from '../api';
import { Users, FileText, CheckCircle, ArrowRight, UserPlus, MapPin, SearchCheck, Building2 } from 'lucide-react';

export default function Landing() {
  const { user } = useContext(AuthContext);
  const { lang } = useContext(AppContext);
  const [stats, setStats] = useState({ users: 0, requests: 0, completed: 0 });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/public/stats`)
      .then(res => {
        if (typeof res.data === 'object') {
          setStats(res.data);
        }
      })
      .catch(console.error);
  }, []);

  if (user) {
    if (user.isAdmin) return <Navigate to="/admin" />;
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="w-full flex flex-col gap-16 animate-fade-in pb-12">
      <section className="text-center pt-8 md:pt-16 px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight mb-6 transition-colors">
          {t(lang, 'hero_title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-200">{t(lang, 'hero_title_2')}</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 transition-colors">
          {t(lang, 'hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn btn-primary text-lg px-8 py-3 w-full sm:w-auto shadow-xl shadow-indigo-600/20 dark:shadow-none">
            {t(lang, 'get_started')} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
          <Link to="/login" className="btn bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-lg px-8 py-3 w-full sm:w-auto shadow-sm transition-colors">
            {t(lang, 'sign_in_account')}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full px-4">
        <div className="card shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-4 rounded-full mb-4 transition-colors">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-4xl font-extrabold mb-1 dark:text-white transition-colors">{stats.users}</h3>
            <p className="font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase text-sm transition-colors">{t(lang, 'active_members')}</p>
          </div>
        </div>

        <div className="card shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 p-4 rounded-full mb-4 transition-colors">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-4xl font-extrabold mb-1 dark:text-white transition-colors">{stats.requests}</h3>
            <p className="font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase text-sm transition-colors">{t(lang, 'transfer_requests')}</p>
          </div>
        </div>

        <div className="card shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 p-4 rounded-full mb-4 transition-colors">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-4xl font-extrabold mb-1 dark:text-white transition-colors">{stats.completed}</h3>
            <p className="font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase text-sm transition-colors">{t(lang, 'successful_transfers')}</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full px-4 pt-10">
        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-12 transition-colors">{t(lang, 'how_it_works')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200 dark:shadow-none border-2 border-indigo-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 relative transition-colors">
              <UserPlus className="w-8 h-8 absolute opacity-10 text-indigo-500 dark:text-indigo-400" />
              1
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 transition-colors">{t(lang, 'step_1_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">{t(lang, 'step_1_desc')}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200 dark:shadow-none border-2 border-sky-100 dark:border-slate-700 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 relative transition-colors">
              <MapPin className="w-8 h-8 absolute opacity-10 text-sky-500 dark:text-sky-400" />
              2
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 transition-colors">{t(lang, 'step_2_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">{t(lang, 'step_2_desc')}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200 dark:shadow-none border-2 border-amber-100 dark:border-slate-700 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 relative transition-colors">
              <SearchCheck className="w-8 h-8 absolute opacity-10 text-amber-500 dark:text-amber-400" />
              3
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 transition-colors">{t(lang, 'step_3_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">{t(lang, 'step_3_desc')}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200 dark:shadow-none border-2 border-emerald-100 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 relative transition-colors">
              <Building2 className="w-8 h-8 absolute opacity-10 text-emerald-500 dark:text-emerald-400" />
              4
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 transition-colors">{t(lang, 'step_4_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">{t(lang, 'step_4_desc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
