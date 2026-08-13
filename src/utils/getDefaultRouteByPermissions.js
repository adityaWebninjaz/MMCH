// src/utils/getDefaultRouteByPermissions.js
import { getStoredPermissions } from './permissionsStorage';

export const getDefaultRouteByPermissions = () => {
  try {
    const permissions = getStoredPermissions();

    console.log("per", permissions)
    if (!Array.isArray(permissions) || permissions.length === 0) return null;

    // 🔥 Route priority order (THIS decides default route)
    const routeMap = {
      dashboard: '/superadmindashboard/default',
      dashboard_b: '/superadmindashboard/default',
      building_floor_management: '/superadmindashboard/buildingmanagement',
      booking_request: '/superadmindashboard/booking_request',
      gate_pass: '/superadmindashboard/gatePass',
      room_allotment: '/superadmindashboard/roomallotment',
      room_allocation: '/superadmindashboard/roomallocation',
      student_management: '/superadmindashboard/studentmanagement',
      fee_management: '/superadmindashboard/fees_management',
      fees_management: '/superadmindashboard/fees_management',
      student_fee_management: '/superadmindashboard/fees_management',
      student_attandance: '/superadmindashboard/studentattendance',
      complaint_management: '/superadmindashboard/complaintmanagement',
      complaint_report: '/superadmindashboard/complaintmanagement',
      hospital_complaint: '/superadmindashboard/hospital_complaint',
      hospital_complaint_raise: '/superadmindashboard/hospital_complaint_raise',
      admin_management: '/superadmindashboard/default',
      auditlog: '/superadmindashboard/default',
      audit_log: '/superadmindashboard/default',
      admission_management: '/superadmindashboard/admission_management',
      admission_enquiry_management: '/superadmindashboard/enqury_management',
      enquiry_management: '/superadmindashboard/enqury_management',
      enqury_management: '/superadmindashboard/enqury_management',
      fees_approval: '/superadmindashboard/fees_approval',
      fees_repots: '/superadmindashboard/fees_repots',
      fees_upload: '/superadmindashboard/fees_upload'
    };

    // 🔒 Normalize permissions into a lookup map
    const permissionMap = {};
    permissions.forEach((p) => {
      if (!p || !p.module) return;
      const key = String(p.module)
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_');
      permissionMap[key] = p;
    });

    // ✅ Pick FIRST allowed module based on routeMap order
    for (const moduleKey of Object.keys(routeMap)) {
      const perm = permissionMap[moduleKey];
      if (perm?.actions?.view === true) {
        return routeMap[moduleKey];
      }
    }

    return null;
  } catch (error) {
    console.error('Error determining default route by permissions:', error);
    return null;
  }
};
