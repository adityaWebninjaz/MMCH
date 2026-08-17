import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { getAttendanceReport, exportAttendanceReport } from 'services/attendanceReportService';
import { getDepartments } from 'services/allEmployeeService';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

const AttendanceReport = () => {
  // Filter States
  const [departmentId, setDepartmentId] = useState('');
  const [departmentsList, setDepartmentsList] = useState([]);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Data States
  const [attendanceData, setAttendanceData] = useState([]);
  const [kpis, setKpis] = useState({
    total_employees: 0,
    total_present: 0,
    total_absent: 0,
    total_half_day: 0,
    total_lwp: 0
  });
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch departments list from API on mount
  useEffect(() => {
    let isMounted = true;
    getDepartments()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDepartmentsList(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load departments in AttendanceReport:', err);
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

  // Fetch attendance report data from API
  const fetchAttendanceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAttendanceReport({
        month,
        year,
        department_id: departmentId || undefined,
        search: debouncedSearch || undefined
      });

      const items = res.items || [];
      setAttendanceData(items);
      setKpis(
        res.kpis || {
          total_employees: items.length,
          total_present: 0,
          total_absent: 0,
          total_half_day: 0,
          total_lwp: 0
        }
      );
    } catch (err) {
      console.error('Failed to fetch attendance report:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load attendance report. Please try again.');
      setAttendanceData([]);
      setKpis({
        total_employees: 0,
        total_present: 0,
        total_absent: 0,
        total_half_day: 0,
        total_lwp: 0
      });
    } finally {
      setLoading(false);
    }
  }, [month, year, departmentId, debouncedSearch]);

  useEffect(() => {
    fetchAttendanceData();
    setPage(1);
  }, [fetchAttendanceData]);

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(attendanceData.length / rowsPerPage));

  // Current page rows slice
  const paginatedEmployees = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    return attendanceData.slice(startIdx, startIdx + rowsPerPage);
  }, [attendanceData, page, rowsPerPage]);

  // Export to Excel / CSV handler
  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      await exportAttendanceReport({
        month,
        year,
        department_id: departmentId || undefined,
        search: debouncedSearch || undefined
      });
    } catch (err) {
      console.warn('Backend export failed, generating CSV locally...', err);
      // Fallback: Export loaded rows to CSV
      if (!attendanceData || attendanceData.length === 0) {
        alert('No attendance data available to export.');
        setExportLoading(false);
        return;
      }

      const headers = [
        'Emp ID',
        'Emp Name',
        'Department',
        'Designation',
        'Work Days',
        'Present',
        'Leave',
        'Half',
        'Absent (LWP)',
        'Payable Days'
      ];

      const csvRows = [headers.join(',')];

      attendanceData.forEach((emp) => {
        const row = [
          `"${emp.employee_uid || '-'}"`,
          `"${emp.employee_name || '-'}"`,
          `"${emp.department || '-'}"`,
          `"${emp.designation || '-'}"`,
          emp.total_working_days ?? 0,
          emp.total_present ?? 0,
          emp.total_leaves ?? 0,
          emp.total_half_days ?? 0,
          emp.total_lwp ?? 0,
          emp.total_payable_days ?? 0
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);

      const monthLabel = MONTHS.find((m) => m.value === Number(month))?.label || `Month_${month}`;
      const deptObj = departmentsList.find((d) => d.id === departmentId);
      const deptLabel = deptObj ? deptObj.name.replace(/\s+/g, '_') : 'All_Departments';

      link.setAttribute('download', `Attendance_Report_${deptLabel}_${monthLabel}_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setExportLoading(false);
    }
  };

  const startIndex = attendanceData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, attendanceData.length);

  return (
    <Box sx={{ width: '100%', bgcolor: '#ffffff', minHeight: '100vh', p: 4 }}>
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
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#1E293B',
                fontWeight: 400,
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
                height: '38px',
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

          {/* Month Dropdown */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#1E293B',
                fontWeight: 400,
                mb: '6px',
                display: 'block',
                fontSize: '13px',
                lineHeight: '100%'
              }}
            >
              Month
            </Typography>
            <Select
              value={month}
              onChange={(e) => {
                setMonth(Number(e.target.value));
                setPage(1);
              }}
              sx={{
                borderRadius: '8px',
                bgcolor: '#ffffff',
                height: '38px',
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
              {MONTHS.map((m) => (
                <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.875rem' }}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Year Dropdown */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#1E293B',
                fontWeight: 400,
                mb: '6px',
                display: 'block',
                fontSize: '13px',
                lineHeight: '100%'
              }}
            >
              Year
            </Typography>
            <Select
              value={year}
              onChange={(e) => {
                setYear(Number(e.target.value));
                setPage(1);
              }}
              sx={{
                borderRadius: '8px',
                bgcolor: '#ffffff',
                height: '38px',
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
              {YEARS.map((y) => (
                <MenuItem key={y} value={y} sx={{ fontSize: '0.875rem' }}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Employee Search */}
          <FormControl size="small" sx={{ minWidth: 392 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#1E293B',
                fontWeight: 400,
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
              placeholder="Search by employee UID fragment..."
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(100, 116, 139, 1)', fontSize: 16 }} />
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
                      sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#475569' } }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
              sx={{
                width: 392,
                borderRadius: '8px',
                bgcolor: '#ffffff',
                height: '38px',
                fontSize: '13px',
                fontWeight: 400,
                lineHeight: '100%',
                color: 'rgba(100, 116, 139, 1)',
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

        {/* Action Buttons: Refresh & Export Excel */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* <Button
            variant="outlined"
            onClick={fetchAttendanceData}
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
            onClick={handleExportExcel}
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
            <Button color="inherit" size="small" onClick={fetchAttendanceData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* KPI Cards Row (5 Stat Cards) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(5, 1fr)'
          },
          gap: '12px',
          mb: 3
        }}
      >
        {/* Card 1: Total Employees */}
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
            {loading ? <Skeleton width="50%" height={28} /> : (kpis.total_employees ?? 0).toLocaleString('en-US')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: '8px', fontWeight: 600, fontSize: '13px', lineHeight: '100%' }}>
            Total Employees
          </Typography>
        </Paper>

        {/* Card 2: Present */}
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
            {loading ? <Skeleton width="50%" height={28} /> : (kpis.total_present ?? 0).toLocaleString('en-US')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: '8px', fontWeight: 600, fontSize: '13px', lineHeight: '100%' }}>
            Present
          </Typography>
        </Paper>

        {/* Card 3: Absent */}
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
            {loading ? <Skeleton width="50%" height={28} /> : (kpis.total_absent ?? 0).toLocaleString('en-US')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: '8px', fontWeight: 600, fontSize: '13px', lineHeight: '100%' }}>
            Absent
          </Typography>
        </Paper>

        {/* Card 4: Half-Day */}
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
            {loading ? <Skeleton width="50%" height={28} /> : (kpis.total_half_day ?? kpis.total_half_days ?? 0).toLocaleString('en-US')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: '8px', fontWeight: 600, fontSize: '13px', lineHeight: '100%' }}>
            Half- Day
          </Typography>
        </Paper>

        {/* Card 5: LWP */}
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
            {loading ? <Skeleton width="50%" height={28} /> : (kpis.total_lwp ?? 0).toLocaleString('en-US')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: '8px', fontWeight: 600, fontSize: '13px', lineHeight: '100%' }}>
            LWP
          </Typography>
        </Paper>
      </Box>

      {/* Main Attendance Data Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflowX: 'auto',
          mb: '20px'
        }}
      >
        <Table sx={{ minWidth: 900 }} size="medium">
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
              <TableCell>Designation</TableCell>
              <TableCell align="center">Work Days</TableCell>
              <TableCell align="center">Present</TableCell>
              <TableCell align="center">Leave</TableCell>
              <TableCell align="center">Half</TableCell>
              <TableCell align="center">Absent (LWP)</TableCell>
              <TableCell align="center">Payable Days</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell sx={{ pl: '24px' }}>
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell sx={{ pl: '24px' }}>
                    <Skeleton width={120} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={100} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={40} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={40} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={40} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={40} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={40} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={40} sx={{ mx: 'auto' }} />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((row, index) => (
                <TableRow
                  key={`${row.employee_uid || 'emp'}-${index}`}
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
                  <TableCell sx={{ fontWeight: 500, fontSize: '13px', lineHeight: '100%', color: '#1E293B' }}>
                    {row.employee_uid || '-'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: '13px', lineHeight: '100%' }}>{row.employee_name || '-'}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: '13px', lineHeight: '100%' }}>{row.department || '-'}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: '13px', lineHeight: '100%' }}>{row.designation || '-'}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: '13px', lineHeight: '100%' }} align="center">
                    {row.total_working_days ?? 0}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '13px', lineHeight: '100%', color: '#16A34A' }} align="center">
                    {row.total_present ?? 0}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: '13px', lineHeight: '100%', color: '#D97706' }} align="center">
                    {row.total_leaves ?? 0}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: '13px', lineHeight: '100%', color: '#CA8A04' }} align="center">
                    {row.total_half_days ?? 0}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: '13px', lineHeight: '100%', color: '#DC2626' }} align="center">
                    {row.total_lwp ?? 0}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', lineHeight: '100%', color: '#4F46E5' }} align="center">
                    {row.total_payable_days ?? 0}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6, color: '#64748b' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#475569', mb: 0.5 }}>
                    No employee attendance records found
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Try selecting a different month, year, department, or clearing the search query.
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
          Showing {startIndex}-{endIndex} of {attendanceData.length}
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

export default AttendanceReport;
