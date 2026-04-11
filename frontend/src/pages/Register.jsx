import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { t } from '../locales/dictionary';
import { API_BASE_URL } from '../api';
import { UserPlus } from 'lucide-react';
import { regionsData, t_geo, grades } from '../data/regions';

export default function Register() {
  const [selectedRegion, setSelectedRegion] = useState('');
  const { lang } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    grade: 'technicien',
    email: '',
    password: '',
    frmProvince: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.frmProvince) {
      setError('Please select a province');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
      navigate('/check-email', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 md:my-12">
      <div className="card shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
        <div className="text-center mb-8">
          <div className="bg-indigo-50 dark:bg-indigo-900/40 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
            <UserPlus className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">{t(lang, 'create_acct')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">{t(lang, 'create_acct_desc')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label-text">{t(lang, 'fname')}</label>
            <input name="firstName" className="input-field" placeholder="John" onChange={handleChange} required />
          </div>
          <div>
            <label className="label-text">{t(lang, 'lname')}</label>
            <input name="lastName" className="input-field" placeholder="Doe" onChange={handleChange} required />
          </div>

          <div>
            <label className="label-text">{t(lang, 'phone')}</label>
            <input name="phone" className="input-field" placeholder="06XXXXXXXX" onChange={handleChange} required dir="ltr" />
          </div>
          <div>
            <label className="label-text">{t(lang, 'grade_target')}</label>
            <select name="grade" className="input-field" onChange={handleChange} value={formData.grade}>
              {grades.map((g) => (
                <option key={g} value={g}>{t_geo(lang, g)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">{t(lang, 'region')}</label>
            <select
              className="input-field"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setFormData({...formData, frmProvince: ''});
              }}
              required
            >
              <option value="">-- {t(lang, 'region')} --</option>
              {Object.keys(regionsData).map(region => (
                <option key={region} value={region}>{t_geo(lang, region)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">{t(lang, 'province')}</label>
            <select
              name="frmProvince"
              className="input-field"
              onChange={handleChange}
              value={formData.frmProvince}
              required
              disabled={!selectedRegion}
            >
              <option value="">-- {t(lang, 'province')} --</option>
              {selectedRegion && regionsData[selectedRegion].map(province => (
                <option key={province} value={province}>{t_geo(lang, province)}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label-text">{t(lang, 'email_address')}</label>
            <input type="email" name="email" className="input-field" placeholder="you@example.com" onChange={handleChange} required dir="ltr" />
          </div>
          <div className="md:col-span-2">
            <label className="label-text">{t(lang, 'password')}</label>
            <input type="password" name="password" className="input-field" placeholder="••••••••" onChange={handleChange} required dir="ltr" />
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary w-full py-2.5 shadow-md shadow-indigo-200 dark:shadow-none text-lg"
              disabled={loading}
            >
              <UserPlus className="w-5 h-5 rtl:ml-1 rtl:mr-0 mr-1" />
              {loading ? t(lang, 'creating') : t(lang, 'create_acct')}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400 transition-colors">
          <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
            {t(lang, 'already_have_acct')}
          </Link>
        </div>
      </div>
    </div>
  );
}
