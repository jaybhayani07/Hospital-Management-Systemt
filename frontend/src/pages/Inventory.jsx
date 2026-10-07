import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, X, AlertTriangle,
  Package, AlertOctagon, TrendingDown, DollarSign
} from 'lucide-react';
import {
  fetchInventory, addInventoryItem, updateInventoryItem,
  deleteInventoryItem
} from '../api';
import Header from '../components/Header';

// ─── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['Medicine', 'Supplies', 'Equipment'];

// Helper to format date string to DD/MM/YYYY
const fmtDate = (dateStr) => {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

// ─── Category Badge ────────────────────────────────────────────────────────────
const CategoryBadge = ({ category }) => {
  const map = {
    medicine:  'bg-blue-50 text-blue-600 border border-blue-100',
    supplies:  'bg-emerald-50 text-emerald-600 border border-emerald-100',
    equipment: 'bg-purple-50 text-purple-600 border border-purple-100',
  };
  const key = category.toLowerCase();
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold lowercase ${map[key] || 'bg-slate-100 text-slate-600'}`}>
      {category}
    </span>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ isLow }) => {
  return isLow ? (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200 whitespace-nowrap">
      Low Stock
    </span>
  ) : (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-white whitespace-nowrap">
      In Stock
    </span>
  );
};

// ─── Add Inventory Modal ───────────────────────────────────────────────────────
const AddItemModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '', category: 'Medicine', quantity: '', unit: '',
    reorderLevel: '', price: '', supplier: '', expiry: ''
  });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newItem = await addInventoryItem(form);
    onAdd(newItem);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add Inventory Item</h2>
            <p className="text-sm text-slate-500 mt-0.5">Add new medicine, equipment, or supplies to the inventory.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Item Name</label>
              <input name="name" required value={form.name} onChange={handle} className={inputClass} placeholder="e.g., Paracetamol 500mg" />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={form.category} onChange={handle} className={inputClass}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quantity</label>
              <input name="quantity" type="number" required min="0" value={form.quantity} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <input name="unit" required value={form.unit} onChange={handle} className={inputClass} placeholder="e.g., tablets, boxes, units" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Reorder Level</label>
              <input name="reorderLevel" type="number" required min="0" value={form.reorderLevel} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Price per Unit ($)</label>
              <input name="price" type="number" step="0.01" required min="0" value={form.price} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Supplier</label>
              <input name="supplier" required value={form.supplier} onChange={handle} className={inputClass} placeholder="e.g., MediPharm Inc." />
            </div>
            <div>
              <label className={labelClass}>Expiry Date (Optional)</label>
              <input name="expiry" type="date" value={form.expiry} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Edit Inventory Modal ──────────────────────────────────────────────────────
const EditItemModal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:         item.name,
    category:     item.category,
    quantity:     item.quantity,
    unit:         item.unit,
    reorderLevel: item.reorderLevel,
    price:         item.price,
    supplier:     item.supplier,
    expiry:       item.expiry || '',
  });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updated = await updateInventoryItem(item.id, form);
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
            <h2 className="text-xl font-bold text-slate-800">Edit Inventory Item - {item.id}</h2>
            <p className="text-sm text-slate-500 mt-0.5">Update inventory item details and stock levels.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Item Name</label>
              <input name="name" required value={form.name} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={form.category} onChange={handle} className={inputClass}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quantity</label>
              <input name="quantity" type="number" required min="0" value={form.quantity} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <input name="unit" required value={form.unit} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Reorder Level</label>
              <input name="reorderLevel" type="number" required min="0" value={form.reorderLevel} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Price per Unit ($)</label>
              <input name="price" type="number" step="0.01" required min="0" value={form.price} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Supplier</label>
              <input name="supplier" required value={form.supplier} onChange={handle} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Expiry Date (Optional)</label>
              <input name="expiry" type="date" value={form.expiry} onChange={handle} className={inputClass} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Saving...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Inventory Page ───────────────────────────────────────────────────────
const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    fetchInventory().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel);
  const lowStockCount = lowStockItems.length;

  // Simple expiration logic: item is expiring if expiry date is present and in the future < 90 days
  const expiringSoonCount = items.filter(item => {
    if (!item.expiry) return false;
    const diffTime = new Date(item.expiry) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90;
  }).length;

  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleAdd = (newItem) => {
    setItems(prev => [...prev, newItem]);
  };

  const handleSave = (updated) => {
    setItems(prev => prev.map(item => item.id === updated.id ? updated : item));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this item from inventory?')) {
      await deleteInventoryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="flex-1 ml-64 bg-slate-50 min-h-screen">
      <Header />

      <main className="p-8 space-y-6">
        {/* Info & Add row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 font-semibold">Manage hospital inventory and supplies</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Items',   value: totalItems,        badgeColor: 'bg-blue-500',   icon: <Package className="text-white" size={20} /> },
            { label: 'Low Stock',     value: lowStockCount,     badgeColor: 'bg-orange-500', icon: <AlertTriangle className="text-white" size={20} /> },
            { label: 'Expiring Soon', value: expiringSoonCount, badgeColor: 'bg-red-500',    icon: <TrendingDown className="text-white" size={20} /> },
            { label: 'Total Value',   value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`, badgeColor: 'bg-emerald-500', icon: <DollarSign className="text-white" size={20} /> },
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

        {/* Low Stock Alert Box */}
        {!loading && lowStockItems.length > 0 && (
          <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-orange-800 font-semibold text-sm">
              <AlertOctagon size={18} className="text-orange-600" />
              <span>Low Stock Alert</span>
            </div>
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.id} className="bg-white border border-orange-50 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Current: <span className="font-semibold text-slate-700">{item.quantity} {item.unit}</span> | Reorder: <span className="font-semibold text-slate-700">{item.reorderLevel} {item.unit}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200">
                    Low Stock
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">Inventory Items</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['ID', 'Name', 'Category', 'Quantity', 'Reorder Level', 'Price', 'Supplier', 'Expiry', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 animate-pulse">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-sm text-slate-400">
                      No items in inventory.
                    </td>
                  </tr>
                ) : (
                  items.map(item => {
                    const isLow = item.quantity <= item.reorderLevel;
                    return (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">{item.id}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.name}</td>
                        <td className="px-6 py-4"><CategoryBadge category={item.category} /></td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-semibold">{item.quantity} {item.unit}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.reorderLevel} {item.unit}</td>
                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">${item.price}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.supplier}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{fmtDate(item.expiry)}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge isLow={isLow} /></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditItem(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
      {editItem && (
        <EditItemModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Inventory;
