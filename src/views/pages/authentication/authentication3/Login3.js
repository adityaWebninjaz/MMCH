import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Divider, Grid, Stack, Typography, useMediaQuery, Box } from '@mui/material';

// project imports
import AuthWrapper1 from '../AuthWrapper1';
import AuthCardWrapper from '../AuthCardWrapper';
import AuthLogin from '../auth-forms/AuthLogin';
import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import hostelcrm from '../../../../assets/images/hostel1.png';

// assets

// ================================|| AUTH3 - LOGIN ||================================ //

const Login = () => {
  const theme = useTheme();
  const downMd = useMediaQuery(theme.breakpoints.down('md')); // ≤ 960px
  const downSm = useMediaQuery(theme.breakpoints.down('sm')); // ≤ 600px

  return (
    <AuthWrapper1>
      <Grid container sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: downSm ? 2 : 4
          }}
        >
          <AuthCardWrapper
            sx={{
              width: '100%',
              maxWidth: 400,
              boxShadow: theme.shadows[3],
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              p: downSm ? 2 : 3
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
                  <Typography
                    variant={downSm ? 'h4' : 'h3'}
                    sx={{
                      fontWeight: 700,
                      textAlign: 'center',
                      color: '#240046',
                      fontSize: downSm ? '20px' : '26px'
                    }}
                  >
                    Welcome to PMU Hostel
                  </Typography>
                  <Typography textAlign="center" variant="body2" sx={{ color: 'black' }}>
                    Login to use the platform
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <AuthLogin />
              </Grid>

              {/* <Grid item xs={12}>
                <Divider sx={{ backgroundColor: '#ffffff' }} />
              </Grid> */}

              {/* <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'black' }}>
                  <Link to="/forgot-password" style={{ color: '#240046', textDecoration: 'none' }}>
                    Forgot Password?
                  </Link>
                </Typography>
              </Grid> */}
            </Grid>
          </AuthCardWrapper>
        </Grid>
        {!downMd && (
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
              <Typography
                variant="h2"
                sx={{ color: 'white', fontSize: '24px', fontWeight: '600', textAlign: 'center', marginBottom: '32px' }}
              >
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
        )}
      </Grid>
    </AuthWrapper1>
  );
};

export default Login;
