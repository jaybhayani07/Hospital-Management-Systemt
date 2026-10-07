import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Eye, Download, X, Trash2,
  FileText, CheckCircle2, RefreshCw, Clock
} from 'lucide-react';
import {
  fetchLabReports, fetchLabReportById, createLabReport,
  updateLabReport, deleteLabReport
} from '../api';
import Header from '../components/Header';

// Helper to format date string to DD/MM/YYYY
const fmtDate = (dateStr) => {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    completed:  'bg-slate-950 text-white font-semibold',
    processing: 'bg-slate-100 text-slate-700 border border-slate-200',
    pending:    'bg-blue-50 text-blue-600 border border-blue-100 font-semibold',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize whitespace-nowrap ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};

// ─── Parameter Status Badge ────────────────────────────────────────────────────
const ParamStatusBadge = ({ status }) => {
  const map = {
    normal: 'bg-slate-950 text-white font-semibold',
    high:   'bg-red-100 text-red-600 border border-red-200 font-semibold',
    low:    'bg-amber-100 text-amber-700 border border-amber-200 font-semibold',
  };
  const norm = (status || 'normal').toLowerCase();
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize whitespace-nowrap ${map[norm] || 'bg-slate-100 text-slate-600'}`}>
      {norm}
    </span>
  );
};

// ─── Order Lab Test Modal ──────────────────────────────────────────────────────
const OrderLabTestModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    patientName: '',
    patientId: 'P001',
    testType: 'Complete Blood Count (CBC)',
    orderedBy: '',
    status: 'pending',
    notes: '',
    parameters: []
  });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Seed empty parameters based on test type choice
    let seedParams = [];
    if (form.testType === 'Complete Blood Count (CBC)') {
      seedParams = [
        { name: 'White Blood Cells', value: '-', normalRange: '4.0-11.0 × 10^9/L', status: 'normal' },
        { name: 'Red Blood Cells', value: '-', normalRange: '4.5-5.5 × 10^12/L', status: 'normal' },
        { name: 'Hemoglobin', value: '-', normalRange: '13.0-17.0 g/dL', status: 'normal' },
        { name: 'Platelets', value: '-', normalRange: '150-400 × 10^9/L', status: 'normal' },
      ];
    } else if (form.testType === 'Lipid Panel') {
      seedParams = [
        { name: 'Total Cholesterol', value: '-', normalRange: '< 200 mg/dL', status: 'normal' },
        { name: 'Triglycerides', value: '-', normalRange: '< 150 mg/dL', status: 'normal' },
        { name: 'HDL Cholesterol', value: '-', normalRange: '> 40 mg/dL', status: 'normal' },
        { name: 'LDL Cholesterol', value: '-', normalRange: '< 100 mg/dL', status: 'normal' },
      ];
    } else if (form.testType === 'Thyroid Function Test') {
      seedParams = [
        { name: 'TSH', value: '-', normalRange: '0.4-4.0 mIU/L', status: 'normal' },
        { name: 'Free T4', value: '-', normalRange: '0.8-1.8 ng/dL', status: 'normal' },
      ];
    } else if (form.testType === 'Blood Glucose') {
      seedParams = [
        { name: 'Fasting Blood Sugar', value: '-', normalRange: '70-100 mg/dL', status: 'normal' },
      ];
    } else if (form.testType === 'Liver Function Test') {
      seedParams = [
        { name: 'Albumin', value: '-', normalRange: '3.5-5.0 g/dL', status: 'normal' },
        { name: 'Total Bilirubin', value: '-', normalRange: '0.1-1.2 mg/dL', status: 'normal' },
        { name: 'AST', value: '-', normalRange: '10-40 U/L', status: 'normal' },
        { name: 'ALT', value: '-', normalRange: '7-56 U/L', status: 'normal' },
      ];
    } else if (form.testType === 'Kidney Function Test') {
      seedParams = [
        { name: 'Urea', value: '-', normalRange: '7-20 mg/dL', status: 'normal' },
        { name: 'Creatinine', value: '-', normalRange: '0.6-1.2 mg/dL', status: 'normal' },
        { name: 'GFR', value: '-', normalRange: '> 90 mL/min/1.73m²', status: 'normal' },
      ];
    } else if (form.testType === 'Urinalysis') {
      seedParams = [
        { name: 'Color', value: '-', normalRange: 'Pale Yellow', status: 'normal' },
        { name: 'pH', value: '-', normalRange: '4.5-8.0', status: 'normal' },
        { name: 'Protein', value: '-', normalRange: 'Negative', status: 'normal' },
        { name: 'Glucose', value: '-', normalRange: 'Negative', status: 'normal' },
      ];
    } else if (form.testType === 'X-Ray') {
      seedParams = [
        { name: 'Chest View', value: '-', normalRange: 'No active infiltrates', status: 'normal' },
      ];
    } else if (form.testType === 'MRI Scan') {
      seedParams = [
        { name: 'Brain Scan', value: '-', normalRange: 'No acute pathology', status: 'normal' },
      ];
    }

    const newReport = await createLabReport({
      ...form,
      parameters: seedParams
    });
    
    if (newReport) {
      onAdd(newReport);
      onClose();
    } else {
      setLoading(false);
      alert('Failed to create report. Please try again.');
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Order Laboratory Test</h2>
            <p className="text-sm text-slate-500 mt-0.5">Create a new lab test order for a patient.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Patient Name</label>
              <input name="patientName" required value={form.patientName} onChange={handle} className={inputClass} placeholder="Enter patient name" />
            </div>
            <div>
              <label className={labelClass}>Patient ID</label>
              <input name="patientId" required value={form.patientId} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Test Type</label>
            <select name="testType" value={form.testType} onChange={handle} className={inputClass}>
              <option>Complete Blood Count (CBC)</option>
              <option>Lipid Panel</option>
              <option>Thyroid Function Test</option>
              <option>Blood Glucose</option>
              <option>Liver Function Test</option>
              <option>Kidney Function Test</option>
              <option>Urinalysis</option>
              <option>X-Ray</option>
              <option>MRI Scan</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Ordered By</label>
            <input name="orderedBy" required value={form.orderedBy} onChange={handle} className={inputClass} placeholder="Dr. Name" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Ordering...' : 'Order Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Update Lab Report Modal (Edit/Update results) ─────────────────────────────
const UpdateLabReportModal = ({ report, onClose, onSave }) => {
  const [status, setStatus] = useState(report.status);
  const [notes, setNotes] = useState(report.notes);
  const [parameters, setParameters] = useState(report.parameters.map(p => ({ ...p })));
  const [loading, setLoading] = useState(false);

  const handleParam = (index, field, val) => {
    setParameters(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addParam = () => {
    setParameters(prev => [...prev, { name: '', value: '', normalRange: '', status: 'normal' }]);
  };

  const removeParam = (index) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updated = await updateLabReport(report.id, {
      status,
      notes,
      parameters
    });
    
    if (updated) {
      onSave(updated);
      onClose();
    } else {
      setLoading(false);
      alert('Failed to update report. Please try again.');
    }
  };

  const inputClass = "px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Update Lab Report</h2>
            <p className="text-sm text-slate-500 mt-0.5">Add or update test results and report status.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-b border-slate-100 pb-4">
            <div>
              <span className="block text-xs text-slate-400 font-semibold uppercase">Report ID</span>
              <span className="font-bold text-slate-700">{report.id}</span>
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-semibold uppercase">Patient</span>
              <span className="font-bold text-slate-700">{report.patientName} ({report.patientId})</span>
            </div>
            <div className="col-span-2 mt-2">
              <span className="block text-xs text-slate-400 font-semibold uppercase">Test Type</span>
              <span className="font-bold text-slate-800">{report.testType}</span>
            </div>
          </div>

          <div>
            <label className={labelClass}>Report Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Test Results</span>
              <button
                type="button"
                onClick={addParam}
                className="flex items-center gap-1 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50"
              >
                <Plus size={13} />
                Add Parameter
              </button>
            </div>

            <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
              {parameters.map((p, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 relative">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Parameter</span>
                      <input
                        required
                        value={p.name}
                        onChange={(e) => handleParam(idx, 'name', e.target.value)}
                        className={`${inputClass} w-full`}
                        placeholder="e.g. Red Blood Cells"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Value</span>
                      <input
                        required
                        value={p.value}
                        onChange={(e) => handleParam(idx, 'value', e.target.value)}
                        className={`${inputClass} w-full`}
                        placeholder="e.g. 4.8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Normal Range</span>
                      <input
                        required
                        value={p.normalRange}
                        onChange={(e) => handleParam(idx, 'normalRange', e.target.value)}
                        className={`${inputClass} w-full`}
                        placeholder="e.g. 4.5-5.5"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Status</span>
                      <select
                        value={p.status}
                        onChange={(e) => handleParam(idx, 'status', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeParam(idx)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Clinical Notes</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
              placeholder="All parameters within normal range..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Saving...' : 'Update Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Lab Report Details Modal ──────────────────────────────────────────────────
const LabReportDetailsModal = ({ reportId, onClose }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabReportById(reportId).then(data => {
      setReport(data);
      setLoading(false);
    });
  }, [reportId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Lab Report Details</h2>
            <p className="text-sm text-slate-500 mt-0.5">View complete lab test results and parameter values.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 animate-pulse">
            Loading report details...
          </div>
        ) : !report ? (
          <div className="p-12 text-center text-sm text-red-500">
            Report not found.
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm border-b border-slate-50 pb-4">
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Report ID</span>
                <span className="font-bold text-slate-700">{report.id}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Date</span>
                <span className="font-bold text-slate-700">{fmtDate(report.date)}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Patient</span>
                <span className="font-bold text-slate-700">{report.patientName}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Patient ID</span>
                <span className="font-bold text-slate-700">{report.patientId}</span>
              </div>
              <div className="col-span-2 border-t border-slate-50 pt-3 flex justify-between gap-4">
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase">Test Type</span>
                  <span className="font-bold text-slate-800">{report.testType}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase">Ordered By</span>
                  <span className="font-bold text-slate-800">{report.orderedBy}</span>
                </div>
              </div>
            </div>

            {/* Test Results table */}
            <div className="space-y-2">
              <span className="block text-xs text-slate-400 font-semibold uppercase">Test Results</span>
              {report.parameters.length === 0 ? (
                <div className="p-6 border border-slate-100 rounded-xl text-center text-sm text-slate-400 bg-slate-50">
                  No parameters added yet. Update report to enter parameters.
                </div>
              ) : (
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-100">
                        <th className="px-4 py-2 text-left font-semibold">Parameter</th>
                        <th className="px-4 py-2 text-center font-semibold w-16">Value</th>
                        <th className="px-4 py-2 text-left font-semibold">Normal Range</th>
                        <th className="px-4 py-2 text-center font-semibold w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.parameters.map((p, idx) => (
                        <tr key={idx} className="border-b border-slate-50 text-slate-700 font-medium">
                          <td className="px-4 py-2.5">{p.name}</td>
                          <td className="px-4 py-2.5 text-center font-semibold">{p.value}</td>
                          <td className="px-4 py-2.5 text-slate-500">{p.normalRange}</td>
                          <td className="px-4 py-2.5 text-center"><ParamStatusBadge status={p.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notes block */}
            <div className="space-y-2">
              <span className="block text-xs text-slate-400 font-semibold uppercase">Notes</span>
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 font-semibold">
                {report.notes || 'No notes added.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Lab Reports Page ─────────────────────────────────────────────────────
const LabReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [viewReportId, setViewReportId] = useState(null);
  const [editReport, setEditReport] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchLabReports().then(data => {
      setReports(data);
      setLoading(false);
    });
    const auth = localStorage.getItem('hms_auth');
    if (auth) {
      try {
        setUserRole(JSON.parse(auth).role);
      } catch (e) {}
    }
  }, []);

  const totalReports = reports.length;
  const completedCount = reports.filter(r => r.status === 'completed').length;
  const processingCount = reports.filter(r => r.status === 'processing').length;
  const pendingCount = reports.filter(r => r.status === 'pending').length;

  const handleAdd = (newReport) => {
    setReports(prev => [...prev, newReport]);
  };

  const handleSave = (updated) => {
    setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  return (
    <div className="flex-1 ml-64 bg-slate-50 min-h-screen">
      <Header />

      <main className="p-8 space-y-6">
        {/* Info & Order row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 font-semibold">View and manage laboratory test reports</p>
          {userRole !== 'Nurse' && (
            <button
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={16} />
              Order Lab Test
            </button>
          )}
        </div>

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Tests', value: totalReports,     badgeColor: 'bg-blue-500',   icon: <FileText className="text-white" size={20} /> },
            { label: 'Completed',   value: completedCount,   badgeColor: 'bg-emerald-500', icon: <CheckCircle2 className="text-white" size={20} /> },
            { label: 'Processing',  value: processingCount,  badgeColor: 'bg-orange-500', icon: <RefreshCw className="text-white" size={20} /> },
            { label: 'Pending',     value: pendingCount,     badgeColor: 'bg-slate-500',  icon: <Clock className="text-white" size={20} /> },
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

        {/* Lab Reports Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">Laboratory Reports</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Report ID', 'Patient', 'Test Type', 'Ordered By', 'Date', 'Status', 'Actions'].map(h => (
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
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                      No reports registered.
                    </td>
                  </tr>
                ) : (
                  reports.map(r => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">{r.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{r.patientName}</p>
                          <p className="text-xs text-slate-400">{r.patientId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800 font-semibold">{r.testType}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{r.orderedBy}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{fmtDate(r.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewReportId(r.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          {userRole !== 'Nurse' && (
                            <button
                              onClick={() => setEditReport(r)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit2 size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => alert(`Downloading Lab Report ${r.id}...`)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Download size={15} />
                          </button>
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
      {showOrderModal && (
        <OrderLabTestModal
          onClose={() => setShowOrderModal(false)}
          onAdd={handleAdd}
        />
      )}
      {viewReportId && (
        <LabReportDetailsModal
          reportId={viewReportId}
          onClose={() => setViewReportId(null)}
        />
      )}
      {editReport && (
        <UpdateLabReportModal
          report={editReport}
          onClose={() => setEditReport(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default LabReports;
