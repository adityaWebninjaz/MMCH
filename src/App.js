import { useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRoutes, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from 'views/pages/authentication/authentication3/Login3';
import themes from 'themes';
import NavigationScroll from 'layout/NavigationScroll';
import SuperMostAdminRoutes from 'routes/SuperMostAdminRoutes';
import './toastStyles.css';

import MainLayout from 'layout/MainLayout';
import ResetPassword from 'views/pages/authentication/auth-forms/ResetPassword';
import { removeStoredPermissions } from 'utils/permissionsStorage';
import { toast } from 'react-toastify';
import SafeLoginRedirect from 'utils/SafeLoginRedirect';
import ChangePassword from 'layout/MainLayout/Header/ProfileSection/ChangePassword';
import PrivacyPolicy from './views/pages/policy';
import Support from './views/pages/Support';

// ==============================|| APP ROUTES ||============================== //

const AppRoutes = ({ role }) => {
  const effectiveRole = role || Cookies.get('Role') || Cookies.get('role') || '';
  const normalizedRole = String(effectiveRole).toLowerCase().replace(/[^a-z0-9]/g, '');
  const isSuperAdmin = [
    'superadmin',
    'supermostadmin',
    'superadminrole',
    'super_admin',
    'superadminuser'
  ].includes(normalizedRole);

  const routes = isSuperAdmin
    ? SuperMostAdminRoutes.children
    : [{ path: '*', element: <Navigate to="/login" replace /> }];

  const element = useRoutes([
    {
      path: '/',
      element: isSuperAdmin ? <MainLayout /> : <Navigate to="/login" replace />,
      children: routes
    }
  ]);

  return element;
};

const App = () => {
  const customization = useSelector((state) => state.customization);
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(() => Cookies.get('Role') || Cookies.get('role') || '');
  const [hasToken, setHasToken] = useState(() => Boolean(Cookies.get('Token') || Cookies.get('token')));
  const [isTokenExpired, setIsTokenExpired] = useState(() => !(Cookies.get('Token') || Cookies.get('token')));
  const [page, setPage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const [forceChangePassword, setForceChangePassword] = useState(false);
  const isFreshLoginRequest = location.pathname === '/login' && new URLSearchParams(location.search).get('fresh') === 'true';

  // Function to clear localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem('lastVisitedPath');
    localStorage.removeItem('currentPage');
  };

  const clearAuthSession = () => {
    const removeOpts = { path: '/' };
    ['Token', 'token', 'RefreshToken', 'refreshToken', 'Role', 'role', 'user', '_Id', 'isPasswordChanged'].forEach((key) => {
      Cookies.remove(key, removeOpts);
      Cookies.remove(key);
    });
    removeStoredPermissions();
    clearLocalStorage();
  };

  // Function to handle 401 unauthorized - can be called from anywhere
  const handleUnauthorized = () => {
    clearAuthSession();
    setHasToken(false);
    setRole('');
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    window.handleUnauthorized = handleUnauthorized;
  }, [navigate]);

  useEffect(() => {
    if (!isFreshLoginRequest) return;

    clearAuthSession();
    setHasToken(false);
    setRole('');
    setIsTokenExpired(true);
    setForceChangePassword(false);
    setIsInitialized(true);
    navigate('/login', { replace: true });
  }, [isFreshLoginRequest, navigate]);

  useEffect(() => {
    const syncAuthFromCookies = () => {
      const token = Cookies.get('Token') || Cookies.get('token');
      const userRole = Cookies.get('Role') || Cookies.get('role');
      setRole(userRole || '');
      setHasToken(Boolean(token));
      setIsTokenExpired(!token);
    };

    const handleAuthUpdated = () => {
      syncAuthFromCookies();
    };

    window.addEventListener('auth:updated', handleAuthUpdated);
    return () => window.removeEventListener('auth:updated', handleAuthUpdated);
  }, []);

  useEffect(() => {
    const token = Cookies.get('Token') || Cookies.get('token');
    const userRole = Cookies.get('Role') || Cookies.get('role');
    const passwordChanged = Cookies.get('isPasswordChanged');
    setRole(userRole || '');

    const checkToken = () => {
      const normalizedRole = String(userRole || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const isSuperAdmin = [
        'superadmin',
        'supermostadmin',
        'superadminrole',
        'super_admin',
        'superadminuser'
      ].includes(normalizedRole);

      if (token && isSuperAdmin) {
        setHasToken(true);
        setIsTokenExpired(false);
      } else {
        setHasToken(false);
        setIsTokenExpired(true);
        clearLocalStorage();
        if (token && !isSuperAdmin) {
          clearAuthSession();
        }
      }
    };
    checkToken();

    if (token && passwordChanged === 'false') {
      setForceChangePassword(true);
    } else {
      setForceChangePassword(false);
    }
  }, [hasToken, role, navigate]);

  // Load saved page on refresh
  useEffect(() => {
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) {
      setPage(savedPage);
    }
  }, []);

  // Save page whenever it changes
  useEffect(() => {
    localStorage.setItem('currentPage', page);
  }, [page]);

  // Save current path to localStorage whenever location changes
  useEffect(() => {
    if (hasToken && location.pathname !== '/login' && location.pathname !== '/forgot-password') {
      localStorage.setItem('lastVisitedPath', location.pathname);
    }
  }, [location.pathname, hasToken]);

  useEffect(() => {
    if (location.pathname !== '/login') return;
    const flashMessage = sessionStorage.getItem('AUTH_FLASH_SUCCESS');
    if (!flashMessage) return;
    sessionStorage.removeItem('AUTH_FLASH_SUCCESS');
    toast.success(flashMessage);
  }, [location.pathname]);

  useEffect(() => {
    if (forceChangePassword) return;
    const publicPaths = ['/privacy-policy', '/support', '/login'];

    if (publicPaths.includes(location.pathname)) {
      setIsInitialized(true);
      return;
    }

    if (hasToken && !isInitialized) {
      const savedPath = localStorage.getItem('lastVisitedPath');
      const defaultPath = '/supermostadmin/hrms/all-employees';

      if (savedPath && savedPath !== '/login' && savedPath !== '/forgot-password' && savedPath !== '/') {
        navigate(savedPath.startsWith('/supermostadmin') ? savedPath : defaultPath, { replace: true });
      } else {
        navigate(defaultPath, { replace: true });
      }
      setIsInitialized(true);
    }
  }, [hasToken, navigate, isInitialized, role, forceChangePassword, location.pathname]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <ToastContainer enableMultiContainer />
        <NavigationScroll>
          {forceChangePassword ? (
            <ChangePassword open={true} forceReset={true} handleClose={() => setForceChangePassword(true)} />
          ) : (
            <Routes>
              <Route path="/login" element={isFreshLoginRequest || !hasToken ? <Login /> : <SafeLoginRedirect role={role} />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/support" element={<Support />} />
              <Route
                path="/forgot-password"
                element={
                  hasToken ? (
                    <Navigate to="/supermostadmin/hrms/all-employees" replace />
                  ) : (
                    <ResetPassword />
                  )
                }
              />
              {hasToken ? (
                <Route path="/*" element={<AppRoutes role={role} />} />
              ) : (
                <Route path="/*" element={<Navigate to="/login" replace />} />
              )}
            </Routes>
          )}
        </NavigationScroll>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
