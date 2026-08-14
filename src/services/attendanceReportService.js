import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Fetch attendance report from API
 * Endpoint: GET /reports/attendance
 * Query Params:
 *  - month (integer, 1-12, required)
 *  - year (integer, required)
 *  - department_id (uuid string, optional)
 *  - search (string, employee UID fragment, optional)
 */
export const getAttendanceReport = async ({ month, year, department_id = '', search = '' } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const params = {};

  // month (integer 1-12)
  if (month !== undefined && month !== null && month !== '') {
    params.month = Number(month);
  }

  // year (integer)
  if (year !== undefined && year !== null && year !== '') {
    params.year = Number(year);
  }

  // department_id (uuid string)
  if (
    department_id &&
    typeof department_id === 'string' &&
    department_id.trim() !== '' &&
    department_id !== 'all' &&
    department_id !== 'All Departments'
  ) {
    params.department_id = department_id.trim();
  }

  // search (employee UID fragment)
  if (search && typeof search === 'string' && search.trim() !== '') {
    params.search = search.trim();
  }

  try {
    const response = await axios.get(`${BASE_URL}/reports/attendance`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      params
    });

    const resData = response?.data?.data || response?.data || {};
    const items = Array.isArray(resData?.items) ? resData.items : Array.isArray(resData) ? resData : [];

    const kpis = resData?.kpis || {
      total_employees: items.length,
      total_present: 0,
      total_absent: 0,
      total_half_day: 0,
      total_lwp: 0
    };

    return {
      success: response?.data?.success ?? true,
      items,
      kpis,
      raw: response?.data
    };
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    throw error;
  }
};

/**
 * Export attendance report
 * Endpoint: GET /reports/attendance/export
 * Query Params:
 *  - month (integer, 1-12, required)
 *  - year (integer, required)
 *  - department_id (uuid string, optional)
 *  - search (string, optional)
 */
export const exportAttendanceReport = async ({ month, year, department_id = '', search = '' } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const params = {};

  if (month !== undefined && month !== null && month !== '') {
    params.month = Number(month);
  }

  if (year !== undefined && year !== null && year !== '') {
    params.year = Number(year);
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

  if (search && typeof search === 'string' && search.trim() !== '') {
    params.search = search.trim();
  }

  try {
    const response = await axios.get(`${BASE_URL}/reports/attendance/export`, {
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

    let filename = `Attendance_Report_${month}_${year}.xlsx`;
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    } else if (response.headers['content-type']?.includes('csv')) {
      filename = `Attendance_Report_${month}_${year}.csv`;
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
    console.error('Error exporting attendance report from backend:', error);
    throw error;
  }
};
