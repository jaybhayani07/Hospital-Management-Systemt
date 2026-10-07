import React, { useState } from 'react';
import { Hospital, AlertCircle } from 'lucide-react';

const credentialsMap = {
  'admin@hospital.com': { password: 'admin123', name: 'Dr. Sarah Admin', role: 'Admin' },
  'doctor@hospital.com': { password: 'doctor123', name: 'Dr. David Smith', role: 'Doctor' },
  'nurse@hospital.com': { password: 'nurse123', name: 'Nurse Emily Wilson', role: 'Nurse' },
  'receptionist@hospital.com': { password: 'receptionist123', name: 'Receptionist Jane Doe', role: 'Receptionist' },
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Validate role if user explicitly selected one
        if (role && data.role.toLowerCase() !== role.toLowerCase() && role.toLowerCase() !== "admin") {
          setError(`Access Denied: This account does not possess the ${role} role permissions.`);
          setLoading(false);
          return;
        }

        localStorage.setItem('hms_token', data.jwt);
        localStorage.setItem('hms_auth', JSON.stringify({
          name: data.name || data.email,
          role: data.role
        }));
        
        onLogin();
      } else {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred while connecting to the server.');
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 w-full">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100 flex flex-col items-center">
        {/* Logo circle */}
        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <Hospital className="text-white" size={32} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800 text-center">Hospital Management System</h1>
        <p className="text-sm text-slate-400 font-semibold mt-1 mb-6 text-center">Sign in to access your dashboard</p>

        {error && (
          <div className="w-full flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg p-3 text-red-600 text-xs font-semibold mb-4 animate-fadeIn">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="user@hospital.com"
            />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
            >
              <option value="">Select your role</option>
              <option value="Admin">Admin</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-6 disabled:opacity-60"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials panel */}
        <div className="w-full mt-6 bg-blue-50/60 border border-blue-100/80 rounded-xl p-4 text-[11px] text-slate-600 space-y-1.5 font-medium">
          <p className="font-bold text-slate-800 text-xs mb-2">Demo Credentials:</p>
          <div className="flex justify-between">
            <span className="font-bold">Admin:</span>
            <span>admin@hospital.com / admin123</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Doctor:</span>
            <span>doctor@hospital.com / doctor123</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Nurse:</span>
            <span>nurse@hospital.com / nurse123</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Receptionist:</span>
            <span>receptionist@hospital.com / receptionist123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
