import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Box, ButtonBase, Typography } from '@mui/material';

// project imports
import LogoSection from '../LogoSection';
import SearchSection from './SearchSection';
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';
import Cookies from 'js-cookie';

// assets
import { IconMenu2 } from '@tabler/icons-react';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();

  const capitalizeWords = (value = '') =>
    String(value)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  const resolveUserDisplayName = () => {
    const decodeJwtPayload = (jwtToken) => {
      if (!jwtToken || typeof jwtToken !== 'string') return null;
      const parts = jwtToken.split('.');
      if (parts.length !== 3) return null;
      try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const json = atob(padded);
        return JSON.parse(json);
      } catch (error) {
        return null;
      }
    };

    const pickNameFromObject = (obj) => {
      if (!obj || typeof obj !== 'object') return '';
      if (obj?.full_name) return obj.full_name;
      const firstName = obj?.firstname || obj?.firstName || '';
      const lastName = obj?.lastname || obj?.lastName || '';
      const fullFromFirstLast = `${firstName} ${lastName}`.trim();
      if (fullFromFirstLast) return fullFromFirstLast;
      return obj?.name || '';
    };

    try {
      const tokenFromCookie = Cookies.get('Token') || Cookies.get('token');
      const payload = decodeJwtPayload(tokenFromCookie);
      const fromToken = pickNameFromObject(payload);
      if (fromToken) return capitalizeWords(fromToken);
    } catch (error) {
      console.error('Error decoding token for header name:', error);
    }

    try {
      const userCookie = Cookies.get('user');
      if (userCookie) {
        const parsedUser = JSON.parse(userCookie);
        const fromCookie = pickNameFromObject(parsedUser);
        if (fromCookie) return capitalizeWords(fromCookie);
      }
    } catch (error) {
      console.error('Error parsing user cookie:', error);
    }

    return 'Guest';
  };

  let user = {};
  try {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      user = JSON.parse(userCookie);
      console.log('user :', user);
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    user = {};
  }

  const role = (Cookies.get('Role') || '').toLowerCase();
  const userDisplayName = resolveUserDisplayName();

  return (
    <>
      {/* logo & toggler button */}
      <Box
        sx={{
          // width: 228,
          display: 'flex',
          [theme.breakpoints.down('md')]: {
            width: 'auto'
          }
        }}
      >
        {/* Mobile hamburger for students */}

        <ButtonBase
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            display: { xs: 'inline-flex', md: 'none' },
            mr: 1,
            position: 'relative',
            zIndex: (theme) => theme.zIndex.appBar + 1,
            pointerEvents: 'auto'
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              '&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light
              }
            }}
            onClick={handleLeftDrawerToggle}
            color="inherit"
          >
            <IconMenu2 stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase>

        <Box
          component="span"
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <LogoSection />
        </Box>

        {/* <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              '&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light
              }
            }}
            onClick={handleLeftDrawerToggle}
            color="inherit"
          >
            <IconMenu2 stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase> */}
      </Box>

      {user?.role?.toLowerCase() === 'customer' ? (
        <Typography
          variant="h3"
          sx={{
            mx: 5,
            color: '#644EE5',
            display: { xs: 'none', sm: 'none', md: 'block' }
          }}
        >
          {' '}
          Welcome to {user?.hostelName} !
        </Typography>
      ) : (
        <Typography
          variant="h3"
          sx={{
            mx: '96px',
            color: '#644EE5',
            display: { xs: 'none', sm: 'none', md: 'block' }
          }}
        >
          {' '}
          {`${getGreeting()}, ${userDisplayName}!`}
        </Typography>
      )}
      <Box sx={{ flexGrow: 1 }} />

      {/* <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ color: 'grey.600' }}>
          Today is {new Date().toLocaleDateString('en-US', { weekday: 'long' })}, {new Date().toLocaleDateString('en-GB')}
        </Typography>
      </Box> */}

      {/* <Box sx={{ flexGrow: 1 }} /> */}
      {/* <Box sx={{ flexGrow: 1 }} /> */}

      {/* notification & profile */}
      {/* <NotificationSection /> */}
      <ProfileSection />
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;
