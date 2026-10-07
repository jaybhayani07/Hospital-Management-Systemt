import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, ChevronDown, X, FileText } from 'lucide-react';
import { fetchPatients, fetchPatientById, addPatient, updatePatient, updatePatientStatus } from '../api';
import Header from '../components/Header';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    admitted:   'bg-slate-900 text-white',
    outpatient: 'bg-slate-100 text-slate-700 border border-slate-300',
    discharged: 'bg-slate-100 text-slate-500 border border-slate-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};

// ─── Status Dropdown ──────────────────────────────────────────────────────────
const StatusDropdown = ({ patientId, current, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const statuses = ['admitted', 'outpatient', 'discharged'];

  const handle = async (s) => {
    setOpen(false);
    setLoading(true);
    await updatePatientStatus(patientId, s);
    onUpdate(patientId, s);
    setLoading(false);
  };

  const btnStyles = {
    admitted:   'bg-slate-900 text-white',
    outpatient: 'bg-slate-100 text-slate-700',
    discharged: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="relative">
      <button
        disabled={loading}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity ${btnStyles[current]} ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? '...' : current.charAt(0).toUpperCase() + current.slice(1)}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-36">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => handle(s)}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 capitalize transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Patient Details Modal ────────────────────────────────────────────────────
const PatientDetailModal = ({ patientId, onClose }) => {
  const [patient, setPatient] = useState(null);
  const [tab, setTab] = useState('Information');
  const tabs = ['Information', 'Medical', 'History'];

  useEffect(() => {
    if (patientId) fetchPatientById(patientId).then(setPatient);
  }, [patientId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Patient Details</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                View complete patient{' '}
                <span className="text-blue-500">information</span> and medical history.
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X size={20} />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-slate-100 rounded-lg p-1">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {!patient ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3,4].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg" />)}
            </div>
          ) : (
            <>
              {tab === 'Information' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {[
                    { label: 'Patient ID', value: patient.id },
                    { label: 'Name', value: patient.name },
                    { label: 'Age', value: `${patient.age} years` },
                    { label: 'Gender', value: patient.gender },
                    { label: 'Blood Group', value: patient.bloodGroup },
                    { label: 'Phone', value: patient.phone },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-blue-500 font-medium mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-slate-800">{value}</p>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-xs text-blue-500 font-medium mb-0.5">Email</p>
                    <p className="text-sm font-semibold text-slate-800">{patient.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-blue-500 font-medium mb-0.5">Address</p>
                    <p className="text-sm font-semibold text-slate-800">{patient.address}</p>
                  </div>
                </div>
              )}

              {tab === 'Medical' && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-xs text-blue-500 font-medium mb-0.5">Department</p>
                    <p className="text-sm font-semibold text-slate-800">{patient.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-500 font-medium mb-0.5">Assigned Doctor</p>
                    <p className="text-sm font-semibold text-slate-800">{patient.medical.assignedDoctor || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-500 font-medium mb-0.5">Admission Date</p>
                    <p className="text-sm font-semibold text-slate-800">{patient.medical.admissionDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-500 font-medium mb-0.5">Status</p>
                    <StatusBadge status={patient.status} />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-blue-500 font-medium mb-0.5">Diagnosis</p>
                    <p className="text-sm font-semibold text-slate-800">{patient.medical.diagnosis || '—'}</p>
                  </div>
                </div>
              )}

              {tab === 'History' && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Medical History</p>
                  {patient.history.length === 0 ? (
                    <p className="text-sm text-slate-400">No medical history recorded.</p>
                  ) : (
                    <ul className="space-y-2">
                      {patient.history.map((h, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <FileText size={16} className="text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">
                            {h.condition} ({h.year})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Add Patient Modal ────────────────────────────────────────────────────────
const AddPatientModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '', age: '', gender: 'Male', bloodGroup: 'O+',
    phone: '', email: '', address: '', department: '', status: 'outpatient',
  });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newP = await addPatient({ ...form, age: Number(form.age) });
    onAdd(newP);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Register New Patient</h2>
              <p className="text-sm text-blue-500 mt-0.5">Enter patient information to register them in the hospital system.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input name="name" required value={form.name} onChange={handle} className={inputClass} placeholder="" />
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input name="age" type="number" required min="0" max="150" value={form.age} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={form.gender} onChange={handle} className={inputClass}>
                {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Blood Group</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handle} className={inputClass}>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" value={form.phone} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <textarea name="address" value={form.address} onChange={handle} rows={2} className={`${inputClass} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department</label>
              <select name="department" value={form.department} onChange={handle} className={inputClass}>
                <option value="">Select department</option>
                {['Cardiology','Neurology','Orthopedics','Pediatrics','Emergency','General'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={form.status} onChange={handle} className={inputClass}>
                {['admitted','outpatient','discharged'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Edit Patient Modal ───────────────────────────────────────────────────────
const EditPatientModal = ({ patient, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:           patient.name,
    age:            patient.age,
    gender:         patient.gender,
    bloodGroup:     patient.bloodGroup,
    phone:          patient.phone,
    email:          patient.email,
    address:        patient.address,
    department:     patient.department,
    status:         patient.status,
    assignedDoctor: patient.medical?.assignedDoctor || '',
    diagnosis:      patient.medical?.diagnosis || '',
  });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updated = await updatePatient(patient.id, form);
    onSave(updated);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Edit Patient - {patient.id}</h2>
              <p className="text-sm text-blue-500 mt-0.5">Update patient information and medical details.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Full Name + Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input name="name" required value={form.name} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input name="age" type="number" required min="0" max="150" value={form.age} onChange={handle} className={inputClass} />
            </div>
          </div>

          {/* Gender + Blood Group */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={form.gender} onChange={handle} className={inputClass}>
                {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Blood Group</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handle} className={inputClass}>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" value={form.phone} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} className={inputClass} />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>Address</label>
            <textarea name="address" value={form.address} onChange={handle} rows={2} className={`${inputClass} resize-none`} />
          </div>

          {/* Department + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department</label>
              <select name="department" value={form.department} onChange={handle} className={inputClass}>
                <option value="">Select department</option>
                {['Cardiology','Neurology','Orthopedics','Pediatrics','Emergency','General'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={form.status} onChange={handle} className={inputClass}>
                {['admitted','outpatient','discharged'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Assigned Doctor + Diagnosis */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Assigned Doctor</label>
              <input name="assignedDoctor" value={form.assignedDoctor} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Diagnosis</label>
              <input name="diagnosis" value={form.diagnosis} onChange={handle} className={inputClass} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Saving...' : 'Update Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Patients Page ───────────────────────────────────────────────────────
const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchPatients().then(data => { setPatients(data); setLoading(false); });
    const auth = localStorage.getItem('hms_auth');
    if (auth) {
      try {
        setUserRole(JSON.parse(auth).role);
      } catch (e) {}
    }
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const handleStatusUpdate = (id, status) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handlePatientUpdate = (updated) => {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div className="flex-1 ml-64 bg-slate-50 min-h-screen">
      <Header />

      <main className="p-8">
        {/* Search + Add */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by name, ID, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          {userRole !== 'Nurse' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={16} />
              Add Patient
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">Patient Records</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['ID', 'Name', 'Age', 'Gender', 'Blood Group', 'Department', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">{p.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => setSelectedPatientId(p.id)}>
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{p.age}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{p.gender}</td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{p.bloodGroup}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{p.department}</td>
                      <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedPatientId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          {userRole !== 'Nurse' && (
                            <>
                              <button
                                onClick={() => setEditPatient(p)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <StatusDropdown patientId={p.id} current={p.status} onUpdate={handleStatusUpdate} />
                            </>
                          )}
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
      {selectedPatientId && (
        <PatientDetailModal patientId={selectedPatientId} onClose={() => setSelectedPatientId(null)} />
      )}
      {showAddModal && (
        <AddPatientModal
          onClose={() => setShowAddModal(false)}
          onAdd={p => setPatients(prev => [...prev, p])}
        />
      )}
      {editPatient && (
        <EditPatientModal
          patient={editPatient}
          onClose={() => setEditPatient(null)}
          onSave={handlePatientUpdate}
        />
      )}
    </div>
  );
};

export default Patients;
