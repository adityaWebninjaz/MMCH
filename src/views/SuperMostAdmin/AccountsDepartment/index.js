import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material';
import { IconCheck, IconClock } from '@tabler/icons-react';
import { getAccountsDashboardData, MOCK_ACCOUNTS_DASHBOARD } from './Services/accountsDashboardService';

const AccountsDashboard = () => {
  const [data, setData] = useState(MOCK_ACCOUNTS_DASHBOARD);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const response = await getAccountsDashboardData();
        if (response && response.success) {
          setData(response.data);
        }
      } catch (err) {
        console.error('Failed to load accounts dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const payrollStatus = data?.payrollStatus || MOCK_ACCOUNTS_DASHBOARD.payrollStatus;
  const lastCycle = data?.lastCycleSummary || MOCK_ACCOUNTS_DASHBOARD.lastCycleSummary;
  const statutoryProgress = data?.statutoryEntryProgress || MOCK_ACCOUNTS_DASHBOARD.statutoryEntryProgress;
  const pendingReviews = data?.pendingReviews || MOCK_ACCOUNTS_DASHBOARD.pendingReviews;

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
      {/* 2. Main 2x2 Grid of Dashboard Cards */}
      <Grid container spacing={3}>
        {/* Card 1: Payroll Status */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: '24px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              height: { xs: 'auto', md: '285px' },
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxSizing: 'border-box'
            }}
          >
            {/* Card Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0F172A',
                  lineHeight:"100%",
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {payrollStatus.title || 'Payroll Status'}
              </Typography>
              <Chip
                label={payrollStatus.statusBadge || '2 of 5 Complete'}
                size="small"
                sx={{
                  bgcolor: '#DCFCE7',
                  color: '#15803D',
                  fontWeight: 600,
                  fontSize: '12px',
                  borderRadius: '6px',
                  height: '24px',
                  lineHeight:"100%",
                  fontFamily: 'Inter, sans-serif',
                  px: 0.5
                }}
              />
            </Box>

            {/* 5 Process Steps List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, justifyContent: 'space-between' }}>
              {payrollStatus.steps?.map((step) => {
                const isCompleted = step.status === 'completed';
                const isInProgress = step.status === 'in-progress';

                return (
                  <Box
                    key={step.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}
                  >
                    {isCompleted ? (
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '100px',
                          bgcolor: '#DCFCE7',
                          color: '#15803D',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: '6px',
                          boxSizing: 'border-box',
                          flexShrink: 0
                        }}
                      >
                        <IconCheck size={14} stroke={3} />
                      </Box>
                    ) : isInProgress ? (
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '100px',
                          bgcolor: '#FEF9C3',
                          color: '#CA8A04',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: '6px',
                          boxSizing: 'border-box',
                          flexShrink: 0
                        }}
                      >
                        <IconClock size={14} stroke={2.5} />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '100px',
                          bgcolor: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: '6px',
                          boxSizing: 'border-box',
                          flexShrink: 0
                        }}
                      >
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            border: '2px solid #94A3B8',
                            boxSizing: 'border-box'
                          }}
                        />
                      </Box>
                    )}

                    <Typography
                      sx={{
                        fontSize: '15px',
                        fontWeight: isCompleted || isInProgress ? 500 : 500,
                        color: isCompleted || isInProgress ? '#0F172A' : '#64748B',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: "100%"
                      }}
                    >
                      {step.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Card 2: Last Cycle Summary (May 2026) */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: '24px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              height: { xs: 'auto', md: '285px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            {/* Card Header */}
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
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Last Cycle Summary ({lastCycle.cycleName || 'May 2026'})
              </Typography>
              <Chip
                label={lastCycle.status || 'Approved'}
                size="small"
                sx={{
                  bgcolor: '#DCFCE7',
                  color: '#16A34A',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderRadius: '16px',
                  height: '24px',
                  fontFamily: 'Inter, sans-serif',
                  px: 0.5
                }}
              />
            </Box>

            {/* 4 Metric Key-Value Rows */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, flexGrow: 1, justifyContent: 'space-around' }}>
              {/* Row 1: Month */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#64748B', fontSize: '14.5px', fontFamily: 'Inter, sans-serif' }}>
                  Month
                </Typography>
                <Typography sx={{ color: '#0F172A', fontWeight: 600, fontSize: '14.5px', fontFamily: 'Inter, sans-serif' }}>
                  {lastCycle.month || 'June 2025'}
                </Typography>
              </Box>

              {/* Row 2: Final Net Payroll Total */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#64748B', fontSize: '14.5px', fontFamily: 'Inter, sans-serif' }}>
                  Final Net Payroll Total
                </Typography>
                <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: '15px', fontFamily: 'Inter, sans-serif' }}>
                  {lastCycle.finalNetPayrollTotal || '₹ 24,53,890'}
                </Typography>
              </Box>

              {/* Row 3: Export Lock Date */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#64748B', fontSize: '14.5px', fontFamily: 'Inter, sans-serif' }}>
                  Export Lock Date
                </Typography>
                <Typography sx={{ color: '#0F172A', fontWeight: 600, fontSize: '14.5px', fontFamily: 'Inter, sans-serif' }}>
                  {lastCycle.exportLockDate || '18 Jun 2025'}
                </Typography>
              </Box>

              {/* Row 4: Compliance Export */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#64748B', fontSize: '14.5px', fontFamily: 'Inter, sans-serif' }}>
                  Compliance Export
                </Typography>
                <Typography
                  sx={{
                    color: '#16A34A',
                    fontWeight: 700,
                    fontSize: '14.5px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {lastCycle.complianceExport || 'SARAL Validated'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Card 3: Statutory Entry Progress */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: '24px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              height: { xs: 'auto', md: '235px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            {/* Card Header & Subtitle */}
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {statutoryProgress.title || 'Statutory Entry Progress'}
              </Typography>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#64748B',
                  fontFamily: 'Inter, sans-serif',
                  mt: 0.5
                }}
              >
                {statutoryProgress.subtitle || 'TDS requires manual entry — PF/ESIC are formula-driven'}
              </Typography>
            </Box>

            {/* Progress Bars */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, justifyContent: 'space-around' }}>
              {/* Progress Item 1: PF / ESIC */}
              <Box>
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
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#0F172A',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {statutoryProgress.pfEsic?.label || 'PF / ESIC (Formula-driven)'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {statutoryProgress.pfEsic?.statusText || '142 of 150 computed'}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={statutoryProgress.pfEsic?.percentage || 94.67}
                  sx={{
                    height: 7,
                    borderRadius: 4,
                    bgcolor: '#E2E8F0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: '#644EE5'
                    }
                  }}
                />
              </Box>

              {/* Progress Item 2: TDS (Manual Entry) */}
              <Box>
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
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#0F172A',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {statutoryProgress.tds?.label || 'TDS (Manual Entry)'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {statutoryProgress.tds?.statusText || '98 of 150 entered'}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={statutoryProgress.tds?.percentage || 65.33}
                  sx={{
                    height: 7,
                    borderRadius: 4,
                    bgcolor: '#E2E8F0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: '#644EE5'
                    }
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Card 4: Pending Reviews */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: '24px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              height: { xs: 'auto', md: '235px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            {/* Card Header */}
            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {pendingReviews.title || 'Pending Reviews'}
              </Typography>
            </Box>

            {/* Pending Review List Items */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, justifyContent: 'center' }}>
              {pendingReviews.items?.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14.5px',
                      fontWeight: 500,
                      color: '#0F172A',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: '#F1F5F9',
                      color: '#1E293B',
                      fontSize: '13px',
                      fontWeight: 600,
                      px: '14px',
                      py: '4px',
                      borderRadius: '12px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {item.count}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Bottom Alert Banner */}
            <Box
              sx={{
                bgcolor: '#FEE2E2',
                borderRadius: '8px',
                p: '12px 16px',
                mt: 1.5,
                boxSizing: 'border-box'
              }}
            >
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#EF4444',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '18px'
                }}
              >
                {pendingReviews.alertMessage || 'Action required to avoid payroll processing delay'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountsDashboard;
