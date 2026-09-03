import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// ============================================================================
// SHARED UTILITIES & HELPERS
// ============================================================================

/**
 * Returns authorization headers with the current auth token
 */
const getAuthHeaders = (isMultipart = false) => {
  const token = Cookies.get('Token') || Cookies.get('token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
    ...(isMultipart ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json', accept: 'application/json' })
  };
};

/**
 * Extracts a human-readable error message from Axios errors
 */
const extractErrorMessage = (error, defaultMessage = 'An unexpected error occurred') => {
  if (error?.response?.status === 409) {
    return 'This Employee ID already exists. Please enter a different Employee ID or leave it blank to auto-generate.';
  }
  const errData = error?.response?.data;
  if (Array.isArray(errData?.errors) && errData.errors.length > 0) {
    return errData.errors
      .map((e) => {
        if (e.path === 'last_name' || (e.message && e.message.toLowerCase().includes('last_name'))) {
          return 'Please enter last name';
        }
        if (e.path === 'uid' || (e.message && e.message.toLowerCase().includes('uid'))) {
          return 'This Employee ID already exists. Please choose a different Employee ID or leave it blank to auto-generate.';
        }
        return `${e.path || 'Field'}: ${e.message}`;
      })
      .join(', ');
  }
  const rawMsg = errData?.message || error?.message || defaultMessage;
  if (typeof rawMsg === 'string' && rawMsg.toLowerCase().includes('last_name')) {
    return 'Please enter last name';
  }
  if (typeof rawMsg === 'string' && (rawMsg.toLowerCase().includes('duplicate') || rawMsg.toLowerCase().includes('already exists'))) {
    return 'This Employee ID already exists. Please enter a different Employee ID or leave it blank to auto-generate.';
  }
  return rawMsg;
};

// ============================================================================
// AVATAR & IMAGE HELPERS
// ============================================================================

const formatImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return '';
  const trimmed = imagePath.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const baseOrigin = (BASE_URL || '').replace(/\/+$/, '');
  return trimmed.startsWith('/') ? `${baseOrigin}${trimmed}` : `${baseOrigin}/${trimmed}`;
};

const imageBlobCache = new Map();

export const getBlobAvatar = async (imagePath) => {
  const formattedUrl = formatImageUrl(imagePath);
  if (!formattedUrl) return '';
  if (imageBlobCache.has(formattedUrl)) return imageBlobCache.get(formattedUrl);
  if (formattedUrl.startsWith('data:') || formattedUrl.startsWith('blob:')) return formattedUrl;

  try {
    const res = await axios.get(formattedUrl, { responseType: 'blob' });
    const blobUrl = URL.createObjectURL(res.data);
    imageBlobCache.set(formattedUrl, blobUrl);
    return blobUrl;
  } catch (err) {
    return formattedUrl;
  }
};

// ============================================================================
// DROPDOWN METADATA (Departments, Designations, HoDs)
// ============================================================================

export const getDepartments = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/departments`, {
      headers: getAuthHeaders()
    });

    const resData = response?.data?.data || response?.data || [];
    const list = Array.isArray(resData?.items) ? resData.items : Array.isArray(resData) ? resData : [];

    return list.map((dept) => ({
      id: dept.id || dept.department_id || dept._id || dept.name,
      name: dept.name || dept.department_name || dept.title || dept.id
    }));
  } catch (err) {
    console.info('getDepartments info:', err?.message);
    return [];
  }
};

export const getDesignations = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/designations`, {
      headers: getAuthHeaders()
    });

    const resData = response?.data?.data || response?.data || [];
    const list = Array.isArray(resData?.items) ? resData.items : Array.isArray(resData) ? resData : [];

    return list.map((item) => {
      if (typeof item === 'string') return { id: item, name: item };
      return {
        id: item.id || item.designation_id || item._id || item.name,
        name: item.name || item.designation || item.designation_name || item.title || item.role_name || item.id
      };
    });
  } catch (err) {
    console.info('getDesignations info:', err?.message);
    return [];
  }
};

export const getHODs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/employees/hods`, {
      headers: getAuthHeaders()
    });

    const resData = response?.data?.data || response?.data || [];
    const list = Array.isArray(resData?.items) ? resData.items : Array.isArray(resData) ? resData : [];

    return list.map((item) => {
      if (typeof item === 'string') return { id: item, name: item };
      const id = item.id || item._id || item.hod_id || item.employee_id || item.uid || item.name;
      const name = item.full_name || item.name || item.hod_name || item.employee_name || id;
      return { id, name };
    });
  } catch (err) {
    console.info('getHODs info:', err?.message);
    return [];
  }
};

// ============================================================================
// EMPLOYEE MASTER LIST
// ============================================================================

export const getEmployees = async ({ search = '', page = 1, limit = 10, department_id = '', status = '' } = {}) => {
  const params = {
    page: Number(page) || 1,
    limit: Number(limit) || 10
  };

  if (search && typeof search === 'string' && search.trim()) {
    params.search = search.trim();
  }

  if (department_id && department_id !== 'all' && department_id !== 'All Departments') {
    params.department_id = department_id.trim();
  }

  if (status && status !== 'all' && status !== 'All Status') {
    params.status = status.trim().toLowerCase();
  }

  try {
    const response = await axios.get(`${BASE_URL}/employees/master`, {
      headers: getAuthHeaders(),
      params
    });

    const rawData = response?.data || {};
    const resData = rawData.data || rawData || {};
    const items = Array.isArray(resData?.items)
      ? resData.items
      : Array.isArray(resData)
      ? resData
      : Array.isArray(rawData?.items)
      ? rawData.items
      : [];

    const mappedEmployees = await Promise.all(
      items.map(async (emp) => {
        const avatarUrl = await getBlobAvatar(emp.employee_image);
        const rawStatus = emp.status || 'Active';
        const formattedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

        return {
          id: emp.id,
          employeeId: emp.uid || '-',
          empId: emp.uid || '-',
          name: emp.full_name || '-',
          avatar: avatarUrl,
          department: emp.department || '-',
          departmentId: emp.department_id || '',
          designation: emp.designation || '-',
          designationId: emp.designation_id || '',
          category: emp.category || (emp.profile_status ? emp.profile_status.replace(/_/g, ' ') : 'Staff'),
          hod: emp.reporting_manager || '-',
          hodId: emp.reporting_manager_id || '',
          hodAssigned: emp.reporting_manager || '-',
          phone: emp.mobile_number || '-',
          mobile: emp.mobile_number || '-',
          email: emp.email || '',
          shift: emp.current_shift || '-',
          shiftId: emp.current_shift_id || '',
          current_shift_id: emp.current_shift_id || '',
          device: emp.device_assigned || '-',
          deviceId: emp.device_id || '',
          device_id: emp.device_id || '',
          status: formattedStatus,
          profileStatus: emp.profile_status || '',
          profile_status: emp.profile_status || '',
          exitType: emp.exit_type || null,
          lastWorkingDay: emp.last_working_day || null,
          exitedBy: emp.exited_by || null,
          exitedAt: emp.exited_at || null,
          createdAt: emp.created_at || null,
          dob: emp.dob || emp.date_of_birth || '-',
          gender: emp.gender || '-',
          fatherName: emp.father_name || '-',
          emergencyContactName: emp.emergency_contact_name || '-',
          salaryGrade: emp.salary_grade || '-',
          bankName: emp.bank_name || '-',
          accountNumber: emp.account_number || '-',
          pfNumber: emp.pf_number || '-',
          ifsc: emp.ifsc || '-',
          pan: emp.pan || '-',
          aadhaar: emp.aadhaar || emp.aadhaar_number || '-',
          alternatePhone: emp.alternate_phone || '-',
          address: emp.address || '-',
          pinCode: emp.pin_code || '-',
          documents: emp.documents || {}
        };
      })
    );

    const extractedTotal =
      rawData.total ??
      rawData.total_count ??
      rawData.totalCount ??
      rawData.count ??
      rawData.pagination?.total ??
      rawData.pagination?.total_count ??
      rawData.meta?.total ??
      resData.total ??
      resData.total_count ??
      resData.totalCount ??
      resData.count ??
      resData.pagination?.total ??
      resData.pagination?.total_count ??
      resData.meta?.total ??
      (response?.headers?.['x-total-count'] ? Number(response.headers['x-total-count']) : null);

    const hasExplicitTotal = extractedTotal !== null && extractedTotal !== undefined && !isNaN(Number(extractedTotal));
    const total = hasExplicitTotal ? Number(extractedTotal) : mappedEmployees.length;

    let totalPages =
      Number(
        rawData.totalPages ??
          rawData.total_pages ??
          rawData.pagination?.totalPages ??
          rawData.pagination?.total_pages ??
          rawData.meta?.totalPages ??
          resData.totalPages ??
          resData.total_pages ??
          resData.pagination?.totalPages ??
          resData.pagination?.total_pages ??
          resData.meta?.totalPages ??
          (hasExplicitTotal && params.limit > 0 ? Math.ceil(total / params.limit) : 0)
      ) || 0;

    if (!totalPages) {
      if (hasExplicitTotal) {
        totalPages = Math.max(1, Math.ceil(total / params.limit));
      } else if (mappedEmployees.length === params.limit) {
        totalPages = params.page + 1;
      } else {
        totalPages = Math.max(1, params.page);
      }
    }

    return {
      items: mappedEmployees,
      total,
      totalPages: Math.max(1, totalPages),
      page: Number(rawData.page || resData.page || params.page) || 1,
      limit: Number(rawData.limit || resData.limit || params.limit) || 10
    };
  } catch (error) {
    console.error('Failed to fetch employees from API:', error);
    return {
      items: [],
      total: 0,
      totalPages: 1,
      page: params.page,
      limit: params.limit
    };
  }
};

// ============================================================================
// EMPLOYEE DETAILS & CRUD (GET / POST / PATCH / DOCUMENT UPLOAD)
// ============================================================================

/**
 * GET /employees/{id} - Get complete employee details
 */
export const getEmployeeById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/employees/${id}`, {
      headers: getAuthHeaders()
    });
    return { success: true, data: response?.data?.data || response?.data };
  } catch (err) {
    return { success: true, data: null };
  }
};

/**
 * POST /users - Create new employee user
 */
export const createEmployeeUser = async (employeePayload) => {
  try {
    const response = await axios.post(`${BASE_URL}/users`, employeePayload, {
      headers: getAuthHeaders()
    });

    const resData = response?.data?.data || response?.data || {};
    return {
      success: true,
      data: resData
    };
  } catch (error) {
    const validationMsg = extractErrorMessage(error, 'Failed to create employee user');
    console.error('Failed to create employee user:', error?.response?.data || error?.message);
    return {
      success: false,
      error: validationMsg,
      rawError: error?.response?.data
    };
  }
};

/**
 * PATCH /users/{id} - Update employee fields
 */
export const updateEmployeeUser = async (userId, updatePayload) => {
  try {
    const response = await axios.patch(`${BASE_URL}/users/${userId}`, updatePayload, {
      headers: getAuthHeaders()
    });

    const resData = response?.data?.data || response?.data || {};
    return {
      success: true,
      data: resData
    };
  } catch (error) {
    const validationMsg = extractErrorMessage(error, 'Failed to update employee details');
    console.error('Failed to update employee user:', error?.response?.data || error?.message);
    return {
      success: false,
      error: validationMsg,
      rawError: error?.response?.data
    };
  }
};

/**
 * POST /employees/{id}/documents/{doc_type} - Upload document
 */
export const uploadEmployeeDocument = async (employeeId, docType, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${BASE_URL}/employees/${employeeId}/documents/${docType}`, formData, {
      headers: getAuthHeaders(true)
    });

    return {
      success: true,
      data: response?.data?.data || response?.data
    };
  } catch (error) {
    console.error(`Failed to upload document ${docType}:`, error?.response?.data || error?.message);
    return {
      success: false,
      error: error?.response?.data?.message || error?.message
    };
  }
};

// ============================================================================
// ATTENDANCE & LEAVES
// ============================================================================

/**
 * GET /attendance/employee/{userId}/yearly - Yearly attendance matrix
 */
export const getEmployeeAttendance = async (userId, year = new Date().getFullYear()) => {
  try {
    const response = await axios.get(`${BASE_URL}/attendance/employee/${userId}/yearly`, {
      headers: getAuthHeaders(),
      params: {
        year: Number(year) || new Date().getFullYear()
      }
    });

    const rawData = response?.data;
    const resData = rawData?.data || rawData || {};

    return {
      success: true,
      data: resData
    };
  } catch (error) {
    console.error('Failed to fetch employee attendance from API:', error?.response?.data || error?.message);
    return {
      success: false,
      error: error?.response?.data?.message || error?.message,
      data: null
    };
  }
};

/**
 * GET /leaves/employee/{userId} - Employee leaves history
 */
export const getEmployeeLeaves = async (userId, { year, month, status } = {}) => {
  try {
    const params = {};
    if (year) params.year = Number(year);
    if (month && month !== 'all' && month !== 'All') params.month = Number(month);
    if (status && status !== 'all' && status !== 'ALL') params.status = status.toUpperCase();

    const response = await axios.get(`${BASE_URL}/leaves/employee/${userId}`, {
      headers: getAuthHeaders(),
      params
    });

    const rawData = response?.data;
    const resData = rawData?.data || rawData || {};

    return {
      success: true,
      data: resData
    };
  } catch (error) {
    console.error('Failed to fetch employee leaves from API:', error?.response?.data || error?.message);
    return {
      success: false,
      error: error?.response?.data?.message || error?.message,
      data: null
    };
  }
};
