import { useState, useRef, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  ClickAwayListener,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  Paper,
  Popper,
  Stack,
  Switch,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import styles from './index.module.css';
// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import userImage from 'assets/images/AdminIcon.svg';
// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import UpgradePlanCard from './UpgradePlanCard';
import User1 from 'assets/images/users/user-round.svg';

// assets
import { IconLogout, IconSearch, IconSettings, IconUser } from '@tabler/icons-react';

import Cookies from 'js-cookie';
import { removeStoredPermissions } from 'utils/permissionsStorage';
import { logoutUser } from 'utils/authUtils';
import axios from 'axios';
import Login from 'views/pages/authentication/authentication3/Login3';
import UserProfile from './Profile';
import ChangePassword from './ChangePassword';
import { camelToCapitalized } from 'utils/camelToCapitalized';

// ==============================|| PROFILE MENU ||============================== //

const ProfileSection = () => {
  const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const theme = useTheme();
  const customization = useSelector((state) => state.customization);
  const navigate = useNavigate();

  const [sdm, setSdm] = useState(true);
  const [value, setValue] = useState('');
  const [notification, setNotification] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);

  const [openDeleteDialog, setDeleteDialog] = useState(false);

  const [adminId, setAdminId] = useState(null);

  const [hostelId, setHostelId] = useState(null);

  const [adminData, setAdminData] = useState(null);
  const [roleLabel, setRoleLabel] = useState('Super Admin');
  const [userName, setUserName] = useState('Super Admin');

  useEffect(() => {
    // Prefer explicit Role cookie
    const roleCookie = Cookies.get('role') || Cookies.get('Role');
    if (roleCookie) {
      setRoleLabel(String(roleCookie).replace(/_/g, ' '));
    }

    // Check for user cookie first
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        if (userData?.full_name) {
          setUserName(userData.full_name);
          return;
        }
        const firstName = userData?.firstname || userData?.firstName || userData?.name;
        const lastName = userData?.lastname || userData?.lastName;

        if (firstName) {
          const fullName = lastName ? `${firstName} ${lastName}` : firstName;
          setUserName(fullName);
          return; // Exit early if we found user data in cookie
        }
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    }

    // Decode JWT for user information
    const token = Cookies.get('Token');
    if (token && token.split('.').length === 3) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const fromToken = payload?.role || payload?.userRole || payload?.scope;
        if (fromToken) setRoleLabel(String(fromToken).replace(/_/g, ' '));

        // Extract user name from JWT token
        const firstName = payload?.firstname || payload?.firstName || payload?.name;
        const lastName = payload?.lastname || payload?.lastName;

        if (firstName) {
          const fullName = lastName ? `${firstName} ${lastName}` : firstName;
          setUserName(fullName);
        }
      } catch (error) {
        console.error('Error decoding JWT:', error);
      }
    }
  }, []);

  // const handleCloseDeleteDialog = () => {
  //   setDeleteDialog(false);
  // };

  // const handleLogout = () => {

  // };

  const handleOpenChangePassword = () => setOpenChangePassword(true);
  const handleCloseChangePassword = () => setOpenChangePassword(false);

  const handleClickOpen = () => setDeleteDialog(true);

  //Get Admin Obj Id Which is Seted In Cookies
  // useEffect(() => {
  //   const HosId = Cookies.get('_Id');
  //   if (HosId) {
  //     setHostelId(HosId);
  //   }
  //   fetchAdminData(HosId);
    const anchorRef = useRef(null);

  const handleLogout = async () => {
    await logoutUser();
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleListItemClick = (event, index, route = '') => {
    setSelectedIndex(index);
    handleClose(event);

    if (route && route !== '') {
      navigate(route);
    }
  };
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const prevOpen = useRef(open);

  const handleOpenForProfile = () => setOpenProfile(true);
  const handleCloseForProfile = () => setOpenProfile(false);

  // useEffect(() => {
  //   if (prevOpen.current === true && open === false) {
  //     anchorRef.current.focus();
  //   }

  //   prevOpen.current = open;
  // }, [open]);

  const fetchAdminData = async (hostelId) => {
    try {
      const response = await axios.get(`${REACT_APP_BACKEND_URL}/hostel/view/${hostelId}`);

      setAdminData(response.data.result);
    } catch (error) {
      console.error('Error fetching enpenses data:', error);
    }
  };

  return (
    <>
      <ChangePassword open={openChangePassword} handleClose={handleCloseChangePassword} />
      <UserProfile open={openProfile} handleClose={handleCloseForProfile} />

      {/* Header trigger styled like the mock: avatar + role + chevron */}
      <Box
        ref={anchorRef}
        onClick={handleToggle}
        className={styles.trigger}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        role="button"
        sx={{ position: 'relative', zIndex: (theme) => theme.zIndex.appBar + 1, pointerEvents: 'auto', cursor: 'pointer' }}
      >
        {/* <Avatar src={User1} className={styles.avatar} /> */}
        {/* <Avatar src={userImage} className={styles.avatar} /> */}
        <div>
          <img src={userImage} alt="user" className={styles.avatar} />
        </div>
        <Typography variant="h4" className={styles.title}>
          {camelToCapitalized(roleLabel)}
        </Typography>
        <KeyboardArrowDownIcon className={styles.chevron} />
      </Box>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 14]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions in={open} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  <Box sx={{ p: 2, paddingBottom: 0 }}>
                    <Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="h4">{getGreeting()},</Typography>
                        <Typography component="span" variant="h4" sx={{ fontWeight: 400, textTransform: 'capitalize' }}>
                          {userName ? userName : 'Guest'}
                        </Typography>
                      </Stack>
                      {adminData && <Typography variant="subtitle2">Admin of {adminData?.hostelName}</Typography>}
                    </Stack>
                  </Box>
                  <Box sx={{ position: 'relative' }}>
                    <style>
                      {`
      /* Scoped only to this component */
      .ps__rail-y, .ps__rail-x {
        opacity: 0 !important;
        visibility: hidden !important;
        display: none !important;
      }
    `}
                    </style>

                    <PerfectScrollbar
                      options={{
                        suppressScrollX: true,
                        wheelPropagation: false
                      }}
                      style={{
                        maxHeight: 'fit-content',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          minHeight: '100%',
                          overflow: 'hidden'
                        }}
                      >
                        <Divider sx={{ my: 0, borderBottomWidth: '1px' }} />

                        <List
                          component="nav"
                          sx={{
                            width: '100%',
                            maxWidth: 350,
                            minWidth: 300,
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: '10px',
                            [theme.breakpoints.down('md')]: {
                              minWidth: '100%'
                            },
                            '& .MuiListItemButton-root': {
                              mt: 0.5
                            }
                          }}
                        >
                          <ListItemButton
                            sx={{ borderRadius: `${customization.borderRadius}px` }}
                            selected={selectedIndex === 4}
                            onClick={handleLogout}
                          >
                            <ListItemIcon>
                              <IconLogout stroke={1.5} size="1.3rem" />
                            </ListItemIcon>
                            <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
                          </ListItemButton>
                          {/* <ListItemButton
                            sx={{ borderRadius: `${customization.borderRadius}px` }}
                            selected={selectedIndex === 4}
                            onClick={handleOpenChangePassword}
                          >
                            <ListItemIcon>
                              <IconSettings stroke={1.5} size="1.3rem" />
                            </ListItemIcon>
                            <ListItemText primary={<Typography variant="body2">Change Password</Typography>} />
                          </ListItemButton> */}
                        </List>
                      </Box>
                    </PerfectScrollbar>
                  </Box>

                  {/* <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 250px)', overflowX: 'hidden' }}>
                    <Box sx={{ p: 2 }}>
                      <Divider />
                      <List
                        component="nav"
                        sx={{
                          width: '100%',
                          maxWidth: 350,
                          minWidth: 300,
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: '10px',
                          [theme.breakpoints.down('md')]: {
                            minWidth: '100%'
                          },
                          '& .MuiListItemButton-root': {
                            mt: 0.5
                          }
                        }}
                      >
                        <ListItemButton
                          sx={{ borderRadius: `${customization.borderRadius}px` }}
                          selected={selectedIndex === 4}
                          onClick={handleOpenForProfile}
                        >
                          <ListItemIcon>
                            <IconUser stroke={1.5} size="1.3rem" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Profile</Typography>} />
                        </ListItemButton>

                        <ListItemButton
                          sx={{ borderRadius: `${customization.borderRadius}px` }}
                          selected={selectedIndex === 4}
                          onClick={handleOpenChangePassword}
                        >
                          <ListItemIcon>
                            <IconSettings stroke={1.5} size="1.3rem" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Change Password</Typography>} />
                        </ListItemButton>

                        <ListItemButton
                          sx={{ borderRadius: `${customization.borderRadius}px` }}
                          selected={selectedIndex === 4}
                          onClick={handleLogout}
                        >
                          <ListItemIcon>
                            <IconLogout stroke={1.5} size="1.3rem" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
                        </ListItemButton>
                      </List>
                    </Box>
                  </PerfectScrollbar> */}
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>

      {/* <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Logout Confirmation</DialogTitle>
        <DialogContent>Are you sure you want to log out?</DialogContent>
        <DialogActions>
          <Button onClick={handleLogout} color="primary">
            Confirm
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
};

export default ProfileSection;
