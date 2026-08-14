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

// Convert "01:00 PM" to "13:00"
export const formatTimeTo24h = (time12h) => {
  if (!time12h) return '00:00';
  const match = String(time12h).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    const hh = hour < 10 ? `0${hour}` : hour;
    return `${hh}:${minute}`;
  }
  return time12h;
};

// Fetch all shifts from backend
export const getShiftDetails = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');

  try {
    const response = await axios.get(`${BASE_URL}/shifts`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    const list = response?.data?.data || [];

    // This make the shifts appear in the dropdown in the order they were created
    const sortedList = [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return sortedList.map((shift) => {
      const startTime = formatTimeTo12h(shift.startTime);
      const endTime = formatTimeTo12h(shift.endTime);

      return {
        id: shift.id,
        name: shift.name || '-',
        description: (shift.description && String(shift.description).trim().toLowerCase() !== 'string')
          ? shift.description
          : '-',
        timeRange: `${startTime} - ${endTime}`,
        startTime,
        endTime,
        workingDays: formatWorkingDays(shift.workingDays),
        assignedCount: shift.assignedCount || 0,
        raw: shift
      };
    });
  } catch (error) {
    console.error('Error fetching shift details:', error);
    return [];
  }
};

// Create / Change shift POST API
export const createShift = async (data) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const payload = {
    name: data.name,
    description: data.description || '',
    start_time: formatTimeTo24h(data.startTime || data.start_time),
    end_time: formatTimeTo24h(data.endTime || data.end_time),
    working_days: Array.isArray(data.workingDays || data.working_days)
      ? (data.workingDays || data.working_days).map((d) => (typeof d === 'number' ? d : DAYS.indexOf(d))).filter((d) => d >= 0)
      : [1, 2, 3, 4, 5, 6]
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
    throw error;
  }
};

export default {
  getShiftDetails,
  createShift,
  formatTimeTo12h,
  formatWorkingDays,
  formatTimeTo24h
};
