import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { AppContext } from '../context/AppContext';
import { t } from '../locales/dictionary';
import { Users, FileText, CheckCircle, Clock, MapPin, Award, Check, Search, Filter, Settings, ToggleLeft, ToggleRight, Trash2, AlertCircle } from 'lucide-react';
import { regionsData, t_geo, grades } from '../data/regions';
import { API_BASE_URL } from '../api';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const { lang } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users'
  
  const [stats, setStats] = useState({ users: 0, requests: 0, matches: 0 });
  const [matches, setMatches] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [autoApprove, setAutoApprove] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [confirmCfg, setConfirmCfg] = useState({ isOpen: false, message: '', onConfirm: null });
  const [alertMsg, setAlertMsg] = useState('');

  // Filters
  const [filterGrade, setFilterGrade] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterMatchStatus, setFilterMatchStatus] = useState(''); // 'any', 'matched', 'no_match'
  const [hideEmptyRequests, setHideEmptyRequests] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      
      const [statsRes, matchesRes, usersRes, settingsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/stats`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/matches`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/users`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/settings`, { headers })
      ]);

      setStats(statsRes.data);
      if (Array.isArray(matchesRes.data)) {
        setMatches(matchesRes.data);
      }
      if (Array.isArray(usersRes.data)) {
        setUsersList(usersRes.data);
      }
      
      const autoSetting = Array.isArray(settingsRes.data) && settingsRes.data.find(s => s.key === 'autoApprove');
      if (autoSetting) {
        setAutoApprove(autoSetting.value === 'true');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const approveMatchExec = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/matches/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData(); // Refresh everything
    } catch (err) {
      console.error(err);
      setAlertMsg(t(lang, 'err_approve_match'));
    }
  };

  const approveMatch = (id) => {
    setConfirmCfg({
      isOpen: true,
      message: t(lang, 'confirm_approve_match'),
      onConfirm: () => {
        approveMatchExec(id);
        setConfirmCfg({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const toggleAutoApproveExec = async (newValue) => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/settings/autoApprove`, { value: newValue }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAutoApprove(newValue);
      if (newValue) fetchData(); // refresh if pending were approved
    } catch (err) {
      console.error(err);
      setAlertMsg(t(lang, 'err_update_settings'));
    }
  };

  const toggleAutoApprove = () => {
    const newValue = !autoApprove;
    if (newValue) {
      setConfirmCfg({
        isOpen: true,
        message: t(lang, 'confirm_auto_approve'),
        onConfirm: () => {
          toggleAutoApproveExec(newValue);
          setConfirmCfg({ isOpen: false, message: '', onConfirm: null });
        }
      });
    } else {
      toggleAutoApproveExec(newValue);
    }
  };

  const deleteUserExec = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData(); // Refresh UI
    } catch (err) {
      console.error(err);
      setAlertMsg(t(lang, 'err_delete_user'));
    }
  };

  const deleteUser = (id, name) => {
    setConfirmCfg({
      isOpen: true,
      message: t(lang, 'confirm_delete_user').replace('{name}', name),
      onConfirm: () => {
        deleteUserExec(id);
        setConfirmCfg({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  // Compute filtered users
  const filteredUsers = usersList.filter(u => {
    if (hideEmptyRequests && (!u.requests || u.requests.length === 0)) return false;
    if (filterGrade && u.grade !== filterGrade) return false;
    
    if (filterProvince) {
      if (u.frmProvince !== filterProvince) return false;
    } else if (filterRegion) {
      if (!regionsData[filterRegion].includes(u.frmProvince)) return false;
    }

    if (filterMatchStatus) {
      const isMatched = matches.some(m => m.user1Id === u.id || m.user2Id === u.id);
      if (filterMatchStatus === 'matched' && !isMatched) return false;
      if (filterMatchStatus === 'no_match' && isMatched) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in transition-colors relative">
      
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

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t(lang, 'sys_admin')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t(lang, 'sys_admin_desc')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
          >
            {t(lang, 'matches_overview')}
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
          >
            {t(lang, 'user_directory')}
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6 h-full transition-colors">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card shadow-sm flex items-center justify-between p-5 bg-white dark:bg-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t(lang, 'total_users')}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.users}</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/40 p-3 rounded-xl text-indigo-600 dark:text-indigo-400"><Users className="w-6 h-6" /></div>
            </div>
            
            <div className="card shadow-sm flex items-center justify-between p-5 bg-white dark:bg-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t(lang, 'transfer_requests')}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.requests}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/40 p-3 rounded-xl text-emerald-600 dark:text-emerald-400"><FileText className="w-6 h-6" /></div>
            </div>

            <div className="card shadow-sm flex items-center justify-between p-5 bg-white dark:bg-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t(lang, 'matched_pairs')}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.matches}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/40 p-3 rounded-xl text-amber-600 dark:text-amber-400"><CheckCircle className="w-6 h-6" /></div>
            </div>

            <div className="card shadow-sm flex items-center justify-between p-5 border-2 border-indigo-100 dark:border-indigo-800 bg-indigo-50/50 dark:bg-slate-800">
              <div>
                <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2 mt-1">{t(lang, 'auto_approve')}</p>
                <button 
                  onClick={toggleAutoApprove}
                  className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  {autoApprove ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-400 dark:text-slate-500" />}
                  <span className="font-bold text-sm tracking-wide">{autoApprove ? 'ENABLED' : 'DISABLED'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pending & Approved Matches */}
          <div className="card shadow-lg shadow-indigo-100/30 dark:shadow-none p-0 overflow-hidden border-0 bg-white dark:bg-slate-800 transition-colors">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> {t(lang, 'detected_matches')}
              </h3>
            </div>
            
            <div className="p-0 overflow-x-auto">
              {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div></div>
              ) : matches.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800">
                  {t(lang, 'no_system_matches')}
                </div>
              ) : (
                <table className="w-full text-left bg-white dark:bg-slate-800 transition-colors">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(lang, 'status')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(lang, 'user1')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(lang, 'user2')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(lang, 'grade_target')}</th>
                      <th className="px-6 py-4 text-right rtl:text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(lang, 'action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {Array.isArray(matches) && matches.map(m => (
                      <tr key={m.id} className={`transition-colors ${m.status === 'pending' ? 'bg-amber-50/20 dark:bg-amber-900/10 hover:bg-amber-50/40 dark:hover:bg-amber-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                        <td className="px-6 py-4 align-middle">
                          {m.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shadow-sm border border-amber-200 dark:border-amber-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/80">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> {t(lang, 'pending')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-800/50">
                              <CheckCircle className="w-3.5 h-3.5" /> {t(lang, 'approved')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {m.User1 ? (
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{m.User1.firstName} {m.User1.lastName}</p>
                              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mt-1"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> {t_geo(lang, m.User1.frmProvince)}</p>
                            </div>
                          ) : 'Unknown User'}
                        </td>
                        <td className="px-6 py-4">
                          {m.User2 ? (
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{m.User2.firstName} {m.User2.lastName}</p>
                              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mt-1"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> {t_geo(lang, m.User2.frmProvince)}</p>
                            </div>
                          ) : 'Unknown User'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 px-2.5 py-1 rounded-md">
                            <Award className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> {t_geo(lang, m.User1?.grade) || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right rtl:text-left">
                          {m.status === 'pending' && (
                            <button 
                              onClick={() => approveMatch(m.id)}
                              className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 py-1.5 px-4 text-sm shadow-md"
                            >
                              <Check className="w-4 h-4 rtl:ml-2 rtl:mr-0 mr-2" /> {t(lang, 'approve_transfer')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="flex flex-col gap-6">
          {/* Filters Bar */}
          <div className="card shadow-sm p-4 md:p-5 flex flex-col md:flex-row gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm transition-colors">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2 md:mb-0 w-full md:w-auto">
              <Filter className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> {t(lang, 'filters')}:
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 gap-3 w-full">
              <select 
                className="input-field py-2 text-sm flex-1 dark:bg-slate-900" 
                value={filterGrade} 
                onChange={e => setFilterGrade(e.target.value)}
              >
                <option value="">{t(lang, 'all_grades')}</option>
                {grades.map(g => (
                  <option key={g} value={g}>{t_geo(lang, g)}</option>
                ))}
              </select>

              <select 
                className="input-field py-2 text-sm flex-1 dark:bg-slate-900" 
                value={filterRegion} 
                onChange={e => {
                  setFilterRegion(e.target.value);
                  setFilterProvince('');
                }}
              >
                <option value="">{t(lang, 'all_regions')}</option>
                {Object.keys(regionsData).map(r => <option key={r} value={r}>{t_geo(lang, r)}</option>)}
              </select>
              
              <select 
                className="input-field py-2 text-sm flex-1 dark:bg-slate-900" 
                value={filterProvince} 
                onChange={e => setFilterProvince(e.target.value)}
                disabled={!filterRegion}
              >
                <option value="">{t(lang, 'all_provinces')}</option>
                {filterRegion && regionsData[filterRegion].map(p => <option key={p} value={p}>{t_geo(lang, p)}</option>)}
              </select>

              <select 
                className="input-field py-2 text-sm flex-1 dark:bg-slate-900" 
                value={filterMatchStatus} 
                onChange={e => setFilterMatchStatus(e.target.value)}
              >
                <option value="">{t(lang, 'all_match_status')}</option>
                <option value="matched">{t(lang, 'has_match')}</option>
                <option value="no_match">{t(lang, 'no_match')}</option>
              </select>
              
              <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-900/30 px-3 rounded-lg border border-indigo-100 dark:border-indigo-800 flex-1 whitespace-nowrap">
                <input 
                  type="checkbox" 
                  id="hideEmpty" 
                  checked={hideEmptyRequests}
                  onChange={(e) => setHideEmptyRequests(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-indigo-500"
                />
                <label htmlFor="hideEmpty" className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 cursor-pointer">
                  {t(lang, 'hide_empty')}
                </label>
              </div>
            </div>
          </div>

          {/* Users Output */}
          <div className="card shadow-lg shadow-indigo-100/30 dark:shadow-none p-0 overflow-hidden border-0 bg-white dark:bg-slate-800 transition-colors">
            <div className="p-0 overflow-x-auto">
              {filteredUsers.length === 0 && !loading ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800">
                  <Search className="w-12 h-12 text-slate-200 dark:text-slate-600 mx-auto mb-3" />
                  {t(lang, 'no_users_found')}
                </div>
              ) : (
                <table className="w-full text-left bg-white dark:bg-slate-800 transition-colors">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t(lang, 'user_name')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(lang, 'email')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(lang, 'phone')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(lang, 'grade_target')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t(lang, 'province')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(lang, 'requests')}</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(lang, 'status')}</th>
                      <th className="px-6 py-4 text-right rtl:text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t(lang, 'action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {Array.isArray(filteredUsers) && filteredUsers.map(u => {
                      const isMatched = Array.isArray(matches) && matches.some(m => m.user1Id === u.id || m.user2Id === u.id);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 align-top pt-5">
                            <p className="font-bold text-slate-800 dark:text-white whitespace-nowrap">{u.firstName} {u.lastName}</p>
                          </td>
                          <td className="px-6 py-4 align-top pt-5 text-sm text-slate-600 dark:text-slate-400">
                            {u.email}
                          </td>
                          <td className="px-6 py-4 align-top pt-5 text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {u.phone}
                          </td>
                          <td className="px-6 py-4 align-top pt-5">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-200 dark:border-slate-600 whitespace-nowrap">
                              {t_geo(lang, u.grade)}
                            </span>
                          </td>
                          <td className="px-6 py-4 align-top pt-5">
                            <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300 text-sm whitespace-nowrap">
                              <MapPin className="w-4 h-4 text-indigo-400" /> {t_geo(lang, u.frmProvince)}
                            </span>
                          </td>
                          <td className="px-6 py-4 align-top pt-5">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 px-2.5 py-1 rounded-md text-xs whitespace-nowrap">
                              {u.requests?.length || 0} Places
                            </span>
                          </td>
                          <td className="px-6 py-4 align-top pt-5">
                            {isMatched ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                {t(lang, 'matched')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                                {t(lang, 'none')}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right rtl:text-left align-top pt-5">
                            <div className="flex justify-end rtl:justify-start">
                              <button 
                                onClick={() => deleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                                className="p-2 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
