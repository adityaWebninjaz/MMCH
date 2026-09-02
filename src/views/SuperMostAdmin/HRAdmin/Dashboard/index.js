import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import {
  IconLayoutGrid,
  IconUsers,
  IconUserCheck,
  IconCalendarOff,
  IconUserPlus
} from '@tabler/icons-react';

const HRAdminDashboard = () => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '#FFFFFF',
        p: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: { xs: '22px', sm: '26px' },
            fontWeight: 700,
            color: '#0F172A',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          HR Admin Dashboard
        </Typography>
        <Typography
          sx={{
            fontSize: '14px',
            color: '#64748B',
            fontFamily: 'Inter, sans-serif',
            mt: 0.5
          }}
        >
          Overview of hospital staff, attendance, employee records, and HR operations
        </Typography>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card 1: Total Employees */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: '20px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#64748B' }}>
                Total Employees
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#644EE5'
                }}
              >
                <IconUsers size={20} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>
              150
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
              Across all hospital wards
            </Typography>
          </Paper>
        </Grid>

        {/* Card 2: Active On Duty */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: '20px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#64748B' }}>
                Active On Duty
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A'
                }}
              >
                <IconUserCheck size={20} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>
              142
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#16A34A' }}>
              94.7% present today
            </Typography>
          </Paper>
        </Grid>

        {/* Card 3: On Leave */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: '20px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#64748B' }}>
                On Leave Today
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F59E0B'
                }}
              >
                <IconCalendarOff size={20} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>
              8
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
              Approved leaves
            </Typography>
          </Paper>
        </Grid>

        {/* Card 4: New Joiners */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: '20px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#64748B' }}>
                New Joiners
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284C7'
                }}
              >
                <IconUserPlus size={20} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>
              5
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#0284C7' }}>
              This month
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Container */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          textAlign: 'center',
          minHeight: '280px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#EDE9FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#644EE5',
            mb: 1
          }}
        >
          <IconLayoutGrid size={28} />
        </Box>
        <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>
          HR Admin Module Ready
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#64748B', maxWidth: '460px' }}>
          Ready for HR dashboard widgets, recruitment, department analytics, and employee metrics.
        </Typography>
      </Paper>
    </Box>
  );
};

export default HRAdminDashboard;
