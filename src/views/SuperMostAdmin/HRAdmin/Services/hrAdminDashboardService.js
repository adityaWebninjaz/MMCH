import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const MOCK_HR_ADMIN_DATA = {
  stats: {
    totalEmployees: 150,
    activeEmployees: 142,
    onLeaveToday: 8,
    newJoiners: 5
  }
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
