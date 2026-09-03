import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert
} from '@mui/material';
import {
  IconCheck,
  IconClock,
  IconArrowRight,
  IconUserPlus,
  IconPlayerPlay,
  IconClipboardCheck
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  getHrAdminDashboardData,
  MOCK_HR_ADMIN_DATA
} from '../Services/hrAdminDashboardService';

const HRAdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(MOCK_HR_ADMIN_DATA);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getHrAdminDashboardData();
        if (response && response.success && response.data) {
          setData(response.data);
        }
      } catch (err) {
        console.error('Failed to load HR Admin dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const payrollSteps = data?.payrollCycle?.steps || MOCK_HR_ADMIN_DATA.payrollCycle.steps;
  const pendingActions = data?.pendingActions || MOCK_HR_ADMIN_DATA.pendingActions;
  const attendanceMetrics = data?.attendanceExceptions?.metrics || MOCK_HR_ADMIN_DATA.attendanceExceptions.metrics;
  const attendanceBreakdown = data?.attendanceExceptions?.departmentBreakdown || MOCK_HR_ADMIN_DATA.attendanceExceptions.departmentBreakdown;
  const quickActions = data?.quickActions || MOCK_HR_ADMIN_DATA.quickActions;
  const deductionMatrix = data?.deductionMatrix || MOCK_HR_ADMIN_DATA.deductionMatrix;

  const handleQuickAction = (action) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.action === 'trigger-payroll') {
      setToast({
        open: true,
        message: 'Payroll cycle advance triggered to Pre-Processing stage',
        severity: 'success'
      });
    } else if (action.action === 'review-regularisation') {
      setToast({
        open: true,
        message: 'Opening Regularisation reviews...',
        severity: 'info'
      });
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'current':
        return {
          bgcolor: '#DCFCE7',
          color: '#16A34A'
        };
      case 'submitted':
        return {
          bgcolor: '#DBEAFE',
          color: '#2563EB'
        };
      case 'open':
        return {
          bgcolor: '#FEF3C7',
          color: '#D97706'
        };
      default:
        return {
          bgcolor: '#F1F5F9',
          color: '#475569'
        };
    }
  };

  const renderQuickActionIcon = (iconName) => {
    switch (iconName) {
      case 'user-plus':
        return <IconUserPlus size={20} stroke={1.75} />;
      case 'play':
        return <IconPlayerPlay size={18} stroke={1.75} />;
      case 'checklist':
      default:
        return <IconClipboardCheck size={20} stroke={1.75} />;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        p: { xs: 2, sm: 2.5, md: 3 },
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* 1. Top Card: Payroll Cycle Status */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3, md: 3.5 },
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          mb: 3
        }}
      >
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#1E293B',
            mb: { xs: 3, md: 3.5 }
          }}
        >
          Payroll Cycle Status
        </Typography>

        {/* Horizontal Stepper */}
        <Box
          sx={{
            width: '100%',
            overflowX: 'auto',
            pb: { xs: 1, sm: 0 },
            '::-webkit-scrollbar': { height: '4px' },
            '::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: '4px' }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              position: 'relative',
              minWidth: { xs: '760px', sm: '100%' },
              px: { xs: 1, md: 2 }
            }}
          >
            {payrollSteps.map((step, index) => {
              const isCompleted = step.status === 'completed';
              const isInProgress = step.status === 'in-progress';
              const isLast = index === payrollSteps.length - 1;

              // Determine connecting line color: green for completed steps, gray afterwards
              let lineColor = '#E2E8F0';
              if (index < 3) {
                lineColor = '#86EFAC';
              }

              return (
                <Box
                  key={step.id}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  {/* Connecting Line to next step */}
                  {!isLast && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '14px',
                        left: '50%',
                        width: '100%',
                        height: '2px',
                        bgcolor: lineColor,
                        zIndex: 0
                      }}
                    />
                  )}

                  {/* Step Node Circle */}
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 0 4px #FFFFFF',
                      ...(isCompleted && {
                        bgcolor: '#DCFCE7',
                        color: '#16A34A',
                        border: '1px solid #86EFAC'
                      }),
                      ...(isInProgress && {
                        bgcolor: '#FEF9C3',
                        color: '#CA8A04',
                        border: '1.5px solid #FACC15'
                      }),
                      ...(!isCompleted &&
                        !isInProgress && {
                          bgcolor: '#FFFFFF',
                          border: '1.5px solid #CBD5E1',
                          color: '#94A3B8'
                        })
                    }}
                  >
                    {isCompleted && <IconCheck size={16} stroke={2.5} />}
                    {isInProgress && <IconClock size={15} stroke={2} />}
                    {!isCompleted && !isInProgress && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#E2E8F0'
                        }}
                      />
                    )}
                  </Box>

                  {/* Step Label */}
                  <Typography
                    sx={{
                      mt: 1.5,
                      fontSize: '13px',
                      fontWeight: 500,
                      color: isCompleted || isInProgress ? '#1E293B' : '#64748B',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>

      {/* 2. Main Content Grid: Left Column & Right Column */}
      <Grid container spacing={3}>
        {/* ================= LEFT COLUMN ================= */}
        <Grid item xs={12} lg={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Card: Pending Action Category */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF'
              }}
            >
              <Typography
                sx={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#1E293B',
                  mb: 2.5
                }}
              >
                Pending Action Category
              </Typography>

              <Grid container spacing={2}>
                {pendingActions.map((item) => (
                  <Grid item xs={12} sm={4} key={item.id}>
                    <Box
                      sx={{
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        p: '16px 18px',
                        bgcolor: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '88px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#CBD5E1',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '26px',
                            fontWeight: 700,
                            color: '#0F172A',
                            lineHeight: 1.1
                          }}
                        >
                          {item.count}
                        </Typography>
                        <IconArrowRight size={18} stroke={1.8} style={{ color: '#0F172A' }} />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '13px',
                          color: '#94A3B8',
                          fontWeight: 500,
                          mt: 1.5
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Card: Attendance Exceptions */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF'
              }}
            >
              <Typography
                sx={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#1E293B',
                  mb: 2.5
                }}
              >
                Attendance Exceptions
              </Typography>

              {/* Attendance Metric Sub-Cards */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {attendanceMetrics.map((item) => (
                  <Grid item xs={12} sm={4} key={item.id}>
                    <Box
                      sx={{
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        p: '16px 18px',
                        bgcolor: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '88px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#CBD5E1',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: item.count.includes('/') ? '22px' : '26px',
                            fontWeight: 700,
                            color: '#0F172A',
                            lineHeight: 1.1
                          }}
                        >
                          {item.count}
                        </Typography>
                        <IconArrowRight size={18} stroke={1.8} style={{ color: '#0F172A' }} />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '13px',
                          color: '#94A3B8',
                          fontWeight: 500,
                          mt: 1.5
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Department Missing Punch Table */}
              <TableContainer
                sx={{
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden'
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F1F5F9' }}>
                      <TableCell
                        sx={{
                          py: '12px',
                          px: '20px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1E293B',
                          borderBottom: '1px solid #E2E8F0'
                        }}
                      >
                        Department
                      </TableCell>
                      <TableCell
                        sx={{
                          py: '12px',
                          px: '20px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1E293B',
                          borderBottom: '1px solid #E2E8F0'
                        }}
                      >
                        Missing Punch
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceBreakdown.map((row, idx) => (
                      <TableRow
                        key={idx}
                        sx={{
                          '&:last-child td': { borderBottom: 0 },
                          '&:hover': { bgcolor: '#F8FAFC' }
                        }}
                      >
                        <TableCell
                          sx={{
                            py: '12px',
                            px: '20px',
                            fontSize: '14px',
                            color: '#334155',
                            fontWeight: 500,
                            borderBottom: '1px solid #F1F5F9'
                          }}
                        >
                          {row.department}
                        </TableCell>
                        <TableCell
                          sx={{
                            py: '12px',
                            px: '20px',
                            fontSize: '14px',
                            color: '#334155',
                            fontWeight: 400,
                            borderBottom: '1px solid #F1F5F9'
                          }}
                        >
                          {row.missingPunch}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Grid>

        {/* ================= RIGHT COLUMN ================= */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Card: Quick Actions */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF'
              }}
            >
              <Typography
                sx={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#1E293B',
                  mb: 2.5
                }}
              >
                Quick Actions
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {quickActions.map((action) => (
                  <Box
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    sx={{
                      p: '14px 18px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      bgcolor: '#FFFFFF',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: '#F8FAFC',
                        borderColor: '#CBD5E1',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* Icon square */}
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                          bgcolor: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#475569',
                          flexShrink: 0
                        }}
                      >
                        {renderQuickActionIcon(action.icon)}
                      </Box>
                      {/* Text */}
                      <Box>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#0F172A',
                            lineHeight: 1.2
                          }}
                        >
                          {action.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: '#64748B',
                            fontWeight: 400,
                            mt: 0.4
                          }}
                        >
                          {action.subtitle}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Arrow Right */}
                    <IconArrowRight size={18} stroke={1.8} style={{ color: '#0F172A' }} />
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Card: Deduction Submission Matrix */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF'
              }}
            >
              <Typography
                sx={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#1E293B',
                  mb: 2.5
                }}
              >
                Deduction Submission Matrix
              </Typography>

              {/* Matrix Table */}
              <TableContainer
                sx={{
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden'
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F1F5F9' }}>
                      <TableCell
                        sx={{
                          py: '12px',
                          px: '20px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1E293B',
                          borderBottom: '1px solid #E2E8F0'
                        }}
                      >
                        Department
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          py: '12px',
                          px: '20px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1E293B',
                          borderBottom: '1px solid #E2E8F0'
                        }}
                      >
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deductionMatrix.map((row) => {
                      const badgeStyle = getStatusBadgeStyle(row.status);
                      return (
                        <TableRow
                          key={row.id}
                          sx={{
                            '&:last-child td': { borderBottom: 0 },
                            '&:hover': { bgcolor: '#F8FAFC' }
                          }}
                        >
                          <TableCell
                            sx={{
                              py: '12px',
                              px: '20px',
                              fontSize: '14px',
                              color: '#334155',
                              fontWeight: 500,
                              borderBottom: '1px solid #F1F5F9'
                            }}
                          >
                            {row.department}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              py: '12px',
                              px: '20px',
                              borderBottom: '1px solid #F1F5F9'
                            }}
                          >
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                px: 2,
                                py: '4px',
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: 600,
                                bgcolor: badgeStyle.bgcolor,
                                color: badgeStyle.color,
                                minWidth: '82px'
                              }}
                            >
                              {row.status}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HRAdminDashboard;
