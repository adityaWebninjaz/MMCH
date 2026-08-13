// material-ui
import { Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project imports
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import Cookies from 'js-cookie';
import { filterMenuByPermissions } from 'utils/filterMenuByPermissions';
import { getStoredPermissions } from 'utils/permissionsStorage';

// ==============================|| SIDEBAR MENU LIST ||============================== //
const MenuList = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [authVersion, setAuthVersion] = useState(0);
  const role = Cookies.get('Role') || Cookies.get('role') || '';
  const roleLower = String(role).toLowerCase();
  const normalizedRole = roleLower.replace(/[^a-z0-9]/g, '');
  const storedPermissions = getStoredPermissions();
  const hasPermissions = Array.isArray(storedPermissions) && storedPermissions.length > 0;

  const isStudentRole = normalizedRole === 'student' || normalizedRole === 'customer';
  const isSuperAdminRole =
    normalizedRole === 'superadmin' ||
    normalizedRole === 'supermostadmin' ||
    normalizedRole === 'admin' ||
    normalizedRole === 'superadminrole' ||
    (!isStudentRole && !hasPermissions);

  const isValidAdminType = (type = '') => {
    const t = String(type).toLowerCase();
    return t === 'superadmin' || t === 'supermostadmin' || t === 'admin';
  };

  console.log('🧩 Current Role:', role, '| Normalized:', normalizedRole, '| isSuperAdminRole:', isSuperAdminRole);
  useEffect(() => {
    const handleAuthUpdated = () => setAuthVersion((prev) => prev + 1);
    window.addEventListener('auth:updated', handleAuthUpdated);
    return () => window.removeEventListener('auth:updated', handleAuthUpdated);
  }, []);

  // === Sub Admin / Student ===
  // === Other roles (admin, warden, janitor, etc.) → Permission-filtered view ===
  const superAdminMenuObj = menuItem.superAdmin?.[0] || menuItem.superMostAdmin?.[0];

  // 🔍 Filter menu items by permissions cookie
  const filteredChildren = useMemo(() => {
    if (isStudentRole || isSuperAdminRole || !superAdminMenuObj) return [];
    const filtered = filterMenuByPermissions(superAdminMenuObj.children, { debug: true });
    return filtered.length > 0 ? filtered : superAdminMenuObj.children;
  }, [isStudentRole, isSuperAdminRole, superAdminMenuObj, authVersion]);

  const filteredMenu = superAdminMenuObj ? [{ ...superAdminMenuObj, children: filteredChildren }] : [];

  console.log(
    '✅ Filtered Sidebar Modules:',
    filteredChildren.map((x) => x.title)
  );

  const allowedUrls = useMemo(() => {
    const urls = [];
    filteredChildren.forEach((item) => {
      if (item?.type === 'item' && item.url) {
        urls.push(item.url);
        if (Array.isArray(item.allowedRoutes)) {
          urls.push(...item.allowedRoutes);
        }
      } else if (item?.type === 'collapse' && Array.isArray(item.children)) {
        item.children.forEach((child) => {
          if (child?.type === 'item' && child.url) {
            urls.push(child.url);
            if (Array.isArray(child.allowedRoutes)) {
              urls.push(...child.allowedRoutes);
            }
          }
        });
      }
    });
    return urls;
  }, [filteredChildren]);

  const firstAllowedUrl = useMemo(() => allowedUrls.find(Boolean) || '', [allowedUrls]);

  useEffect(() => {
    if (isStudentRole || isSuperAdminRole) return;
    if (!firstAllowedUrl) return;
    const isAllowed = allowedUrls.some((url) => pathname === url || pathname.startsWith(`${url}/`));
    if (!isAllowed) {
      navigate(firstAllowedUrl, { replace: true });
    }
  }, [allowedUrls, firstAllowedUrl, isStudentRole, isSuperAdminRole, navigate, pathname]);

  if (isStudentRole) {
    return (
      <>
        {menuItem.subAdmin.map((item) =>
          item.type === 'Customer' ? (
            <NavGroup key={item.id || item.title} item={item} />
          ) : (
            <Typography key={item.id || item.title} variant="h6" color="error" align="center">
              Sub Admin Menu Item Error
            </Typography>
          )
        )}
      </>
    );
  }

  // === Super Admin (full access) ===
  if (isSuperAdminRole) {
    const items = (menuItem.superMostAdmin || menuItem.superAdmin || []).map((item) =>
      isValidAdminType(item.type) ? (
        <NavGroup key={item.id || item.title} item={item} />
      ) : (
        <Typography key={item.id || item.title} variant="h6" color="error" align="center">
          Super Admin Menu Item Error
        </Typography>
      )
    );
    return <>{items}</>;
  }

  if (!superAdminMenuObj) {
    return (
      <Typography variant="h6" color="error" align="center">
        Menu Not Found
      </Typography>
    );
  }

  return (
    <>
      {filteredMenu.map((item) =>
        isValidAdminType(item.type) ? (
          <NavGroup key={item.id || item.title} item={item} />
        ) : (
          <Typography key={item.id || item.title} variant="h6" color="error" align="center">
            Filtered Menu Error
          </Typography>
        )
      )}
    </>
  );
};

export default MenuList;
