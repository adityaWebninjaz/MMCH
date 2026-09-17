// Service for fetching and exporting Attendance Exception Report data

const MOCK_ATTENDANCE_EXCEPTION_DATA = [
  { id: 1, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Missing Punch', shift: 'General', punchIn: '-', punchOut: '09:12 PM', regularisation: 'Pending hod review' },
  { id: 2, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Late Arrival', shift: 'Morning', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Approved' },
  { id: 3, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Early Out', shift: 'Night', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Not Raised' },
  { id: 4, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Half Day', shift: 'General', punchIn: '-', punchOut: '09:12 PM', regularisation: 'Pending hod review' },
  { id: 5, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Missing Punch', shift: 'General', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Approved' },
  { id: 6, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Late Arrival', shift: 'Morning', punchIn: '09:12 AM', punchOut: '-', regularisation: 'Pending hod review' },
  { id: 7, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Missing Punch', shift: 'General', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Pending hod review' },
  { id: 8, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Missing Punch', shift: 'General', punchIn: '09:12 AM', punchOut: '-', regularisation: 'Pending hod review' },
  { id: 9, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Late Arrival', shift: 'Morning', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Approved' },
  { id: 10, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Missing Punch', shift: 'General', punchIn: '-', punchOut: '09:12 PM', regularisation: 'Pending hod review' },
  { id: 11, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Early Out', shift: 'Night', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Not Raised' },
  { id: 12, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Missing Punch', shift: 'General', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Pending hod review' },
  { id: 13, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Half Day', shift: 'General', punchIn: '-', punchOut: '09:12 PM', regularisation: 'Pending hod review' },
  { id: 14, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Missing Punch', shift: 'General', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Approved' },
  { id: 15, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Late Arrival', shift: 'Morning', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Pending hod review' },
  { id: 16, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Missing Punch', shift: 'General', punchIn: '09:12 AM', punchOut: '-', regularisation: 'Pending hod review' },
  { id: 17, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Early Out', shift: 'Night', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Not Raised' },
  { id: 18, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Missing Punch', shift: 'General', punchIn: '-', punchOut: '09:12 PM', regularisation: 'Pending hod review' },
  { id: 19, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Late Arrival', shift: 'Morning', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Approved' },
  { id: 20, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', date: '12 Mar 2026', exception: 'Missing Punch', shift: 'General', punchIn: '09:12 AM', punchOut: '09:12 PM', regularisation: 'Pending hod review' }
];

export const getAttendanceExceptionReport = async (filters = {}) => {
  try {
    // API endpoint slot:
    // const response = await axios.get('/api/hrms/reports/attendance-exception', { params: filters });
    // return response.data;
    return {
      success: true,
      data: MOCK_ATTENDANCE_EXCEPTION_DATA,
      totalCount: MOCK_ATTENDANCE_EXCEPTION_DATA.length
    };
  } catch (error) {
    console.error('Error fetching Attendance Exception Report:', error);
    return {
      success: false,
      data: MOCK_ATTENDANCE_EXCEPTION_DATA,
      totalCount: MOCK_ATTENDANCE_EXCEPTION_DATA.length
    };
  }
};

export const exportAttendanceExceptionReportPDF = async (filters = {}) => {
  console.log('Exporting Attendance Exception Report as PDF with filters:', filters);
};

export const exportAttendanceExceptionReportExcel = async (filters = {}) => {
  console.log('Exporting Attendance Exception Report as Excel with filters:', filters);
};
