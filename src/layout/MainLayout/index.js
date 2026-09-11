import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar, useMediaQuery } from '@mui/material';

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
    marginLeft: 0,
    width: open ? `calc(100% - ${drawerWidth}px)` : '100%'
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
    padding: '16px'
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
    padding: '16px'
  }
}));

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const dispatch = useDispatch();

  // Desktop drawer state in Redux
  const leftDrawerOpened = useSelector((state) => state.customization?.opened ?? true);

  // Separate mobile drawer modal state (so desktop open=true doesn't open modal drawer on mobile)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Get user role and navigation
  const userRole = Cookies.get('Role') || Cookies.get('role') || 'student';
  const navigation = menuItems.superMostAdmin;

  const handleLeftDrawerToggle = () => {
    if (matchDownMd) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
    }
  };

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Close mobile drawer when resizing up to desktop
  useEffect(() => {
    if (!matchDownMd) {
      setMobileDrawerOpen(false);
    }
  }, [matchDownMd]);

  // Ensure desktop sidebar is opened on desktop by default
  useEffect(() => {
    if (!matchDownMd && !leftDrawerOpened) {
      dispatch({ type: SET_MENU, opened: true });
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
          transition: !matchDownMd && leftDrawerOpened ? theme.transitions.create('width') : 'none',
          zIndex: (theme) => theme.zIndex.drawer + 2
        }}
      >
        <Toolbar sx={{ padding: '0px !important', minHeight: '88px !important', height: '88px' }}>
          <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
        </Toolbar>
      </AppBar>

      {/* drawer */}
      <Sidebar
        drawerOpen={matchDownMd ? mobileDrawerOpen : leftDrawerOpened}
        drawerToggle={handleLeftDrawerToggle}
        roleLower={String(userRole).toLowerCase()}
      />

      {/* main content */}
      <Main theme={theme} open={matchDownMd ? false : leftDrawerOpened}>
        {/* breadcrumb */}
        <Breadcrumbs separator={IconChevronRight} navigation={navigation} icon title rightAlign />
        <Outlet />
      </Main>

      {/* <Customization /> */}
    </Box>
  );
};

export default MainLayout;
