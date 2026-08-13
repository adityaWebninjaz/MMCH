import axios from 'axios';
import Cookies from 'js-cookie';
import { removeStoredPermissions } from './permissionsStorage';

// Function to get current auth token
export const getAuthToken = () => {
  return Cookies.get('Token') || Cookies.get('token') || '';
};

// Function to get auth headers with Bearer token
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

// Function to handle 401 unauthorized responses
export const handleUnauthorizedResponse = (response) => {
  if (response.status === 401) {
    if (window.handleUnauthorized) {
      window.handleUnauthorized();
    }
    return true;
  }
  return false;
};

// Function to clear all local auth cookies and storage
export const clearAuthData = () => {
  const removeOpts = { path: '/' };
  const keys = ['Token', 'token', 'RefreshToken', 'refreshToken', 'Role', 'role', 'user', '_Id', 'isPasswordChanged'];
  keys.forEach((key) => {
    Cookies.remove(key, removeOpts);
    Cookies.remove(key);
  });
  removeStoredPermissions();
  localStorage.removeItem('lastVisitedPath');
  localStorage.removeItem('currentPage');
  sessionStorage.removeItem('FROM_LOGIN');
};

// Function to perform logout by calling /auth/logout API and clearing session
export const logoutUser = async () => {
  const token = Cookies.get('Token') || Cookies.get('token');
  const refreshToken = Cookies.get('RefreshToken') || Cookies.get('refreshToken');
  const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  try {
    if (token && REACT_APP_BACKEND_URL) {
      const payload = refreshToken ? { refresh_token: refreshToken } : {};
      await axios.post(`${REACT_APP_BACKEND_URL}/auth/logout`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error('Logout API Error:', error?.response?.data || error?.message);
  } finally {
    clearAuthData();
    window.location.href = '/login';
  }
};
