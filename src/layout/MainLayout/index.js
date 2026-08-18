import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar, useMediaQuery } from '@mui/material';
import { useEffect } from 'react';

// project imports
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Header from './Header';
import Sidebar from './Sidebar';
import Customization from '../Customization';
import menuItems from 'menu-items';
import { drawerWidth } from 'store/constant';
import { SET_MENU } from 'store/actions';

// assets
import { IconChevronRight } from '@tabler/icons-react';
import { filterMenuByPermissions } from 'utils/filterMenuByPermissions';

// styles
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  ...theme.typography.mainContent,
  marginRight: 0,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  transition: theme.transitions.create(
    'margin',
    open
      ? {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        }
      : {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        }
  ),
  [theme.breakpoints.up('md')]: {
    marginLeft: open ? 0 : -(drawerWidth - 20),
    width: `calc(100% - ${drawerWidth}px)`
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: '20px',
    marginRight: '20px',
    width: 'calc(100% - 40px)', // account for horizontal margins
    padding: '16px'
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    marginRight: 0,
    width: '100%', // full width on very small screens
    padding: '16px'
  }
}));

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  // Handle left drawer
  const leftDrawerOpened = useSelector((state) => state.customization?.opened ?? true);
  const dispatch = useDispatch();

  // Get user role and navigation
  const userRole = Cookies.get('Role') || Cookies.get('role') || 'student';

  // Determine which navigation to show based on role
  const navigation = menuItems.superMostAdmin;
  // Debug: log the sidebar state
  // console.log('Sidebar state:', leftDrawerOpened);
  // console.log('User role:', userRole);
  // console.log('Navigation:', navigation);

  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  };

  // Ensure student sees sidebar hidden by default on small screens (< md)
  useEffect(() => {
    const isStudent = String(userRole).toLowerCase() === 'student';
    if (matchDownMd && isStudent && leftDrawerOpened) {
      dispatch({ type: SET_MENU, opened: false });
    }
  }, [matchDownMd, userRole]);

  // Ensure student sees sidebar visible on medium and larger screens (>= md)
  useEffect(() => {
    const isStudent = String(userRole).toLowerCase() === 'student';
    if (!matchDownMd && isStudent && !leftDrawerOpened) {
      dispatch({ type: SET_MENU, opened: true });
    }
  }, [matchDownMd, userRole, leftDrawerOpened]);

  // Open sidebar automatically for screens wider than md
  useEffect(() => {
    if (!matchDownMd && !leftDrawerOpened) {
      dispatch({ type: SET_MENU, opened: true });
    }
  }, [matchDownMd]);
  // Close sidebar on small screens
  useEffect(() => {
    if (matchDownMd && leftDrawerOpened) {
      dispatch({ type: SET_MENU, opened: false });
    }
  }, [matchDownMd]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* header */}
      <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.default,
          borderBottom: '1px solid #CBD5E1',
          transition: leftDrawerOpened ? theme.transitions.create('width') : 'none',
          zIndex: (theme) => theme.zIndex.drawer + 2
        }}
      >
        <Toolbar sx={{ padding: '0px !important', minHeight: '88px !important', height: '88px' }}>
          <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
        </Toolbar>
      </AppBar>

      {/* drawer */}
      <Sidebar drawerOpen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} roleLower={String(userRole).toLowerCase()} />

      {/* main content */}
      <Main theme={theme} open={leftDrawerOpened}>
        {/* breadcrumb */}
        <Breadcrumbs separator={IconChevronRight} navigation={navigation} icon title rightAlign />
        <Outlet />
      </Main>

      {/* <Customization /> */}
    </Box>
  );
};

export default MainLayout;
