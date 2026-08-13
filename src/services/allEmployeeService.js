import axios from 'axios';
import Cookies from 'js-cookie';
import { getEmployees as getFallbackEmployees } from '../views/SuperMostAdmin/HRMS/shiftService';

const extractString = (val, fallback = '-') => {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'string') return val.trim() || fallback;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return (
      val.name ||
      val.full_name ||
      val.title ||
      val.department_name ||
      val.designation_name ||
      val.shift_name ||
      val.device_name ||
      val.label ||
      val.value ||
      fallback
    );
  }
  return String(val);
};

const extractArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.employees)) return data.employees;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.data)) return extractArray(data.data);
  return [];
};

export const getEmployees = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');
  const baseUrl = process.env.REACT_APP_BACKEND_URL;

  try {
    const headers = {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };

    let responseData = null;

    try {
      const res = await axios.get(`${baseUrl}/employees/master`, { headers });
      responseData = res?.data;
    } catch (primaryErr) {
      if (primaryErr?.response?.status === 404) {
        // Fallback endpoint check
        try {
          const fallbackRes = await axios.get(`${baseUrl}/employee/master`, { headers });
          responseData = fallbackRes?.data;
        } catch (subErr) {
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }

    console.log('Employee Master API Raw Data:', responseData);

    const rawList = extractArray(responseData?.data || responseData);

    if (rawList.length > 0) {
      const normalized = rawList.map((emp, index) => {
        const id = emp.id || emp._id || emp.employee_id || emp.uid || `emp-${index}`;
        const empId = extractString(
          emp.uid || emp.empId || emp.employee_id || emp.emp_id || emp.employee_code || emp.id,
          `EMP${String(index + 1).padStart(6, '0')}`
        );

        let name = emp.full_name || emp.employee_name || emp.name || emp.empName || '';
        if (!name && (emp.first_name || emp.firstName)) {
          const first = emp.first_name || emp.firstName || '';
          const last = emp.last_name || emp.lastName || '';
          name = `${first} ${last}`.trim();
        }
        name = extractString(name, 'Unnamed Employee');

        const department = extractString(
          emp.department_name || emp.department?.name || emp.department || emp.dept,
          'General'
        );

        const designation = extractString(
          emp.designation_name || emp.designation?.name || emp.designation || emp.role || emp.position,
          'Staff'
        );

        const hod = extractString(
          emp.reporting_manager || emp.reporting_manager_name || emp.hod_name || emp.hod?.name || emp.hod || emp.manager,
          '-'
        );

        const mobile = extractString(
          emp.mobile_number || emp.mobile || emp.phone_number || emp.phone || emp.contact_no,
          '-'
        );

        const shift = extractString(
          emp.current_shift || emp.shift_name || emp.shift?.name || emp.shift,
          '-'
        );

        const device = extractString(
          emp.device_assigned || emp.device_name || emp.device?.name || emp.device,
          '-'
        );

        const avatar =
          typeof emp.employee_image === 'string'
            ? emp.employee_image
            : typeof emp.avatar === 'string'
            ? emp.avatar
            : typeof emp.profile_image === 'string'
            ? emp.profile_image
            : '';

        return {
          id,
          empId,
          name,
          avatar,
          department,
          designation,
          hod,
          mobile,
          shift,
          device
        };
      });

      return normalized;
    }
  } catch (err) {
    console.warn('Could not load employees from API, using fallback data:', err?.message || err);
  }

  // Graceful fallback to initial dataset if API returns empty or fails
  const fallback = getFallbackEmployees();
  return Array.isArray(fallback) ? fallback : [];
};