import React, { createContext, useState, useEffect, useContext } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en');

  return (
    <AppContext.Provider value={{ lang, setLang, theme, toggleTheme, toggleLang }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
