import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Format "13:00:00" to "01:00 PM"
export const formatTimeTo12h = (timeStr) => {
  if (!timeStr) return '-';
  const parts = String(timeStr).split(':');
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    const hh = hour < 10 ? `0${hour}` : hour;
    return `${hh}:${minute} ${ampm}`;
  }
  return timeStr;
};

// Format [1, 2, 3, 4, 5, 6] to "Mon, Tue, Wed, Thu, Fri, Sat"
export const formatWorkingDays = (days) => {
  if (!Array.isArray(days) || days.length === 0) return '-';
  return days.map((d) => DAYS[d] || d).join(', ');
};

// Convert "01:00 PM" or "13:00" to "13:00:00"
export const formatTimeTo24h = (time12h, includeSeconds = true) => {
  if (!time12h) return includeSeconds ? '00:00:00' : '00:00';
  const str = String(time12h).trim();

  // If already in "13:00:00" format
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(str)) {
    const parts = str.split(':');
    const hh = parts[0].padStart(2, '0');
    return `${hh}:${parts[1]}:${parts[2]}`;
  }

  // If in "13:00" format
  if (/^\d{1,2}:\d{2}$/.test(str)) {
    const parts = str.split(':');
    const hh = parts[0].padStart(2, '0');
    return includeSeconds ? `${hh}:${parts[1]}:00` : `${hh}:${parts[1]}`;
  }

  // If in "01:00 PM", "9:00 AM", etc.
  const match = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const sec = match[3] || '00';
    const ampm = match[4] ? match[4].toUpperCase() : null;
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    const hh = String(hour).padStart(2, '0');
    return includeSeconds ? `${hh}:${minute}:${sec}` : `${hh}:${minute}`;
  }
  return str;
};

// Map employee response item to table UI structure
export const mapShiftEmployee = (emp, index) => {
  if (!emp) return null;

  const empId =
    emp.empId ||
    emp.employeeId ||
    emp.employee_id ||
    emp.code ||
    emp.employeeCode ||
    emp.id ||
    `EMP-${index + 1}`;

  const empName =
    emp.empName ||
    emp.name ||
    emp.fullName ||
    (emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : '') ||
    emp.user?.name ||
    emp.employee?.name ||
    'Employee';

  const designation =
    emp.designation?.name ||
    emp.designation ||
    emp.role ||
    emp.designation_name ||
    emp.employee?.designation ||
    '-';

  const department =
    emp.department?.name ||
    emp.department ||
    emp.dept ||
    emp.department_name ||
    emp.employee?.department ||
    '-';

  const mobileNo =
    emp.mobileNo ||
    emp.mobile ||
    emp.phone ||
    emp.contact ||
    emp.phoneNumber ||
    '-';

  return {
    id: emp.id || emp.userId || empId,
    empId,
    empName,
    designation,
    department,
    mobileNo,
    raw: emp
  };
};

// Fetch all shifts from backend with search and pagination
export const getShiftDetails = async ({ search = '', page = 1, limit = 10 } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');
  const term = typeof search === 'string' ? search.trim() : '';

  const params = {
    page: Number(page) || 1,
    limit: Number(limit) || 10
  };

  if (term !== '') {
    params.search = term;
    params.name = term;
    params.q = term;
  }

  try {
    const response = await axios.get(`${BASE_URL}/shifts`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      params
    });

    const resData = response?.data?.data || response?.data || [];
    const list = Array.isArray(resData?.items)
      ? resData.items
      : Array.isArray(resData)
      ? resData
      : [];

    // Order shifts by creation time (newest first)
    const sortedList = [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    const mappedShifts = sortedList.map((shift) => {
      const startTime = formatTimeTo12h(shift.startTime || shift.start_time);
      const endTime = formatTimeTo12h(shift.endTime || shift.end_time);

      return {
        id: shift.id,
        name: shift.name || '-',
        description: (shift.description && String(shift.description).trim().toLowerCase() !== 'string')
          ? shift.description
          : '-',
        timeRange: `${startTime} - ${endTime}`,
        startTime,
        endTime,
        workingDays: formatWorkingDays(shift.workingDays || shift.working_days),
        assignedCount: shift.assignedCount || shift.assigned_count || 0,
        raw: shift
      };
    });

    // Ensure search matching (filters correctly whether backend filtered or returned unpaginated list)
    const qLower = term.toLowerCase();
    const filteredShifts = term
      ? mappedShifts.filter((s) => {
          const name = String(s.name || '').toLowerCase();
          const desc = String(s.description || '').toLowerCase();
          const days = String(s.workingDays || '').toLowerCase();
          const time = String(s.timeRange || '').toLowerCase();
          return name.includes(qLower) || desc.includes(qLower) || days.includes(qLower) || time.includes(qLower);
        })
      : mappedShifts;

    const total =
      resData.total ??
      resData.total_count ??
      resData.totalCount ??
      resData.count ??
      resData.pagination?.total ??
      filteredShifts.length;

    const totalPages =
      resData.totalPages ??
      resData.total_pages ??
      resData.pagination?.totalPages ??
      (limit ? Math.max(1, Math.ceil(Number(total) / Number(limit))) : 1);

    // Apply pagination slice if response returned full list
    let paginatedItems = filteredShifts;
    if (limit && filteredShifts.length > limit) {
      const startIdx = (Math.max(1, Number(page)) - 1) * Number(limit);
      paginatedItems = filteredShifts.slice(startIdx, startIdx + Number(limit));
    }

    return {
      items: paginatedItems,
      total: Number(total) || 0,
      totalPages: Math.max(1, Number(totalPages) || 1),
      page: Number(resData.page || page) || 1,
      limit: Number(resData.limit || limit) || 10
    };
  } catch (error) {
    console.error('Error fetching shift details:', error);
    return {
      items: [],
      total: 0,
      totalPages: 1,
      page: 1,
      limit: 10
    };
  }
};

// Fetch employees assigned to a shift by ID
export const getShiftEmployees = async (shiftId) => {
  if (!shiftId) return [];
  const token = Cookies.get('Token') || Cookies.get('token');

  try {
    const response = await axios.get(`${BASE_URL}/shifts/${shiftId}/employees`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    const list = response?.data?.data || response?.data || [];
    const items = Array.isArray(list?.items)
      ? list.items
      : Array.isArray(list?.employees)
      ? list.employees
      : Array.isArray(list)
      ? list
      : [];

    return items.map((emp, idx) => mapShiftEmployee(emp, idx)).filter(Boolean);
  } catch (error) {
    console.error(`Error fetching employees for shift ${shiftId}:`, error);
    return [];
  }
};

// Create / Change shift POST API
export const createShift = async (data) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const startTime24 = formatTimeTo24h(data.startTime || data.start_time, true);
  const endTime24 = formatTimeTo24h(data.endTime || data.end_time, true);

  const rawDays = data.workingDays || data.working_days;
  const workingDaysArray = Array.isArray(rawDays)
    ? rawDays
        .map((d) => (typeof d === 'number' ? d : DAYS.indexOf(d)))
        .filter((d) => d >= 0)
    : [1, 2, 3, 4, 5];

  const payload = {
    name: data.name?.trim(),
    description: data.description?.trim() || '',
    startTime: startTime24,
    endTime: endTime24,
    workingDays: workingDaysArray,
    start_time: startTime24,
    end_time: endTime24,
    working_days: workingDaysArray
  };

  try {
    const response = await axios.post(`${BASE_URL}/shifts`, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating shift:', error);
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Delete shift DELETE API
export const deleteShift = async (id) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  try {
    const response = await axios.delete(`${BASE_URL}/shifts/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting shift with ID ${id}:`, error);
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const deleteShiftDetail = deleteShift;

export default {
  getShiftDetails,
  getShiftEmployees,
  createShift,
  deleteShift,
  deleteShiftDetail,
  mapShiftEmployee,
  formatTimeTo12h,
  formatWorkingDays,
  formatTimeTo24h
};
