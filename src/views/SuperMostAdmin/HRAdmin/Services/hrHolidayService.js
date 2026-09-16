import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Helper to format date string 'YYYY-MM-DD' -> 'DD Mon YYYY'
export const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const [year, month, day] = parts;
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(month, 10) - 1;
  const shortMonth = monthNamesShort[monthIdx] || month;
  return `${day} ${shortMonth} ${year}`;
};

/**
 * Fetch Holidays Table data by year
 * Endpoint: GET /holidays/table?year=YYYY
 */
export const getHolidaysTable = async (year) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const response = await axios.get(`${BASE_URL}/holidays/table`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          year: year || new Date().getFullYear()
        }
      });

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return {
          success: true,
          data: response.data.data.map((item) => {
            const hasSpecificApplies = Array.isArray(item.applies_to_departments) && item.applies_to_departments.length > 0;
            const hasWorkingDepts = Array.isArray(item.working_departments) && item.working_departments.length > 0;
            const isAllDepts = item.type === 'ALL_DEPARTMENTS' || (!hasSpecificApplies && !hasWorkingDepts);

            return {
              id: item.id || Math.random().toString(36).substring(2, 9),
              name: item.name || '',
              date: item.date || '',
              displayDate: formatDateDisplay(item.date),
              description: item.description || '',
              type: item.type || (isAllDepts ? 'ALL_DEPARTMENTS' : 'DEPARTMENT_SPECIFIC'),
              appliesTo: isAllDepts ? 'All' : 'Specific',
              applies_to_departments: item.applies_to_departments || null,
              working_departments: Array.isArray(item.working_departments) ? item.working_departments : [],
              overrideDepartments: Array.isArray(item.working_departments) ? item.working_departments : [],
              departmentOverride: hasWorkingDepts
            };
          })
        };
      }
    } catch (error) {
      console.error('Error fetching holidays from /holidays/table:', error);
      throw error;
    }
  }

  return {
    success: false,
    data: []
  };
};

/**
 * Create a new Holiday
 * Endpoint: POST /holidays
 * Payload:
 *  - ALL departments: { name, date, description } (omit department_ids)
 *  - Specific departments: { name, date, description, department_ids: ["uuid1", "uuid2"] }
 */
export const createHoliday = async (holidayData) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const payload = {
    name: holidayData.name,
    date: holidayData.date,
    description: typeof holidayData.description === 'string' ? holidayData.description : ''
  };

  // If department_ids are provided for specific departments, include them.
  // Otherwise omit department_ids completely for an ALL-departments holiday.
  if (Array.isArray(holidayData.department_ids) && holidayData.department_ids.length > 0) {
    payload.department_ids = holidayData.department_ids;
  }

  if (BASE_URL) {
    try {
      const response = await axios.post(`${BASE_URL}/holidays`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && (response.data.success || response.status === 200 || response.status === 201)) {
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Holiday added successfully!'
        };
      }
    } catch (error) {
      console.error('Error adding holiday to /holidays:', error);
      const resData = error.response?.data;
      let errMessage = resData?.message;

      if (Array.isArray(resData?.errors) && resData.errors.length > 0) {
        const errorDetails = resData.errors
          .map((err) => (typeof err === 'object' ? `${err.path || 'field'}: ${err.message}` : String(err)))
          .join(', ');
        errMessage = errMessage ? `${errMessage} (${errorDetails})` : errorDetails;
      }

      if (!errMessage) {
        errMessage = resData?.error || error.message || 'Failed to add holiday';
      }

      throw new Error(errMessage);
    }
  }

  return {
    success: true,
    data: payload,
    message: 'Holiday added successfully'
  };
};
