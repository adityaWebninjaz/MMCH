// Centralized Data & API Service Layer for Shift Management

const INITIAL_SHIFTS = [
  {
    id: 'morning_general',
    name: 'Morning General',
    description: 'Full system access with all permissions',
    timeRange: '06:00 AM - 02:00 PM',
    assignedCount: 24,
    workingDays: 'Mon, Tue, Wed'
  },
  {
    id: 'night_icu',
    name: 'Night ICU',
    description: 'Full system access with all permissions',
    timeRange: '06:00 AM - 02:00 PM',
    assignedCount: 24,
    workingDays: 'Mon, Tue, Wed'
  },
  {
    id: 'morning_shift',
    name: 'Morning Shift',
    description: 'Full system access with all permissions',
    timeRange: '06:00 AM - 02:00 PM',
    assignedCount: 24,
    workingDays: 'Mon, Tue, Wed'
  },
  {
    id: 'evening_shift',
    name: 'Evening Shift',
    description: 'Outpatient consultation evening rotation',
    timeRange: '02:00 PM - 10:00 PM',
    assignedCount: 18,
    workingDays: 'Mon, Tue, Wed, Thu, Fri'
  },
  {
    id: 'night_shift',
    name: 'Night Shift',
    description: 'Dedicated shift layout for overnight trauma response.',
    timeRange: '10:00 PM - 06:00 AM',
    assignedCount: 15,
    workingDays: 'Mon, Tue, Wed, Thu, Fri'
  },
  {
    id: 'general_shift',
    name: 'General Shift',
    description: 'Full system access with all permissions',
    timeRange: '09:00 AM - 05:00 PM',
    assignedCount: 24,
    workingDays: 'Mon, Tue, Wed'
  },
  {
    id: 'new_sn_duty',
    name: 'New S/N Duty',
    description: 'Dedicated shift layout for staff nurses.',
    timeRange: '09:00 AM - 05:00 PM',
    assignedCount: 12,
    workingDays: 'Mon, Tue, Wed, Thu, Fri'
  },
  {
    id: 'evening_opd',
    name: 'Evening OPD',
    description: 'Outpatient consultation evening rotation',
    timeRange: '02:00 PM - 10:00 PM',
    assignedCount: 18,
    workingDays: 'Mon, Tue, Wed, Thu, Fri'
  },
  {
    id: 'night_emergency',
    name: 'Night Emergency',
    description: 'Dedicated shift layout for overnight trauma response and emergency ward triage management.',
    timeRange: '09:00 AM - 07:00 PM',
    assignedCount: 15,
    workingDays: 'Mon, Tue, Wed, Thu, Fri'
  }
];

export const DEPARTMENT_EMPLOYEE_LIST = [
  { id: 'cardiology', name: 'Cardiology', count: 42 },
  { id: 'neurology', name: 'Neurology', count: 28 },
  { id: 'emergency', name: 'Emergency', count: 65 },
  { id: 'orthopedics', name: 'Orthopedics', count: 31 },
  { id: 'pediatrics', name: 'Pediatrics', count: 24 },
  { id: 'radiology', name: 'Radiology', count: 18 }
];

const STORAGE_KEY = 'hms_shift_details_list';

/**
 * Fetch all shift records (LocalStorage fallback / API endpoint)
 */
export const getShifts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading shift details from localStorage:', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SHIFTS));
  return INITIAL_SHIFTS;
};

const MODAL_SHIFT_MAP = {
  morning_shift: { name: 'Morning Shift', timeRange: '06:00 AM - 02:00 PM' },
  evening_shift: { name: 'Evening Shift', timeRange: '02:00 PM - 10:00 PM' },
  night_shift: { name: 'Night Shift', timeRange: '10:00 PM - 06:00 AM' },
  general_shift: { name: 'General Shift', timeRange: '09:00 AM - 05:00 PM' },
  new_sn_duty: { name: 'New S/N Duty', timeRange: '09:00 AM - 05:00 PM' }
};

/**
 * Assign a shift to selected departments or individual employees
 */
export const assignShift = ({ shiftId, assignMode, selectedDepartmentIds = [], selectedIds = [] }) => {
  const currentShifts = getShifts();

  // Calculate newly assigned employee count
  let addedCount = 0;
  if (assignMode === 'assign_department') {
    addedCount = selectedDepartmentIds.reduce((sum, deptId) => {
      const dept = DEPARTMENT_EMPLOYEE_LIST.find((d) => d.id === deptId);
      return sum + (dept ? dept.count : 0);
    }, 0);
  } else {
    addedCount = selectedIds.length;
  }

  // Update shift in dataset cleanly matching shift ID or name
  let shiftFound = false;
  const targetClean = (shiftId || '').toLowerCase().replace('_shift', '').replace('_', '');
  const updatedShifts = currentShifts.map((s) => {
    const sIdClean = (s.id || '').toLowerCase().replace('_shift', '').replace('_', '');
    const sNameClean = (s.name || '').toLowerCase();

    if (
      s.id === shiftId ||
      sIdClean === targetClean ||
      (targetClean && sNameClean.includes(targetClean)) ||
      sNameClean === (shiftId || '').toLowerCase()
    ) {
      shiftFound = true;
      return { ...s, assignedCount: (s.assignedCount || 0) + addedCount };
    }
    return s;
  });

  // If the shift was deleted previously, restore/add it to the list with assignedCount
  if (!shiftFound && shiftId) {
    const meta = MODAL_SHIFT_MAP[shiftId] || { name: 'Morning Shift', timeRange: '06:00 AM - 02:00 PM' };
    updatedShifts.unshift({
      id: shiftId,
      name: meta.name,
      description: 'Full system access with all permissions',
      timeRange: meta.timeRange,
      assignedCount: addedCount,
      workingDays: 'Mon, Tue, Wed, Thu, Fri'
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedShifts));
  return updatedShifts;
};

/**
 * Create or update a shift definition
 */
export const saveShiftDefinition = (shiftObj) => {
  const currentShifts = getShifts();
  let updatedShifts;

  if (shiftObj.id && currentShifts.some((s) => s.id === shiftObj.id)) {
    updatedShifts = currentShifts.map((s) => (s.id === shiftObj.id ? { ...s, ...shiftObj } : s));
  } else {
    const newShift = {
      ...shiftObj,
      id: shiftObj.id || `shift_${Date.now()}`,
      assignedCount: shiftObj.assignedCount || 0
    };
    updatedShifts = [newShift, ...currentShifts];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedShifts));
  return updatedShifts;
};

/**
 * Delete a shift definition
 */
export const deleteShiftDefinition = (id) => {
  const currentShifts = getShifts();
  const updatedShifts = currentShifts.filter((s) => String(s.id) !== String(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedShifts));
  return updatedShifts;
};

// ================= EMPLOYEE MASTER DATA SERVICE =================

const INITIAL_EMPLOYEES = [
  { id: 'EMP235469-1', empId: 'EMP235469', name: 'Dr. Ravi Mehta', department: 'Cardiology', designation: 'HOD Cardiology', hod: 'Dr. Sharma', mobile: '+91 7879536495', shift: 'Morning Shift (09:00 AM - 05:00 PM)', device: 'Device 1', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100' },
  { id: 'EMP235469-2', empId: 'EMP235469', name: 'Dr. Ravi Mehta', department: 'Cardiology', designation: 'HOD Cardiology', hod: 'Dr. Sharma', mobile: '+91 7879536495', shift: 'Morning Shift (09:00 AM - 05:00 PM)', device: 'Device 1', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100' },
  { id: 'EMP235469-3', empId: 'EMP235469', name: 'Dr. Ravi Mehta', department: 'Cardiology', designation: 'HOD Cardiology', hod: 'Dr. Sharma', mobile: '+91 7879536495', shift: 'Morning Shift (09:00 AM - 05:00 PM)', device: 'Device 1', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100' },
  { id: 'EMP235469-4', empId: 'EMP235469', name: 'Dr. Ravi Mehta', department: 'Cardiology', designation: 'HOD Cardiology', hod: 'Dr. Sharma', mobile: '+91 7879536495', shift: 'Morning Shift (09:00 AM - 05:00 PM)', device: 'Device 1', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100' },
  { id: 'EMP235469-5', empId: 'EMP235469', name: 'Dr. Ravi Mehta', department: 'Cardiology', designation: 'HOD Cardiology', hod: 'Dr. Sharma', mobile: '+91 7879536495', shift: 'Morning Shift (09:00 AM - 05:00 PM)', device: 'Device 1', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100' },
  { id: 'EMP235469-6', empId: 'EMP235469', name: 'Dr. Ravi Mehta', department: 'Cardiology', designation: 'HOD Cardiology', hod: 'Dr. Sharma', mobile: '+91 7879536495', shift: 'Morning Shift (09:00 AM - 05:00 PM)', device: 'Device 1', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100' },
  { id: 'EMP235469-7', empId: 'EMP235469', name: 'Dr. Ravi Mehta', department: 'Cardiology', designation: 'HOD Cardiology', hod: 'Dr. Sharma', mobile: '+91 7879536495', shift: 'Morning Shift (09:00 AM - 05:00 PM)', device: 'Device 1', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100' },
  { id: 'EMP235469-8', empId: 'EMP235469', name: 'Dr. Ravi Mehta', department: 'Cardiology', designation: 'HOD Cardiology', hod: 'Dr. Sharma', mobile: '+91 7879536495', shift: 'Morning Shift (09:00 AM - 05:00 PM)', device: 'Device 1', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100' }
];

const EMP_STORAGE_KEY = 'hms_employee_master_list';

export const getEmployees = () => {
  try {
    const saved = localStorage.getItem(EMP_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading employee master list:', e);
  }
  localStorage.setItem(EMP_STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
  return INITIAL_EMPLOYEES;
};

export const updateEmployee = (id, fieldsToUpdate) => {
  const current = getEmployees();
  const updated = current.map((emp) => (emp.id === id ? { ...emp, ...fieldsToUpdate } : emp));
  localStorage.setItem(EMP_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
