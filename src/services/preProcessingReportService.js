// Service for fetching and exporting Pre Processing Report data

const MOCK_PRE_PROCESSING_DATA = [
  { id: 1, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Ready' },
  { id: 2, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Ready' },
  { id: 3, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Review' },
  { id: 4, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Exception' },
  { id: 5, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Ready' },
  { id: 6, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Review' },
  { id: 7, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Review' },
  { id: 8, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Exception' },
  { id: 9, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Ready' },
  { id: 10, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Ready' },
  { id: 11, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Exception' },
  { id: 12, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Review' },
  { id: 13, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Ready' },
  { id: 14, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Review' },
  { id: 15, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Ready' },
  { id: 16, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Ready' },
  { id: 17, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Ready' },
  { id: 18, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Review' },
  { id: 19, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Exception' },
  { id: 20, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', workingDays: '26', presentDays: '26', leaveDays: '02', halfDays: '01', payableDays: '26', otAmount: '₹7500', totalDeduction: '₹7500', status: 'Ready' }
];

const MOCK_PRE_PROCESSING_STATS = {
  totalEmployeeProcessed: '147',
  totalPayableAmount: '04',
  totalOtAmount: '75',
  totalDeduction: '12',
  payrollReadiness: '12%'
};

export const getPreProcessingReport = async (filters = {}) => {
  try {
    // API endpoint slot:
    // const response = await axios.get('/api/hrms/reports/pre-processing', { params: filters });
    // return response.data;
    return {
      success: true,
      stats: MOCK_PRE_PROCESSING_STATS,
      data: MOCK_PRE_PROCESSING_DATA,
      totalCount: MOCK_PRE_PROCESSING_DATA.length
    };
  } catch (error) {
    console.error('Error fetching Pre Processing Report:', error);
    return {
      success: false,
      stats: MOCK_PRE_PROCESSING_STATS,
      data: MOCK_PRE_PROCESSING_DATA,
      totalCount: MOCK_PRE_PROCESSING_DATA.length
    };
  }
};

export const exportPreProcessingReportPDF = async (filters = {}) => {
  console.log('Exporting Pre Processing Report as PDF with filters:', filters);
};

export const exportPreProcessingReportExcel = async (filters = {}) => {
  console.log('Exporting Pre Processing Report as Excel with filters:', filters);
};
