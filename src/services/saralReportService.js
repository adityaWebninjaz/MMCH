// Service for fetching and exporting Saral Report data

const MOCK_SARAL_REPORT_DATA = [
  { id: 1, exportVersion: 'v1', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 2, exportVersion: 'v2', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Unlocked' },
  { id: 3, exportVersion: 'v2', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 4, exportVersion: 'v3', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 5, exportVersion: 'v1', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Unlocked' },
  { id: 6, exportVersion: 'v1', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 7, exportVersion: 'v1', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Unlocked' },
  { id: 8, exportVersion: 'v2', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 9, exportVersion: 'v1', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Unlocked' },
  { id: 10, exportVersion: 'v3', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 11, exportVersion: 'v1', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Unlocked' },
  { id: 12, exportVersion: 'v2', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 13, exportVersion: 'v3', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Unlocked' },
  { id: 14, exportVersion: 'v1', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 15, exportVersion: 'v1', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 16, exportVersion: 'v3', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 17, exportVersion: 'v1', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 18, exportVersion: 'v1', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 19, exportVersion: 'v2', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' },
  { id: 20, exportVersion: 'v1', payrollMonth: 'July 2026', generatedOn: '31 Jul 2026, 10:15 AM', generatedBy: 'Ritika Sharma', recordCount: '1,248', lockStatus: 'Locked' }
];

export const getSaralReport = async (filters = {}) => {
  try {
    // API endpoint slot:
    // const response = await axios.get('/api/hrms/reports/saral', { params: filters });
    // return response.data;
    return {
      success: true,
      data: MOCK_SARAL_REPORT_DATA,
      totalCount: MOCK_SARAL_REPORT_DATA.length
    };
  } catch (error) {
    console.error('Error fetching Saral Report:', error);
    return {
      success: false,
      data: MOCK_SARAL_REPORT_DATA,
      totalCount: MOCK_SARAL_REPORT_DATA.length
    };
  }
};

export const exportSaralReportPDF = async (filters = {}) => {
  console.log('Exporting Saral Report as PDF with filters:', filters);
};

export const exportSaralReportExcel = async (filters = {}) => {
  console.log('Exporting Saral Report as Excel with filters:', filters);
};
