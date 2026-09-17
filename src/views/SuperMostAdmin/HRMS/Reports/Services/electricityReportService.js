// Service for fetching and exporting Electricity Report data

const MOCK_ELECTRICITY_REPORT_DATA = [
  { id: 1, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 2, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 3, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 4, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 5, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 6, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 7, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 8, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 9, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 10, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 11, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 12, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 13, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 14, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 15, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 16, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 17, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 18, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 19, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' },
  { id: 20, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomNo: 'A-102', meterNo: 'MTR-1001', previousReading: '750', currentReading: '750', unitConsumed: '750', rate: '₹750', billing: '₹750' }
];

const MOCK_ELECTRICITY_STATS = {
  totalUnitConsumed: '147',
  totalBilling: '04',
  avgBillPerEmployee: '75',
  pendingMeterReading: '12'
};

export const getElectricityReport = async (filters = {}) => {
  try {
    // API endpoint slot:
    // const response = await axios.get('/api/hrms/reports/electricity', { params: filters });
    // return response.data;
    return {
      success: true,
      stats: MOCK_ELECTRICITY_STATS,
      data: MOCK_ELECTRICITY_REPORT_DATA,
      totalCount: MOCK_ELECTRICITY_REPORT_DATA.length
    };
  } catch (error) {
    console.error('Error fetching Electricity Report:', error);
    return {
      success: false,
      stats: MOCK_ELECTRICITY_STATS,
      data: MOCK_ELECTRICITY_REPORT_DATA,
      totalCount: MOCK_ELECTRICITY_REPORT_DATA.length
    };
  }
};

export const exportElectricityReportPDF = async (filters = {}) => {
  console.log('Exporting Electricity Report as PDF with filters:', filters);
};

export const exportElectricityReportExcel = async (filters = {}) => {
  console.log('Exporting Electricity Report as Excel with filters:', filters);
};
