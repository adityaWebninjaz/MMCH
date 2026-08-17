import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const formatImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return '';
  const trimmed = imagePath.trim();
  if (!trimmed || trimmed === '-' || trimmed === 'null' || trimmed === 'undefined') return '';

  // If already a complete http/https URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const baseOrigin = (BASE_URL || 'https://mmchhrmsapi.pmu.org.in')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/+$/, '');

  // If path starts with // (e.g. //var/www/pmch-hrms-api/uploads/...)
  if (trimmed.startsWith('//')) {
    return `${baseOrigin}${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    return `${baseOrigin}${trimmed}`;
  }

  return `${baseOrigin}/${trimmed}`;
};

const imageBlobCache = new Map();

export const getBlobAvatar = async (imagePath) => {
  const formattedUrl = formatImageUrl(imagePath);
  if (!formattedUrl) return '';

  if (imageBlobCache.has(formattedUrl)) {
    return imageBlobCache.get(formattedUrl);
  }

  if (formattedUrl.startsWith('data:') || formattedUrl.startsWith('blob:')) {
    return formattedUrl;
  }

  try {
    const res = await axios.get(formattedUrl, { responseType: 'blob' });
    const blobUrl = URL.createObjectURL(res.data);
    imageBlobCache.set(formattedUrl, blobUrl);
    return blobUrl;
  } catch (err) {
    console.warn('Failed to load image blob for:', formattedUrl, err?.message);
    return formattedUrl;
  }
};

export const getEmployees = async ({ search = '', page = 1, limit = 10, department_id = '' } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const params = {
    page: Number(page) || 1,
    limit: Number(limit) || 10
  };

  if (search && typeof search === 'string' && search.trim() !== '') {
    params.search = search.trim();
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

  try {
    const response = await axios.get(`${BASE_URL}/employees/master`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      params
    });

    const resData = response?.data?.data || response?.data || {};
    const items = Array.isArray(resData?.items)
      ? resData.items
      : Array.isArray(resData)
        ? resData
        : [];

    const mappedEmployees = await Promise.all(
      items.map(async (emp) => {
        const avatarUrl = await getBlobAvatar(emp.employee_image);
        return {
          id: emp.id,
          empId: emp.uid || '-',
          name: emp.full_name || '-',
          avatar: avatarUrl,
          department: emp.department || '-',
          departmentId: emp.department_id || '',
          designation: emp.designation || '-',
          designationId: emp.designation_id || '',
          hod: emp.reporting_manager || '-',
          hodId: emp.reporting_manager_id || '-',
          mobile: emp.mobile_number || '-',
          shift: emp.current_shift || '-',
          shiftId: emp.current_shift_id || emp.shift_id || '',
          current_shift_id: emp.current_shift_id || emp.shift_id || '',
          device: emp.device_assigned || '-',
          deviceId: emp.device_id || '',
          device_id: emp.device_id || '',
          status: emp.status || 'active',
          profileStatus: emp.profile_status || emp.profileStatus || '',
          profile_status: emp.profile_status || emp.profileStatus || ''
        };
      })
    );

    const total =
      resData.total ??
      resData.total_count ??
      resData.totalCount ??
      resData.count ??
      resData.pagination?.total ??
      mappedEmployees.length;

    const totalPages =
      resData.totalPages ??
      resData.total_pages ??
      resData.pagination?.totalPages ??
      (params.limit > 0 ? Math.ceil(Number(total) / Number(params.limit)) : 1);

    return {
      items: mappedEmployees,
      total: Number(total) || 0,
      totalPages: Math.max(1, Number(totalPages) || 1),
      page: Number(resData.page || params.page) || 1,
      limit: Number(resData.limit || params.limit) || 10
    };
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return {
      items: [],
      total: 0,
      totalPages: 1,
      page: 1,
      limit: 10
    };
  }
};

export const getAllEmployees = async ({ search = '', department_id = '', batchSize = 100 } = {}) => {
  try {
    const firstPage = await getEmployees({
      search,
      department_id,
      page: 1,
      limit: batchSize
    });

    let allItems = Array.isArray(firstPage?.items) ? [...firstPage.items] : [];
    const totalPages = Number(firstPage?.totalPages) || 1;

    if (totalPages > 1) {
      const pagePromises = [];
      for (let p = 2; p <= totalPages; p++) {
        pagePromises.push(
          getEmployees({
            search,
            department_id,
            page: p,
            limit: batchSize
          })
        );
      }
      const restPages = await Promise.all(pagePromises);
      restPages.forEach((res) => {
        if (Array.isArray(res?.items)) {
          allItems = allItems.concat(res.items);
        }
      });
    }

    return {
      items: allItems,
      total: allItems.length,
      totalPages: 1,
      page: 1,
      limit: allItems.length
    };
  } catch (error) {
    console.error('Failed to fetch all employees:', error);
    return {
      items: [],
      total: 0,
      totalPages: 1,
      page: 1,
      limit: 10
    };
  }
};

export const exportEmployeesMaster = async ({ search = '', department_id = '' } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const params = {};
  if (search && typeof search === 'string' && search.trim() !== '') {
    params.search = search.trim();
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

  try {
    const response = await axios.get(`${BASE_URL}/employees/master/export`, {
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

    let filename = `Employee_Master_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    } else if (response.headers['content-type']?.includes('csv')) {
      filename = `Employee_Master_${new Date().toISOString().slice(0, 10)}.csv`;
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
    console.error('Failed to export employee master:', error);
    throw error;
  }
};

export const updateEmployeeDevice = async (employeeId, deviceData) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const device_id =
    typeof deviceData === 'object' && deviceData !== null
      ? deviceData.device_id || deviceData.deviceId || deviceData.id
      : deviceData;

  try {
    const response = await axios.patch(
      `${BASE_URL}/employees/${employeeId}/device`,
      { device_id },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      statusCode: error.response?.status || 500,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to update employee device',
      errors: null
    };
  }
};

export const updateEmployeeHOD = async (employeeId, hodData) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const hod_id =
    typeof hodData === 'object' && hodData !== null
      ? hodData.hod_id || hodData.reporting_manager_id || hodData.managerId || hodData.id
      : hodData;

  const payload = {
    employee_id: employeeId,
    hod_id,
    reporting_manager_id: hod_id
  };

  try {
    const response = await axios.patch(
      `${BASE_URL}/employees/hods`,
      payload,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      try {
        const fallbackRes = await axios.patch(
          `${BASE_URL}/employees/${employeeId}/hods`,
          { hod_id, reporting_manager_id: hod_id },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          }
        );
        return fallbackRes.data;
      } catch (err2) {
        if (err2.response?.status === 404) {
          try {
            const fallbackRes2 = await axios.patch(
              `${BASE_URL}/employees/${employeeId}/reporting-manager`,
              { reporting_manager_id: hod_id, hod_id },
              {
                headers: {
                  Authorization: token ? `Bearer ${token}` : '',
                  'Content-Type': 'application/json'
                }
              }
            );
            return fallbackRes2.data;
          } catch (err3) {
            if (err3.response && err3.response.data) return err3.response.data;
          }
        }
        if (err2.response && err2.response.data) return err2.response.data;
      }
    }

    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      statusCode: error.response?.status || 500,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to update HOD',
      errors: null
    };
  }
};

export const updateEmployeeHod = updateEmployeeHOD;
export const updateEmployeeReportingManager = updateEmployeeHOD;

export const updateEmployeeShift = async (employeeId, shiftData) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const shift_id =
    typeof shiftData === 'object' && shiftData !== null
      ? shiftData.shift_id || shiftData.shiftId || shiftData.id
      : shiftData;

  try {
    const response = await axios.patch(
      `${BASE_URL}/employees/${employeeId}/shift`,
      { shift_id },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      statusCode: error.response?.status || 500,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to update employee shift',
      errors: null
    };
  }
};

export const getDesignations = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');
  try {
    const response = await axios.get(`${BASE_URL}/designations`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    const resData = response?.data?.data || response?.data || [];
    const list = Array.isArray(resData?.items)
      ? resData.items
      : Array.isArray(resData)
        ? resData
        : [];

    return list.map((item) => {
      if (typeof item === 'string') return { id: item, name: item };
      return {
        id: item.id || item._id || item.designation_id || item.name,
        name: item.name || item.designation || item.designation_name || item.title || item.role_name || item.id,
        ...item
      };
    });
  } catch (error) {
    console.error('Failed to fetch designations:', error);
    return [];
  }
};

export const getDepartments = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');
  try {
    const response = await axios.get(`${BASE_URL}/departments`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    const resData = response?.data?.data || response?.data || [];
    const list = Array.isArray(resData?.items)
      ? resData.items
      : Array.isArray(resData)
        ? resData
        : [];

    return list.map((dept) => {
      if (typeof dept === 'string') return { id: dept, name: dept };
      return {
        id: dept.id || dept._id || dept.department_id || dept.name,
        name: dept.name || dept.department_name || dept.title || dept.id,
        ...dept
      };
    });
  } catch (error) {
    console.error('Failed to fetch departments from API:', error);
    return [];
  }
};

export const getHODs = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');
  try {
    const response = await axios.get(`${BASE_URL}/employees/hods`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    const resData = response?.data?.data || response?.data || [];
    const list = Array.isArray(resData?.items)
      ? resData.items
      : Array.isArray(resData)
        ? resData
        : [];

    return list.map((item) => {
      if (typeof item === 'string') return { id: item, name: item };
      const id = item.id || item._id || item.hod_id || item.employee_id || item.uid || item.name;
      const name =
        item.full_name ||
        item.name ||
        item.hod_name ||
        item.employee_name ||
        item.designation ||
        item.title ||
        id;
      return {
        id,
        name,
        department: item.department || item.department_name || '',
        designation: item.designation || item.designation_name || '',
        ...item
      };
    });
  } catch (error) {
    console.error('Failed to fetch HODs from API:', error);
    return [];
  }
};

export const getHods = getHODs;
export const getManagers = getHODs;

export const getShifts = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');
  try {
    const response = await axios.get(`${BASE_URL}/shifts`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    const resData = response?.data?.data || response?.data || [];
    const list = Array.isArray(resData?.items)
      ? resData.items
      : Array.isArray(resData)
        ? resData
        : [];

    return list.map((s) => {
      const shiftId = s.id || s._id || s.shift_id || s.shiftId;
      const startTime = s.startTime || s.start_time || '';
      const endTime = s.endTime || s.end_time || '';
      const timeRange =
        s.timeRange ||
        s.time_range ||
        (startTime && endTime ? `${startTime} - ${endTime}` : '');

      return {
        id: shiftId,
        shift_id: shiftId,
        shiftId: shiftId,
        name: s.name || s.shift_name || s.title || shiftId,
        timeRange,
        startTime,
        endTime,
        raw: s
      };
    });
  } catch (error) {
    console.error('Failed to fetch shifts from API:', error);
    return [];
  }
};

export const getProfileApprovals = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');

  try {
    const response = await axios.get(`${BASE_URL}/profile/approvals`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    const resData = response?.data?.data || response?.data || [];
    const items = Array.isArray(resData?.items)
      ? resData.items
      : Array.isArray(resData)
        ? resData
        : [];

    const mappedApprovals = await Promise.all(
      items.map(async (item, index) => {
        const emp = item.employee || {};
        const rawImage =
          item.picture_url ||
          item.employee_image ||
          emp.image ||
          emp.employee_image ||
          emp.picture_url ||
          '';
        const avatarUrl = await getBlobAvatar(rawImage);

        let submittedDate = '-';
        if (item.submitted_at || item.created_at) {
          try {
            const dateObj = new Date(item.submitted_at || item.created_at);
            if (!isNaN(dateObj.getTime())) {
              submittedDate = dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
            }
          } catch (e) {
            submittedDate = item.submitted_at || '-';
          }
        }

        return {
          id: item.id,
          approvalId: item.id,
          employeeId: emp.id || item.employee_id || item.employeeId || '',
          empId: emp.uid || emp.id || `EMP${String(index + 1).padStart(6, '0')}`,
          name: emp.full_name || emp.name || 'Unnamed Employee',
          avatar: avatarUrl,
          department: emp.department || item.department || 'General',
          departmentId: emp.department_id || emp.departmentId || '',
          designation: emp.designation || item.designation || 'Staff',
          designationId: emp.designation_id || emp.designationId || '',
          mobile: emp.mobile_number || emp.mobile || '-',
          hod: emp.reporting_manager || emp.hod || 'Department HOD',
          shift: emp.current_shift || emp.shift || '-',
          shiftId: emp.current_shift_id || emp.shift_id || item.shift_id || '',
          current_shift_id: emp.current_shift_id || emp.shift_id || item.shift_id || '',
          device: emp.device_assigned || item.device_assigned || '-',
          deviceId: emp.device_id || item.device_id || '',
          device_id: emp.device_id || item.device_id || '',
          submitted: submittedDate,
          rawSubmittedAt: item.submitted_at,
          status: item.status || 'Pending'
        };
      })
    );

    return mappedApprovals;
  } catch (error) {
    console.error('Failed to fetch profile approvals:', error);
    return [];
  }
};

export const approveOrRejectProfile = async (id, { action = 'APPROVE', device_id, shift_id, remarks } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const payload = {
    action
  };

  if (device_id) {
    payload.device_id = device_id;
  }

  if (shift_id) {
    payload.shift_id = shift_id;
  }

  if (remarks !== undefined && remarks !== null && String(remarks).trim() !== '') {
    payload.remarks = String(remarks).trim();
  }

  try {
    const response = await axios.patch(
      `${BASE_URL}/profile/approvals/${id}`,
      payload,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      statusCode: error.response?.status || 500,
      data: null,
      message: error.response?.data?.message || error.message || `Failed to ${action.toLowerCase()} profile`,
      errors: null
    };
  }
};

export const deleteEmployee = async (id) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  try {
    const response = await axios.delete(`${BASE_URL}/users/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      statusCode: error.response?.status || 500,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to delete employee',
      errors: null
    };
  }
};

export const deleteUser = deleteEmployee;

export default {
  getEmployees,
  getAllEmployees,
  exportEmployeesMaster,
  updateEmployeeDevice,
  updateEmployeeReportingManager,
  updateEmployeeHOD,
  updateEmployeeHod,
  updateEmployeeShift,
  deleteEmployee,
  deleteUser,
  getDesignations,
  getDepartments,
  getHODs,
  getHods,
  getManagers,
  getShifts,
  getProfileApprovals,
  approveOrRejectProfile
};
