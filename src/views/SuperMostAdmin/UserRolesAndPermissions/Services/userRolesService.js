import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Extracts clean backend error message from server response
 */
export const getApiErrorMessage = (error, defaultMsg = 'An unexpected error occurred') => {
  const resData = error?.response?.data;
  if (!resData) return error?.message || defaultMsg;
  if (typeof resData === 'string') return resData;
  if (resData.message) return resData.message;
  if (resData.error) return typeof resData.error === 'string' ? resData.error : resData.error.message || defaultMsg;
  if (resData.detail) return resData.detail;
  if (Array.isArray(resData.errors) && resData.errors[0]) {
    const err = resData.errors[0];
    return typeof err === 'string' ? err : err?.msg || err?.message || defaultMsg;
  }
  return defaultMsg;
};

const getAuthHeaders = () => {
  const token = Cookies.get('Token') || Cookies.get('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? String(dateStr)
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatRoleName = (name) => {
  if (!name) return '-';
  if (name.includes(' ') && !name.includes('_')) return name;
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bHr\b/g, 'HR')
    .replace(/\bHod\b/g, 'HOD');
};

/**
 * Fetch all roles (GET /roles)
 */
export const getRoles = async () => {
  const response = await axios.get(`${BASE_URL}/roles`, getAuthHeaders());
  const data = response?.data;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.roles)
        ? data.roles
        : Array.isArray(data?.items)
          ? data.items
          : [];
  return { success: true, data: list, raw: data };
};

/**
 * Create a new role (POST /roles)
 */
export const createRole = async (roleData) => {
  const response = await axios.post(`${BASE_URL}/roles`, roleData, getAuthHeaders());
  return response.data;
};

/**
 * Update an existing role (PUT /roles/:id)
 */
export const updateRole = async (roleId, roleData) => {
  const response = await axios.put(`${BASE_URL}/roles/${roleId}`, roleData, getAuthHeaders());
  return response.data;
};

/**
 * Delete a role (DELETE /roles/:id)
 */
export const deleteRole = async (roleId) => {
  const response = await axios.delete(`${BASE_URL}/roles/${roleId}`, getAuthHeaders());
  return response.data;
};

