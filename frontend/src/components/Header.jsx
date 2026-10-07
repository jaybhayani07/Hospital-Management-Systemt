import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Menu } from 'lucide-react';
import { fetchUserProfile } from '../api';

const routeTitles = {
  '/dashboard':      'Dashboard',
  '/patients':       'Patients',
  '/appointments':   'Appointments',
  '/staff':          'Staff',
  '/billing':        'Billing',
  '/inventory':      'Inventory',
  '/lab-reports':    'Lab Reports',
  '/bed-management': 'Bed Management',
};

const Header = () => {
  const [profile, setProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const pageTitle = routeTitles[location.pathname] || 'Dashboard';

  useEffect(() => {
    fetchUserProfile().then(setProfile);
    
    // Check initial state
    const open = !document.documentElement.classList.contains('sidebar-closed');
    setIsOpen(open);

    const handleSync = () => {
      setIsOpen(!document.documentElement.classList.contains('sidebar-closed'));
    };

    window.addEventListener('toggle-sidebar', handleSync);
    return () => window.removeEventListener('toggle-sidebar', handleSync);
  }, []);

  const handleToggle = () => {
    if (document.documentElement.classList.contains('sidebar-closed')) {
      document.documentElement.classList.remove('sidebar-closed');
      document.documentElement.classList.add('sidebar-open');
    } else {
      document.documentElement.classList.remove('sidebar-open');
      document.documentElement.classList.add('sidebar-closed');
    }
    window.dispatchEvent(new Event('toggle-sidebar'));
  };

  return (
    <header className="bg-white border-b border-slate-200 h-20 flex items-center px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleToggle}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
        >
          {isOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 leading-tight">{pageTitle}</h2>
          {profile ? (
            <p className="text-sm text-slate-500">Welcome back, {profile.name}</p>
          ) : (
            <div className="h-4 w-48 bg-slate-200 animate-pulse rounded mt-1" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
