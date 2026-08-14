import { getShiftDetails, assignEmployeesToShift } from '../../../services/shiftDetailServices';

export const DEPARTMENT_EMPLOYEE_LIST = [
  { id: 'cardiology', name: 'Cardiology', count: 42 },
  { id: 'neurology', name: 'Neurology', count: 28 },
  { id: 'emergency', name: 'Emergency', count: 65 },
  { id: 'orthopedics', name: 'Orthopedics', count: 31 },
  { id: 'pediatrics', name: 'Pediatrics', count: 24 },
  { id: 'radiology', name: 'Radiology', count: 18 }
];

export { getShiftDetails, assignEmployeesToShift };

/**
 * Fetch all shift records directly from backend API
 */
export const getShifts = async (params = {}) => {
  const res = await getShiftDetails(params);
  return res?.items || (Array.isArray(res) ? res : []);
};

export const fetchShiftsApi = getShifts;

/**
 * Assign a shift to selected individual employee uids
 * API: POST /shifts/{shiftId}/employees
 * Payload: { "uids": ["PMCH0101", "PMCH0104"] }
 */
export const assignShift = async ({ shiftId, uids = [], selectedEmployees = [] } = {}) => {
  const empUids =
    Array.isArray(uids) && uids.length > 0
      ? uids
      : Array.isArray(selectedEmployees)
      ? selectedEmployees.map((e) => e.empId || e.uid || e.id).filter(Boolean)
      : [];

  return assignEmployeesToShift(shiftId, empUids);
};

/**
 * Helper for employee update
 */
export const updateEmployee = (id, fieldsToUpdate) => {
  return fieldsToUpdate;
};
