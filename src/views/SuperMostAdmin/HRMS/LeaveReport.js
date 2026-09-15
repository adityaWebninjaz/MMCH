import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon,
  PictureAsPdf as PictureAsPdfIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';
import { getLeaveReport, exportLeaveReport } from 'services/leaveReportService';
import { getDepartments } from 'services/allEmployeeService';
import styles from './LeaveReport.module.css';

const DATE_PRESETS = [
  { label: 'All Dates', value: 'all' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Custom Range', value: 'custom' }
];

const LEAVE_TYPE_OPTIONS = [
  { label: 'June', value: 'June' },
  { label: 'All Leave Types', value: 'all' },
  { label: 'Casual Leave', value: 'Casual Leave' },
  { label: 'Compensatory Off', value: 'Compensatory Off' },
  { label: 'LWP', value: 'LWP' }
];

const INITIAL_LEAVE_BALANCE_DATA = [
  { id: 1, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 2, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 3, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 4, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 5, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 6, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 7, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 8, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 9, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 10, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 11, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 12, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 13, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 14, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 15, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 16, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 17, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 18, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 19, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' },
  { id: 20, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', casualLeave: '08', compensatoryOff: '08', lwp: '08', totalBalance: '14' }
];

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const computePresetDates = (presetKey) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (presetKey === 'this_month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: formatDate(firstDay), to: formatDate(lastDay) };
  }
  if (presetKey === 'last_month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: formatDate(firstDay), to: formatDate(lastDay) };
  }
  if (presetKey === 'last_7_days') {
    const past = new Date(now);
    past.setDate(past.getDate() - 7);
    return { from: formatDate(past), to: formatDate(now) };
  }
  if (presetKey === 'last_30_days') {
    const past = new Date(now);
    past.setDate(past.getDate() - 30);
    return { from: formatDate(past), to: formatDate(now) };
  }
  return { from: '', to: '' };
};

const formatStatusLabel = (status) => {
  if (!status) return '-';
  const str = String(status).trim();
  const upper = str.toUpperCase();
  if (upper === 'PENDING') return 'Pending';
  if (upper === 'APPROVED') return 'Approved';
  if (upper === 'REJECTED') return 'Rejected';
  if (upper === 'CANCELLED') return 'Cancelled';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const LeaveReport = () => {
  // Main Top Switcher: 'leave_balance' | 'leave_application'
  const [mainTab, setMainTab] = useState('leave_application');

  // ================= LEAVE APPLICATION (ORIGINAL) STATES =================
  // Tab State: 'All', 'Pending', 'Approved', 'Rejected', 'Cancelled'
  const [activeTab, setActiveTab] = useState('All');

  // Filter States
  const [departmentId, setDepartmentId] = useState('');
  const [departmentsList, setDepartmentsList] = useState([]);
  const [datePreset, setDatePreset] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Data States
  const [leaveItems, setLeaveItems] = useState([]);
  const [kpis, setKpis] = useState({
    total_requests: 0,
    total_pending: 0,
    total_approved: 0,
    total_rejected: 0
  });
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportPdfLoading, setExportPdfLoading] = useState(false);
  const [error, setError] = useState(null);

  // ================= LEAVE BALANCE STATES =================
  const [balanceDept, setBalanceDept] = useState('All Departments');
  const [balanceLeaveType, setBalanceLeaveType] = useState('June');
  const [balanceSearch, setBalanceSearch] = useState('');
  const [balancePage, setBalancePage] = useState(1);
  const [balanceRowsPerPage, setBalanceRowsPerPage] = useState(10);
  const [balanceExportLoading, setBalanceExportLoading] = useState(false);
  const [balancePdfLoading, setBalancePdfLoading] = useState(false);

  // Filtered Leave Balance Data
  const filteredBalanceData = useMemo(() => {
    return INITIAL_LEAVE_BALANCE_DATA.filter((item) => {
      const matchesSearch =
        !balanceSearch.trim() ||
        item.empId.toLowerCase().includes(balanceSearch.toLowerCase()) ||
        item.empName.toLowerCase().includes(balanceSearch.toLowerCase());
      const matchesDept =
        !balanceDept ||
        balanceDept === 'All Departments' ||
        item.department.toLowerCase() === balanceDept.toLowerCase();
      return matchesSearch && matchesDept;
    });
  }, [balanceSearch, balanceDept]);

  const totalBalanceCount = filteredBalanceData.length;
  const totalBalancePages = Math.max(1, Math.ceil(totalBalanceCount / balanceRowsPerPage));
  const paginatedBalanceData = useMemo(() => {
    const start = (balancePage - 1) * balanceRowsPerPage;
    return filteredBalanceData.slice(start, start + balanceRowsPerPage);
  }, [filteredBalanceData, balancePage, balanceRowsPerPage]);

  const balanceStartIndex = totalBalanceCount === 0 ? 0 : (balancePage - 1) * balanceRowsPerPage + 1;
  const balanceEndIndex = Math.min(balancePage * balanceRowsPerPage, totalBalanceCount);

  // Fetch departments on mount
  useEffect(() => {
    let isMounted = true;
    getDepartments()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDepartmentsList(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load departments in LeaveReport:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Debounce search query (400ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle date preset change
  const handleDatePresetChange = (newPreset) => {
    setDatePreset(newPreset);
    if (newPreset !== 'custom') {
      const dates = computePresetDates(newPreset);
      setFromDate(dates.from);
      setToDate(dates.to);
    }
    setPage(1);
  };

  // Fetch leave report from API
  const fetchLeaveData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const statusParam = activeTab === 'All' ? 'ALL' : activeTab.toUpperCase();

    try {
      const res = await getLeaveReport({
        status: statusParam,
        department_id: departmentId || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        page,
        limit: rowsPerPage,
        search: debouncedSearch || undefined
      });

      const rawItems = res.items || [];
      // Filter out CANCELLED records
      const items = rawItems.filter((item) => (item?.status || '').toUpperCase() !== 'CANCELLED');
      setLeaveItems(items);
      setKpis(
        res.kpis || {
          total_requests: items.length,
          total_pending: 0,
          total_approved: 0,
          total_rejected: 0
        }
      );

      const pagination = res.pagination || {};
      const total = Number(pagination.total ?? items.length) || 0;
      setTotalCount(total);
      setTotalPages(Math.max(1, Number(pagination.totalPages) || Math.ceil(total / rowsPerPage)));
    } catch (err) {
      console.error('Failed to fetch leave report:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load leave report. Please try again.');
      setLeaveItems([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [activeTab, departmentId, fromDate, toDate, page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  // Export Leave Application (Excel / CSV)
  const handleExport = async () => {
    setExportLoading(true);
    const statusParam = activeTab === 'All' ? 'ALL' : activeTab.toUpperCase();

    try {
      await exportLeaveReport({
        status: statusParam,
        department_id: departmentId || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        search: debouncedSearch || undefined
      });
    } catch (err) {
      console.warn('Backend export failed, generating CSV locally...', err);
      if (leaveItems.length === 0) {
        alert('No leave records found to export.');
        setExportLoading(false);
        return;
      }

      const headers = [
        'Emp ID',
        'Emp Name',
        'Department',
        'Leave Category',
        'Leave Type',
        'From Date',
        'To Date',
        'Total Days',
        'Applied Date',
        'Status'
      ];

      const csvRows = [headers.join(',')];

      leaveItems.forEach((row) => {
        const line = [
          `"${row.employee_uid || '-'}"`,
          `"${row.employee_name || '-'}"`,
          `"${row.department || '-'}"`,
          `"${row.leave_category || '-'}"`,
          `"${row.leave_type || '-'}"`,
          `"${row.from_date || '-'}"`,
          `"${row.to_date || '-'}"`,
          row.total_days ?? 0,
          `"${row.applied_date || '-'}"`,
          `"${formatStatusLabel(row.status)}"`
        ];
        csvRows.push(line.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute('download', `Leave_Report_${statusParam}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setExportLoading(false);
    }
  };

  // Export Leave Application PDF (Print fallback)
  const handleExportPdf = () => {
    setExportPdfLoading(true);
    setTimeout(() => {
      window.print();
      setExportPdfLoading(false);
    }, 300);
  };

  // Export Leave Balance Excel / CSV
  const handleBalanceExportExcel = () => {
    setBalanceExportLoading(true);
    try {
      const headers = ['Emp ID', 'Emp Name', 'Department', 'Casual Leave', 'Compensatory Off', 'LWP', 'Total Balance'];
      const csvRows = [headers.join(',')];

      filteredBalanceData.forEach((row) => {
        const line = [
          `"${row.empId}"`,
          `"${row.empName}"`,
          `"${row.department}"`,
          `"${row.casualLeave}"`,
          `"${row.compensatoryOff}"`,
          `"${row.lwp}"`,
          `"${row.totalBalance}"`
        ];
        csvRows.push(line.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute('download', `Leave_Balance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setBalanceExportLoading(false);
    }
  };

  // Export Leave Balance PDF
  const handleBalanceExportPdf = () => {
    setBalancePdfLoading(true);
    setTimeout(() => {
      window.print();
      setBalancePdfLoading(false);
    }, 300);
  };

  const startIndex = totalCount === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, totalCount);

  return (
    <Box sx={{ width: '100%', bgcolor: '#ffffff', minHeight: '100vh', p: 4 }}>
      {/* Title */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: '#0F172A',
          fontSize: '24px',
          lineHeight: '100%',
          mb: '20px'
        }}
      >
        Leave Report
      </Typography>

      {/* Top Segmented Switcher: Leave Balance | Leave Application */}
      <div className={styles.topSwitcherContainer}>
        <button
          type="button"
          className={`${styles.switcherBtn} ${mainTab === 'leave_balance' ? styles.switcherBtnActive : ''}`}
          onClick={() => setMainTab('leave_balance')}
        >
          Leave Balance
        </button>
        <button
          type="button"
          className={`${styles.switcherBtn} ${mainTab === 'leave_application' ? styles.switcherBtnActive : ''}`}
          onClick={() => setMainTab('leave_application')}
        >
          Leave Application
        </button>
      </div>

      {/* ================= 1. LEAVE APPLICATION VIEW ================= */}
      {mainTab === 'leave_application' && (
        <>
          {/* KPI Cards Row (4 Cards) */}
          <Box
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: '12px',
              mb: 3
            }}
          >
            {/* Card 1: Total Application */}
            <Paper
              elevation={0}
              sx={{
                p: '16px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                bgcolor: '#ffffff'
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '24px', lineHeight: '100%' }}>
                {loading ? <Skeleton width="50%" height={28} /> : (kpis.total_requests ?? 0).toLocaleString('en-US')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mt: '8px', fontWeight: 600, fontSize: '13px', lineHeight: '100%' }}>
                Total Application
              </Typography>
            </Paper>

            {/* Card 2: Pending */}
            <Paper
              elevation={0}
              sx={{
                p: '16px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                bgcolor: '#ffffff'
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#D97706', fontSize: '24px', lineHeight: '100%' }}>
                {loading ? <Skeleton width="50%" height={28} /> : (kpis.total_pending ?? 0).toLocaleString('en-US')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mt: '8px', fontWeight: 600, fontSize: '13px', lineHeight: '100%' }}>
                Pending
              </Typography>
            </Paper>

            {/* Card 3: Approved */}
            <Paper
              elevation={0}
              sx={{
                p: '16px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                bgcolor: '#ffffff'
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#16A34A', fontSize: '24px', lineHeight: '100%' }}>
                {loading ? <Skeleton width="50%" height={28} /> : (kpis.total_approved ?? 0).toLocaleString('en-US')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mt: '8px', fontWeight: 600, fontSize: '13px', lineHeight: '100%' }}>
                Approved
              </Typography>
            </Paper>

            {/* Card 4: Rejected */}
            <Paper
              elevation={0}
              sx={{
                p: '16px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                bgcolor: '#ffffff'
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#DC2626', fontSize: '24px', lineHeight: '100%' }}>
                {loading ? <Skeleton width="50%" height={28} /> : (kpis.total_rejected ?? 0).toLocaleString('en-US')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mt: '8px', fontWeight: 600, fontSize: '13px', lineHeight: '100%' }}>
                Rejected
              </Typography>
            </Paper>
          </Box>

          {/* Tabs Row (All, Pending, Approved, Rejected) */}
          <Box sx={{ mb: '24px' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => {
                setActiveTab(newValue);
                setPage(1);
              }}
              sx={{
                minHeight: '38px',
                borderBottom: '1px solid #E2E8F0',
                '& .MuiTabs-indicator': {
                  bgcolor: '#6366f1',
                  height: '3px',
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              {['All', 'Pending', 'Approved', 'Rejected'].map((tabLabel) => (
                <Tab
                  key={tabLabel}
                  value={tabLabel}
                  label={tabLabel}
                  disableRipple
                  sx={{
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 2,
                    py: 0.5,
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: 600,
                    color: activeTab === tabLabel ? '#6366f1' : '#64748b',
                    '&.Mui-selected': {
                      color: '#6366f1'
                    }
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Filter Controls Row */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 2,
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 2, flex: 1 }}>
              {/* Date Preset */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#1E293B',
                    fontWeight: 500,
                    mb: '6px',
                    display: 'block',
                    fontSize: '13px',
                    lineHeight: '100%'
                  }}
                >
                  Date
                </Typography>
                <Select
                  value={datePreset}
                  onChange={(e) => handleDatePresetChange(e.target.value)}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#ffffff',
                    height: '40px',
                    fontSize: '13px',
                    color: '#334155',
                    overflow: 'hidden',
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '13px',
                      color: '#334155',
                      lineHeight: '100%',
                      fontWeight: 400,
                      minHeight: 'auto',
                      py: 0,
                      height: '40px',
                      boxSizing: 'border-box'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      top: 0,
                      '& legend': {
                        display: 'none'
                      }
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: '1.5px' }
                  }}
                >
                  {DATE_PRESETS.map((p) => (
                    <MenuItem key={p.value} value={p.value} sx={{ fontSize: '0.875rem' }}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Custom Date Pickers (Shown when Custom Range is active) */}
              {datePreset === 'custom' && (
                <>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#1E293B',
                        fontWeight: 500,
                        mb: '6px',
                        display: 'block',
                        fontSize: '13px',
                        lineHeight: '100%'
                      }}
                    >
                      From Date
                    </Typography>
                    <OutlinedInput
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        setPage(1);
                      }}
                      sx={{
                        borderRadius: '8px',
                        bgcolor: '#ffffff',
                        height: '40px',
                        fontSize: '13px',
                        overflow: 'hidden',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#cbd5e1',
                          borderRadius: '8px',
                          top: 0,
                          '& legend': {
                            display: 'none'
                          }
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: '1.5px' }
                      }}
                    />
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#1E293B',
                        fontWeight: 500,
                        mb: '6px',
                        display: 'block',
                        fontSize: '13px',
                        lineHeight: '100%'
                      }}
                    >
                      To Date
                    </Typography>
                    <OutlinedInput
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        setPage(1);
                      }}
                      sx={{
                        borderRadius: '8px',
                        bgcolor: '#ffffff',
                        height: '40px',
                        fontSize: '13px',
                        overflow: 'hidden',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#cbd5e1',
                          borderRadius: '8px',
                          top: 0,
                          '& legend': {
                            display: 'none'
                          }
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: '1.5px' }
                      }}
                    />
                  </FormControl>
                </>
              )}

              {/* Department Dropdown */}
              <FormControl size="small" sx={{ minWidth: 190 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#1E293B',
                    fontWeight: 500,
                    mb: '6px',
                    display: 'block',
                    fontSize: '13px',
                    lineHeight: '100%'
                  }}
                >
                  Department
                </Typography>
                <Select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#ffffff',
                    height: '40px',
                    fontSize: '13px',
                    fontWeight: 400,
                    lineHeight: '100%',
                    color: '#1E293B',
                    overflow: 'hidden',
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '13px',
                      color: '#1E293B',
                      lineHeight: '100%',
                      fontWeight: 400,
                      minHeight: 'auto',
                      py: 0,
                      height: '40px',
                      boxSizing: 'border-box'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      top: 0,
                      '& legend': {
                        display: 'none'
                      }
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: '1.5px' }
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: '0.875rem' }}>
                    All Departments
                  </MenuItem>
                  {departmentsList.map((dept) => (
                    <MenuItem key={dept.id || dept.name} value={dept.id} sx={{ fontSize: '0.875rem', borderRadius: '6px' }}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Status Dropdown */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#1E293B',
                    fontWeight: 500,
                    mb: '6px',
                    display: 'block',
                    fontSize: '13px',
                    lineHeight: '100%'
                  }}
                >
                  Status
                </Typography>
                <Select
                  value={activeTab}
                  onChange={(e) => {
                    setActiveTab(e.target.value);
                    setPage(1);
                  }}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#ffffff',
                    height: '40px',
                    fontSize: '13px',
                    color: '#1E293B',
                    overflow: 'hidden',
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '13px',
                      color: '#1E293B',
                      lineHeight: '100%',
                      fontWeight: 400,
                      minHeight: 'auto',
                      py: 0,
                      height: '40px',
                      boxSizing: 'border-box'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      top: 0,
                      '& legend': {
                        display: 'none'
                      }
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: '1.5px' }
                  }}
                >
                  <MenuItem value="All" sx={{ fontSize: '0.875rem' }}>
                    All Status
                  </MenuItem>
                  <MenuItem value="Pending" sx={{ fontSize: '0.875rem' }}>
                    Pending
                  </MenuItem>
                  <MenuItem value="Approved" sx={{ fontSize: '0.875rem' }}>
                    Approved
                  </MenuItem>
                  <MenuItem value="Rejected" sx={{ fontSize: '0.875rem' }}>
                    Rejected
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Employee Search */}
              <FormControl size="small" sx={{ minWidth: 280, flex: 1, maxWidth: 400 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#1E293B',
                    fontWeight: 500,
                    mb: '6px',
                    display: 'block',
                    fontSize: '13px',
                    lineHeight: '100%'
                  }}
                >
                  Employee Search
                </Typography>
                <OutlinedInput
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by ID or name..."
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  }
                  endAdornment={
                    searchQuery ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSearchQuery('');
                            setDebouncedSearch('');
                            setPage(1);
                          }}
                          sx={{ p: '2px', color: '#94a3b8' }}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#ffffff',
                    height: '40px',
                    fontSize: '13px',
                    fontWeight: 400,
                    lineHeight: '100%',
                    color: '#64748B',
                    overflow: 'hidden',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      top: 0,
                      '& legend': {
                        display: 'none'
                      }
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: '1.5px' }
                  }}
                />
              </FormControl>
            </Box>

            {/* Action Buttons: Export PDF & Export Excel */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={handleExportPdf}
                disabled={exportPdfLoading || loading}
                startIcon={exportPdfLoading ? <CircularProgress size={16} /> : <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  height: '38px',
                  borderRadius: '6px',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 2,
                  '&:hover': {
                    borderColor: '#94a3b8',
                    bgcolor: '#f8fafc'
                  }
                }}
              >
                Export PDF
              </Button>

              <Button
                variant="contained"
                onClick={handleExport}
                disabled={exportLoading || loading}
                startIcon={exportLoading ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  height: '38px',
                  borderRadius: '6px',
                  background: '#644EE5',
                  backgroundColor: '#644EE5',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  textTransform: 'none',
                  boxShadow: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 2.25,
                  '&:hover': {
                    background: '#533ec7',
                    backgroundColor: '#533ec7',
                    boxShadow: 'none'
                  }
                }}
              >
                {exportLoading ? 'Exporting...' : 'Export Excel'}
              </Button>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: '8px' }}
              action={
                <Button color="inherit" size="small" onClick={fetchLeaveData}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Main Leave Applications Data Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              overflowX: 'auto',
              mb: '20px'
            }}
          >
            <Table sx={{ minWidth: 950 }} size="medium">
              <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                <TableRow
                  sx={{
                    '& th': {
                      borderBottom: '1px solid #E2E8F0',
                      py: '12px',
                      px: '24px',
                      fontWeight: 600,
                      color: '#16151C',
                      fontSize: '14px',
                      lineHeight: '20px'
                    }
                  }}
                >
                  <TableCell>Emp ID</TableCell>
                  <TableCell>Emp Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Leave Category / Type</TableCell>
                  <TableCell>From Date</TableCell>
                  <TableCell>To Date</TableCell>
                  <TableCell align="center">Total Days</TableCell>
                  <TableCell>Applied Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: rowsPerPage }).map((_, index) => (
                    <TableRow
                      key={`skeleton-${index}`}
                      sx={{
                        '& td': {
                          borderBottom: '1px solid #E2E8F0',
                          py: '12px',
                          px: '24px'
                        }
                      }}
                    >
                      <TableCell>
                        <Skeleton width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={120} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={100} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={120} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={90} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={90} />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton width={30} sx={{ mx: 'auto' }} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={90} />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton width={60} sx={{ mx: 'auto' }} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : leaveItems.length > 0 ? (
                  leaveItems.map((row, index) => {
                    const statusNormalized = (row.status || '').toUpperCase();
                    let chipBg = '#f1f5f9';
                    let chipColor = '#475569';

                    if (statusNormalized === 'APPROVED') {
                      chipBg = '#d1fae5';
                      chipColor = '#15803d';
                    } else if (statusNormalized === 'PENDING') {
                      chipBg = '#fef3c7';
                      chipColor = '#b45309';
                    } else if (statusNormalized === 'REJECTED') {
                      chipBg = '#fee2e2';
                      chipColor = '#dc2626';
                    } else if (statusNormalized === 'CANCELLED') {
                      chipBg = '#f1f5f9';
                      chipColor = '#64748b';
                    }

                    return (
                      <TableRow
                        key={`${row.employee_uid || 'emp'}-${row.applied_date || index}-${index}`}
                        sx={{
                          '&:hover': { bgcolor: '#f8fafc' },
                          '& td': {
                            borderBottom: '1px solid #E2E8F0',
                            py: '10px',
                            px: '24px',
                            fontSize: '13px',
                            color: '#0F172A',
                            lineHeight: '100%',
                            fontWeight: 400
                          }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500, color: '#1E293B' }}>{row.employee_uid || '-'}</TableCell>
                        <TableCell>{row.employee_name || '-'}</TableCell>
                        <TableCell>{row.department || '-'}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#1E293B', lineHeight: '120%' }}>
                            {row.leave_category || '-'}
                          </Typography>
                          {row.leave_type && (
                            <Typography sx={{ fontSize: '11px', color: '#64748B', lineHeight: '120%' }}>{row.leave_type}</Typography>
                          )}
                        </TableCell>
                        <TableCell>{formatDisplayDate(row.from_date)}</TableCell>
                        <TableCell>{formatDisplayDate(row.to_date)}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 500 }}>
                          {row.total_days ?? 0}
                        </TableCell>
                        <TableCell>{formatDisplayDate(row.applied_date)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={formatStatusLabel(row.status)}
                            size="small"
                            sx={{
                              bgcolor: chipBg,
                              color: chipColor,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: '24px',
                              borderRadius: '16px',
                              px: 0.5
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#64748b' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#475569', mb: 0.5 }}>
                        No leave application records found
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        Try adjusting the tab status, date range, department, or clearing the search query.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Bar */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              pt: 1
            }}
          >
            <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#64748B', fontSize: '14px', fontWeight: 400, lineHeight: '20px', letterSpacing: '0%' }}>
              Showing {startIndex}-{endIndex} of {totalCount}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Rows per page */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#1E293B', fontSize: '14px', fontWeight: 500, lineHeight: '20px', letterSpacing: '0%' }}>
                  Rows per page
                </Typography>
                <Select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  size="small"
                  IconComponent={UnfoldMoreIcon}
                  sx={{
                    height: '36px',
                    borderRadius: '6px',
                    bgcolor: '#FFFFFF',
                    color: '#1E293B',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    letterSpacing: '0%',
                    minWidth: '78px',
                    overflow: 'hidden',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D0D5DD',
                      borderRadius: '6px',
                      borderWidth: '1px',
                      top: 0,
                      '& legend': {
                        display: 'none'
                      }
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#94A3B8'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366F1'
                    },
                    '& .MuiSelect-select': {
                      py: '8px',
                      pl: '14px',
                      pr: '34px !important',
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      letterSpacing: '0%',
                      color: '#1E293B'
                    },
                    '& .MuiSelect-icon': {
                      color: '#1E293B',
                      fontSize: '18px',
                      right: '8px'
                    }
                  }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </Box>

              {/* Page counter text */}
              <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#1E293B', fontSize: '14px', fontWeight: 500, lineHeight: '20px', letterSpacing: '0%' }}>
                Page {page} of {totalPages}
              </Typography>

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    p: '4px',
                    color: '#475569',
                    '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' }
                  }}
                >
                  <FirstPageIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    p: '4px',
                    color: '#475569',
                    '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' }
                  }}
                >
                  <NavigateBeforeIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    p: '4px',
                    color: '#475569',
                    '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' }
                  }}
                >
                  <NavigateNextIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  sx={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    p: '4px',
                    color: '#475569',
                    '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' }
                  }}
                >
                  <LastPageIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </>
      )}

      {/* ================= 2. LEAVE BALANCE VIEW (SCREENSHOT 2) ================= */}
      {mainTab === 'leave_balance' && (
        <>
          {/* Leave Balance Filter Row */}
          <div className={styles.filterRow}>
            <div className={styles.filterControls}>
              {/* Department */}
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Department</span>
                <FormControl size="small" sx={{ minWidth: 190 }}>
                  <Select
                    value={balanceDept}
                    onChange={(e) => {
                      setBalanceDept(e.target.value);
                      setBalancePage(1);
                    }}
                    sx={{
                      borderRadius: '8px',
                      bgcolor: '#ffffff',
                      height: '40px',
                      fontSize: '13px',
                      color: '#1E293B',
                      overflow: 'hidden',
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '13px',
                        color: '#1E293B',
                        lineHeight: '100%',
                        fontWeight: 400,
                        minHeight: 'auto',
                        py: 0,
                        height: '40px',
                        boxSizing: 'border-box'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1',
                        borderRadius: '8px',
                        top: 0,
                        '& legend': { display: 'none' }
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: '1.5px' }
                    }}
                  >
                    <MenuItem value="All Departments">All Departments</MenuItem>
                    {departmentsList.map((dept) => (
                      <MenuItem key={dept.id || dept.name} value={dept.name}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Leave Type */}
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Leave Type</span>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select
                    value={balanceLeaveType}
                    onChange={(e) => {
                      setBalanceLeaveType(e.target.value);
                      setBalancePage(1);
                    }}
                    sx={{
                      borderRadius: '8px',
                      bgcolor: '#ffffff',
                      height: '40px',
                      fontSize: '13px',
                      color: '#1E293B',
                      overflow: 'hidden',
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '13px',
                        color: '#1E293B',
                        lineHeight: '100%',
                        fontWeight: 400,
                        minHeight: 'auto',
                        py: 0,
                        height: '40px',
                        boxSizing: 'border-box'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1',
                        borderRadius: '8px',
                        top: 0,
                        '& legend': { display: 'none' }
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: '1.5px' }
                    }}
                  >
                    {LEAVE_TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Employee Search */}
              <div className={styles.filterGroup} style={{ flex: 1, maxWidth: 400 }}>
                <span className={styles.filterLabel}>Employee Search</span>
                <div className={styles.searchInputWrapper}>
                  <span className={styles.searchIcon}>
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by ID or name..."
                    value={balanceSearch}
                    onChange={(e) => {
                      setBalanceSearch(e.target.value);
                      setBalancePage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actions: Export PDF & Export Excel */}
            <div className={styles.actionButtons}>
              <button
                type="button"
                className={styles.exportPdfBtn}
                onClick={handleBalanceExportPdf}
                disabled={balancePdfLoading}
              >
                <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
                <span>Export PDF</span>
              </button>
              <button
                type="button"
                className={styles.exportExcelBtn}
                onClick={handleBalanceExportExcel}
                disabled={balanceExportLoading}
              >
                <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Leave Balance Data Table */}
          <div className={styles.tableContainer}>
            <table className={styles.balanceTable}>
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Emp Name</th>
                  <th>Department</th>
                  <th>Casual Leave</th>
                  <th>Compensatory Off</th>
                  <th>LWP</th>
                  <th>Total Balance</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBalanceData.length > 0 ? (
                  paginatedBalanceData.map((row, index) => (
                    <tr key={`${row.empId}-${index}`}>
                      <td className={styles.empIdCell}>{row.empId}</td>
                      <td>{row.empName}</td>
                      <td>{row.department}</td>
                      <td className={styles.numberCell}>{row.casualLeave}</td>
                      <td className={styles.numberCell}>{row.compensatoryOff}</td>
                      <td className={styles.numberCell}>{row.lwp}</td>
                      <td className={styles.numberCell} style={{ fontWeight: 600 }}>
                        {row.totalBalance}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      No leave balance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Leave Balance Pagination Bar */}
          <div className={styles.paginationRow}>
            <span>
              Showing {balanceStartIndex}-{balanceEndIndex} of {totalBalanceCount}
            </span>

            <div className={styles.paginationControls}>
              <div className={styles.rowsPerPage}>
                <span>Rows per page</span>
                <select
                  className={styles.rowsSelect}
                  value={balanceRowsPerPage}
                  onChange={(e) => {
                    setBalanceRowsPerPage(Number(e.target.value));
                    setBalancePage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <span>
                Page {balancePage} of {totalBalancePages}
              </span>

              <div className={styles.pageNavBtns}>
                <button
                  type="button"
                  className={styles.navBtn}
                  disabled={balancePage === 1}
                  onClick={() => setBalancePage(1)}
                >
                  <FirstPageIcon fontSize="small" />
                </button>
                <button
                  type="button"
                  className={styles.navBtn}
                  disabled={balancePage === 1}
                  onClick={() => setBalancePage((prev) => Math.max(1, prev - 1))}
                >
                  <NavigateBeforeIcon fontSize="small" />
                </button>
                <button
                  type="button"
                  className={styles.navBtn}
                  disabled={balancePage === totalBalancePages}
                  onClick={() => setBalancePage((prev) => Math.min(totalBalancePages, prev + 1))}
                >
                  <NavigateNextIcon fontSize="small" />
                </button>
                <button
                  type="button"
                  className={styles.navBtn}
                  disabled={balancePage === totalBalancePages}
                  onClick={() => setBalancePage(totalBalancePages)}
                >
                  <LastPageIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Box>
  );
};

export default LeaveReport;

