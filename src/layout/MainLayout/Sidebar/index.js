import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Drawer,
  Stack,
  useMediaQuery,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider
} from '@mui/material';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { removeStoredPermissions } from 'utils/permissionsStorage';
import { BrowserView, MobileView } from 'react-device-detect';

// project imports
import MenuList from './MenuList';
import LogoSection from '../LogoSection';
import { drawerWidth } from 'store/constant';
import { IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { logoutUser } from 'utils/authUtils';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// ==============================|| SIDEBAR DRAWER ||============================== //

const Sidebar = ({ drawerOpen, drawerToggle, window, roleLower }) => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
  };

  const roleFromCookie = (Cookies.get('Role') || Cookies.get('role') || '').toLowerCase();
  const effectiveRole = (roleLower || roleFromCookie || '').toLowerCase();

  const drawer = (
    <>
      {effectiveRole === 'student' ? (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              px: 1.5,
              height: 56,
              minHeight: 56,
              borderBottom: '1px solid',
              borderColor: 'divider',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              bgcolor: 'background.default'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <LogoSection />
            </Box>
            <IconButton aria-label="close sidebar" onClick={drawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1,
              height: 56,
              minHeight: 56,
              borderBottom: '1px solid',
              borderColor: 'divider',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              bgcolor: 'background.default'
            }}
          >
            <LogoSection />
            <IconButton aria-label="close sidebar" onClick={drawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      )}
      <BrowserView>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: !matchUpMd ? 'calc(100vh - 56px)' : 'calc(100vh - 88px)',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
            <PerfectScrollbar
              component="div"
              options={{
                wheelPropagation: false,
                suppressScrollX: true
              }}
              style={{
                height: '100%',
                maxHeight: '100%',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '10px',
                overscrollBehavior: 'contain'
              }}
            >
              <MenuList />
            </PerfectScrollbar>
          </Box>

          <Box sx={{ px: 2, pb: 2 }}>
            <Divider sx={{ mb: 1.25 }} />
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1 }}>
              <ListItemIcon>
                <IconLogout stroke={1.5} size="1.3rem" />
              </ListItemIcon>
              <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
            </ListItemButton>
          </Box>
        </Box>
      </BrowserView>
      <MobileView>
        <Box sx={{ mt: { xs: '20px', sm: '20px', md: 0 }, px: 2, pt: '10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flexGrow: 1 }}>
            <MenuList />
            {/* <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
              <Chip label={process.env.REACT_APP_VERSION} disabled chipcolor="secondary" size="small" sx={{ cursor: 'pointer' }} />
            </Stack> */}
          </Box>
          <Box sx={{ pb: 2 }}>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1 }}>
              <ListItemIcon>
                <IconLogout stroke={1.5} size="1.3rem" />
              </ListItemIcon>
              <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
            </ListItemButton>
          </Box>
        </Box>
      </MobileView>
    </>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, width: matchUpMd ? drawerWidth : 'auto' }} aria-label="mailbox folders">
      <Drawer
        container={container}
        variant={matchUpMd ? 'persistent' : 'temporary'}
        anchor="left"
        open={drawerOpen}
        onClose={drawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: {
              xs: '100%', // Full width on extra small screens
              sm: '280px', // Fixed width on small screens
              md: '280px', // Fixed width on medium screens
              lg: '280px', // Fixed width on large screens
              xl: '280px' // Fixed width on extra large screens
            },
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderRight: '1px solid #CBD5E1',
            display: 'flex',
            flexDirection: 'column',
            [theme.breakpoints.up('md')]: {
              top: '88px'
            }
          }
        }}
        ModalProps={{ keepMounted: true }}
        color="inherit"
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

Sidebar.propTypes = {
  drawerOpen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default Sidebar;
