// utils/filterMenuByPermissions.js
import { getStoredPermissions } from './permissionsStorage';

// Normalize strings to compare safely
const normalize = (s = '') =>
  String(s)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[\s/-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/__+/g, '_')
    .trim();

// ✅ Manual mapping between backend module names (cookie) and frontend sidebar titles
const moduleTitleMap = {
  dashboard: 'dashboard',
  building_floor_management: 'building & floor management',
  booking_request: 'booking request',
  gate_pass: 'gate pass management',
  room_allotment: 'room allotment',
  room_allocation: 'room allocation',
  student_management: 'student management',
  fees_management: 'Fees Management',
  student_attandance: 'hostel Attendance',
  complaint_management: 'complaint management',
  admin_management: 'admin management',
  auditlog: 'reports', // 🔥 fixed key here,
  hospital_complaint: 'hospital complaint management',
  admission_management: 'admission management',
  admission_enquiry_management: 'enquiry management',
  enqury_management: 'enquiry management',
  fees_approval: 'Fee Approval',
  fees_repots: 'Fee Report',
  fees_upload: "Fees Upload"
};

const getPermissions = () => {
  return getStoredPermissions();
};

// Build quick lookup map of module → actions
const buildPermissionMap = (arr) => {
  const map = {};
  arr.forEach((p) => {
    if (p?.module) {
      const normalizedKey = normalize(p.module);
      map[normalizedKey] = p.actions || {};

    }
  });
  return map;
};

// Main filtering function
export const filterMenuByPermissions = (children = [], { debug = false } = {}) => {
  const permissions = getPermissions();
  console.log("building permission2", permissions)
  const map = buildPermissionMap(permissions);
  console.log("building permission", map)



  // if (debug) console.log('🔍 Permission Map:', map);

  return children.filter((item) => {
    const normalizedTitle = normalize(item.title);
    const explicitKeys = Array.isArray(item.permissionKeys) ? item.permissionKeys.map(normalize) : [];
    const mappedKeys = Object.keys(moduleTitleMap).filter((key) => normalize(moduleTitleMap[key]) === normalizedTitle);
    const lookupKeys = [...new Set([...explicitKeys, ...mappedKeys, normalizedTitle])];

    const matchedKey = lookupKeys.find((key) => map[key]?.view === true);
    if (matchedKey) {
      // if (debug) console.log(`✅ Matched ${item.title} → ${matchedKey}`, map[matchedKey]);
      return true;
    }

    // if (debug) console.log(`🚫 No permission found for: ${item.title}`);
    return false;
  });
};
