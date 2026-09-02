import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Mock data aligned directly with Figma specs & UI screenshot
const MOCK_FRONTOFFICE_DASHBOARD_DATA = {
  entryWindow: {
    isOpen: true,
    daysRemaining: 5,
    message: 'Entry Window Open — Closes in 5 days'
  },
  deductionProgress: {
    title: 'Deduction Progress Overview',
    cycleLabel: 'June 2026 Active Entries',
    statusText: '18 of 42 residents entered',
    current: 18,
    total: 42,
    percentage: 42.85,
    note: 'Once all operational personnel entries are finished, lock the cycle to push records to payroll processing.'
  },
  lastCycleSummary: {
    cycleName: 'May 2026',
    status: 'Approved',
    employeesCharged: '42 Employee',
    combinedTotal: '₹ 2,84,500',
    submissionDate: '15 Jun 2026'
  }
};

/**
 * Get Front Office Dashboard Data
 */
export const getFrontOfficeDashboardData = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const response = await axios.get(`${BASE_URL}/front-office/dashboard`, {
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
      console.info('Front Office Dashboard API connecting, using local dataset:', err?.message);
    }
  }

  return {
    success: true,
    data: MOCK_FRONTOFFICE_DASHBOARD_DATA
  };
};

export const getHostelDashboardData = getFrontOfficeDashboardData;
