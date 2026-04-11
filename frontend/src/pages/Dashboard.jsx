import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { AppContext } from '../context/AppContext';
import { t } from '../locales/dictionary';
import axios from 'axios';
import { Plus, Trash2, Users, MapPin, Phone, Mail, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { regionsData, t_geo } from '../data/regions';
import { API_BASE_URL } from '../api';
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { lang } = useContext(AppContext);
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  
  const [selectedReqRegion, setSelectedReqRegion] = useState('');
  const [newProvince, setNewProvince] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [confirmCfg, setConfirmCfg] = useState({ isOpen: false, message: '', onConfirm: null });
  const [alertMsg, setAlertMsg] = useState('');
  // const API_BASE_URL = import.meta.env.VITE_API_URL; 
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(err);
      setRequests([]);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/requests/matches`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (Array.isArray(res.data)) {
        setMatches(res.data);
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error(err);
      setMatches([]);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchMatches();
  }, []);

  const handleAddRequest = async (e) => {
    e.preventDefault();
    if (!newProvince) {
      setError('Please select a target province');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/requests`, 
        { toProvince: newProvince },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setNewProvince('');
      setSelectedReqRegion('');
      fetchRequests();
      fetchMatches();
    } catch (err) {
      setError(t(lang, err.response?.data?.message || 'err_add_request'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReqExec = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/requests/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRequests();
      fetchMatches();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    setConfirmCfg({
      isOpen: true,
      message: t(lang, 'confirm_delete_req'),
      onConfirm: () => {
        handleDeleteReqExec(id);
        setConfirmCfg({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const markAsCompletedExec = async (matchId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/requests/matches/${matchId}/complete`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMatches();
    } catch(err) {
      console.error(err);
      setAlertMsg(t(lang, 'err_mark_complete'));
    }
  };

  const markAsCompleted = (matchId) => {
    setConfirmCfg({
      isOpen: true,
      message: t(lang, 'confirm_mark_complete'),
      onConfirm: () => {
        markAsCompletedExec(matchId);
        setConfirmCfg({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full transition-colors relative">
      {/* Modals */}
      {confirmCfg.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-500" />
              {t(lang, 'modal_confirm_title')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">{confirmCfg.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmCfg({ isOpen: false, message: '', onConfirm: null })} 
                className="px-4 py-2 font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {t(lang, 'modal_cancel')}
              </button>
              <button 
                onClick={confirmCfg.onConfirm} 
                className="px-4 py-2 font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20"
              >
                {t(lang, 'modal_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {alertMsg && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3.5 shadow-2xl shadow-red-500/20 bg-red-600 dark:bg-red-700 rounded-full border border-red-500 flex items-center gap-3 animate-fade-in transition-all">
          <div className="bg-white/20 rounded-full p-1"><AlertCircle className="w-5 h-5 text-white" /></div>
          <span className="text-white text-sm font-semibold tracking-wide pr-2">{alertMsg}</span>
          <button onClick={() => setAlertMsg('')} className="text-white/70 hover:text-white font-bold ml-2">×</button>
        </div>
      )}
      {/* Left Sidebar - Add/List Requests */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="card bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 shadow-lg shadow-indigo-200/50 dark:shadow-none hidden md:block border-0 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <UserAvatar name={user.firstName} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.firstName} {user.lastName}</h2>
              <div className="flex items-center gap-1.5 text-indigo-100 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                <span>{t(lang, 'currently_in')} <strong className="text-white">{t_geo(lang, user.frmProvince)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Request Form */}
        <div className="card shadow-md transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> 
            {t(lang, 'new_transfer_req')}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleAddRequest} className="space-y-4">
            <div>
              <label className="label-text">{t(lang, 'select_target_region')}</label>
              <select 
                className="input-field" 
                value={selectedReqRegion}
                onChange={(e) => {
                  setSelectedReqRegion(e.target.value);
                  setNewProvince('');
                }}
              >
                <option value="">-- {t(lang, 'select_target_region')} --</option>
                {Object.keys(regionsData).map(region => (
                  <option key={region} value={region}>{t_geo(lang, region)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label-text">{t(lang, 'select_target_province')}</label>
              <select 
                className="input-field" 
                value={newProvince}
                onChange={e => setNewProvince(e.target.value)}
                disabled={!selectedReqRegion}
              >
                <option value="">-- {t(lang, 'select_target_province')} --</option>
                {selectedReqRegion && regionsData[selectedReqRegion]
                  .filter(province => province !== user.frmProvince)
                  .map(province => (
                  <option key={province} value={province}>{t_geo(lang, province)}</option>
                ))}
              </select>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full py-2.5 mt-2 transition-colors" 
              disabled={loading || !newProvince}
            >
              <Plus className="w-5 h-5 rtl:mr-0 rtl:ml-2" /> 
              {loading ? '...' : t(lang, 'add_required_province')}
            </button>
          </form>
        </div>

        {/* List of Requests */}
        <div className="card shadow-md overflow-hidden p-0 sm:p-0 transition-colors">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t(lang, 'my_required_dest')}</h3>
          </div>
          
          <div className="p-2 sm:p-3 bg-white dark:bg-slate-800 transition-colors">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 flex flex-col items-center">
                <MapPin className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p>{t(lang, 'no_req_yet')}</p>
                <p className="text-sm mt-1">{t(lang, 'add_where_above')}</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {Array.isArray(requests) && requests.map(req => (
                  <li key={req.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-2 rounded-md transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{t_geo(lang, req.toProvince)}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(req.id)} 
                      className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-md transition-colors"
                      title="Delete request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Right Content - Potential Matches */}
      <div className="w-full lg:w-2/3">
        <div className="card shadow-xl shadow-slate-200/40 dark:shadow-none h-full p-0 sm:p-0 flex flex-col overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between transition-colors">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> 
              {t(lang, 'potential_matches')}
            </h3>
            <div className="text-sm font-medium bg-white dark:bg-slate-700 px-3 py-1 rounded-full text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-600/30 shadow-sm transition-colors">
              {matches.length} {t(lang, 'matches_found')}
            </div>
          </div>
          
          <div className="flex-1 bg-slate-50/30 dark:bg-slate-900/30 p-4 sm:p-6 transition-colors">
            {matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                  <Users className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                </div>
                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">{t(lang, 'no_matches_yet')}</h4>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                  {t(lang, 'no_match_desc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(matches) && matches.map(match => (
                  <div key={match.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-600 transition-all duration-300 flex flex-col">
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                      <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">{match.firstName} {match.lastName}</h4>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 w-max px-2.5 py-1 rounded-md mt-1.5 border border-indigo-100/50 dark:border-indigo-800/50">
                          <Award className="w-3.5 h-3.5" />
                          <span>{t_geo(lang, match.grade)}</span>
                        </div>
                      </div>
                      <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${match.matchStatus === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'}`}>
                        {match.matchStatus === 'completed' ? `🎉 ${t(lang, 'transferred')}` : t(lang, 'match_100')}
                      </div>
                    </div>
                    
                    <div className="space-y-3 flex-1 mb-5">
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{t(lang, 'currently_in')}</p>
                          <p className="font-medium text-slate-800 dark:text-slate-300">{t_geo(lang, match.frmProvince)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 text-sm">
                        <ArrowRightIcon className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0 rtl:rotate-180" />
                        <div>
                          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{t(lang, 'wants_to_go_to')}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {match.requests.map((r, idx) => (
                              <span key={r.id} className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                                {t_geo(lang, r.toProvince)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    
                    {match.matchStatus !== 'completed' ? (
                      <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                        <a 
                          href={`tel:${match.phone}`} 
                          onClick={(e) => { if(window.innerWidth >= 768) e.preventDefault(); }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors border border-slate-200 dark:border-slate-600 shadow-sm cursor-text md:cursor-auto"
                          dir="ltr"
                          title={t(lang, 'call')}
                        >
                          <Phone className="w-4 h-4 cursor-pointer md:cursor-text" /> 
                          <span className="md:hidden cursor-pointer">{t(lang, 'call')}</span>
                          <span className="hidden md:inline tracking-wider select-all cursor-text">{match.phone}</span>
                        </a>
                        <a 
                          href={`mailto:${match.email}`} 
                          onClick={(e) => { if(window.innerWidth >= 768) e.preventDefault(); }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-semibold transition-colors border border-indigo-100 dark:border-indigo-800 shadow-sm cursor-text md:cursor-auto"
                          title={t(lang, 'email')}
                        >
                          <Mail className="w-4 h-4 cursor-pointer md:cursor-text" /> 
                          <span className="md:hidden cursor-pointer">{t(lang, 'email')}</span>
                          <span className="hidden md:inline select-all cursor-text break-all">{match.email}</span>
                        </a>
                        <button 
                          onClick={() => markAsCompleted(match.matchId)} 
                          className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-all shadow-md mt-1"
                        >
                          <CheckCircle className="w-4 h-4 rtl:mr-0 rtl:ml-2" /> {t(lang, 'finalize_transfer_btn')}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col items-center gap-1">
                          <CheckCircle className="w-6 h-6 text-emerald-500 mb-1" />
                          <span className="font-bold text-sm">{t(lang, 'successfully_transferred')}</span>
                          <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80">{t(lang, 'congratulations')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserAvatar({ name }) {
  return (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
