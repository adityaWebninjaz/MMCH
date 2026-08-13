import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const SafeLoginRedirect = ({ role }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const effectiveRole = role || Cookies.get('Role') || Cookies.get('role') || '';
    const normalizedRole = String(effectiveRole).toLowerCase().replace(/[^a-z0-9]/g, '');
    const isSuperAdmin = [
      'superadmin',
      'supermostadmin',
      'superadminrole',
      'super_admin',
      'superadminuser'
    ].includes(normalizedRole);

    if (!isSuperAdmin) {
      navigate('/login', { replace: true });
      return;
    }

    const savedPath = localStorage.getItem('lastVisitedPath');
    sessionStorage.removeItem('FROM_LOGIN');

    if (savedPath && savedPath.startsWith('/supermostadmin') && savedPath !== '/login' && savedPath !== '/') {
      navigate(savedPath, { replace: true });
    } else {
      navigate('/supermostadmin/hrms/all-employees', { replace: true });
    }
  }, [role, navigate]);

  return null;
};

export default SafeLoginRedirect;
