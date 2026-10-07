import React, { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Activity } from 'lucide-react';
import Header from '../components/Header';
import KpiCard from '../components/KpiCard';
import { WeeklyAppointmentsChart, DepartmentStatsChart, MonthlyRevenueChart } from '../components/Charts';
import { fetchDashboardMetrics, fetchUserProfile } from '../api';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchDashboardMetrics().then(setMetrics);
    fetchUserProfile().then(setProfile);
  }, []);

  return (
    <div className="flex-1 ml-64 bg-slate-50 min-h-screen">
      <Header />
      
      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-md">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {profile ? profile.name : '...'}!
          </h2>
          <p className="text-blue-100">
            Here's what's happening with your hospital today.
          </p>
        </div>

        {/* KPI Cards */}
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard 
              title="Total Patients" 
              value={metrics.totalPatients.value} 
              change={metrics.totalPatients.change} 
              isPositive={metrics.totalPatients.isPositive} 
              icon={Users} 
              iconColorClass="bg-blue-500" 
            />
            <KpiCard 
              title="Today's Appointments" 
              value={metrics.todaysAppointments.value} 
              change={metrics.todaysAppointments.change} 
              isPositive={metrics.todaysAppointments.isPositive} 
              icon={Calendar} 
              iconColorClass="bg-green-500" 
            />
            <KpiCard 
              title="Revenue (Month)" 
              value={metrics.monthlyRevenue.value} 
              change={metrics.monthlyRevenue.change} 
              isPositive={metrics.monthlyRevenue.isPositive} 
              icon={DollarSign} 
              iconColorClass="bg-purple-500" 
            />
            <KpiCard 
              title="Bed Occupancy" 
              value={metrics.bedOccupancy.value} 
              change={metrics.bedOccupancy.change} 
              isPositive={metrics.bedOccupancy.isPositive} 
              icon={Activity} 
              iconColorClass="bg-orange-500" 
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 h-36 animate-pulse">
                <div className="h-10 w-10 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-6 w-24 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-16 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyAppointmentsChart />
          <DepartmentStatsChart />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6">
          <MonthlyRevenueChart />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
