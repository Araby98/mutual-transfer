import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { AppContext } from '../context/AppContext';
import { t } from '../locales/dictionary';
import { ArrowRightLeft, LogOut, Sun, Moon, Globe } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { lang, toggleLang, theme, toggleTheme } = useContext(AppContext);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 w-full">
          <Link to="/" className="flex items-center gap-2 group text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition duration-200">
            <div className="bg-indigo-50 dark:bg-slate-800 p-2 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-slate-700 transition-colors">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg hidden sm:block tracking-tight text-slate-800 dark:text-slate-100">{t(lang, 'app_name')}</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Toggles */}
            <div className="flex items-center gap-2 mr-2 rtl:mr-0 rtl:ml-2 border-r dark:border-slate-700 pr-4 rtl:pr-0 rtl:pl-4">
              <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg transition-colors" title="Toggle Dark Mode">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={toggleLang} className="flex items-center gap-1.5 p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg transition-colors font-bold text-xs uppercase tracking-wider" title="Change Language">
                <Globe className="w-5 h-5" /> {lang === 'en' ? 'AR' : 'EN'}
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="hidden md:flex flex-col items-end rtl:items-start text-right rtl:text-left">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                     <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{user.firstName}</strong>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mt-1">
                    {user.isAdmin ? 'Admin' : user.grade}
                  </span>
                </div>
                <Link to="/profile" className="btn bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm px-3 py-1.5 flex items-center gap-1.5 focus:outline-none transition-colors border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                  <span className="hidden sm:inline text-slate-700 dark:text-slate-300 font-semibold">{t(lang, 'edit_profile')}</span>
                </Link>
                <button onClick={logout} className="btn btn-danger text-sm px-3 py-1.5 flex items-center gap-1.5 focus:outline-none">
                  <LogOut className="w-4 h-4 rtl:rotate-180" />
                  <span className="hidden sm:inline">{t(lang, 'logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {t(lang, 'login')}
                </Link>
                <Link to="/register" className="btn btn-primary text-sm px-4 py-1.5 shadow-indigo-200 dark:shadow-none shadow-sm">
                  {t(lang, 'sign_up')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
