import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const MOCK_HR_ADMIN_DATA = {
  payrollCycle: {
    currentStep: 4,
    steps: [
      { id: 1, label: 'Attendance locked', status: 'completed' },
      { id: 2, label: 'Deduction', status: 'completed' },
      { id: 3, label: 'Statutory Entry', status: 'completed' },
      { id: 4, label: 'Pre - Processing', status: 'in-progress' },
      { id: 5, label: 'Accounts Gate 1', status: 'pending' },
      { id: 6, label: 'SARAL Export', status: 'pending' },
      { id: 7, label: 'Accounts Gate 2', status: 'pending' },
      { id: 8, label: 'Locked', status: 'pending' }
    ]
  },
  pendingActions: [
    { id: 'regularisation', count: '5', label: 'Regularisation', link: '/hr-admin/regularisation' },
    { id: 'leaveQueries', count: '2', label: 'Leave Queries', link: '/hr-admin/leave-queries' },
    { id: 'deductionOverride', count: '1', label: 'Deduction Override', link: '/hr-admin/deduction-override' }
  ],
  attendanceExceptions: {
    metrics: [
      { id: 'missingPunch', count: '13', label: 'Missing Punch' },
      { id: 'leaveQueries', count: '3', label: 'Leave Queries' },
      { id: 'biodeviceOnline', count: '8/10', label: 'Biodevice Online' }
    ],
    departmentBreakdown: [
      { department: 'Emergency', missingPunch: 4 },
      { department: 'ICU', missingPunch: 3 },
      { department: 'MRU', missingPunch: 4 },
      { department: 'Surgery', missingPunch: 2 }
    ]
  },
  quickActions: [
    {
      id: 'addEmployee',
      title: 'Add Employee',
      subtitle: '6-Step Onboarding',
      icon: 'user-plus',
      path: '/hr-admin/employee'
    },
    {
      id: 'triggerPayroll',
      title: 'Trigger Payroll Cycle',
      subtitle: 'Advance to Pre - Processing',
      icon: 'play',
      action: 'trigger-payroll'
    },
    {
      id: 'reviewRegularisation',
      title: 'Review Regularisation',
      subtitle: '5 Awaiting Final Update',
      icon: 'checklist',
      action: 'review-regularisation'
    }
  ],
  deductionMatrix: [
    { id: 1, department: 'Emergency', status: 'Current' },
    { id: 2, department: 'Emergency', status: 'Submitted' },
    { id: 3, department: 'Emergency', status: 'Open' }
  ]
};

export const getHrAdminDashboardData = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const response = await axios.get(`${BASE_URL}/hr-admin/dashboard`, {
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
      console.info('HR Admin API connecting, falling back to mock dataset:', err?.message);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 50));
  return {
    success: true,
    data: MOCK_HR_ADMIN_DATA
  };
};
