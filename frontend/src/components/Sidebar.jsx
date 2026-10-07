import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, UserCog,
  DollarSign, Package, FileText, Bed, LogOut, Hospital
} from 'lucide-react';
import { fetchUserProfile } from '../api';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',      to: '/dashboard' },
  { icon: Users,           label: 'Patients',        to: '/patients' },
  { icon: Calendar,        label: 'Appointments',    to: '/appointments' },
  { icon: UserCog,         label: 'Staff',           to: '/staff' },
  { icon: DollarSign,      label: 'Billing',         to: '/billing' },
  { icon: Package,         label: 'Inventory',       to: '/inventory' },
  { icon: FileText,        label: 'Lab Reports',     to: '/lab-reports' },
  { icon: Bed,             label: 'Bed Management',  to: '/bed-management' },
];

const Sidebar = ({ onLogout }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile().then(setProfile);
    if (!document.documentElement.classList.contains('sidebar-open') && !document.documentElement.classList.contains('sidebar-closed')) {
      document.documentElement.classList.add('sidebar-open');
    }
  }, []);

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-30 sidebar-transition">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 flex-shrink-0">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Hospital size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">HMS</h1>
          <p className="text-xs text-slate-500">Hospital Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {(() => {
          const role = profile?.role?.toLowerCase() || '';
          const menuToRender = role === 'doctor'
            ? menuItems.filter(item => ['Dashboard', 'Patients', 'Appointments', 'Lab Reports'].includes(item.label))
            : role === 'nurse'
            ? menuItems.filter(item => ['Dashboard', 'Patients', 'Inventory', 'Lab Reports', 'Bed Management'].includes(item.label))
            : role === 'receptionist'
            ? menuItems.filter(item => ['Dashboard', 'Patients', 'Appointments', 'Bed Management', 'Billing'].includes(item.label))
            : menuItems;
            
          return menuToRender.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={isActive ? 'text-blue-600' : 'text-slate-400'}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))})()}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          {profile ? (
            <>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {profile.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{profile.name}</p>
                <p className="text-xs text-slate-500 truncate">{profile.role}</p>
              </div>
            </>
          ) : (
            <div className="animate-pulse flex gap-3 items-center w-full">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
