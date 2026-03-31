import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CheckEmail from './pages/CheckEmail';
import { AppProvider } from './context/AppContext';

export const AuthContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <AppProvider>
      <AuthContext.Provider value={{ user, login, logout, loading }}>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col animate-fade-in relative">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={!user ? <Login /> : (user.isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} />
                <Route path="/register" element={!user ? <Register /> : (user.isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} />
                <Route path="/dashboard" element={user ? (!user.isAdmin ? <Dashboard /> : <Navigate to="/admin" />) : <Navigate to="/login" />} />
                <Route path="/admin" element={user && user.isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/check-email" element={<CheckEmail />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthContext.Provider>
    </AppProvider>
  );
}

export default App;
