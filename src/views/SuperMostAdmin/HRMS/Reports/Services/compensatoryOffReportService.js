// Service for fetching and exporting Compensatory Off Report data

const MOCK_COMPENSATORY_OFF_DATA = [
  { id: 1, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 2, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 3, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 4, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 5, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 6, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 7, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 8, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 9, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 10, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 11, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 12, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 13, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 14, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 15, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 16, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 17, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 18, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 19, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' },
  { id: 20, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', creditEarned: '04', utilized: '03', expired: '04', currentBalance: '04', nextExpiryDate: '12 Jul 2026' }
];

export const getCompensatoryOffReport = async (filters = {}) => {
  try {
    // API endpoint slot: return await axios.get('/api/hrms/reports/compensatory-off', { params: filters });
    return {
      success: true,
      stats: {
        totalCreditIssued: '147',
        totalUtilized: '04',
        activeBalanceCompOff: '75',
        empWithCompOff: '12'
      },
      data: MOCK_COMPENSATORY_OFF_DATA,
      totalCount: MOCK_COMPENSATORY_OFF_DATA.length
    };
  } catch (error) {
    console.error('Error fetching Compensatory Off Report:', error);
    return {
      success: false,
      stats: {
        totalCreditIssued: '147',
        totalUtilized: '04',
        activeBalanceCompOff: '75',
        empWithCompOff: '12'
      },
      data: MOCK_COMPENSATORY_OFF_DATA,
      totalCount: MOCK_COMPENSATORY_OFF_DATA.length
    };
  }
};

export const exportCompensatoryOffReportPDF = async (filters = {}) => {
  console.log('Exporting Compensatory Off Report as PDF with filters:', filters);
};

export const exportCompensatoryOffReportExcel = async (filters = {}) => {
  console.log('Exporting Compensatory Off Report as Excel with filters:', filters);
};
