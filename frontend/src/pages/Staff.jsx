import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, ChevronDown, X, Mail, Phone,
  Users, UserCheck, Heart, AlertCircle, Check, Eye, EyeOff
} from 'lucide-react';
import {
  fetchStaff, addStaff, updateStaff,
  updateStaffStatus, deleteStaff
} from '../api';
import Header from '../components/Header';

// ─── Constants ─────────────────────────────────────────────────────────────────
const ROLES = ['Doctor', 'Nurse', 'Receptionist', 'Admin', 'Technician'];
const DEPARTMENTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Emergency', 'General', 'Reception'];
const STATUSES = ['active', 'on-leave', 'inactive'];

const avatarBgColors = [
  'bg-blue-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-purple-600',
  'bg-fuchsia-600',
];

// Helper to get initials avatar bg color
const getAvatarColor = (id) => {
  const index = parseInt(id.replace(/\D/g, ''), 10) || 0;
  return avatarBgColors[index % avatarBgColors.length];
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active:     'bg-slate-950 text-white font-semibold',
    'on-leave': 'bg-orange-50 text-orange-600 border border-orange-200 font-semibold',
    inactive:   'bg-slate-100 text-slate-500 border border-slate-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status === 'on-leave' ? 'on-leave' : status}
    </span>
  );
};

// ─── Role Badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    doctor:       'bg-blue-50 text-blue-600 border border-blue-100',
    nurse:        'bg-emerald-50 text-emerald-600 border border-emerald-100',
    receptionist: 'bg-purple-50 text-purple-600 border border-purple-100',
    admin:        'bg-amber-50 text-amber-600 border border-amber-100',
    technician:   'bg-slate-100 text-slate-600 border border-slate-200',
  };
  const norm = role.toLowerCase();
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold lowercase ${map[norm] || 'bg-slate-100 text-slate-600'}`}>
      {role}
    </span>
  );
};

// ─── Status Dropdown ───────────────────────────────────────────────────────────
const StatusDropdown = ({ staffId, current, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (s) => {
    setOpen(false);
    setLoading(true);
    try {
      const result = await updateStaffStatus(staffId, s);
      if (result) {
        onUpdate(staffId, s);
      } else {
        alert('Failed to update status. Please try again.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const btnMap = {
    active:     'bg-slate-100 text-slate-800',
    'on-leave': 'bg-orange-50 text-orange-700 border border-orange-100',
    inactive:   'bg-slate-100 text-slate-500',
  };

  return (
    <div className="relative">
      <button
        disabled={loading}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity ${btnMap[current]} ${loading ? 'opacity-50' : ''}`}
      >
        <span className="capitalize">{current === 'on-leave' ? 'On Leave' : current}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => handle(s)}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors capitalize"
            >
              <span>{s === 'on-leave' ? 'On Leave' : s}</span>
              {s === current && <Check size={14} className="text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Add Staff Modal ───────────────────────────────────────────────────────────
const AddStaffModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '', role: 'Doctor', department: '', specialization: '',
    email: '', phone: '', status: 'active', password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newStaff = await addStaff({
        ...form,
        role: form.role.toLowerCase(),
        specialization: form.specialization || '-'
      });
      if (newStaff) {
        onAdd(newStaff);
        onClose();
      } else {
        alert('Failed to add staff member. Please try again.');
      }
    } catch (err) {
      console.error('Error adding staff:', err);
      alert('Error adding staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New Staff Member</h2>
            <p className="text-sm text-slate-500 mt-0.5">Fill in the details below to add a new staff member to the hospital system.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input name="name" required value={form.name} onChange={handle} className={inputClass} placeholder="e.g. Dr. Jane Doe" />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <select name="role" value={form.role} onChange={handle} className={inputClass}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department</label>
              <select name="department" required value={form.department} onChange={handle} className={inputClass}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Specialization (Optional)</label>
              <input name="specialization" value={form.specialization} onChange={handle} className={inputClass} placeholder="e.g., Cardiologist" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" required value={form.email} onChange={handle} className={inputClass} placeholder="email@hospital.com" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" required value={form.phone} onChange={handle} className={inputClass} placeholder="+1 234-567-8901" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input name="password" type={showPassword ? "text" : "password"} required value={form.password} onChange={handle} className={inputClass} placeholder="Set a secure password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Adding...' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Edit Staff Modal ──────────────────────────────────────────────────────────
const EditStaffModal = ({ staff, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:           staff.name,
    role:           staff.role.charAt(0).toUpperCase() + staff.role.slice(1),
    department:     staff.department,
    specialization: staff.specialization === '-' ? '' : staff.specialization,
    email:          staff.email,
    phone:          staff.phone,
    status:         staff.status,
    password:       ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateStaff(staff.id, {
        ...form,
        role: form.role.toLowerCase(),
        specialization: form.specialization || '-'
      });
      if (updated) {
        onSave(updated);
        onClose();
      } else {
        alert('Failed to update staff member. Please try again.');
      }
    } catch (err) {
      console.error('Error updating staff:', err);
      alert('Error updating staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Staff Member - {staff.id}</h2>
            <p className="text-sm text-slate-500 mt-0.5">Update staff member information and status.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input name="name" required value={form.name} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <select name="role" value={form.role} onChange={handle} className={inputClass}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department</label>
              <select name="department" required value={form.department} onChange={handle} className={inputClass}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Specialization (Optional)</label>
              <input name="specialization" value={form.specialization} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" required value={form.email} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" required value={form.phone} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={form.status} onChange={handle} className={inputClass}>
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s === 'on-leave' ? 'On Leave' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handle} className={inputClass} placeholder="Leave blank to keep current" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Saving...' : 'Update Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Staff Page ───────────────────────────────────────────────────────────
const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStaff, setEditStaff] = useState(null);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const data = await fetchStaff();
        if (data) {
          setStaff(data);
        } else {
          console.error('Failed to fetch staff data');
          setStaff([]);
        }
      } catch (err) {
        console.error('Error loading staff:', err);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, []);

  const totalStaff = staff.length;
  const doctorsCount = staff.filter(s => s.role === 'doctor').length;
  const nursesCount = staff.filter(s => s.role === 'nurse').length;
  const leaveCount = staff.filter(s => s.status === 'on-leave').length;

  const handleStatusUpdate = (id, status) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleSave = (updated) => {
    setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        const result = await deleteStaff(id);
        if (result) {
          setStaff(prev => prev.filter(s => s.id !== id));
        } else {
          alert('Failed to delete staff member. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting staff:', err);
        alert('Error deleting staff member. Please try again.');
      }
    }
  };

  return (
    <div className="flex-1 ml-64 bg-slate-50 min-h-screen">
      <Header />

      <main className="p-8 space-y-6">
        {/* Info & Add Staff row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 font-semibold">Manage hospital staff and their roles</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Staff Member
          </button>
        </div>

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Staff', value: totalStaff, badgeColor: 'bg-blue-500', icon: <Users className="text-white" size={20} /> },
            { label: 'Doctors',     value: doctorsCount, badgeColor: 'bg-emerald-500', icon: <UserCheck className="text-white" size={20} /> },
            { label: 'Nurses',      value: nursesCount, badgeColor: 'bg-purple-500', icon: <Heart className="text-white" size={20} /> },
            { label: 'On Leave',    value: leaveCount, badgeColor: 'bg-orange-500', icon: <AlertCircle className="text-white" size={20} /> },
          ].map(({ label, value, badgeColor, icon }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-900">{loading ? '—' : value}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badgeColor}`}>
                {icon}
              </div>
            </div>
          ))}
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">Staff Directory</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Staff', 'Role', 'Department', 'Specialization', 'Contact', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                      No staff members registered.
                    </td>
                  </tr>
                ) : (
                  staff.map(s => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarColor(s.id)} flex-shrink-0`}>
                          {s.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4"><RoleBadge role={s.role} /></td>
                      <td className="px-6 py-4 text-sm text-slate-600">{s.department}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{s.specialization}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail size={12} className="text-slate-400" />
                            <span>{s.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone size={12} className="text-slate-400" />
                            <span>{s.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditStaff(s)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                          <StatusDropdown staffId={s.id} current={s.status} onUpdate={handleStatusUpdate} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddStaffModal
          onClose={() => setShowAddModal(false)}
          onAdd={newStaff => setStaff(prev => [...prev, newStaff])}
        />
      )}
      {editStaff && (
        <EditStaffModal
          staff={editStaff}
          onClose={() => setEditStaff(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Staff;
