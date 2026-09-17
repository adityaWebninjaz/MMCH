// Service for fetching and exporting Deduction Summary Report data

const MOCK_DEDUCTION_SUMMARY_DATA = [
  { id: 1, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 2, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '-', miscellaneous: '-', totalDeduction: '₹750' },
  { id: 3, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 4, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '-', electricity: '₹750', busPass: '-', frontOffice: '₹750', miscellaneous: '-', totalDeduction: '₹750' },
  { id: 5, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 6, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '-', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '-', totalDeduction: '₹750' },
  { id: 7, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '-', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 8, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '-', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 9, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '-', totalDeduction: '₹750' },
  { id: 10, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 11, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '-', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 12, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '-', totalDeduction: '₹750' },
  { id: 13, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '-', electricity: '₹750', busPass: '-', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 14, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 15, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 16, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 17, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 18, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 19, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' },
  { id: 20, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', roomRent: '₹750', electricity: '₹750', busPass: '₹750', frontOffice: '₹750', miscellaneous: '₹750', totalDeduction: '₹750' }
];

export const getDeductionSummaryReport = async (filters = {}) => {
  try {
    // API endpoint slot: return await axios.get('/api/hrms/reports/deduction-summary', { params: filters });
    return {
      success: true,
      donutData: {
        series: [450, 300, 550, 750, 650], // Buss Pass, Electricity, Front Office, Room Rent, Security
        labels: ['Buss Pass', 'Electricity', 'Front Office', 'Room Rent', 'Security']
      },
      barData: {
        series: [{ name: 'Deduction Amount', data: [55, 48, 65, 30, 42] }], // values in k: 55k, 48k, 65k, 30k, 42k
        categories: ['Room Rent', 'Electricity', 'Security', 'Buss Pass', 'Front Office']
      },
      data: MOCK_DEDUCTION_SUMMARY_DATA,
      totalCount: MOCK_DEDUCTION_SUMMARY_DATA.length
    };
  } catch (error) {
    console.error('Error fetching Deduction Summary Report:', error);
    return {
      success: false,
      donutData: {
        series: [450, 300, 550, 750, 650],
        labels: ['Buss Pass', 'Electricity', 'Front Office', 'Room Rent', 'Security']
      },
      barData: {
        series: [{ name: 'Deduction Amount', data: [55, 48, 65, 30, 42] }],
        categories: ['Room Rent', 'Electricity', 'Security', 'Buss Pass', 'Front Office']
      },
      data: MOCK_DEDUCTION_SUMMARY_DATA,
      totalCount: MOCK_DEDUCTION_SUMMARY_DATA.length
    };
  }
};

export const exportDeductionSummaryReportPDF = async (filters = {}) => {
  console.log('Exporting Deduction Summary Report as PDF with filters:', filters);
};

export const exportDeductionSummaryReportExcel = async (filters = {}) => {
  console.log('Exporting Deduction Summary Report as Excel with filters:', filters);
};
