import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, ChevronDown, X, Calendar,
  Clock, CheckCircle, XCircle, Check,
} from 'lucide-react';
import {
  fetchAppointments, scheduleAppointment, updateAppointment,
  updateAppointmentStatus, fetchDoctorsByDepartment,
} from '../api';
import Header from '../components/Header';

// ─── Constants ─────────────────────────────────────────────────────────────────
const DEPARTMENTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Emergency', 'General'];
const TIMES = [
  '08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM',
  '11:00 AM','11:30 AM','12:00 PM','01:00 PM','01:30 PM','02:00 PM',
  '02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM',
];
const TYPES = ['Check-up', 'Follow-up', 'Consultation', 'Emergency', 'Surgery', 'Lab Test'];
const STATUSES = ['scheduled', 'in-progress', 'completed', 'cancelled'];

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    scheduled:    { cls: 'bg-slate-100 text-slate-600 border border-slate-300', icon: <Calendar size={11} /> },
    'in-progress':{ cls: 'bg-blue-100 text-blue-600 border border-blue-200',    icon: <Clock size={11} /> },
    completed:    { cls: 'bg-green-100 text-green-700 border border-green-200', icon: <CheckCircle size={11} /> },
    cancelled:    { cls: 'bg-red-100 text-red-600 border border-red-200',       icon: <XCircle size={11} /> },
  };
  const { cls, icon } = map[status] || map.scheduled;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {icon} {status}
    </span>
  );
};

// ─── Status Dropdown ───────────────────────────────────────────────────────────
const StatusDropdown = ({ aptId, current, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (s) => {
    setOpen(false);
    setLoading(true);
    await updateAppointmentStatus(aptId, s);
    onUpdate(aptId, s);
    setLoading(false);
  };

  const btnMap = {
    scheduled:    'bg-slate-100 text-slate-700',
    'in-progress':'bg-blue-100 text-blue-700',
    completed:    'bg-green-100 text-green-700',
    cancelled:    'bg-red-100 text-red-600',
  };

  return (
    <div className="relative">
      <button
        disabled={loading}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity ${btnMap[current]} ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? '...' : current.charAt(0).toUpperCase() + current.slice(1)}
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => handle(s)}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
            >
              <span className="capitalize">{s}</span>
              {s === current && <Check size={14} className="text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Schedule Modal ────────────────────────────────────────────────────────────
const ScheduleModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    patientName: '', patientId: 'P001', department: '', doctor: '',
    date: '', time: '', type: '', notes: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.department) fetchDoctorsByDepartment(form.department).then(setDoctors);
    else setDoctors([]);
  }, [form.department]);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newApt = await scheduleAppointment(form);
    onAdd(newApt);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Schedule New Appointment</h2>
            <p className="text-sm text-blue-500 mt-0.5">Book a new appointment for a patient with a doctor.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Patient Name</label>
              <input name="patientName" required value={form.patientName} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Patient ID</label>
              <input name="patientId" value={form.patientId} onChange={handle} className={`${inputClass} text-slate-400`} />
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
              <label className={labelClass}>Doctor</label>
              <select name="doctor" required value={form.doctor} onChange={handle} className={inputClass} disabled={!doctors.length}>
                <option value="">Select doctor</option>
                {doctors.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input name="date" type="date" required value={form.date} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <select name="time" required value={form.time} onChange={handle} className={inputClass}>
                <option value="">Select time</option>
                {TIMES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Appointment Type</label>
            <select name="type" required value={form.type} onChange={handle} className={inputClass}>
              <option value="">Select type</option>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handle} rows={2} placeholder="Additional notes..." className={`${inputClass} resize-none`} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ apt, onClose, onSave }) => {
  const [form, setForm] = useState({
    patientName: apt.patientName,
    patientId:   apt.patientId,
    department:  apt.department,
    doctor:      apt.doctor,
    date:        apt.date,
    time:        apt.time,
    type:        apt.type,
    status:      apt.status,
    notes:       apt.notes,
  });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.department) fetchDoctorsByDepartment(form.department).then(setDoctors);
  }, [form.department]);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updated = await updateAppointment(apt.id, form);
    onSave(updated);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Appointment - {apt.id}</h2>
            <p className="text-sm text-blue-500 mt-0.5">Update appointment details and schedule.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Patient Name</label>
              <input name="patientName" required value={form.patientName} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Patient ID</label>
              <input name="patientId" value={form.patientId} onChange={handle} className={`${inputClass} text-slate-400`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department</label>
              <select name="department" value={form.department} onChange={handle} className={inputClass}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Doctor</label>
              <select name="doctor" value={form.doctor} onChange={handle} className={inputClass}>
                {(doctors.length ? doctors : [apt.doctor]).map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input name="date" type="date" value={form.date} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <select name="time" value={form.time} onChange={handle} className={inputClass}>
                {TIMES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Appointment Type</label>
              <select name="type" value={form.type} onChange={handle} className={inputClass}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={form.status} onChange={handle} className={inputClass}>
                {STATUSES.map(s => <option key={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handle} rows={2} className={`${inputClass} resize-none`} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Saving...' : 'Update Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Appointments Page ────────────────────────────────────────────────────
const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [editApt, setEditApt]           = useState(null);
  const [userRole, setUserRole]         = useState('');

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    fetchAppointments().then(data => { setAppointments(data); setLoading(false); });
    const auth = localStorage.getItem('hms_auth');
    if (auth) {
      try {
        setUserRole(JSON.parse(auth).role);
      } catch (e) {}
    }
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts     = appointments.filter(a => a.date === todayStr);
  const scheduledCnt  = appointments.filter(a => a.status === 'scheduled').length;
  const completedCnt  = appointments.filter(a => a.status === 'completed').length;
  const cancelledCnt  = appointments.filter(a => a.status === 'cancelled').length;

  const handleStatusUpdate = (id, status) =>
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));

  const handleUpdate = (updated) =>
    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));

  // Format date for display
  const fmtDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
  };

  return (
    <div className="flex-1 ml-64 bg-slate-50 min-h-screen">
      <Header />

      <main className="p-8 space-y-6">
        {/* Date + Schedule button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
            <Calendar size={16} />
            {today}
          </div>
          {userRole !== 'Doctor' && (
            <button
              onClick={() => setShowSchedule(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={16} />
              Schedule Appointment
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Today', value: todayApts.length, icon: <Calendar size={22} className="text-blue-500" />, color: 'text-slate-800' },
            { label: 'Scheduled',   value: scheduledCnt,     icon: <Clock size={22} className="text-blue-500" />,     color: 'text-blue-600' },
            { label: 'Completed',   value: completedCnt,     icon: <CheckCircle size={22} className="text-green-500" />, color: 'text-green-600' },
            { label: 'Cancelled',   value: cancelledCnt,     icon: <XCircle size={22} className="text-red-500" />,    color: 'text-red-500' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>{loading ? '—' : value}</p>
              </div>
              {icon}
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">Appointment Schedule</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['ID', 'Patient', 'Doctor', 'Department', 'Date', 'Time', 'Type', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 animate-pulse">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-100 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-400">
                      No appointments found. Schedule one!
                    </td>
                  </tr>
                ) : (
                  appointments.map(a => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">{a.id}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-blue-600">{a.patientName}</p>
                        <p className="text-xs text-slate-400">{a.patientId}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">{a.doctor}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{a.department}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">{fmtDate(a.date)}</td>
                      <td className="px-5 py-4 text-sm font-medium text-blue-600 whitespace-nowrap">{a.time}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{a.type}</td>
                      <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditApt(a)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <StatusDropdown aptId={a.id} current={a.status} onUpdate={handleStatusUpdate} />
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
      {showSchedule && (
        <ScheduleModal
          onClose={() => setShowSchedule(false)}
          onAdd={apt => setAppointments(prev => [...prev, apt])}
        />
      )}
      {editApt && (
        <EditModal
          apt={editApt}
          onClose={() => setEditApt(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default Appointments;
