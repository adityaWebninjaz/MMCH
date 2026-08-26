// Service for fetching and managing Regularisations data

let MOCK_REGULARISATIONS_DATA = [
  {
    id: 1,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch In',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Approved',
    employeeReason: 'Emergency trauma case ran late. Punched in but device was offline at exit.',
    hodNote: 'Attended trauma case till 23:40, forgot to punch out.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 2,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch Out',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Pending',
    employeeReason: 'Emergency trauma case ran late. Punched in but device was offline at exit.',
    hodNote: 'Attended trauma case till 23:40, forgot to punch out.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 3,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch In',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Rejected',
    employeeReason: 'Late arrival regularization without prior shift notification.',
    hodNote: 'Shift timing discrepancy identified. Approval declined as per policy.',
    hodName: 'Dr. S. Kulkarni'
  },
  {
    id: 4,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch Both',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Pending',
    employeeReason: 'On-duty movement across satellite clinic building during emergency protocol.',
    hodNote: 'Duty log verified at Satellite OPD block A.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 5,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch In',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Approved',
    employeeReason: 'Biometric reader power maintenance during morning shift check-in.',
    hodNote: 'Maintenance log confirmed for Wing 2 Biometric terminal.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 6,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch Out',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Pending',
    employeeReason: 'Night shift extension handover due to critical ICU patient care.',
    hodNote: 'Shift extension confirmed by senior consultant on duty.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 7,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch Out',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Approved',
    employeeReason: 'Emergency ICU protocol attendance during shift handover.',
    hodNote: 'Present in emergency theater during specified hours.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 8,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch Both',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Approved',
    employeeReason: 'External ambulance escort duty for inter-hospital patient transfer.',
    hodNote: 'Ambulance travel log attached and verified.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 9,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch Both',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Approved',
    employeeReason: 'Official hospital administration meeting with CMO.',
    hodNote: 'Meeting presence recorded in administration minutes.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 10,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch In',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Pending',
    employeeReason: 'Fingerprint scanner non-responsive at Gate 3.',
    hodNote: 'Physical attendance sheet signed at security desk.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 11,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch Out',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Approved',
    employeeReason: 'Duty handover completed at 09:05 PM in triage section.',
    hodNote: 'Handover report counter-signed.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 12,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch In',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Approved',
    employeeReason: 'Emergency ward call-in for code blue resuscitation.',
    hodNote: 'Resuscitation code blue team log confirms timely arrival.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 13,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch Out',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Approved',
    employeeReason: 'Extended patient supervision in post-op recovery.',
    hodNote: 'Post-op observation logs verified.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 14,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Emergency',
    dateRequested: '14 Jul 2026',
    punchType: 'Punch In',
    punchIn: '09:05 AM',
    punchOut: '09:05 PM',
    status: 'Approved',
    employeeReason: 'Morning departmental briefing attendance.',
    hodNote: 'Briefing attendance verified.',
    hodName: 'Dr. R. Krishnan'
  },
  {
    id: 15,
    empId: 'EMP235470',
    empName: 'Dr. Ananya Roy',
    department: 'ICU',
    dateRequested: '13 Jul 2026',
    punchType: 'Punch In',
    punchIn: '08:30 AM',
    punchOut: '08:30 PM',
    status: 'Pending',
    employeeReason: 'Immediate attendance on ventilated patient at shift start.',
    hodNote: 'Verified with ICU nursing supervisor on floor.',
    hodName: 'Dr. M. Banerjee'
  },
  {
    id: 16,
    empId: 'EMP235471',
    empName: 'Dr. Suresh Kumar',
    department: 'Radiology',
    dateRequested: '13 Jul 2026',
    punchType: 'Punch Out',
    punchIn: '09:00 AM',
    punchOut: '06:00 PM',
    status: 'Approved',
    employeeReason: 'Emergency MRI reporting for accident trauma patient.',
    hodNote: 'Urgent diagnostic imaging signed at 18:00.',
    hodName: 'Dr. K. Saxena'
  },
  {
    id: 17,
    empId: 'EMP235472',
    empName: 'Rajesh Verma',
    department: 'Housekeeping',
    dateRequested: '12 Jul 2026',
    punchType: 'Punch Both',
    punchIn: '07:00 AM',
    punchOut: '03:30 PM',
    status: 'Pending',
    employeeReason: 'Deep cleaning and sterilization in Operation Theater 3.',
    hodNote: 'OT sterilization log confirmed by Sister in Charge.',
    hodName: 'Anita Das'
  },
  {
    id: 18,
    empId: 'EMP235473',
    empName: 'Dr. Neha Sharma',
    department: 'OPD',
    dateRequested: '12 Jul 2026',
    punchType: 'Punch In',
    punchIn: '09:15 AM',
    punchOut: '05:00 PM',
    status: 'Rejected',
    employeeReason: 'Device log missing without notification.',
    hodNote: 'No supporting documentation submitted.',
    hodName: 'Dr. P. Joshi'
  },
  {
    id: 19,
    empId: 'EMP235474',
    empName: 'Amit Singh',
    department: 'Admin',
    dateRequested: '11 Jul 2026',
    punchType: 'Punch Out',
    punchIn: '09:30 AM',
    punchOut: '06:30 PM',
    status: 'Approved',
    employeeReason: 'Monthly attendance reconciliation audit.',
    hodNote: 'Department audit records submitted and cleared.',
    hodName: 'Sunil Rao'
  },
  {
    id: 20,
    empId: 'EMP235475',
    empName: 'Priya Sundaram',
    department: 'Radiology',
    dateRequested: '11 Jul 2026',
    punchType: 'Punch In',
    punchIn: '08:45 AM',
    punchOut: '05:45 PM',
    status: 'Approved',
    employeeReason: 'CT machine software calibration protocol.',
    hodNote: 'Engineer service sheet verified.',
    hodName: 'Dr. K. Saxena'
  }
];

export const getRegularisations = async (filters = {}) => {
  try {
    // API endpoint slot:
    // const response = await axios.get('/api/hrms/regularisations', { params: filters });
    // return response.data;
    return {
      success: true,
      data: MOCK_REGULARISATIONS_DATA,
      totalCount: MOCK_REGULARISATIONS_DATA.length
    };
  } catch (error) {
    console.error('Error fetching Regularisations:', error);
    return {
      success: false,
      data: MOCK_REGULARISATIONS_DATA,
      totalCount: MOCK_REGULARISATIONS_DATA.length
    };
  }
};

export const approveRegularisation = async (id) => {
  try {
    MOCK_REGULARISATIONS_DATA = MOCK_REGULARISATIONS_DATA.map((item) =>
      item.id === id ? { ...item, status: 'Approved' } : item
    );
    return { success: true, message: 'Regularisation approved successfully.' };
  } catch (error) {
    console.error('Error approving Regularisation:', error);
    return { success: false, message: 'Failed to approve regularisation.' };
  }
};

export const rejectRegularisation = async (id, reason = '') => {
  try {
    MOCK_REGULARISATIONS_DATA = MOCK_REGULARISATIONS_DATA.map((item) =>
      item.id === id ? { ...item, status: 'Rejected', rejectionReason: reason } : item
    );
    return { success: true, message: 'Regularisation rejected successfully.' };
  } catch (error) {
    console.error('Error rejecting Regularisation:', error);
    return { success: false, message: 'Failed to reject regularisation.' };
  }
};

export const exportRegularisationsPDF = async (filters = {}) => {
  console.log('Exporting Regularisations as PDF with filters:', filters);
};

export const exportRegularisationsExcel = async (filters = {}) => {
  console.log('Exporting Regularisations as Excel with filters:', filters);
};
