import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const getEmployees = async ({ search = '', page = 1, limit = 10 } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  const params = {
    page: Number(page) || 1,
    limit: Number(limit) || 10
  };

  if (search && typeof search === 'string' && search.trim() !== '') {
    params.search = search.trim();
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

    const mappedEmployees = items.map((emp) => ({
      id: emp.id,
      empId: emp.uid || '-',
      name: emp.full_name || '-',
      avatar: emp.employee_image || '',
      department: emp.department || '-',
      designation: emp.designation || '-',
      hod: emp.reporting_manager || '-',
      mobile: emp.mobile_number || '-',
      shift: emp.current_shift || '-',
      device: emp.device_assigned || '-',
      status: emp.status || 'active',
      profileStatus: emp.profile_status || 'approved'
    }));

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