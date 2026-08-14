import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// material-ui
import { useTheme } from '@mui/material/styles';
import { 
  Divider, 
  Grid, 
  Stack, 
  Typography, 
  useMediaQuery, 
  Box,
  TextField,
  Button,
  Alert
} from '@mui/material';

// project imports
import AuthWrapper1 from '../AuthWrapper1';
import AuthCardWrapper from '../AuthCardWrapper';
import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import hostelcrm from '../../../../assets/images/hostel1.png';

// ================================|| RESET PASSWORD ||================================ //

const ResetPassword = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  
  console.log('ResetPassword component rendered!'); // Debug log
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      toast.error(emailValidationError);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Replace with your actual API endpoint
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/student/reset-password`, { email });
      
      if (response.data.success) {
        setMessage('Password reset link has been sent to your email');
        toast.success('Password reset link sent successfully!');
      } else {
        setMessage('Failed to send reset link. Please try again.');
        toast.error('Failed to send reset link');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage('An error occurred. Please try again later.');
      toast.error('An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper1>
      <Grid container sx={{ minHeight: '100vh', backgroundColor: theme.palette.primary.light }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <AuthCardWrapper
            sx={{
              maxWidth: 400,
              width: '100%',
              boxShadow: theme.shadows[3],
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper
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
                    {/* Welcome to PMU Hostel */}
                    Welcome to MMCH
                  </Typography>
                  <Typography textAlign="center" variant="body2" sx={{ color: 'black' }}>
                    Reset your password
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter your email address"
                      error={!!emailError}
                      helperText={emailError}
                      disabled={isLoading}
                    />
                    
                    {message && (
                      <Alert severity={message.includes('success') ? 'success' : 'info'}>
                        {message}
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                 
                      disabled={isLoading}
                      variant="contained" 
                      color="secondary"
                    
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </Stack>
                </form>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ backgroundColor: '#ffffff' }} />
              </Grid>

              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'black' }}>
                  {/* Remember your password?{' '} */}
                  <Link to="/login" style={{ color: '#240046', textDecoration: 'none' }}>
                    Back to Login
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </AuthCardWrapper>
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
      
      {/* <AuthFooter /> */}
    </AuthWrapper1>
  );
};

export default ResetPassword;
