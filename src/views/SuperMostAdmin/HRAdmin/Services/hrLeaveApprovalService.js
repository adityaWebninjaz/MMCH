import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Fetch Leave Approvals list from Backend API
 * Endpoint: GET /leaves/approvals
 * Query params: status (ALL, APPROVED, REJECTED, PENDING), etc.
 */
export const getLeaveApprovals = async ({ status = 'ALL' } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  let normalizedStatus = 'ALL';
  if (status && status !== 'All Status' && status !== 'ALL' && status !== 'all') {
    normalizedStatus = status.toUpperCase();
  }

  if (BASE_URL) {
    try {
      const response = await axios.get(`${BASE_URL}/leaves/approvals`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          accept: 'application/json'
        },
        params: {
          status: normalizedStatus
        },
        timeout: 10000
      });

      if (response?.data?.success && Array.isArray(response?.data?.data)) {
        return response.data.data;
      }
      if (Array.isArray(response?.data)) {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching leave approvals from API:', error);
      throw error;
    }
  }

  return [];
};
