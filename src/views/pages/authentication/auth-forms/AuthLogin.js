import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  OutlinedInput
} from '@mui/material';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Formik } from 'formik';
import AnimateButton from 'ui-component/extended/AnimateButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router';

import axios from 'axios';
import Cookies from 'js-cookie';
import { setStoredPermissions } from 'utils/permissionsStorage';

const FirebaseLogin = ({ ...others }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLoginSubmit = async (values) => {
    try {
      setIsSubmitting(true);

      const identifier = (values.email || '').trim();
      const payload = {
        uid: identifier,
        password: values.password
      };

      const response = await axios.post(`${REACT_APP_BACKEND_URL}/auth/login`, payload);

      console.log('Login Response:->', response?.data);

      const responseData = response?.data;
      const token = responseData?.data?.access_token || responseData?.token || responseData?.data?.token;
      const refreshToken = responseData?.data?.refresh_token || responseData?.refreshToken;
      const userData = responseData?.data?.user || responseData?.user || responseData?.student || responseData?.data?.student;

      if (token) {
        const userRole = userData?.role || '';
        const normalizedRole = String(userRole).toLowerCase().replace(/[^a-z0-9]/g, '');
        const isSuperAdmin = [
          'superadmin',
          'supermostadmin',
          'superadminrole',
          'super_admin',
          'superadminuser'
        ].includes(normalizedRole);

        if (!isSuperAdmin) {
          toast.error('Access denied. Only Super Admin is authorized to log in.');
          return;
        }

        let tokenExpiry = undefined;
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken?.exp) {
            tokenExpiry = new Date(decodedToken.exp * 1000);
          }
        } catch (err) {
          console.error('Failed to decode token:', err);
        }

        const cookieOptions = {
          path: '/',
          ...(tokenExpiry ? { expires: tokenExpiry } : {})
        };

        Cookies.set('Token', token, cookieOptions);
        if (refreshToken) {
          Cookies.set('RefreshToken', refreshToken, cookieOptions);
        }
        Cookies.set('_Id', userData?.id || userData?._id || '', cookieOptions);
        Cookies.set('Role', userData?.role || '', cookieOptions);
        Cookies.set('user', JSON.stringify(userData || {}), cookieOptions);
        Cookies.set('isPasswordChanged', userData?.is_password_changed !== false ? 'true' : 'false', cookieOptions);

        if (userData?.permissions) {
          setStoredPermissions(userData.permissions, cookieOptions);
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:updated'));
        }

        toast.success(responseData?.message || 'Login successful!');
        sessionStorage.setItem('FROM_LOGIN', 'true');

        navigate('/supermostadmin/hrms/all-employees');
      }
    } catch (error) {
      console.error('Login Error:', error);
      console.error('Error Response:', error?.response?.data);
      toast.error(error?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: ''
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().max(255).required('Email or Uid is required'),
          password: Yup.string().required('Password is required')
        })}
        onSubmit={handleLoginSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <FormControl
              fullWidth
              error={Boolean(touched.email && errors.email)}
              sx={{
                '& .MuiFormLabel-root': {
                  color: '#000066'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: errors.email ? '#000066' : ''
                  }
                },
                mb: 2
              }}
            >
              <FormLabel htmlFor="outlined-adornment-email-login" sx={{ mb: 0.5 }}>
                Login ID
              </FormLabel>
              <OutlinedInput
                id="outlined-adornment-email-login"
                type="text"
                value={values.email}
                name="email"
                onBlur={handleBlur}
                onChange={handleChange}
                placeholder="Enter Login ID"
              />
              {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
            </FormControl>
            <FormControl
              fullWidth
              error={Boolean(touched.password && errors.password)}
              sx={{
                '& .MuiFormLabel-root': {
                  color: '#000066'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: errors.email ? '#000066' : ''
                  }
                }
              }}
            >
              <FormLabel htmlFor="outlined-adornment-password-login" sx={{ mb: 0.5 }}>
                Password
              </FormLabel>
              <OutlinedInput
                id="outlined-adornment-password-login"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                placeholder="Enter password"
              />
              {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
            </FormControl>

            {/* <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  cursor: 'pointer',
                  p: 3,
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: 1
                }}
                onClick={() => handleCredentialClick(setFieldValue, handleSubmit, values)}
              >
                <Typography variant="h5">Login with Hostel Credentials</Typography>
              </Box>
            </Box> */}

            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <AnimateButton>
                <Button disableElevation disabled={isSubmitting} size="large" type="submit" variant="contained" color="secondary">
                  {isSubmitting ? 'Logging in...' : 'Sign in'}
                </Button>
              </AnimateButton>
            </Box>
          </form>
        )}
      </Formik>
    </>
  );
};

export default FirebaseLogin;
