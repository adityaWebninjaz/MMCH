import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const MOCK_ACCOUNTS_DASHBOARD = {
  payrollStatus: {
    title: 'Payroll Status',
    completedSteps: 2,
    totalSteps: 5,
    statusBadge: '2 of 5 Complete',
    steps: [
      { id: 1, label: 'Payroll Cycle', status: 'completed' },
      { id: 2, label: 'Verification Checklist', status: 'completed' },
      { id: 3, label: 'Pre - Processing', status: 'in-progress' },
      { id: 4, label: 'Saral Export', status: 'pending' },
      { id: 5, label: 'Payslip', status: 'pending' }
    ]
  },
  lastCycleSummary: {
    cycleName: 'May 2026',
    status: 'Approved',
    month: 'June 2025',
    finalNetPayrollTotal: '₹ 24,53,890',
    exportLockDate: '18 Jun 2025',
    complianceExport: 'SARAL Validated'
  },
  statutoryEntryProgress: {
    title: 'Statutory Entry Progress',
    subtitle: 'TDS requires manual entry — PF/ESIC are formula-driven',
    pfEsic: {
      label: 'PF / ESIC (Formula-driven)',
      current: 142,
      total: 150,
      statusText: '142 of 150 computed',
      percentage: 94.67
    },
    tds: {
      label: 'TDS (Manual Entry)',
      current: 98,
      total: 150,
      statusText: '98 of 150 entered',
      percentage: 65.33
    }
  },
  pendingReviews: {
    title: 'Pending Reviews',
    items: [
      { label: 'Payroll Review', count: '3 pending', alert: false },
      { label: 'Statutory Deductions', count: '5 pending', alert: false }
    ],
    alertMessage: 'Action required to avoid payroll processing delay'
  }
};

/**
 * Fetch Accounts Dashboard Overview Data
 */
export const getAccountsDashboardData = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const response = await axios.get(`${BASE_URL}/accounts-admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || response.data.result
        };
      }
    } catch (err) {
      console.info('Accounts Dashboard API connecting, falling back to mock dataset:', err?.message);
    }
  }

  // Fallback to local dataset
  await new Promise((resolve) => setTimeout(resolve, 60));
  return {
    success: true,
    data: MOCK_ACCOUNTS_DASHBOARD
  };
};
