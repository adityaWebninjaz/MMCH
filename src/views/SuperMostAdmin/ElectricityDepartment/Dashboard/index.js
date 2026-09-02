import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  IconTarget,
  IconHistory
} from '@tabler/icons-react';
import { getElectricityDashboardData } from '../Services/dashboardservices';

const ElectricityDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const response = await getElectricityDashboardData();
        if (response && response.success) {
          setData(response.data);
        }
      } catch (err) {
        console.error('Failed to load electricity dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Safely extract properties with fallbacks
  const entryWindow = data?.entryWindow || {
    isOpen: true,
    daysRemaining: 5,
    message: 'Entry Window Open — Closes in 5 days'
  };

  const currentCycle = data?.currentCycleProgress || {
    title: 'Current Cycle Progress',
    meteredRoomsRead: 18,
    totalMeteredRooms: 22,
    percentage: 72,
    statusText: '18 of 22 metered rooms read',
    note: 'Data collection is ongoing.\nEnsure all hospital departments submit current cycle counts.'
  };

  const fixedBuildings = data?.fixedBuildingsConfirmation || {
    title: 'Fixed Buildings Confirmation',
    status: 'Confirmed',
    confirmedCount: 6,
    totalCount: 6,
    percentage: 100,
    statusText: '6 of 6 fixed buildings confirmed',
    note: 'All ₹750 flat-rate buildings have confirmed their fixed billing for this cycle.'
  };

  const lastCycleUtility = data?.lastCycleSummaryUtility || {
    cycleName: 'May 2026',
    status: 'Approved',
    totalUnitsBilled: '12,450 units',
    totalCharge: '₹ 1,44,420',
    submissionDate: '15 Jun 2026'
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '#ffffff',
        p: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* 1. Top Alert Banner: Entry Window Open */}
      <Box
        sx={{
          width: '100%',
          height: '68px',
          bgcolor: '#DCFCE7',
          border: '1px solid #16A34A',
          borderRadius: '12px',
          px: { xs: 2, sm: 3 },
          py: '16px',
          mb: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxSizing: 'border-box'
        }}
      >
        <Box
          sx={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            bgcolor: '#16A34A',
            flexShrink: 0
          }}
        />
        <Typography
          sx={{
            fontSize: '18px',
            color: '#1E293B',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            lineHeight: '28px'
          }}
        >
          {entryWindow.message || `Entry Window Open — Closes in ${entryWindow.daysRemaining || 5} days`}
        </Typography>
      </Box>

      {/* 2. Middle Row: Three Cards (Current Cycle, Fixed Buildings, Last Cycle Summary Utility) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card 1: Current Cycle Progress */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '20px',
                  mb: 2
                }}
              >
                {currentCycle.title || 'Current Cycle Progress'}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1
                }}
              >
                <Typography
                  sx={{
                    fontSize: '15px',
                    fontWeight: 400,
                    color: '#1E293B',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '18px'
                  }}
                >
                  {currentCycle.statusText || `${currentCycle.meteredRoomsRead || 18} of ${currentCycle.totalMeteredRooms || 22} metered rooms read`}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#644EE5',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {currentCycle.percentage || 72}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={currentCycle.percentage || 72}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#EDE9FE',
                  mb: 2,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: '#644EE5'
                  }
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: '15px',
                fontWeight: 400,
                color: '#1E293B',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '18px'
              }}
            >
              {currentCycle.note || 'Data collection is ongoing.\nEnsure all hospital departments submit current cycle counts.'}
            </Typography>
          </Paper>
        </Grid>

        {/* Card 2: Fixed Buildings Confirmation */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}
              >
                <Typography
                  sx={{
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '20px'
                  }}
                >
                  {fixedBuildings.title || 'Fixed Buildings Confirmation'}
                </Typography>
                <Chip
                  label={fixedBuildings.status || 'Confirmed'}
                  size="small"
                  sx={{
                    bgcolor: '#DFF2DF',
                    color: '#228B22',
                    fontWeight: 600,
                    fontSize: '13px',
                    borderRadius: '16px',
                    height: '24px',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '18px'
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#1E293B',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '18px',
                  mb: 1
                }}
              >
                {fixedBuildings.statusText || `${fixedBuildings.confirmedCount || 6} of ${fixedBuildings.totalCount || 6} fixed buildings confirmed`}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={fixedBuildings.percentage || 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#E2E8F0',
                  mb: 2,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: '#228B22'
                  }
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: '15px',
                fontWeight: 400,
                color: '#1E293B',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '18px'
              }}
            >
              {fixedBuildings.note || 'All ₹750 flat-rate buildings have confirmed their fixed billing for this cycle.'}
            </Typography>
          </Paper>
        </Grid>

        {/* Card 3: Last Cycle Summary (May 2026) - Utilities */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
              }}
            >
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '20px'
                }}
              >
                Last Cycle Summary ({lastCycleUtility.cycleName || 'May 2026'})
              </Typography>
              <Chip
                label={lastCycleUtility.status || 'Approved'}
                size="small"
                sx={{
                  bgcolor: '#DCFCE7',
                  color: '#15803D',
                  fontWeight: 600,
                  fontSize: '16px',
                  borderRadius: '16px',
                  height: '24px',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '18px'
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: '#1E293B', fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                  Total Units Billed
                </Typography>
                <Typography sx={{ color: '#1E293B', fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                  {lastCycleUtility.totalUnitsBilled || '12,450 units'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: '#1E293B', fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                  Total Charge
                </Typography>
                <Typography sx={{ color: '#1E293B', fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                  {lastCycleUtility.totalCharge || '₹ 1,44,420'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: '#1E293B', fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                  Submission Date
                </Typography>
                <Typography sx={{ color: '#1E293B', fontSize: '15px', fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                  {lastCycleUtility.submissionDate || '15 Jun 2026'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 5. Bottom Section: Electricity Module Quick Actions */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 3 },
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxSizing: 'border-box'
        }}
      >
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '24px',
            color: '#1E293B',
            fontFamily: 'Inter, sans-serif',
            mb: 2
          }}
        >
          Electricity Module Quick Actions
        </Typography>

        <Grid container spacing={2}>
          {/* Quick Action 1: Enter Readings */}
          <Grid item xs={12} sm={6}>
            <Box
              onClick={() => navigate('/supermostadmin/electricity/meter-reading-entry')}
              sx={{
                bgcolor: '#F3E8FF',
                borderRadius: '8px',
                p: '16px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                border: '1px solid transparent',
                '&:hover': {
                  bgcolor: '#EDE9FE',
                  borderColor: '#D8B4FE',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1E293B',
                  flexShrink: 0
                }}
              >
                <IconTarget size={24} stroke={2} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '20px'
                  }}
                >
                  Enter Readings
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#1E293B',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '100%',
                    mt: 0.25
                  }}
                >
                  Update utility & meter logs
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quick Action 2: View History */}
          <Grid item xs={12} sm={6}>
            <Box
              onClick={() => navigate('/supermostadmin/electricity/meter-reading-entry')}
              sx={{
                bgcolor: '#F3E8FF',
                borderRadius: '8px',
                p: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                border: '1px solid transparent',
                '&:hover': {
                  bgcolor: '#EDE9FE',
                  borderColor: '#D8B4FE',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1E293B',
                  flexShrink: 0
                }}
              >
                <IconHistory size={24} stroke={2} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '20px'
                  }}
                >
                  View History
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#1E293B',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '100%',
                    mt: 0.25
                  }}
                >
                  View previous cycles & records
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ElectricityDashboard;
