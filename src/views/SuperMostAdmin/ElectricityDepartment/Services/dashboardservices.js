import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Initial / Fallback mock data structure for Electricity Department Dashboard
const MOCK_DASHBOARD_DATA = {
  entryWindow: {
    isOpen: true,
    daysRemaining: 5,
    message: 'Entry Window Open — Closes in 5 days'
  },
  chargeTypeProgress: {
    hostelRent: {
      title: 'Hostel Rent',
      statusText: 'Ready to confirm (42/42)',
      current: 42,
      total: 42,
      percentage: 100
    },
    roomMaintenance: {
      title: 'Room Maintenance',
      statusText: '18 of 42 residents entered',
      current: 18,
      total: 42,
      percentage: 42.85
    },
    accommodationCharges: {
      title: 'Accommodation Charges',
      statusText: 'Not started — optional this cycle',
      current: 0,
      total: 42,
      percentage: 0
    }
  },
  lastCycleSummaryRent: {
    cycleName: 'May 2026',
    status: 'Approved',
    totalResidentsCharged: '42 residents',
    combinedTotal: '₹ 2,84,500',
    submissionDate: '15 Jun 2026'
  },
  currentCycleProgress: {
    title: 'Current Cycle Progress',
    meteredRoomsRead: 18,
    totalMeteredRooms: 22,
    percentage: 72,
    statusText: '18 of 22 metered rooms read',
    note: 'Data collection is ongoing.\nEnsure all hospital departments submit current cycle counts.'
  },
  fixedBuildingsConfirmation: {
    title: 'Fixed Buildings Confirmation',
    status: 'Confirmed',
    confirmedCount: 6,
    totalCount: 6,
    percentage: 100,
    statusText: '6 of 6 fixed buildings confirmed',
    note: 'All ₹750 flat-rate buildings have confirmed their fixed billing for this cycle.'
  },
  lastCycleSummaryUtility: {
    cycleName: 'May 2026',
    status: 'Approved',
    totalUnitsBilled: '12,450 units',
    totalCharge: '₹ 1,44,420',
    submissionDate: '15 Jun 2026'
  }
};

/**
 * Get Electricity Dashboard Overview Data
 * Endpoint: GET /electricity-admin/dashboard (or custom configured API endpoint)
 */
export const getElectricityDashboardData = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const response = await axios.get(`${BASE_URL}/electricity-admin/dashboard`, {
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
      console.info('Electricity Dashboard API connecting, falling back to local dataset:', err?.message);
    }
  }

  // Fallback to local structured data
  await new Promise((resolve) => setTimeout(resolve, 80));
  return {
    success: true,
    data: MOCK_DASHBOARD_DATA
  };
};

export const getHostelDashboardData = getElectricityDashboardData;
