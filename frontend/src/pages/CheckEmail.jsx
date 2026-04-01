import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

// After registration, redirect straight to /verify-email where they enter their code
// This page is now just a transition — we instantly navigate
export default function CheckEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to verify page immediately, passing any email state received
  React.useEffect(() => {
    navigate('/verify-email', { 
      replace: true, 
      state: { email: location.state?.email || '' } 
    });
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mt-20 animate-fade-in">
      <div className="card shadow-xl bg-white dark:bg-slate-800 border-0 text-center p-10 transition-colors">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      </div>
    </div>
  );
}
