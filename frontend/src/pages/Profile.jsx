import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../App';
import { t } from '../locales/dictionary';
import { regionsData, t_geo, grades } from '../data/regions';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import { User, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Profile() {
  const { lang } = useContext(AppContext);
  const { user, login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    grade: 'technicien',
    frmProvince: ''
  });
  
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '', // Needs to be manually maintained since backend previously didn't return it
        email: user.email || '',
        grade: user.grade || 'technicien',
        frmProvince: user.frmProvince || ''
      });

      // Find the region mapping
      for (const [region, provinces] of Object.entries(regionsData)) {
        if (provinces.includes(user.frmProvince)) {
          setSelectedRegion(region);
          break;
        }
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
    setFormData({...formData, frmProvince: ''}); // Reset province when region changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.put(`${API_BASE_URL}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      login(res.data, localStorage.getItem('token')); // Update context user object
      setMessage(t(lang, 'profile_updated'));
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8 md:my-10 animate-fade-in transition-colors">
      <div className="mb-4">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium text-sm">
          <ArrowLeft className="w-4 h-4 rtl:hidden" />
          <ArrowRight className="w-4 h-4 hidden rtl:block" />
          {t(lang, 'back_to_dashboard')}
        </Link>
      </div>
      <div className="card shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-800 border-0 transition-colors">
        <div className="text-center mb-8 border-b pb-8 border-slate-100 dark:border-slate-700">
          <div className="bg-indigo-50 dark:bg-indigo-900/40 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-sm transition-colors">
            <User className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
            {t(lang, 'edit_profile')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">
            {t(lang, 'update_profile_desc')}
          </p>
        </div>
        
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Identity */}
          <div>
            <label className="label-text">{t(lang, 'fname')}</label>
            <input name="firstName" className="input-field" placeholder="John" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div>
            <label className="label-text">{t(lang, 'lname')}</label>
            <input name="lastName" className="input-field" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
          </div>
          
          <div className="md:col-span-2">
             <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
          </div>

          {/* Contact Details */}
          <div>
            <label className="label-text">{t(lang, 'phone')}</label>
            <input name="phone" className="input-field" placeholder="06XXXXXXXX" value={formData.phone} onChange={handleChange} required dir="ltr" />
          </div>
          <div>
            <label className="label-text">{t(lang, 'email_address')}</label>
            <input type="email" name="email" className="input-field" placeholder="you@example.com" value={formData.email} onChange={handleChange} required dir="ltr" />
          </div>

          <div className="md:col-span-2">
             <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
          </div>

          {/* Career & Location */}
          <div>
            <label className="label-text">{t(lang, 'grade_target')}</label>
            <select name="grade" className="input-field" onChange={handleChange} value={formData.grade}>
              {grades.map((g) => (
                <option key={g} value={g}>{t_geo(lang, g)}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label className="label-text">{t(lang, 'region')}</label>
              <select className="input-field" value={selectedRegion} onChange={handleRegionChange} required>
                <option value="">-- {t(lang, 'region')} --</option>
                {Object.keys(regionsData).map(region => (
                  <option key={region} value={region}>{t_geo(lang, region)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">{t(lang, 'province')}</label>
              <select name="frmProvince" className="input-field" onChange={handleChange} value={formData.frmProvince} required disabled={!selectedRegion}>
                <option value="">-- {t(lang, 'province')} --</option>
                {selectedRegion && regionsData[selectedRegion].map(province => (
                  <option key={province} value={province}>{t_geo(lang, province)}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2 mt-6">
            <button type="submit" className="btn btn-primary w-full py-3 shadow-md shadow-indigo-200 dark:shadow-none text-md" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t(lang, 'save_changes')}...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t(lang, 'save_changes')}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
