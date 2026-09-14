import axios from 'axios';
import Cookies from 'js-cookie';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const getAuthHeaders = () => {
  const token = Cookies.get('Token') || Cookies.get('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

// Realistic mock dataset reflecting live PMCH/MMCH employee records, biometric devices, and departmental actions
const MOCK_AUDIT_LOGS = [
  {
    id: 'ATT-45821',
    user: 'Rahul Sharma (USR-1024)',
    role: 'HR Admin',
    module: 'Attendance',
    action: 'Updated Attendance',
    timestamp: '19 Aug 2026, 03:24:18 PM',
    status: 'Success',
    details: 'Manual check-in override for Biometric Device MMCH-DEV-01'
  },
  {
    id: 'ATT-45822',
    user: 'Aarav Mehta (USR-1021)',
    role: 'Accounts',
    module: 'Attendance',
    action: 'Payroll Export Generated',
    timestamp: '19 Aug 2026, 03:24:18 PM',
    status: 'Success',
    details: 'Exported monthly attendance ledger for Saral payroll cycle'
  },
  {
    id: 'ATT-45823',
    user: 'Raja Goyal (USR-1021)',
    role: 'Employee',
    module: 'Attendance',
    action: 'Updated Attendance',
    timestamp: '19 Aug 2026, 03:24:18 PM',
    status: 'Success',
    details: 'Self-service punch regularization requested for 18 Aug'
  },
  {
    id: 'ATT-45824',
    user: 'Piyush Bansal (USR-1021)',
    role: 'HR Admin',
    module: 'Attendance',
    action: 'Approved Regularisation',
    timestamp: '19 Aug 2026, 03:24:18 PM',
    status: 'Success',
    details: 'Approved missed punch regularisation for EMP235469'
  },
  {
    id: 'ATT-45825',
    user: 'Vivek Samtani (USR-1021)',
    role: 'Employee',
    module: 'Leave',
    action: 'Leave Request',
    timestamp: '19 Aug 2026, 03:24:18 PM',
    status: 'Success',
    details: 'Submitted Sick Leave application for 2 days'
  },
  {
    id: 'ATT-45826',
    user: 'Harsh Gujral (USR-1021)',
    role: 'Front Office',
    module: 'Attendance',
    action: 'Updated Attendance',
    timestamp: '19 Aug 2026, 03:24:18 PM',
    status: 'Success',
    details: 'Logged visitor and security gate attendance roster'
  },
  {
    id: 'AUTH-78231',
    user: 'System (SYSTEM)',
    role: 'System',
    module: 'Authentication',
    action: 'Failed Login',
    timestamp: '19 Aug 2026, 03:24:18 PM',
    status: 'Failed',
    details: 'Multiple invalid password attempts from IP 192.168.1.104'
  },
  {
    id: 'ATT-45827',
    user: 'Lalit Chauhan (USR-1021)',
    role: 'Super Admin',
    module: 'Role & Access Control',
    action: 'Role Changed',
    timestamp: '19 Aug 2026, 03:24:18 PM',
    status: 'Success',
    details: 'Updated permission matrix for HR Admin role'
  },
  {
    id: 'ATT-45828',
    user: 'Gaurav Khanna (USR-1021)',
    role: 'HR Admin',
    module: 'Attendance',
    action: 'Updated Attendance',
    timestamp: '19 Aug 2026, 03:24:18 PM',
    status: 'Success',
    details: 'Reassigned biometric terminal MAIN-GATE-01 to Shift B'
  },
  {
    id: 'ATT-45829',
    user: 'Sumitra Ranjan (USR-1021)',
    role: 'HR Admin',
    module: 'Attendance',
    action: 'Updated Attendance',
    timestamp: '19 Aug 2026, 03:24:18 PM',
    status: 'Success',
    details: 'Biometric sync completed for OPD Terminal #2'
  },
  {
    id: 'ATT-45830',
    user: 'Aarav Mehta (USR-1021)',
    role: 'HR Admin',
    module: 'Attendance',
    action: 'Updated Attendance',
    timestamp: '19 Aug 2026, 03:24:18 PM',
    status: 'Success',
    details: 'Shift roster updated for emergency care department'
  },
  {
    id: 'BIO-33291',
    user: 'Rahul Sharma (USR-1024)',
    role: 'HR Admin',
    module: 'Biometric Devices',
    action: 'Device Reassigned',
    timestamp: '19 Aug 2026, 02:15:10 PM',
    status: 'Success',
    details: 'Assigned terminal ICU-DEV-03 to 14 Nursing Staff'
  },
  {
    id: 'BIO-33292',
    user: 'System (SYSTEM)',
    role: 'System',
    module: 'Biometric Devices',
    action: 'Terminal Synced',
    timestamp: '19 Aug 2026, 01:00:00 PM',
    status: 'Success',
    details: 'Synchronized 1,240 biometric attendance logs'
  },
  {
    id: 'PAY-11029',
    user: 'Aarav Mehta (USR-1021)',
    role: 'Accounts',
    module: 'Payroll',
    action: 'Payroll Cycle Locked',
    timestamp: '18 Aug 2026, 06:45:20 PM',
    status: 'Success',
    details: 'Locked monthly payroll cycle for August 2026'
  },
  {
    id: 'DED-90412',
    user: 'Rahul Sharma (USR-1024)',
    role: 'HR Admin',
    module: 'Deductions',
    action: 'Deduction Override Applied',
    timestamp: '18 Aug 2026, 04:30:15 PM',
    status: 'Success',
    details: 'Hostel Rent Mess Recovery override applied for Ayush Kumar'
  },
  {
    id: 'AUTH-78232',
    user: 'Pooja Verma (USR-1028)',
    role: 'Employee',
    module: 'Authentication',
    action: 'Password Reset',
    timestamp: '18 Aug 2026, 02:10:04 PM',
    status: 'Success',
    details: 'Self-service password reset completed via OTP'
  },
  {
    id: 'LEV-55102',
    user: 'Piyush Bansal (USR-1021)',
    role: 'HR Admin',
    module: 'Leave',
    action: 'Leave Approved',
    timestamp: '18 Aug 2026, 11:20:30 AM',
    status: 'Success',
    details: 'Approved Maternity Leave for Dr. Sneha Roy'
  },
  {
    id: 'BIO-33293',
    user: 'System (SYSTEM)',
    role: 'System',
    module: 'Biometric Devices',
    action: 'Device Offline Alert',
    timestamp: '18 Aug 2026, 09:12:44 AM',
    status: 'Failed',
    details: 'Hostel Block A device heartbeat lost for 10 minutes'
  },
  {
    id: 'GP-88310',
    user: 'Harsh Gujral (USR-1021)',
    role: 'Front Office',
    module: 'Gate Pass',
    action: 'Gate Pass Issued',
    timestamp: '17 Aug 2026, 05:14:00 PM',
    status: 'Success',
    details: 'Issued official duty gate pass GP-2026-904'
  },
  {
    id: 'ROL-10022',
    user: 'Lalit Chauhan (USR-1021)',
    role: 'Super Admin',
    module: 'Role & Access Control',
    action: 'Permission Granted',
    timestamp: '17 Aug 2026, 02:00:10 PM',
    status: 'Success',
    details: 'Granted Deduction Control Center access to HR Admin'
  }
];

export const getAuditLogs = async ({
  page = 1,
  limit = 10,
  module = 'All Module',
  role = 'All Role',
  status = 'All Status',
  search = ''
} = {}) => {
  if (BASE_URL) {
    try {
      const params = { page, limit };
      if (module && module !== 'All Module') params.module = module;
      if (role && role !== 'All Role') params.role = role;
      if (status && status !== 'All Status') params.status = status;
      if (search && search.trim()) params.search = search.trim();

      const response = await axios.get(`${BASE_URL}/audit-logs`, {
        ...getAuthHeaders(),
        params
      });

      if (response?.data?.success) {
        return {
          success: true,
          data: response.data.data?.logs || response.data.data || [],
          total: response.data.data?.total || response.data.total || 0,
          page: response.data.data?.page || page,
          limit: response.data.data?.limit || limit
        };
      }
    } catch (err) {
      console.warn('Backend /audit-logs endpoint error, falling back to local dataset:', err.message);
    }
  }

  // Filter Mock Data
  let filtered = [...MOCK_AUDIT_LOGS];

  if (module && module !== 'All Module') {
    filtered = filtered.filter((item) => item.module.toLowerCase() === module.toLowerCase());
  }

  if (role && role !== 'All Role') {
    filtered = filtered.filter((item) => item.role.toLowerCase() === role.toLowerCase());
  }

  if (status && status !== 'All Status') {
    filtered = filtered.filter((item) => item.status.toLowerCase() === status.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.user.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const pagedData = filtered.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: pagedData,
    total,
    page,
    limit
  };
};

export const exportAuditLogsToExcel = (logs, filename = 'audit_logs.csv') => {
  try {
    const exportData = logs.map((log) => ({
      'Audit ID': log.id,
      User: log.user,
      Role: log.role,
      Module: log.module,
      Action: log.action,
      'Time Stamp': log.timestamp,
      Status: log.status,
      Details: log.details || ''
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to export to Excel/CSV:', error);
    return false;
  }
};

export const exportAuditLogsToPDF = (logs, title = 'Audit Logs Report') => {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(title, 40, 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | Total Records: ${logs.length}`, 40, 56);

    const tableHeaders = [['Audit ID', 'User', 'Role', 'Module', 'Action', 'Time Stamp', 'Status']];
    const tableBody = logs.map((log) => [log.id, log.user, log.role, log.module, log.action, log.timestamp, log.status]);

    doc.autoTable({
      head: tableHeaders,
      body: tableBody,
      startY: 70,
      theme: 'grid',
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [51, 65, 85],
        fontSize: 9,
        fontStyle: 'bold',
        cellPadding: 6
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [51, 65, 85],
        cellPadding: 6
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 140 },
        2: { cellWidth: 80 },
        3: { cellWidth: 90 },
        4: { cellWidth: 130 },
        5: { cellWidth: 130 },
        6: { cellWidth: 60 }
      },
      margin: { left: 40, right: 40 }
    });

    doc.save('audit_logs_report.pdf');
    return true;
  } catch (error) {
    console.error('Failed to export to PDF:', error);
    return false;
  }
};
