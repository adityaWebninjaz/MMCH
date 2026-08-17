import React, { useState, useEffect, useCallback } from 'react';
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
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';
import { getLeaveReport, exportLeaveReport } from 'services/leaveReportService';
import { getDepartments } from 'services/allEmployeeService';

const DATE_PRESETS = [
  { label: 'All Dates', value: 'all' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Custom Range', value: 'custom' }
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

const LeaveReport = () => {
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
  const [error, setError] = useState(null);

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

  // Export handler (calls /reports/leaves/export with client CSV fallback)
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
      // Fallback: Export loaded rows to CSV
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
          `"${row.status || '-'}"`
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
          mb: '24px'
        }}
      >
        Leave Report
      </Typography>

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

          {/* Date Range Preset */}
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
              Date Range
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

        {/* Action Buttons: Refresh & Export */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* <Button
            variant="outlined"
            onClick={fetchLeaveData}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: '#644EE5' }} /> : <RefreshIcon />}
            sx={{
              borderColor: '#E2E8F0',
              color: '#475569',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '8px',
              height: '40px',
              px: 2,
              '&:hover': {
                borderColor: '#cbd5e1',
                bgcolor: '#f8fafc'
              }
            }}
          >
            Refresh
          </Button> */}

          <Button
            variant="contained"
            onClick={handleExport}
            disabled={exportLoading || loading}
            startIcon={exportLoading ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <FileDownloadIcon />}
            sx={{
              width: '148px',
              height: '36px',
              gap: '8px',
              opacity: 1,
              pt: '6px',
              pr: '16px',
              pb: '6px',
              pl: '16px',
              borderRadius: '6px',
              background: '#644EE5',
              backgroundColor: '#644EE5',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '24px',
              letterSpacing: '0%',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                background: '#533ec7',
                backgroundColor: '#533ec7',
                boxShadow: 'none'
              },
              '&.Mui-disabled': {
                background: 'rgba(100, 78, 229, 0.6)',
                backgroundColor: 'rgba(100, 78, 229, 0.6)',
                color: '#ffffff'
              },
              '& .MuiButton-startIcon': {
                margin: 0
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
                // Color mapping for Status Chips
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
                        label={row.status || 'UNKNOWN'}
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
              <MenuItem value={10} sx={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '20px', letterSpacing: '0%', color: '#1E293B' }}>
                10
              </MenuItem>
              <MenuItem value={20} sx={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '20px', letterSpacing: '0%', color: '#1E293B' }}>
                20
              </MenuItem>
              <MenuItem value={50} sx={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '20px', letterSpacing: '0%', color: '#1E293B' }}>
                50
              </MenuItem>
              <MenuItem value={100} sx={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, lineHeight: '20px', letterSpacing: '0%', color: '#1E293B' }}>
                100
              </MenuItem>
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
    </Box>
  );
};

export default LeaveReport;
