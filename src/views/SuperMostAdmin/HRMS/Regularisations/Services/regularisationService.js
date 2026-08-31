import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Helper: Format Date string into "19 Aug 2026"
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper: Format Time string / ISO timestamp into "09:20 AM"
const formatTime = (timeStr) => {
  if (!timeStr) return '-';

  // Already formatted
  if (typeof timeStr === 'string' && (timeStr.includes('AM') || timeStr.includes('PM'))) {
    return timeStr;
  }

  // Handle "HH:mm:ss" format (e.g. "09:00:00")
  if (typeof timeStr === 'string' && timeStr.includes(':') && !timeStr.includes('T')) {
    const parts = timeStr.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    if (!isNaN(h)) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
    }
  }

  // Handle ISO 8601 string (e.g. "2026-08-19T03:50:00.000Z")
  const d = new Date(timeStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  return String(timeStr);
};

// Helper: Normalize punch type
const normalizePunchType = (punchType) => {
  if (!punchType) return 'Punch In';
  const t = String(punchType).trim().toUpperCase();
  if (t === 'PUNCH_BOTH' || t.includes('BOTH')) return 'Punch Both';
  if (t === 'PUNCH_OUT' || t.includes('OUT')) return 'Punch Out';
  return 'Punch In';
};

// Helper: Normalize status
const normalizeStatus = (status) => {
  if (!status) return 'Pending';
  const s = String(status).trim().toUpperCase();
  if (s === 'APPROVED' || s === 'ACCEPT' || s === 'ACCEPTED') return 'Approved';
  if (s === 'REJECTED' || s === 'DECLINED') return 'Rejected';
  return 'Pending';
};

/**
 * Normalizes single API record matching backend response:
 * {
 *   "id": "e1987029-7ca9-4045-86f8-d3de691da3a7",
 *   "employee": {
 *     "uid": "PMCH0102",
 *     "full_name": "Pooja Singh",
 *     "department": "Anatomy",
 *     "designation": "Lab Technician",
 *     "mobile_number": null,
 *     "shift": { "name": "Peter Test Shift", "start_time": "09:00:00", "end_time": "17:15:00" }
 *   },
 *   "date": "2026-08-19",
 *   "punch_type": "PUNCH_IN",
 *   "requested_punch_in": "2026-08-19T03:50:00.000Z",
 *   "requested_punch_out": null,
 *   "current_attendance": { "punch_in": null, "punch_out": null, "status": "LWP" },
 *   "reason": "rrrrrr",
 *   "applied_at": "2026-08-31T10:19:17.024Z",
 *   "status": "PENDING",
 *   "reviewed_by": null,
 *   "reviewed_at": null,
 *   "rejection_remark": null
 * }
 */
const normalizeRegularisationRecord = (item, index) => {
  if (!item) return null;

  const id = item.id || `reg-${index + 1}`;
  const empId = item.employee?.uid || item.employee?.employee_id || item.empId || '-';
  const empName = item.employee?.full_name || item.employee?.name || item.empName || '-';
  const department = item.employee?.department || item.department || '-';
  const designation = item.employee?.designation || '-';
  const mobileNumber = item.employee?.mobile_number || '-';

  const shiftName = item.employee?.shift?.name
    ? `${item.employee.shift.name} (${formatTime(item.employee.shift.start_time)} - ${formatTime(item.employee.shift.end_time)})`
    : '-';

  const dateRequested = formatDate(item.date || item.applied_at);
  const rawDate = item.date || '';

  const punchType = normalizePunchType(item.punch_type);
  const punchIn = formatTime(item.requested_punch_in || item.current_attendance?.punch_in);
  const punchOut = formatTime(item.requested_punch_out || item.current_attendance?.punch_out);

  const status = normalizeStatus(item.status);
  const employeeReason = item.reason || item.employeeReason || 'No reason provided';

  const hodName = item.reviewed_by?.full_name || item.hodName || '-';
  const hodNote =
    item.rejection_remark ||
    (item.reviewed_by ? `${item.reviewed_by.designation || 'Reviewer'}: ${item.reviewed_by.full_name}` : '-');

  return {
    id,
    empId,
    empName,
    department,
    designation,
    mobileNumber,
    shiftName,
    dateRequested,
    rawDate,
    punchType,
    punchIn,
    punchOut,
    status,
    employeeReason,
    hodName,
    hodNote,
    appliedAt: formatDate(item.applied_at),
    reviewedAt: formatDate(item.reviewed_at),
    rejectionRemark: item.rejection_remark || '',
    raw: item
  };
};

/**
 * Fetch regularisations (missed-punches approvals/requests)
 * Endpoint: GET /missed-punches/approvals
 */
export const getRegularisations = async (filters = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const params = {};
  if (filters.status && filters.status !== 'All Status' && filters.status !== 'ALL' && filters.status !== 'All') {
    params.status = filters.status.toUpperCase();
  }

  if (filters.search && typeof filters.search === 'string' && filters.search.trim() !== '') {
    params.search = filters.search.trim();
  }

  if (BASE_URL) {
    try {
      const response = await axios.get(`${BASE_URL}/missed-punches/approvals`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        params,
        timeout: 7000
      });

      const resData = response?.data?.data ?? response?.data ?? [];
      const rawList = Array.isArray(resData)
        ? resData
        : Array.isArray(resData?.items)
        ? resData.items
        : Array.isArray(resData?.requests)
        ? resData.requests
        : [];

      const normalizedList = rawList.map((item, index) => normalizeRegularisationRecord(item, index)).filter(Boolean);

      return {
        success: true,
        data: normalizedList,
        totalCount: response?.data?.total || normalizedList.length
      };
    } catch (apiError) {
      console.warn('Missed punches approvals API error:', apiError?.message);
    }
  }

  return {
    success: true,
    data: [],
    totalCount: 0
  };
};

/**
 * Approve regularisation request
 * Endpoint: PATCH /missed-punches/approvals/:id
 * Body: { "action": "APPROVE" }
 */
export const approveRegularisation = async (id) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const response = await axios.patch(
        `${BASE_URL}/missed-punches/approvals/${id}`,
        {
          action: 'APPROVE'
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          timeout: 7000
        }
      );

      return {
        success: response.data?.success ?? true,
        message: response.data?.message || 'Regularisation approved successfully.',
        data: response.data?.data
      };
    } catch (apiError) {
      console.error('Approve API error:', apiError?.response?.data || apiError?.message);
      return {
        success: false,
        message: apiError?.response?.data?.message || apiError?.message || 'Failed to approve regularisation.'
      };
    }
  }

  return { success: true, message: 'Regularisation approved successfully.' };
};

/**
 * Reject regularisation request
 * Endpoint: PATCH /missed-punches/approvals/:id
 * Body: { "action": "REJECT", "rejection_remark": "..." } (rejection_remark is REQUIRED)
 */
export const rejectRegularisation = async (id, reason = '') => {
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const response = await axios.patch(
        `${BASE_URL}/missed-punches/approvals/${id}`,
        {
          action: 'REJECT',
          rejection_remark: reason || 'Rejected by approver'
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          timeout: 7000
        }
      );

      return {
        success: response.data?.success ?? true,
        message: response.data?.message || 'Regularisation rejected successfully.',
        data: response.data?.data
      };
    } catch (apiError) {
      console.error('Reject API error:', apiError?.response?.data || apiError?.message);
      return {
        success: false,
        message: apiError?.response?.data?.message || apiError?.message || 'Failed to reject regularisation.'
      };
    }
  }

  return { success: true, message: 'Regularisation rejected successfully.' };
};

export const exportRegularisationsPDF = async (filters = {}) => {
  console.log('Exporting Regularisations as PDF with filters:', filters);
};

export const exportRegularisationsExcel = async (filters = {}) => {
  console.log('Exporting Regularisations as Excel with filters:', filters);
};
