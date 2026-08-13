import axios from 'axios';
import Cookies from 'js-cookie';
import { removeStoredPermissions } from './permissionsStorage';

const TOKEN_COOKIE_KEY = 'Token';
const AUTH_SKIP_PATTERNS = [
  '/auth/login',
  '/auth/logout',
  '/student/one-time-password-chnage',
  '/student/one-time-user-password-chnage',
  '/privacy-policy',
  '/support'
];

const clearAuthCookies = () => {
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

const handleUnauthorized = () => {
  clearAuthCookies();
  if (typeof window !== 'undefined' && window.handleUnauthorized) {
    window.handleUnauthorized();
  }
};

const shouldSkipAuth = (url = '') => {
  if (!url) return true;
  return AUTH_SKIP_PATTERNS.some((pattern) => url.includes(pattern));
};

export const initRequestInterceptors = () => {
  if (typeof window === 'undefined') return;
  if (window.__permissionsInterceptorInstalled) return;

  const rawFetch = window.fetch.bind(window);

  // Axios Request Interceptor: Attach Bearer Token automatically
  axios.interceptors.request.use((config) => {
    const token = Cookies.get(TOKEN_COOKIE_KEY) || Cookies.get('token');
    const requestUrl = config.url || '';

    if (token && !shouldSkipAuth(requestUrl)) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization && !config.headers.authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Axios Response Interceptor: Handle 401 Unauthorized
  axios.interceptors.response.use(
    (response) => {
      if (response?.status === 401) {
        const url = response?.config?.url || '';
        if (!shouldSkipAuth(url)) {
          handleUnauthorized();
        }
      }
      return response;
    },
    (error) => {
      if (error?.response?.status === 401) {
        const url = error?.config?.url || '';
        if (!shouldSkipAuth(url)) {
          handleUnauthorized();
        }
      }
      return Promise.reject(error);
    }
  );

  // Window Fetch Interceptor: Attach Bearer Token and handle 401
  window.fetch = async (input, init = {}) => {
    const requestUrl = typeof input === 'string' ? input : input?.url || '';
    const token = Cookies.get(TOKEN_COOKIE_KEY) || Cookies.get('token');

    let modifiedInit = { ...init };

    if (token && !shouldSkipAuth(requestUrl)) {
      const headers = new Headers(
        modifiedInit.headers || (typeof input === 'object' && input?.headers ? input.headers : {})
      );
      if (!headers.has('Authorization') && !headers.has('authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      modifiedInit.headers = headers;
    }

    const response = await rawFetch(input, modifiedInit);
    if (response?.status === 401 && !shouldSkipAuth(requestUrl)) {
      handleUnauthorized();
    }
    return response;
  };

  window.__permissionsInterceptorInstalled = true;
};

