import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, X, ChevronDown, Check,
  Activity, CheckCircle2, AlertTriangle, AlertCircle,
  TrendingUp, Trash2
} from 'lucide-react';
import {
  fetchBeds, createBed, updateBed, updateBedStatus, deleteBed
} from '../api';
import Header from '../components/Header';

// Helper to format date string to DD/MM/YYYY
const fmtDate = (dateStr) => {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

// ─── Bed Type Badge ────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const map = {
    general:        'bg-slate-100 text-slate-700 border border-slate-200',
    icu:            'bg-red-50 text-red-600 border border-red-100 font-bold',
    private:        'bg-purple-50 text-purple-600 border border-purple-100',
    'semi-private': 'bg-blue-50 text-blue-600 border border-blue-100',
  };
  const key = (type || 'general').toLowerCase();
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize whitespace-nowrap ${map[key] || 'bg-slate-100 text-slate-600'}`}>
      {type}
    </span>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    occupied:    'bg-slate-100 text-slate-700 border border-slate-200',
    available:   'bg-slate-950 text-white font-semibold',
    reserved:    'bg-slate-50 text-slate-600 border border-slate-150',
    maintenance: 'bg-rose-600 text-white font-semibold',
  };
  const key = (status || 'available').toLowerCase();
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize whitespace-nowrap ${map[key] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};

// ─── Status Dropdown ───────────────────────────────────────────────────────────
const StatusDropdown = ({ bedId, current, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (s) => {
    setOpen(false);
    setLoading(true);
    await updateBedStatus(bedId, s);
    onUpdate(bedId, s);
    setLoading(false);
  };

  const btnMap = {
    occupied:    'bg-slate-100 text-slate-700 border border-slate-200',
    available:   'bg-slate-950 text-white font-semibold',
    reserved:    'bg-slate-50 text-slate-600 border border-slate-150',
    maintenance: 'bg-rose-50 text-rose-700 border border-rose-100',
  };

  return (
    <div className="relative">
      <button
        disabled={loading}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity capitalize whitespace-nowrap ${btnMap[current]} ${loading ? 'opacity-50' : ''}`}
      >
        <span>{current}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40">
          {['available', 'occupied', 'reserved', 'maintenance'].map(s => (
            <button
              key={s}
              onClick={() => handle(s)}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors capitalize font-semibold"
            >
              <span>{s}</span>
              {s === current && <Check size={14} className="text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Add Bed Modal ─────────────────────────────────────────────────────────────
const AddBedModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    room: '',
    bed: '',
    department: 'Cardiology',
    floor: '1',
    type: 'General',
    status: 'available'
  });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newBed = await createBed(form);
    onAdd(newBed);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New Bed</h2>
            <p className="text-sm text-slate-500 mt-0.5">Add a new bed to the hospital bed management system.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Room Number</label>
              <input name="room" required value={form.room} onChange={handle} className={inputClass} placeholder="e.g. 101" />
            </div>
            <div>
              <label className={labelClass}>Bed Number</label>
              <input name="bed" required value={form.bed} onChange={handle} className={inputClass} placeholder="e.g. A" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department</label>
              <select name="department" value={form.department} onChange={handle} className={inputClass}>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Orthopedics</option>
                <option>Pediatrics</option>
                <option>ICU</option>
                <option>Emergency</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Floor</label>
              <input name="floor" required value={form.floor} onChange={handle} className={inputClass} placeholder="e.g. 1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Bed Type</label>
              <select name="type" value={form.type} onChange={handle} className={inputClass}>
                <option>General</option>
                <option>ICU</option>
                <option>Private</option>
                <option>Semi-Private</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Initial Status</label>
              <select name="status" value={form.status} onChange={handle} className={inputClass}>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Adding...' : 'Add Bed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Edit Bed Modal ────────────────────────────────────────────────────────────
const EditBedModal = ({ bed, onClose, onSave }) => {
  const [form, setForm] = useState({
    room:          bed.room,
    bed:           bed.bed,
    department:    bed.department,
    floor:         bed.floor.replace('Floor ', ''),
    type:          bed.type,
    status:        bed.status,
    patientName:   bed.patientName || '',
    patientId:     bed.patientId || '',
  });
  const [showAssign, setShowAssign] = useState(bed.status === 'occupied');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updated = await updateBed(bed.id, {
      ...form,
      status: showAssign ? 'occupied' : form.status
    });
    onSave(updated);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Bed - {bed.id}</h2>
            <p className="text-sm text-slate-500 mt-0.5">Update bed information including patient assignment and department.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Room Number</label>
              <input name="room" required value={form.room} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Bed Number</label>
              <input name="bed" required value={form.bed} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department</label>
              <select name="department" value={form.department} onChange={handle} className={inputClass}>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Orthopedics</option>
                <option>Pediatrics</option>
                <option>ICU</option>
                <option>Emergency</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Floor</label>
              <input name="floor" required value={form.floor} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Bed Type</label>
              <select name="type" value={form.type} onChange={handle} className={inputClass}>
                <option>General</option>
                <option>ICU</option>
                <option>Private</option>
                <option>Semi-Private</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={(e) => {
                  handle(e);
                  if (e.target.value === 'occupied') setShowAssign(true);
                }}
                className={inputClass}
                disabled={showAssign}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Patient Assignment section */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setShowAssign(s => !s)}
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              <span>Patient Assignment</span>
            </button>

            {showAssign && (
              <div className="grid grid-cols-2 gap-4 mt-3 animate-fadeIn">
                <div>
                  <label className={labelClass}>Patient Name</label>
                  <input name="patientName" required={showAssign} value={form.patientName} onChange={handle} className={inputClass} placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className={labelClass}>Patient ID</label>
                  <input name="patientId" required={showAssign} value={form.patientId} onChange={handle} className={inputClass} placeholder="e.g. P001" />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Saving...' : 'Update Bed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Bed Management Page ──────────────────────────────────────────────────
const BedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBed, setEditBed] = useState(null);

  useEffect(() => {
    fetchBeds().then(data => {
      setBeds(data);
      setLoading(false);
    });
  }, []);

  const totalBeds = beds.length;
  const availableBeds = beds.filter(b => b.status === 'available').length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const maintenanceBeds = beds.filter(b => b.status === 'maintenance').length;

  const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100) : 0;

  const handleAdd = (newBed) => {
    setBeds(prev => [...prev, newBed]);
  };

  const handleSave = (updated) => {
    setBeds(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const handleStatusUpdate = (id, status) => {
    setBeds(prev => prev.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status,
          patientName: status === 'occupied' ? b.patientName : '',
          patientId: status === 'occupied' ? b.patientId : '',
        };
      }
      return b;
    }));
  };

  // Filtered beds
  const filteredBeds = beds.filter(b => {
    const passDept = deptFilter === 'All Departments' || b.department === deptFilter;
    const passStatus = statusFilter === 'All Status' || b.status === statusFilter.toLowerCase();
    return passDept && passStatus;
  });

  // Department distribution calculations
  const deptsList = ['Cardiology', 'ICU', 'Pediatrics', 'Orthopedics', 'Neurology'];
  const deptDist = deptsList.map(dept => {
    const total = beds.filter(b => b.department === dept).length;
    const occupied = beds.filter(b => b.department === dept && b.status === 'occupied').length;
    const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { name: dept, occupied, total, percent };
  });

  // Bed Type distribution calculations
  const typesList = ['General', 'ICU', 'Private', 'Semi-Private'];
  const typeDist = typesList.map(type => {
    const total = beds.filter(b => b.type === type).length;
    const occupied = beds.filter(b => b.type === type && b.status === 'occupied').length;
    const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { name: type, occupied, total, percent };
  });

  const selectClass = "px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-slate-700";

  return (
    <div className="flex-1 ml-64 bg-slate-50 min-h-screen">
      <Header />

      <main className="p-8 space-y-6">
        {/* Info & Add Bed row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 font-semibold">Monitor and manage hospital bed availability</p>
          <div className="flex items-center gap-3">
            {/* Custom occupancy rate display */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-2 text-right">
              <span className="block text-[10px] text-blue-500 font-bold uppercase tracking-wider">Occupancy Rate</span>
              <span className="text-lg font-extrabold text-slate-900">{loading ? '—' : `${occupancyRate.toFixed(1)}%`}</span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={16} />
              Add Bed
            </button>
          </div>
        </div>

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Beds',   value: totalBeds,       badgeColor: 'bg-blue-500',   icon: <Activity className="text-white" size={20} /> },
            { label: 'Available',    value: availableBeds,   badgeColor: 'bg-emerald-500', icon: <CheckCircle2 className="text-white" size={20} /> },
            { label: 'Occupied',     value: occupiedBeds,    badgeColor: 'bg-orange-500', icon: <AlertTriangle className="text-white" size={20} /> },
            { label: 'Maintenance',  value: maintenanceBeds, badgeColor: 'bg-rose-500',   icon: <AlertCircle className="text-white" size={20} /> },
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

        {/* Bed List section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-semibold text-slate-800">Bed Status</h3>

            {/* Filter selectors */}
            <div className="flex gap-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className={selectClass}
              >
                <option>All Departments</option>
                {deptsList.map(d => <option key={d}>{d}</option>)}
                <option>Emergency</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={selectClass}
              >
                <option>All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Bed ID', 'Room', 'Bed', 'Department', 'Floor', 'Type', 'Patient', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 animate-pulse">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredBeds.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-400">
                      No beds found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredBeds.map(b => (
                    <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">{b.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-800 font-semibold">{b.room}</td>
                      <td className="px-6 py-4 text-sm text-slate-800 font-semibold">{b.bed}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-semibold">{b.department}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{b.floor}</td>
                      <td className="px-6 py-4"><TypeBadge type={b.type} /></td>
                      <td className="px-6 py-4">
                        {b.status === 'occupied' ? (
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{b.patientName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">ID: {b.patientId} | Since: {fmtDate(b.assignedSince)}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm font-semibold">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditBed(b)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <StatusDropdown bedId={b.id} current={b.status} onUpdate={handleStatusUpdate} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distributions at bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Distributions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-800">Department-wise Distribution</h3>
            <div className="space-y-3">
              {deptDist.map(d => (
                <div key={d.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-semibold text-slate-700">
                    <span>{d.name}</span>
                    <span className="text-slate-400">{d.occupied}/{d.total} ({d.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${d.percent}%` }}
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bed Type Distributions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-800">Bed Type Distribution</h3>
            <div className="space-y-3">
              {typeDist.map(t => {
                const colors = {
                  'General':      'bg-slate-700',
                  'ICU':          'bg-red-600',
                  'Private':      'bg-purple-600',
                  'Semi-Private': 'bg-blue-600'
                };
                return (
                  <div key={t.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                      <span>{t.name}</span>
                      <span className="text-slate-400">{t.occupied}/{t.total} ({t.percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${t.percent}%` }}
                        className={`h-full ${colors[t.name] || 'bg-slate-600'} rounded-full transition-all duration-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddBedModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
      {editBed && (
        <EditBedModal
          bed={editBed}
          onClose={() => setEditBed(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default BedManagement;
