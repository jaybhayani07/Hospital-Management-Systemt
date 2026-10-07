import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Eye, Download, X, Check,
  ChevronDown, DollarSign, Calendar, CreditCard,
  Trash2
} from 'lucide-react';
import {
  fetchInvoices, fetchInvoiceById, createInvoice,
  updateInvoice, updateInvoiceStatus, deleteInvoice
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
    paid:    'bg-slate-950 text-white font-semibold',
    pending: 'bg-slate-100 text-slate-700 border border-slate-200',
    overdue: 'bg-red-600 text-white font-semibold',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize whitespace-nowrap ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};

// ─── Status Dropdown ───────────────────────────────────────────────────────────
const StatusDropdown = ({ invoiceId, current, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (s) => {
    setOpen(false);
    setLoading(true);
    await updateInvoiceStatus(invoiceId, s);
    onUpdate(invoiceId, s);
    setLoading(false);
  };

  const btnMap = {
    paid:    'bg-slate-100 text-slate-800',
    pending: 'bg-slate-100 text-slate-700 border border-slate-200',
    overdue: 'bg-red-50 text-red-700 border border-red-100',
  };

  return (
    <div className="relative">
      <button
        disabled={loading}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity capitalize ${btnMap[current]} ${loading ? 'opacity-50' : ''}`}
      >
        <span>{current}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40">
          {['paid', 'pending', 'overdue'].map(s => (
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

// ─── Create Invoice Modal ──────────────────────────────────────────────────────
const CreateInvoiceModal = ({ onClose, onAdd }) => {
  const createNewItem = () => ({
    id: `${Date.now()}-${Math.random()}`,
    name: '',
    quantity: 1,
    rate: 0
  });

  const [form, setForm] = useState({
    patientName: '',
    patientId: 'P001',
    status: 'pending',
    paymentMethod: '',
    items: [createNewItem()]
  });
  const [loading, setLoading] = useState(false);

  const handleField = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleItem = (itemId, field, val) => {
    setForm(f => {
      const items = f.items.map(item =>
        item.id === itemId ? { ...item, [field]: val } : item
      );
      return { ...f, items };
    });
  };

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, createNewItem()] }));
  };

  const removeItem = (itemId) => {
    if (form.items.length <= 1) return;
    setForm(f => ({ ...f, items: f.items.filter(item => item.id !== itemId) }));
  };

  // Live Calculations
  const subtotal = form.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newInvoice = await createInvoice(form);
    onAdd(newInvoice);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Create New Invoice</h2>
            <p className="text-sm text-slate-500 mt-0.5">Generate an invoice for patient services and procedures.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Patient Name</label>
              <input name="patientName" required value={form.patientName} onChange={handleField} className={inputClass} placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className={labelClass}>Patient ID</label>
              <input name="patientId" required value={form.patientId} onChange={handleField} className={inputClass} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Invoice Items</span>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50"
              >
                <Plus size={13} />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {form.items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <input
                    required
                    value={item.name}
                    onChange={(e) => handleItem(item.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Service/Item name"
                  />
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItem(item.id, 'quantity', e.target.value)}
                    className="w-14 shrink-0 px-2 py-1.5 text-sm text-center rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="number"
                    required
                    min="0"
                    value={item.rate}
                    onChange={(e) => handleItem(item.id, 'rate', e.target.value)}
                    className="w-16 shrink-0 px-2 py-1.5 text-sm text-center rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="w-16 shrink-0 text-right text-sm text-slate-600 font-medium">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    disabled={form.items.length <= 1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="w-8 h-8 shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 rounded-lg flex items-center justify-center transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 size={15} className="pointer-events-none" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-100 pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Edit Invoice Modal ────────────────────────────────────────────────────────
const EditInvoiceModal = ({ invoice, onClose, onSave }) => {
  const [form, setForm] = useState({
    patientName:   invoice.patientName,
    patientId:     invoice.patientId,
    status:        invoice.status,
    paymentMethod: invoice.paymentMethod || '',
    items:         invoice.items.map((item, idx) => ({
      ...item,
      id: item.id || `${Date.now()}-${idx}-${Math.random()}`
    })),
  });
  const [loading, setLoading] = useState(false);

  const handleField = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleItem = (itemId, field, val) => {
    setForm(f => {
      const items = f.items.map(item =>
        item.id === itemId ? { ...item, [field]: val } : item
      );
      return { ...f, items };
    });
  };

  const addItem = () => {
    const newItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: '',
      quantity: 1,
      rate: 0
    };
    setForm(f => ({ ...f, items: [...f.items, newItem] }));
  };

  const removeItem = (itemId) => {
    if (form.items.length <= 1) return;
    setForm(f => ({ ...f, items: f.items.filter(item => item.id !== itemId) }));
  };

  // Live Calculations
  const subtotal = form.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updated = await updateInvoice(invoice.id, form);
    onSave(updated);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Invoice - {invoice.id}</h2>
            <p className="text-sm text-slate-500 mt-0.5">Update invoice details and line items.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Patient Name</label>
              <input name="patientName" required value={form.patientName} onChange={handleField} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Patient ID</label>
              <input name="patientId" required value={form.patientId} onChange={handleField} className={inputClass} disabled />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={form.status} onChange={handleField} className={inputClass}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Payment Method (Optional)</label>
              <input name="paymentMethod" value={form.paymentMethod} onChange={handleField} className={inputClass} placeholder="e.g. Credit Card" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Invoice Items</span>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50"
              >
                <Plus size={13} />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {form.items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <input
                    required
                    value={item.name}
                    onChange={(e) => handleItem(item.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItem(item.id, 'quantity', e.target.value)}
                    className="w-14 shrink-0 px-2 py-1.5 text-sm text-center rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="number"
                    required
                    min="0"
                    value={item.rate}
                    onChange={(e) => handleItem(item.id, 'rate', e.target.value)}
                    className="w-16 shrink-0 px-2 py-1.5 text-sm text-center rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="w-16 shrink-0 text-right text-sm text-slate-600 font-medium">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    disabled={form.items.length <= 1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="w-8 h-8 shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 rounded-lg flex items-center justify-center transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 size={15} className="pointer-events-none" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-100 pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Saving...' : 'Update Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Invoice Details Modal ─────────────────────────────────────────────────────
const InvoiceDetailsModal = ({ invoiceId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceById(invoiceId).then(data => {
      setInvoice(data);
      setLoading(false);
    });
  }, [invoiceId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Invoice Details</h2>
            <p className="text-sm text-slate-500 mt-0.5">View complete invoice information and line items.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 animate-pulse">
            Loading invoice details...
          </div>
        ) : !invoice ? (
          <div className="p-12 text-center text-sm text-red-500">
            Invoice not found.
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Invoice ID</span>
                <span className="font-bold text-slate-700">{invoice.id}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Date</span>
                <span className="font-bold text-slate-700">{fmtDate(invoice.date)}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Patient</span>
                <span className="font-bold text-slate-700">{invoice.patientName}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-semibold uppercase">Patient ID</span>
                <span className="font-bold text-slate-700">{invoice.patientId}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <span className="block text-xs text-slate-400 font-semibold uppercase">Invoice Items</span>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-100">
                      <th className="px-4 py-2 text-left font-semibold">Item</th>
                      <th className="px-4 py-2 text-center font-semibold w-12">Qty</th>
                      <th className="px-4 py-2 text-right font-semibold w-20">Rate</th>
                      <th className="px-4 py-2 text-right font-semibold w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 text-slate-700 font-medium">
                        <td className="px-4 py-2.5">{item.name}</td>
                        <td className="px-4 py-2.5 text-center">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-right">${item.rate}</td>
                        <td className="px-4 py-2.5 text-right font-semibold">${(item.quantity * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculation displays */}
            <div className="space-y-2 border-t border-slate-100 pt-4 text-sm font-semibold">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (10%):</span>
                <span>${invoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 border-t border-slate-100 pt-2 text-base font-bold">
                <span>Total:</span>
                <span>${invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Billing Page ─────────────────────────────────────────────────────────
const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState(null);
  const [editInvoice, setEditInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices().then(data => {
      setInvoices(data);
      setLoading(false);
    });
  }, []);

  const totalRevenue = invoices
    .filter(inv => inv && inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const totalPaid = totalRevenue; // Revenue from paid invoices
  const totalPending = invoices
    .filter(inv => inv && inv.status === 'pending')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const totalOverdue = invoices
    .filter(inv => inv && inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const handleStatusUpdate = (id, status) => {
    setInvoices(prev => prev.map(inv => inv && inv.id === id ? { ...inv, status } : inv));
  };

  const handleAdd = (newInvoice) => {
    if (!newInvoice) {
      alert("Failed to create invoice. Please make sure the backend server is running and restarted.");
      return;
    }
    setInvoices(prev => [...prev, newInvoice]);
  };

  const handleSave = (updated) => {
    if (!updated) {
      alert("Failed to update invoice. Please make sure the backend server is running and restarted.");
      return;
    }
    setInvoices(prev => prev.map(inv => inv && inv.id === updated.id ? updated : inv));
  };

  // Filtering invoices based on selected tab
  const filteredInvoices = invoices.filter(inv => {
    if (!inv) return false;
    if (filter === 'All') return true;
    return inv.status === filter.toLowerCase();
  });

  return (
    <div className="flex-1 ml-64 bg-slate-50 min-h-screen">
      <Header />

      <main className="p-8 space-y-6">
        {/* Info & Create Invoice row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 font-semibold">Manage patient billing and invoices</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} />
            Create Invoice
          </button>
        </div>

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: totalRevenue, badgeColor: 'bg-emerald-500' },
            { label: 'Paid',          value: totalPaid,    badgeColor: 'bg-blue-500' },
            { label: 'Pending',       value: totalPending, badgeColor: 'bg-orange-500' },
            { label: 'Overdue',       value: totalOverdue, badgeColor: 'bg-red-500' },
          ].map(({ label, value, badgeColor }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-900">
                  {loading ? '—' : `$${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badgeColor}`}>
                <DollarSign className="text-white" size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Invoices List Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-semibold text-slate-800">Invoices</h3>

            {/* Filter tab pills */}
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
              {['All', 'Paid', 'Pending', 'Overdue'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    filter === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Invoice ID', 'Patient', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 animate-pulse">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">{inv.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{inv.patientName}</p>
                          <p className="text-xs text-slate-400">{inv.patientId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{fmtDate(inv.date)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">${inv.amount.toFixed(2)}</td>
                      <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewInvoiceId(inv.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setEditInvoice(inv)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => alert(`Downloading Invoice ${inv.id}...`)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Download size={15} />
                          </button>
                          <StatusDropdown invoiceId={inv.id} current={inv.status} onUpdate={handleStatusUpdate} />
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
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onAdd={handleAdd}
        />
      )}
      {viewInvoiceId && (
        <InvoiceDetailsModal
          invoiceId={viewInvoiceId}
          onClose={() => setViewInvoiceId(null)}
        />
      )}
      {editInvoice && (
        <EditInvoiceModal
          invoice={editInvoice}
          onClose={() => setEditInvoice(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Billing;
