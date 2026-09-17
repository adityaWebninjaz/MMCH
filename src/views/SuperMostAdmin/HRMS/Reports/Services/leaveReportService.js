import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Fetch leave report from API
 * Endpoint: GET /reports/leaves
 * Query Params:
 *  - status (string, e.g. "ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED")
 *  - department_id (uuid string, optional)
 *  - from (date string YYYY-MM-DD, optional)
 *  - to (date string YYYY-MM-DD, optional)
 *  - page (integer, optional)
 *  - limit (integer, optional)
 *  - search (string, optional)
 */
export const getLeaveReport = async ({
  status = 'ALL',
  department_id = '',
  from = '',
  to = '',
  page = 1,
  limit = 10,
  search = ''
} = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const params = {
    page: Number(page) || 1,
    limit: Number(limit) || 10
  };

  if (status && status !== 'ALL' && status !== 'All') {
    params.status = status.toUpperCase();
  }

  if (
    department_id &&
    typeof department_id === 'string' &&
    department_id.trim() !== '' &&
    department_id !== 'all' &&
    department_id !== 'All Departments'
  ) {
    params.department_id = department_id.trim();
  }

  if (from && typeof from === 'string' && from.trim() !== '') {
    params.from = from.trim();
  }

  if (to && typeof to === 'string' && to.trim() !== '') {
    params.to = to.trim();
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    params.search = search.trim();
  }

  try {
    const response = await axios.get(`${BASE_URL}/reports/leaves`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      params
    });

    const resData = response?.data?.data || response?.data || {};
    const items = Array.isArray(resData?.items) ? resData.items : Array.isArray(resData) ? resData : [];

    const kpis = resData?.kpis || {
      total_requests: items.length,
      total_pending: 0,
      total_approved: 0,
      total_rejected: 0
    };

    const pagination = resData?.pagination || {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / (Number(limit) || 10)))
    };

    return {
      success: response?.data?.success ?? true,
      items,
      kpis,
      pagination,
      raw: response?.data
    };
  } catch (error) {
    console.error('Error fetching leave report:', error);
    throw error;
  }
};

/**
 * Export leave report
 * Endpoint: GET /reports/leaves/export
 * Query Params:
 *  - status, department_id, from, to, search
 */
export const exportLeaveReport = async ({ status = 'ALL', department_id = '', from = '', to = '', search = '' } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const params = {};

  if (status && status !== 'ALL' && status !== 'All') {
    params.status = status.toUpperCase();
  }

  if (
    department_id &&
    typeof department_id === 'string' &&
    department_id.trim() !== '' &&
    department_id !== 'all' &&
    department_id !== 'All Departments'
  ) {
    params.department_id = department_id.trim();
  }

  if (from && typeof from === 'string' && from.trim() !== '') {
    params.from = from.trim();
  }

  if (to && typeof to === 'string' && to.trim() !== '') {
    params.to = to.trim();
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    params.search = search.trim();
  }

  try {
    const response = await axios.get(`${BASE_URL}/reports/leaves/export`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      params,
      responseType: 'blob'
    });

    if (response.data && response.data.type === 'application/json') {
      const text = await response.data.text();
      const parsed = JSON.parse(text);
      if (parsed.success === false) {
        throw new Error(parsed.message || 'Export failed');
      }
    }

    let filename = `Leave_Report_${status || 'ALL'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    } else if (response.headers['content-type']?.includes('csv')) {
      filename = `Leave_Report_${status || 'ALL'}_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return { success: true };
  } catch (error) {
    console.error('Error exporting leave report from backend:', error);
    throw error;
  }
};
