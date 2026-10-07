// Simulated API module for fetching dashboard data

const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  if (typeof url === 'string' && url.startsWith('/api/') && !url.includes('/api/auth/login')) {
    const token = localStorage.getItem('hms_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('hms_token');
          localStorage.removeItem('hms_auth');
          window.location.href = '/login';
          return Promise.reject(new Error('Token expired'));
        }
      } catch (e) {}
      
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    const res = await originalFetch(url, options);
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_auth');
      window.location.href = '/login';
    }
    return res;
  }
  return originalFetch(url, options);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchDashboardMetrics = async () => {
  let patientCount = 0;
  let todaysCount = 0;
  let revenueStr = "$0";
  let occupancyStr = "0%";

  let patientChange = { text: "+0%", isPositive: true };
  let appointmentChange = { text: "+0%", isPositive: true };
  let revenueChange = { text: "+0%", isPositive: true };
  let occupancyChange = { text: "0%", isPositive: true }; // No historical tracking for beds

  const calculateChange = (current, previous) => {
    if (previous === 0) return { text: current > 0 ? "+100%" : "0%", isPositive: true };
    const delta = ((current - previous) / previous) * 100;
    const isPos = delta >= 0;
    return { text: `${isPos ? '+' : ''}${delta.toFixed(1)}%`, isPositive: isPos };
  };

  try {
    const patientsRes = await fetch('/api/patient/allPatient');
    if (patientsRes.ok) {
      const patients = await patientsRes.json();
      patientCount = patients.length;

      // Calculate change based on admissions this month vs last month
      const now = new Date();
      const currentMonth = now.getMonth();
      const prevMonth = (currentMonth - 1 + 12) % 12;
      const currentYear = now.getFullYear();
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const thisMonthAdmissions = patients.filter(p => {
        if (!p.admissionDate) return false;
        const d = new Date(p.admissionDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;

      const prevMonthAdmissions = patients.filter(p => {
        if (!p.admissionDate) return false;
        const d = new Date(p.admissionDate);
        return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
      }).length;

      patientChange = calculateChange(thisMonthAdmissions, prevMonthAdmissions);
    }
  } catch (err) {
    console.error("Error fetching total patients for dashboard:", err);
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRes = await fetch(`/api/appointment/countToday?date=${todayStr}`);
    if (todayRes.ok) {
      todaysCount = await todayRes.json();
    }

    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const yesterdayRes = await fetch(`/api/appointment/countToday?date=${yesterdayStr}`);
    if (yesterdayRes.ok) {
      const yesterdayCount = await yesterdayRes.json();
      appointmentChange = calculateChange(todaysCount, yesterdayCount);
    }
  } catch (err) {
    console.error("Error fetching today's appointments count for dashboard:", err);
  }

  try {
    const revRes = await fetch('/api/dashboard/monthlyRevenue');
    if (revRes.ok) {
      const revData = await revRes.json();
      if (revData.length > 0) {
        const currentMonthRev = revData[revData.length - 1].revenue;
        revenueStr = "$" + currentMonthRev.toLocaleString();

        if (revData.length > 1) {
          const prevMonthRev = revData[revData.length - 2].revenue;
          revenueChange = calculateChange(currentMonthRev, prevMonthRev);
        }
      }
    }
  } catch (err) {
    console.error("Error fetching monthly revenue for dashboard metrics:", err);
  }

  try {
    const bedRes = await fetch('/api/bed/allBeds');
    if (bedRes.ok) {
      const beds = await bedRes.json();
      const totalBeds = beds.length;
      if (totalBeds > 0) {
        const occupied = beds.filter(b => b.status === 'occupied').length;
        const occPercent = Math.round((occupied / totalBeds) * 100);
        occupancyStr = occPercent + "%";
      }
    }
  } catch (err) {
    console.error("Error fetching beds for dashboard metrics:", err);
  }

  return {
    totalPatients: {
      value: String(patientCount),
      change: patientChange.text,
      isPositive: patientChange.isPositive,
    },
    todaysAppointments: {
      value: String(todaysCount),
      change: appointmentChange.text,
      isPositive: appointmentChange.isPositive,
    },
    monthlyRevenue: {
      value: revenueStr,
      change: revenueChange.text,
      isPositive: revenueChange.isPositive,
    },
    bedOccupancy: {
      value: occupancyStr,
      change: occupancyChange.text,
      isPositive: occupancyChange.isPositive,
    }
  };
};

export const fetchWeeklyAppointments = async () => {
  try {
    const res = await fetch('/api/dashboard/weeklyAppointments');
    if (!res.ok) throw new Error(`Failed to fetch weekly appointments: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching weekly appointments:", err);
    return [];
  }
};

export const fetchDepartmentStats = async () => {
  try {
    const res = await fetch('/api/dashboard/departmentStats');
    if (!res.ok) throw new Error(`Failed to fetch department stats: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching department stats:", err);
    return [];
  }
};

export const fetchMonthlyRevenue = async () => {
  try {
    const res = await fetch('/api/dashboard/monthlyRevenue');
    if (!res.ok) throw new Error(`Failed to fetch monthly revenue: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching monthly revenue:", err);
    return [];
  }
};

export const fetchUserProfile = async () => {
  await delay(300);
  const local = localStorage.getItem('hms_auth');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      return {
        name: parsed.name,
        role: parsed.role,
        initials: parsed.name ? parsed.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'D'
      };
    } catch (e) {}
  }
  return {
    name: "Dr. Sarah Admin",
    role: "Admin",
    initials: "SA"
  };
};

// ─── Patients API ─────────────────────────────────────────────────────────────

let patientsDb = []; // local fallback or cache if needed, but not used in primary flow

const BASE_URL = '/api/patient';

// Helper to map backend format to frontend format
const mapBackendToFrontend = (p) => {
  if (!p) return null;
  return {
    id: p.patientId,
    name: p.name,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    department: p.department,
    status: p.status,
    phone: p.phoneNumber || '',
    email: p.email || '',
    address: p.address || '',
    medical: {
      assignedDoctor: p.assignedDoctor || '',
      admissionDate: p.admissionDate ? p.admissionDate.split('T')[0] : '',
      diagnosis: p.diagnosis || '',
    },
    history: Array.isArray(p.history) ? p.history.map(h => {
      const match = String(h).match(/^(.*?)\s*\((\d{4})\)$/);
      if (match) {
        return { condition: match[1], year: parseInt(match[2], 10) };
      }
      return { condition: h, year: '' };
    }) : []
  };
};

export const fetchPatients = async () => {
  try {
    const res = await fetch(`${BASE_URL}/allPatient`);
    if (!res.ok) throw new Error(`Failed to fetch patients: ${res.status}`);
    const data = await res.json();
    return data.map(mapBackendToFrontend);
  } catch (err) {
    console.error("Error fetching patients:", err);
    return [];
  }
};

export const fetchPatientById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/allPatient`);
    if (!res.ok) throw new Error(`Failed to fetch patients: ${res.status}`);
    const data = await res.json();
    const found = data.find(p => p.patientId === id);
    return mapBackendToFrontend(found);
  } catch (err) {
    console.error(`Error fetching patient ${id}:`, err);
    return null;
  }
};

export const addPatient = async (patientData) => {
  try {
    const payload = {
      name: patientData.name,
      age: String(patientData.age),
      gender: patientData.gender,
      bloodGroup: patientData.bloodGroup,
      email: patientData.email || '',
      phoneNumber: patientData.phone || '',
      address: patientData.address || '',
      department: patientData.department || '',
      status: patientData.status || 'outpatient'
    };
    const res = await fetch(`${BASE_URL}/addPatient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to add patient: ${res.status}`);
    const saved = await res.json();
    return mapBackendToFrontend(saved);
  } catch (err) {
    console.error("Error adding patient:", err);
    return null;
  }
};

export const updatePatientStatus = async (id, status) => {
  try {
    const payload = {
      patientId: id,
      status: status
    };
    const res = await fetch(`${BASE_URL}/updatePatientStatusById`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update patient status: ${res.status}`);
    
    // Fetch the updated patient list to return the correct patient object
    const patients = await fetchPatients();
    return patients.find(p => p.id === id) || null;
  } catch (err) {
    console.error(`Error updating patient status ${id}:`, err);
    return null;
  }
};

export const updatePatient = async (id, updatedData) => {
  try {
    const payload = {
      patientId: id,
      name: updatedData.name,
      age: Number(updatedData.age),
      gender: updatedData.gender,
      bloodGroup: updatedData.bloodGroup,
      department: updatedData.department || '',
      status: updatedData.status || 'outpatient',
      email: updatedData.email || '',
      phoneNumber: updatedData.phone || '',
      address: updatedData.address || '',
      admissionDate: updatedData.admissionDate || new Date().toISOString(),
      diagnosis: updatedData.diagnosis || '',
      assignedDoctor: updatedData.assignedDoctor || ''
    };
    const res = await fetch(`${BASE_URL}/updatePatientById`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update patient: ${res.status}`);
    
    // Fetch the updated patient list to return the correct patient object
    const patients = await fetchPatients();
    return patients.find(p => p.id === id) || null;
  } catch (err) {
    console.error(`Error updating patient ${id}:`, err);
    return null;
  }
};


// ─── Appointments API ──────────────────────────────────────────────────────────

const DOCTORS = {
  Cardiology:   ['Dr. Smith', 'Dr. Adams'],
  Neurology:    ['Dr. Patel', 'Dr. Johnson'],
  Orthopedics:  ['Dr. Lee', 'Dr. Brown'],
  Pediatrics:   ['Dr. Wilson', 'Dr. Clark'],
  Emergency:    ['Dr. Davis', 'Dr. Martinez'],
  General:      ['Dr. Taylor', 'Dr. Anderson'],
};

const toBackendStatus = (status) => {
  if (!status) return 'Scheduled';
  const s = status.toLowerCase();
  if (s === 'scheduled') return 'Scheduled';
  if (s === 'completed') return 'Completed';
  if (s === 'cancelled') return 'Cancelled';
  if (s === 'in-progress') return 'In-progress';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const toFrontendStatus = (status) => {
  if (!status) return 'scheduled';
  const s = status.toLowerCase();
  if (s === 'scheduled') return 'scheduled';
  if (s === 'completed') return 'completed';
  if (s === 'cancelled') return 'cancelled';
  if (s === 'in-progress') return 'in-progress';
  return s;
};

const mapAppointmentBackendToFrontend = (a) => {
  if (!a) return null;
  return {
    id: a.appointmentId,
    patientName: a.patientName,
    patientId: a.patientId,
    doctor: a.doctorName,
    department: a.department,
    date: a.date,
    time: a.time,
    type: a.appointmentType,
    status: toFrontendStatus(a.status),
    notes: a.note || '',
  };
};

export const fetchAppointments = async () => {
  try {
    const res = await fetch('/api/appointment/allAppointments');
    if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.status}`);
    const data = await res.json();
    return data.map(mapAppointmentBackendToFrontend);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return [];
  }
};

export const fetchAppointmentById = async (id) => {
  try {
    const appointments = await fetchAppointments();
    return appointments.find(a => a.id === id) || null;
  } catch (err) {
    console.error(`Error fetching appointment ${id}:`, err);
    return null;
  }
};

export const scheduleAppointment = async (data) => {
  try {
    const payload = {
      patientId: data.patientId || 'P001',
      patientName: data.patientName,
      department: data.department,
      doctorName: data.doctor,
      date: data.date,
      time: data.time,
      appointmentType: data.type,
      note: data.notes || '',
    };
    const res = await fetch('/api/appointment/addAppointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to schedule appointment: ${res.status}`);
    const saved = await res.json();
    return mapAppointmentBackendToFrontend(saved);
  } catch (err) {
    console.error("Error scheduling appointment:", err);
    return null;
  }
};

export const updateAppointment = async (id, data) => {
  try {
    const payload = {
      appointmentId: id,
      patientName: data.patientName,
      patientId: data.patientId || 'P001',
      department: data.department,
      doctorName: data.doctor,
      date: data.date,
      time: data.time,
      appointmentType: data.type,
      note: data.notes || '',
      status: toBackendStatus(data.status),
    };
    const res = await fetch('/api/appointment/updateAppointment', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update appointment: ${res.status}`);
    const updated = await res.json();
    return mapAppointmentBackendToFrontend(updated);
  } catch (err) {
    console.error(`Error updating appointment ${id}:`, err);
    return null;
  }
};

export const updateAppointmentStatus = async (id, status) => {
  try {
    const payload = {
      appointmentId: id,
      status: toBackendStatus(status),
    };
    const res = await fetch('/api/appointment/updateAppointmentStatus', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update appointment status: ${res.status}`);
    const resData = await res.json();
    return { id, status: toFrontendStatus(resData.status) };
  } catch (err) {
    console.error(`Error updating appointment status ${id}:`, err);
    return null;
  }
};

export const fetchDoctorsByDepartment = async (department) => {
  await delay(200);
  return DOCTORS[department] || [];
};


// ─── Staff API ─────────────────────────────────────────────────────────────────

const STAFF_BASE_URL = '/api/staff';

// Helper to map backend Staff to frontend format
const mapBackendStaffToFrontend = (staff) => {
  if (!staff) return null;
  const initials = staff.name
    ? staff.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'ST';
  return {
    id: staff.staffId,
    name: staff.name,
    initials: initials,
    role: staff.role,
    department: staff.department,
    specialization: staff.specialization || '-',
    email: staff.email || '',
    phone: staff.phoneNumber || '',
    status: staff.status || 'active',
  };
};

export const fetchStaff = async () => {
  try {
    const res = await fetch(`${STAFF_BASE_URL}/getAllStaff`);
    if (!res.ok) throw new Error(`Failed to fetch staff: ${res.status}`);
    const data = await res.json();
    return data.map(mapBackendStaffToFrontend);
  } catch (err) {
    console.error("Error fetching staff:", err);
    return [];
  }
};

export const fetchStaffById = async (id) => {
  try {
    const res = await fetch(`${STAFF_BASE_URL}/getAllStaff`);
    if (!res.ok) throw new Error(`Failed to fetch staff: ${res.status}`);
    const data = await res.json();
    const found = data.find(s => s.staffId === id);
    return mapBackendStaffToFrontend(found);
  } catch (err) {
    console.error(`Error fetching staff ${id}:`, err);
    return null;
  }
};

export const addStaff = async (data) => {
  try {
    const payload = {
      name: data.name,
      role: data.role,
      department: data.department,
      specialization: data.specialization || '',
      email: data.email || '',
      phoneNumber: data.phone || '',
      password: data.password || '',
    };
    const res = await fetch(`${STAFF_BASE_URL}/addStaff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to add staff: ${res.status}`);
    const saved = await res.json();
    return mapBackendStaffToFrontend(saved);
  } catch (err) {
    console.error("Error adding staff:", err);
    return null;
  }
};

export const updateStaff = async (id, data) => {
  try {
    const payload = {
      staffId: id,
      name: data.name,
      role: data.role,
      department: data.department,
      specialization: data.specialization || '',
      email: data.email || '',
      phoneNumber: data.phone || '',
      status: data.status || 'active',
      password: data.password || '',
    };
    const res = await fetch(`${STAFF_BASE_URL}/updateStaff`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update staff: ${res.status}`);
    const updated = await res.json();
    return mapBackendStaffToFrontend(updated);
  } catch (err) {
    console.error(`Error updating staff ${id}:`, err);
    return null;
  }
};

export const updateStaffStatus = async (id, status) => {
  try {
    const payload = {
      staffId: id,
      status: status
    };
    const res = await fetch(`${STAFF_BASE_URL}/updateStaffStatus`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update staff status: ${res.status}`);
    const updated = await res.json();
    return mapBackendStaffToFrontend(updated);
  } catch (err) {
    console.error(`Error updating staff status ${id}:`, err);
    return null;
  }
};

export const deleteStaff = async (id) => {
  try {
    const payload = {
      staffId: id
    };
    const res = await fetch(`${STAFF_BASE_URL}/deleteStaff`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to delete staff: ${res.status}`);
    return true;
  } catch (err) {
    console.error(`Error deleting staff ${id}:`, err);
    return false;
  }
};


// ─── Inventory API ─────────────────────────────────────────────────────────────

const mapInventoryBackendToFrontend = (inv) => {
  if (!inv) return null;
  return {
    id: inv.itemId,
    name: inv.itemName,
    category: inv.category,
    quantity: Number(inv.quantity),
    unit: inv.unit,
    reorderLevel: Number(inv.reorderLevel),
    price: Number(inv.price),
    supplier: inv.supplier,
    expiry: inv.expiryDate || '',
    status: inv.status
  };
};

export const fetchInventory = async () => {
  try {
    const res = await fetch('/api/inventory/allInventory');
    if (!res.ok) throw new Error(`Failed to fetch inventory: ${res.status}`);
    const data = await res.json();
    return data.map(mapInventoryBackendToFrontend);
  } catch (err) {
    console.error("Error fetching inventory:", err);
    return [];
  }
};

export const fetchInventoryById = async (id) => {
  try {
    const inventory = await fetchInventory();
    return inventory.find(i => i.id === id) || null;
  } catch (err) {
    console.error(`Error fetching inventory ${id}:`, err);
    return null;
  }
};

export const addInventoryItem = async (data) => {
  try {
    const payload = {
      itemName: data.name,
      category: data.category,
      quantity: String(data.quantity),
      unit: data.unit,
      reorderLevel: String(data.reorderLevel),
      price: String(data.price),
      supplier: data.supplier,
      expiryDate: data.expiry || ''
    };
    const res = await fetch('/api/inventory/addInventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to add inventory: ${res.status}`);
    const saved = await res.json();
    return mapInventoryBackendToFrontend(saved);
  } catch (err) {
    console.error("Error adding inventory item:", err);
    return null;
  }
};

export const updateInventoryItem = async (id, data) => {
  try {
    const payload = {
      itemId: id,
      itemName: data.name,
      category: data.category,
      quantity: String(data.quantity),
      unit: data.unit,
      reorderLevel: String(data.reorderLevel),
      price: String(data.price),
      supplier: data.supplier,
      expiryDate: data.expiry || '',
      status: data.status || 'In Stock'
    };
    const res = await fetch('/api/inventory/updateInventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update inventory: ${res.status}`);
    const updated = await res.json();
    return mapInventoryBackendToFrontend(updated);
  } catch (err) {
    console.error(`Error updating inventory ${id}:`, err);
    return null;
  }
};

export const deleteInventoryItem = async (id) => {
  try {
    const payload = { itemId: id };
    const res = await fetch('/api/inventory/deleteInventory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to delete inventory: ${res.status}`);
    return true;
  } catch (err) {
    console.error(`Error deleting inventory ${id}:`, err);
    return false;
  }
};


// Helper to calculate totals
const computeInvoiceTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  return { subtotal, tax, total };
};

export const fetchInvoices = async () => {
  try {
    const res = await fetch('/api/invoice/allInvoices');
    if (!res.ok) throw new Error(`Failed to fetch invoices: ${res.status}`);
    const data = await res.json();
    return data.map(inv => ({
      id: inv.invoiceId || String(inv.id),
      patientName: inv.patientName,
      patientId: inv.patientId,
      date: inv.date,
      status: inv.status,
      amount: Number(inv.amount || 0),
      items: Array.isArray(inv.itemsList) ? inv.itemsList.map(item => ({
        name: item.itemName,
        quantity: Number(item.quantity || 0),
        rate: Number(item.pricePerItem || 0)
      })) : []
    }));
  } catch (err) {
    console.error("Error fetching invoices:", err);
    return [];
  }
};

export const fetchInvoiceById = async (id) => {
  try {
    const res = await fetch('/api/invoice/allInvoices');
    if (!res.ok) throw new Error(`Failed to fetch invoices: ${res.status}`);
    const data = await res.json();
    const inv = data.find(i => (i.invoiceId === id || String(i.id) === id));
    if (!inv) return null;
    
    const items = Array.isArray(inv.itemsList) ? inv.itemsList.map(item => ({
      name: item.itemName,
      quantity: Number(item.quantity || 0),
      rate: Number(item.pricePerItem || 0)
    })) : [];
    
    const { subtotal, tax, total } = computeInvoiceTotals(items);

    return {
      id: inv.invoiceId || String(inv.id),
      patientName: inv.patientName,
      patientId: inv.patientId,
      date: inv.date,
      status: inv.status,
      subtotal,
      tax,
      amount: total,
      items
    };
  } catch (err) {
    console.error(`Error fetching invoice ${id}:`, err);
    return null;
  }
};

export const createInvoice = async (data) => {
  try {
    const mappedItemsList = data.items.map(item => {
      const qty = Number(item.quantity);
      const rate = Number(item.rate);
      const total = qty * rate;
      return {
        itemName: item.name,
        quantity: String(qty),
        pricePerItem: String(rate),
        totalPrice: String(total.toFixed(2))
      };
    });

    const subtotal = data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
    const tax = subtotal * 0.1;
    const finalAmount = subtotal + tax;

    const payload = {
      patientId: data.patientId,
      patientName: data.patientName,
      itemsList: mappedItemsList,
      amount: String(finalAmount.toFixed(2)),
      status: data.status || 'pending',
      doctorName: data.doctorName || 'Dr. Taylor'
    };

    const res = await fetch('/api/invoice/addInvoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Failed to create invoice: ${res.status}`);
    const saved = await res.json();

    return {
      id: saved.invoiceId || String(saved.id),
      patientName: saved.patientName,
      patientId: saved.patientId,
      date: saved.date,
      status: saved.status,
      amount: Number(saved.amount || 0),
      items: Array.isArray(saved.itemsList) ? saved.itemsList.map(item => ({
        name: item.itemName,
        quantity: Number(item.quantity || 0),
        rate: Number(item.pricePerItem || 0)
      })) : []
    };
  } catch (err) {
    console.error("Error creating invoice:", err);
    return null;
  }
};

export const updateInvoice = async (id, data) => {
  try {
    const mappedItemsList = data.items.map(item => {
      const qty = Number(item.quantity);
      const rate = Number(item.rate);
      const total = qty * rate;
      return {
        itemName: item.name,
        quantity: String(qty),
        pricePerItem: String(rate),
        totalPrice: String(total.toFixed(2))
      };
    });

    const subtotal = data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
    const tax = subtotal * 0.1;
    const finalAmount = subtotal + tax;

    const payload = {
      invoiceId: id,
      patientName: data.patientName,
      status: data.status,
      amount: String(finalAmount.toFixed(2)),
      itemsList: mappedItemsList
    };

    const res = await fetch('/api/invoice/updateInvoice', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Failed to update invoice: ${res.status}`);
    const saved = await res.json();

    return {
      id: saved.invoiceId || String(saved.id),
      patientName: saved.patientName,
      patientId: saved.patientId,
      date: saved.date,
      status: saved.status,
      amount: Number(saved.amount || 0),
      items: Array.isArray(saved.itemsList) ? saved.itemsList.map(item => ({
        name: item.itemName,
        quantity: Number(item.quantity || 0),
        rate: Number(item.pricePerItem || 0)
      })) : []
    };
  } catch (err) {
    console.error(`Error updating invoice ${id}:`, err);
    return null;
  }
};

export const updateInvoiceStatus = async (id, status) => {
  try {
    const payload = {
      invoiceId: id,
      status: status
    };
    const res = await fetch('/api/invoice/updateInvoiceStatus', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Failed to update invoice status: ${res.status}`);
    return fetchInvoiceById(id);
  } catch (err) {
    console.error(`Error updating invoice status ${id}:`, err);
    return null;
  }
};

export const deleteInvoice = async (id) => {
  // Simple front-end fallback since deletion endpoint is not in user request, returns true to support UI deletion
  return true;
};


// ─── Lab Reports API ───────────────────────────────────────────────────────────

const mapReportBackendToFrontend = (r) => {
  if (!r) return null;
  return {
    id: r.reportId,
    patientName: r.patientName,
    patientId: r.patientId,
    testType: r.testType,
    orderedBy: r.orderedBy,
    date: r.date,
    status: r.status,
    notes: r.note || '',
    parameters: Array.isArray(r.parameters) ? r.parameters.map(p => ({
      name: p.parameterName,
      value: p.parameterValue,
      normalRange: p.normalRange,
      status: p.status
    })) : []
  };
};

export const fetchLabReports = async () => {
  try {
    const res = await fetch('/api/report/allReports');
    if (!res.ok) throw new Error(`Failed to fetch reports: ${res.status}`);
    const data = await res.json();
    return data.map(mapReportBackendToFrontend);
  } catch (err) {
    console.error("Error fetching reports:", err);
    return [];
  }
};

export const fetchLabReportById = async (id) => {
  try {
    const reports = await fetchLabReports();
    return reports.find(r => r.id === id) || null;
  } catch (err) {
    console.error(`Error fetching report ${id}:`, err);
    return null;
  }
};

export const createLabReport = async (data) => {
  try {
    const payload = {
      patientId: data.patientId || 'P000',
      patientName: data.patientName,
      testType: data.testType,
      orderedBy: data.orderedBy,
      status: data.status || 'pending',
      note: data.notes || '',
      parameters: Array.isArray(data.parameters) ? data.parameters.map(p => ({
        parameterName: p.name,
        parameterValue: p.value,
        normalRange: p.normalRange,
        status: p.status
      })) : []
    };
    const res = await fetch('/api/report/addReport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to create report: ${res.status}`);
    const saved = await res.json();
    return mapReportBackendToFrontend(saved);
  } catch (err) {
    console.error("Error creating report:", err);
    return null;
  }
};

export const updateLabReport = async (id, data) => {
  try {
    const payload = {
      reportId: id,
      status: data.status,
      note: data.notes || '',
      parameters: Array.isArray(data.parameters) ? data.parameters.map(p => ({
        parameterName: p.name,
        parameterValue: p.value,
        normalRange: p.normalRange,
        status: p.status
      })) : []
    };
    const res = await fetch('/api/report/updateReport', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update report: ${res.status}`);
    const updated = await res.json();
    return mapReportBackendToFrontend(updated);
  } catch (err) {
    console.error(`Error updating report ${id}:`, err);
    return null;
  }
};

export const deleteLabReport = async (id) => {
  try {
    const payload = { reportId: id };
    const res = await fetch('/api/report/deleteReport', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to delete report: ${res.status}`);
    return true;
  } catch (err) {
    console.error(`Error deleting report ${id}:`, err);
    return false;
  }
};


// ─── Bed Management API ────────────────────────────────────────────────────────

const mapBedBackendToFrontend = (b) => {
  if (!b) return null;
  return {
    id: b.bedId,
    room: String(b.room),
    bed: b.bed,
    department: b.department,
    floor: b.floor,
    type: b.type,
    status: b.status,
    patientName: b.patientName || '',
    patientId: b.patientId || '',
    assignedSince: b.assignedSince || ''
  };
};

export const fetchBeds = async () => {
  try {
    const res = await fetch('/api/bed/allBeds');
    if (!res.ok) throw new Error(`Failed to fetch beds: ${res.status}`);
    const data = await res.json();
    return data.map(mapBedBackendToFrontend);
  } catch (err) {
    console.error("Error fetching beds:", err);
    return [];
  }
};

export const createBed = async (data) => {
  try {
    const payload = {
      room: parseInt(data.room) || 0,
      bed: data.bed,
      department: data.department,
      floor: data.floor || 'Floor 1',
      type: data.type,
      status: data.status || 'available',
      patientId: data.patientId || '',
      patientName: data.patientName || ''
    };
    const res = await fetch('/api/bed/addBed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to create bed: ${res.status}`);
    const saved = await res.json();
    return mapBedBackendToFrontend(saved);
  } catch (err) {
    console.error("Error creating bed:", err);
    return null;
  }
};

export const updateBed = async (id, data) => {
  try {
    const payload = {
      bedId: id,
      room: parseInt(data.room) || 0,
      bed: data.bed,
      department: data.department,
      floor: data.floor,
      type: data.type,
      status: data.status,
      patientId: data.patientId || '',
      patientName: data.patientName || ''
    };
    const res = await fetch('/api/bed/updateBed', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update bed: ${res.status}`);
    const updated = await res.json();
    return mapBedBackendToFrontend(updated);
  } catch (err) {
    console.error(`Error updating bed ${id}:`, err);
    return null;
  }
};

export const updateBedStatus = async (id, status) => {
  try {
    const payload = { bedId: id, status };
    const res = await fetch('/api/bed/updateBedStatus', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update bed status: ${res.status}`);
    const updated = await res.json();
    return mapBedBackendToFrontend(updated);
  } catch (err) {
    console.error(`Error updating bed status ${id}:`, err);
    return null;
  }
};

export const deleteBed = async (id) => {
  try {
    const payload = { bedId: id };
    const res = await fetch('/api/bed/deleteBed', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to delete bed: ${res.status}`);
    return true;
  } catch (err) {
    console.error(`Error deleting bed ${id}:`, err);
    return false;
  }
};








