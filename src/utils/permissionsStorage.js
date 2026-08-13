import Cookies from 'js-cookie';

export const PERMISSIONS_STORAGE_KEY = 'permissions';

export const normalizeStoredPermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];

  return permissions
    .filter((permission) => permission?.module)
    .map((permission) => ({
      module: permission.module,
      actions: permission.actions || {}
    }));
};

export const setStoredPermissions = (permissions, options) => {
  const compactPermissions = normalizeStoredPermissions(permissions);
  const serialized = JSON.stringify(compactPermissions);

  localStorage.setItem(PERMISSIONS_STORAGE_KEY, serialized);
  Cookies.set(PERMISSIONS_STORAGE_KEY, serialized, options);
};

export const getStoredPermissions = () => {
  try {
    const raw = localStorage.getItem(PERMISSIONS_STORAGE_KEY) || Cookies.get(PERMISSIONS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read stored permissions:', error);
    return [];
  }
};

export const getStoredPermissionActions = (moduleName) => {
  const permission = getStoredPermissions().find((item) => item?.module === moduleName);
  return permission?.actions || {};
};

export const removeStoredPermissions = () => {
  const removeOpts = { path: '/' };
  Cookies.remove(PERMISSIONS_STORAGE_KEY, removeOpts);
  Cookies.remove(PERMISSIONS_STORAGE_KEY);
  localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
};
