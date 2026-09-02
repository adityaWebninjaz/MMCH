import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    LinearProgress,
    Chip,
    Button
} from '@mui/material';
import {
    IconSettings,
    IconHistory
} from '@tabler/icons-react';
import { getFrontOfficeDashboardData } from '../Services/dashboardservices';

const FrontOfficeDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const response = await getFrontOfficeDashboardData();
                if (response && response.success) {
                    setData(response.data);
                }
            } catch (err) {
                console.error('Failed to load front office dashboard data:', err);
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

    const deductionProgress = data?.deductionProgress || {
        title: 'Deduction Progress Overview',
        cycleLabel: 'June 2026 Active Entries',
        statusText: '18 of 42 residents entered',
        current: 18,
        total: 42,
        percentage: 42.85,
        note: 'Once all operational personnel entries are finished, lock the cycle to push records to payroll processing.'
    };

    const lastCycleSummary = data?.lastCycleSummary || {
        cycleName: 'May 2026',
        status: 'Approved',
        employeesCharged: '42 Employee',
        combinedTotal: '₹ 2,84,500',
        submissionDate: '15 Jun 2026'
    };

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100%',
                bgcolor: '#FFFFFF',
                p: { xs: 2, sm: 3, md: 4 },
                boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif'
            }}
        >
            {/* 1. Status Banner: Entry Window Open */}
            <Box
                sx={{
                    width: '100%',
                    minHeight: '77px',
                    bgcolor: '#DCFCE7',
                    border: '1px solid #16A34A',
                    borderRadius: '12px',
                    px: { xs: 2, sm: 2.5 },
                    py: { xs: 2, sm: '20px' },
                    mb: '20px',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    boxSizing: 'border-box'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            bgcolor: '#16A34A',
                            flexShrink: 0
                        }}
                    />
                    <Typography
                        sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '18px',
                            lineHeight: '28px',
                            color: '#1E293B'
                        }}
                    >
                        {entryWindow.message || `Entry Window Open — Closes in ${entryWindow.daysRemaining || 5} days`}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    onClick={() => navigate('/supermostadmin/front-office/charge-entry')}
                    sx={{
                        bgcolor: '#644EE5',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        px: '16px',
                        py: '10px',
                        height: '37px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        lineHeight: '17px',
                        textTransform: 'none',
                        boxShadow: 'none',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                            bgcolor: '#533ec7',
                            boxShadow: 'none'
                        }
                    }}
                >
                    Go to Charge Entry
                </Button>
            </Box>

            {/* 2. KPI Row: Deduction Progress Overview & Last Cycle Summary */}
            <Grid container spacing={3} sx={{ mb: '20px' }}>
                {/* Deduction Progress Overview Card */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: '24px',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            bgcolor: '#FFFFFF',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxSizing: 'border-box',
                            gap: '20px'
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: 'Inter, sans-serif',
                                fontStyle: 'normal',
                                fontWeight: 600,
                                fontSize: '18px',
                                lineHeight: '22px',
                                color: '#0F172A'
                            }}
                        >
                            {deductionProgress.title || 'Deduction Progress Overview'}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontStyle: 'normal',
                                        fontWeight: 500,
                                        fontSize: '15px',
                                        lineHeight: '18px',
                                        color: '#0F172A'
                                    }}
                                >
                                    {deductionProgress.cycleLabel || 'June 2026 Active Entries'}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontStyle: 'normal',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        lineHeight: '18px',
                                        color: '#1E293B'
                                    }}
                                >
                                    {deductionProgress.statusText || '18 of 42 residents entered'}
                                </Typography>
                            </Box>

                            <LinearProgress
                                variant="determinate"
                                value={deductionProgress.percentage ?? (deductionProgress.current / deductionProgress.total) * 100}
                                sx={{
                                    height: '8px',
                                    borderRadius: '99px',
                                    bgcolor: '#E2E8F0',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: '99px',
                                        bgcolor: '#644EE5'
                                    }
                                }}
                            />
                        </Box>

                        <Typography
                            sx={{
                                fontFamily: 'Inter, sans-serif',
                                fontStyle: 'normal',
                                fontWeight: 400,
                                fontSize: '14px',
                                lineHeight: '17px',
                                color: '#64748B'
                            }}
                        >
                            {deductionProgress.note || 'Once all operational personnel entries are finished, lock the cycle to push records to payroll processing.'}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Last Cycle Summary Card */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: '24px',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            bgcolor: '#FFFFFF',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxSizing: 'border-box',
                            gap: '16px'
                        }}
                    >
                        {/* Header with Title & Approved Chip */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontStyle: 'normal',
                                    fontWeight: 500,
                                    fontSize: '18px',
                                    lineHeight: '20px',
                                    textTransform: 'capitalize',
                                    color: '#0F172A'
                                }}
                            >
                                Last Cycle Summary ({lastCycleSummary.cycleName || 'May 2026'})
                            </Typography>
                            <Chip
                                label={lastCycleSummary.status || 'Approved'}
                                size="small"
                                sx={{
                                    bgcolor: '#DCFCE7',
                                    color: '#15803D',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    lineHeight: '18px',
                                    borderRadius: '100px',
                                    height: '30px',
                                    px: '4px',
                                    fontFamily: 'Inter, sans-serif'
                                }}
                            />
                        </Box>

                        {/* Metrics Stack */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 400,
                                        fontSize: '15px',
                                        lineHeight: '20px',
                                        color: '#1E293B'
                                    }}
                                >
                                    Employees Charged
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        lineHeight: '20px',
                                        color: '#1E293B'
                                    }}
                                >
                                    {lastCycleSummary.employeesCharged || '42 Employee'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 400,
                                        fontSize: '15px',
                                        lineHeight: '20px',
                                        color: '#1E293B'
                                    }}
                                >
                                    Combined Deduction Total
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        lineHeight: '20px',
                                        color: '#1E293B'
                                    }}
                                >
                                    {lastCycleSummary.combinedTotal || '₹ 2,84,500'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 400,
                                        fontSize: '15px',
                                        lineHeight: '20px',
                                        color: '#1E293B'
                                    }}
                                >
                                    Submission Date
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        lineHeight: '20px',
                                        color: '#1E293B'
                                    }}
                                >
                                    {lastCycleSummary.submissionDate || '15 Jun 2026'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* 3. Quick Actions Box: Front Office Operations Shortcuts */}
            <Paper
                elevation={0}
                sx={{
                    p: '24px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    boxSizing: 'border-box'
                }}
            >
                <Typography
                    sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '24px',
                        color: '#1E293B',
                        mb: '16px'
                    }}
                >
                    Front Office Operations Shortcuts
                </Typography>

                <Grid container spacing={2}>
                    {/* Shortcut Card 1: Enter Current Cycle Charges */}
                    <Grid item xs={12} md={6}>
                        <Box
                            onClick={() => navigate('/supermostadmin/front-office/charge-entry')}
                            sx={{
                                bgcolor: '#F3E8FF',
                                borderRadius: '8px',
                                p: '16px',
                                minHeight: '71px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                boxSizing: 'border-box',
                                '&:hover': {
                                    bgcolor: '#EDE9FE',
                                    transform: 'translateY(-1px)'
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#1E293B',
                                    flexShrink: 0,
                                    mt: '1px'
                                }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2l8 4.6v9.2L12 20.4l-8-4.6V6.6L12 2z" />
                                    <circle cx="12" cy="11.2" r="3.2" />
                                </svg>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        lineHeight: '20px',
                                        color: '#1E293B'
                                    }}
                                >
                                    Enter Current Cycle Charges
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 400,
                                        fontSize: '14px',
                                        lineHeight: '17px',
                                        color: '#1E293B'
                                    }}
                                >
                                    Update June 2026 front office deductions spreadsheet
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Shortcut Card 2: View Archive Logs */}
                    <Grid item xs={12} md={6}>
                        <Box
                            onClick={() => navigate('/supermostadmin/front-office/charge-entry')}
                            sx={{
                                bgcolor: '#F3E8FF',
                                borderRadius: '8px',
                                p: '16px',
                                minHeight: '71px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                boxSizing: 'border-box',
                                '&:hover': {
                                    bgcolor: '#EDE9FE',
                                    transform: 'translateY(-1px)'
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#1E293B',
                                    flexShrink: 0,
                                    mt: '1px'
                                }}
                            >
                                <IconHistory size={22} stroke={2} color="#1E293B" />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        lineHeight: '20px',
                                        color: '#1E293B'
                                    }}
                                >
                                    View Archive Logs
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 400,
                                        fontSize: '14px',
                                        lineHeight: '17px',
                                        color: '#1E293B'
                                    }}
                                >
                                    Access billing sheets of historical cycles
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default FrontOfficeDashboard;

