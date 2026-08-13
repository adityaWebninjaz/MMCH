import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Typography,
  IconButton,
  useMediaQuery,
  CircularProgress,
  Box,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ClearIcon from '@mui/icons-material/Clear';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import axios from 'axios';
import { removeStoredPermissions } from 'utils/permissionsStorage';

import hostelcrm from '../../../../assets/images/hostel1.png';
import Logo from 'ui-component/Logo';

const ChangePassword = ({ open, handleClose, forceReset = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = JSON.parse(Cookies.get('user') || '{}');
  const [loading, setLoading] = useState(false);

  const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // ✅ Only one validation rule: passwords must match
  const validationSchema = yup.object({
    currentPassword: yup.string().required('Current password is required'),

    newPassword: yup
      .string()
      .required('New password is required')
      .notOneOf([yup.ref('currentPassword')], 'New password cannot be the same as current password'),

    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'Passwords must match')
      .required('Confirm password is required')
  });

  const handleLogout = () => {
    const removeOpts = { path: '/' };

    Cookies.remove('Token', removeOpts);
    Cookies.remove('_Id', removeOpts);
    Cookies.remove('Role', removeOpts);
    Cookies.remove('role', removeOpts);
    Cookies.remove('isPasswordChanged', removeOpts);
    Cookies.remove('user', removeOpts);
    removeStoredPermissions();

    // Fallback removals for cookies set without explicit path
    Cookies.remove('Token');
    Cookies.remove('_Id');
    Cookies.remove('Role');
    Cookies.remove('role');
    Cookies.remove('isPasswordChanged');
    Cookies.remove('user');

    localStorage.removeItem('lastVisitedPath');
    localStorage.removeItem('currentPage');
    sessionStorage.setItem('AUTH_FLASH_SUCCESS', 'Password updated successfully. Please login again.');

    window.dispatchEvent(new Event('auth:updated'));
    window.location.replace('/login');
  };

  const formik = useFormik({
    initialValues: {
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const role = (Cookies.get('Role') || Cookies.get('role') || '').toLowerCase();
        const payload = {
          oldPassword: values.currentPassword,
          newPassword: values.newPassword
        };
        let response = null;
        if (role?.toLowerCase() === 'student') {
          response = await axios.post(`${REACT_APP_BACKEND_URL}/student/one-time-password-chnage`, payload, {
            headers: { Authorization: `Bearer ${Cookies.get('Token') || ''}` }
          });
        } else {
          response = await axios.post(`${REACT_APP_BACKEND_URL}/student/one-time-user-password-chnage`, payload, {
            headers: { Authorization: `Bearer ${Cookies.get('Token') || ''}` }
          });
        }

        // Axios throws for non-2xx by default, so reaching here means success.
        if (response) {
          toast.success('Password updated successfully. Please login again.');
          handleLogout();
        }
      } catch (error) {
        console.error('Error updating password:', error);
        toast.error(error?.response?.data?.message || 'Something went wrong!');
      } finally {
        setLoading(false);
        formik.resetForm();
      }
    }
  });

  if (!open) return null;

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* LEFT SIDE */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2, md: 0 } // 🔥 spacing on mobile
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 3,
            boxShadow: 3,
            p: 3,
            backgroundColor: '#fff'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: 2
                  }}
                >
                  <Logo />
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ marginTop: '-10px' }}>
                <Stack alignItems="center">
                  <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center', color: '#240046' }}>
                    Welcome to PMU Hostel
                  </Typography>
                  <Typography textAlign="center" variant="body2" sx={{ color: 'black' }}>
                    Change Your Password
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            {!forceReset && (
              <IconButton onClick={() => window.history.back()}>
                <ClearIcon />
              </IconButton>
            )}
          </Box>

          {/* Force Reset Warning */}
          {forceReset && (
            <Box
              sx={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeeba',
                borderRadius: 2,
                p: 1.2,
                mb: 2
              }}
            >
              <Typography variant="body2" sx={{ color: '#856404', textAlign: 'center', fontWeight: 500 }}>
                You must change your password to proceed.
              </Typography>
            </Box>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {/* <TextField fullWidth label="Login ID" disabled size="small" value={formik.values.email} /> */}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  size="small"
                  value={formik.values.currentPassword}
                  onChange={formik.handleChange}
                  error={Boolean(formik.touched.currentPassword && formik.errors.currentPassword)}
                  helperText={formik.touched.currentPassword && formik.errors.currentPassword}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  size="small"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  error={Boolean(formik.touched.newPassword && formik.errors.newPassword)}
                  helperText={formik.touched.newPassword && formik.errors.newPassword}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  size="small"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={Boolean(formik.errors.confirmPassword)}
                  helperText={formik.errors.confirmPassword}
                />
              </Grid>
            </Grid>
          </form>

          {/* Buttons */}
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2
            }}
          >
            <Button
              variant="contained"
              fullWidth={isMobile}
              onClick={formik.handleSubmit}
              disabled={loading}
              sx={{
                backgroundColor: '#673ab7',
                textTransform: 'none',
                fontWeight: 600,
                width: '100%',
                padding: '10px 16px',
                borderRadius: '6px',
                '&:hover': { backgroundColor: '#5b32a5' }
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Update Password'}
            </Button>

            {/* <Button
              variant="outlined"
              color="error"
              fullWidth={isMobile}
              onClick={handleLogout}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Logout
            </Button> */}
          </Box>
        </Box>
      </Grid>

      {/* RIGHT SIDE */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: { xs: 'none', sm: 'none', md: 'flex' }, // 🔥 hides on small screens
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f4f4f4'
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.secondary.main,
            padding: '4px',
            flexDirection: 'column'
          }}
        >
          <Typography variant="h2" sx={{ color: 'white', fontSize: '24px', fontWeight: '600', textAlign: 'center', marginBottom: '32px' }}>
            PMU Hostel Management
          </Typography>
          <Box
            component="img"
            src={hostelcrm}
            alt="Hostel Management"
            sx={{
              maxWidth: '60%',
              maxHeight: '60%',
              objectFit: 'contain',
              borderRadius: '20px'
            }}
          />
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              marginTop: '32px'
            }}
          >
            Hostel Management System <br />
            <span style={{ fontSize: '12px' }}>
              Simplify room allocations, manage reservations, and track hostel operations seamlessly.
            </span>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ChangePassword;
