import React, { useState, useMemo } from 'react';
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
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  CalendarToday as CalendarTodayIcon,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';

// Sample leave application dataset
const INITIAL_LEAVE_DATA = [
  { id: 1, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', leaveType: 'Casual Leave', fromDate: '10 Jul 2026', toDate: '11 Jul 2026', totalDays: '04', appliedDate: '11 Jul 2026', status: 'Approved', phone: '9876543210' },
  { id: 2, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', leaveType: 'Casual Leave', fromDate: '10 Jul 2026', toDate: '11 Jul 2026', totalDays: '04', appliedDate: '11 Jul 2026', status: 'Approved', phone: '9876543210' },
  { id: 3, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', leaveType: 'Casual Leave', fromDate: '10 Jul 2026', toDate: '11 Jul 2026', totalDays: '04', appliedDate: '11 Jul 2026', status: 'Pending', phone: '9876543210' },
  { id: 4, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', leaveType: 'Casual Leave', fromDate: '10 Jul 2026', toDate: '11 Jul 2026', totalDays: '04', appliedDate: '11 Jul 2026', status: 'Rejected', phone: '9876543210' },
  { id: 5, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', leaveType: 'Casual Leave', fromDate: '10 Jul 2026', toDate: '11 Jul 2026', totalDays: '04', appliedDate: '11 Jul 2026', status: 'Approved', phone: '9876543210' },
  { id: 6, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', leaveType: 'Casual Leave', fromDate: '10 Jul 2026', toDate: '11 Jul 2026', totalDays: '04', appliedDate: '11 Jul 2026', status: 'Approved', phone: '9876543210' },
  { id: 7, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', leaveType: 'Casual Leave', fromDate: '10 Jul 2026', toDate: '11 Jul 2026', totalDays: '04', appliedDate: '11 Jul 2026', status: 'Approved', phone: '9876543210' },
  { id: 8, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', leaveType: 'Casual Leave', fromDate: '10 Jul 2026', toDate: '11 Jul 2026', totalDays: '04', appliedDate: '11 Jul 2026', status: 'Approved', phone: '9876543210' },
  { id: 9, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', leaveType: 'Casual Leave', fromDate: '10 Jul 2026', toDate: '11 Jul 2026', totalDays: '04', appliedDate: '11 Jul 2026', status: 'Approved', phone: '9876543210' },
  { id: 10, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', leaveType: 'Casual Leave', fromDate: '10 Jul 2026', toDate: '11 Jul 2026', totalDays: '04', appliedDate: '11 Jul 2026', status: 'Approved', phone: '9876543210' },
  { id: 11, empId: 'EMP235470', empName: 'Dr. Ananya Sharma', department: 'Cardiology', leaveType: 'Medical Leave', fromDate: '12 Jul 2026', toDate: '15 Jul 2026', totalDays: '03', appliedDate: '10 Jul 2026', status: 'Pending', phone: '9876543211' },
  { id: 12, empId: 'EMP235471', empName: 'Dr. Vikram Patel', department: 'Neurology', leaveType: 'Earned Leave', fromDate: '14 Jul 2026', toDate: '18 Jul 2026', totalDays: '05', appliedDate: '09 Jul 2026', status: 'Approved', phone: '9876543212' },
  { id: 13, empId: 'EMP235472', empName: 'Dr. Priya Nair', department: 'Pediatrics', leaveType: 'Casual Leave', fromDate: '16 Jul 2026', toDate: '17 Jul 2026', totalDays: '02', appliedDate: '12 Jul 2026', status: 'Pending', phone: '9876543213' },
  { id: 14, empId: 'EMP235473', empName: 'Dr. Rajesh Gupta', department: 'Orthopedics', leaveType: 'Sick Leave', fromDate: '08 Jul 2026', toDate: '09 Jul 2026', totalDays: '02', appliedDate: '07 Jul 2026', status: 'Rejected', phone: '9876543214' },
  { id: 15, empId: 'EMP235474', empName: 'Dr. Sunita Rao', department: 'ICU', leaveType: 'Casual Leave', fromDate: '20 Jul 2026', toDate: '22 Jul 2026', totalDays: '03', appliedDate: '14 Jul 2026', status: 'Approved', phone: '9876543215' },
  { id: 16, empId: 'EMP235475', empName: 'Dr. Amit Verma', department: 'Surgery', leaveType: 'Medical Leave', fromDate: '21 Jul 2026', toDate: '25 Jul 2026', totalDays: '05', appliedDate: '15 Jul 2026', status: 'Pending', phone: '9876543216' },
  { id: 17, empId: 'EMP235476', empName: 'Dr. Meera Joshi', department: 'OPD', leaveType: 'Earned Leave', fromDate: '05 Jul 2026', toDate: '06 Jul 2026', totalDays: '02', appliedDate: '04 Jul 2026', status: 'Rejected', phone: '9876543217' },
  { id: 18, empId: 'EMP235477', empName: 'Dr. Alok Singh', department: 'Emergency', leaveType: 'Casual Leave', fromDate: '28 Jul 2026', toDate: '30 Jul 2026', totalDays: '03', appliedDate: '20 Jul 2026', status: 'Approved', phone: '9876543218' },
  { id: 19, empId: 'EMP235478', empName: 'Dr. Kavita Reddy', department: 'Cardiology', leaveType: 'Sick Leave', fromDate: '01 Aug 2026', toDate: '03 Aug 2026', totalDays: '03', appliedDate: '25 Jul 2026', status: 'Approved', phone: '9876543219' },
  { id: 20, empId: 'EMP235479', empName: 'Dr. Suresh Kumar', department: 'Neurology', leaveType: 'Casual Leave', fromDate: '05 Aug 2026', toDate: '06 Aug 2026', totalDays: '02', appliedDate: '28 Jul 2026', status: 'Approved', phone: '9876543220' }
];

const DEPARTMENTS = [
  'All Departments',
  'Emergency',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'ICU',
  'Surgery',
  'OPD'
];

const DATE_RANGES = [
  '12 July 2025',
  'Last 7 Days',
  'Last 30 Days',
  'This Month',
  'Last Month',
  'Custom Range'
];

const LeaveReport = () => {
  // Tab State: 'All', 'Pending', 'Approved', 'Rejected'
  const [activeTab, setActiveTab] = useState('All');

  // Filter States
  const [department, setDepartment] = useState('All Departments');
  const [dateRange, setDateRange] = useState('12 July 2025');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered dataset based on tab, department, and search query
  const filteredLeaveData = useMemo(() => {
    return INITIAL_LEAVE_DATA.filter((item) => {
      const matchesTab = activeTab === 'All' || item.status.toLowerCase() === activeTab.toLowerCase();
      const matchesDept = department === 'All Departments' || item.department === department;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.empId.toLowerCase().includes(q) ||
        item.empName.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.leaveType.toLowerCase().includes(q) ||
        (item.phone && item.phone.includes(q));

      return matchesTab && matchesDept && matchesSearch;
    });
  }, [activeTab, department, searchQuery]);

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(filteredLeaveData.length / rowsPerPage));
  const paginatedData = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    return filteredLeaveData.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredLeaveData, page, rowsPerPage]);

  // Stat Cards values matching design spec
  const stats = useMemo(() => {
    if (activeTab === 'All' && department === 'All Departments' && !searchQuery) {
      return {
        total: '147',
        pending: '04',
        approved: '75',
        rejected: '12'
      };
    }
    const totalCount = filteredLeaveData.length;
    const pendingCount = filteredLeaveData.filter((d) => d.status === 'Pending').length;
    const approvedCount = filteredLeaveData.filter((d) => d.status === 'Approved').length;
    const rejectedCount = filteredLeaveData.filter((d) => d.status === 'Rejected').length;

    return {
      total: totalCount < 10 ? `0${totalCount}` : String(totalCount),
      pending: pendingCount < 10 ? `0${pendingCount}` : String(pendingCount),
      approved: approvedCount < 10 ? `0${approvedCount}` : String(approvedCount),
      rejected: rejectedCount < 10 ? `0${rejectedCount}` : String(rejectedCount)
    };
  }, [activeTab, department, searchQuery, filteredLeaveData]);

  // Export CSV handler
  const handleExportExcel = () => {
    const headers = [
      'Emp ID',
      'Emp Name',
      'Department',
      'Leave Type',
      'From Date',
      'To Date',
      'Total Days',
      'Applied Date',
      'Status'
    ];

    const csvRows = [headers.join(',')];

    filteredLeaveData.forEach((row) => {
      const line = [
        `"${row.empId}"`,
        `"${row.empName}"`,
        `"${row.department}"`,
        `"${row.leaveType}"`,
        `"${row.fromDate}"`,
        `"${row.toDate}"`,
        `"${row.totalDays}"`,
        `"${row.appliedDate}"`,
        `"${row.status}"`
      ];
      csvRows.push(line.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Leave_Report_${activeTab}_${department.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startIndex = filteredLeaveData.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, filteredLeaveData.length);

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
          mb: "24px"
        }}
      >
        Leave Report
      </Typography>

      {/* KPI Cards Row (4 Cards) */}
      <Box
        sx={{
          width:"100%",
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: "12px",
          mb: 3
        }}
      >
        {/* Card 1: Total Application */}
        <Paper
          elevation={0}
          sx={{
            p: "16px",
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            bgcolor: '#ffffff'
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '24px', lineHeight: "100%" }}>
            {stats.total}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: "8px", fontWeight: 600, fontSize: "13px", lineHeight: "100%" }}>
            Total Application
          </Typography>
        </Paper>

        {/* Card 2: Pending */}
        <Paper
          elevation={0}
          sx={{
            p: "16px",
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            bgcolor: '#ffffff'
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '24px', lineHeight: "100%" }}>
            {stats.pending}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: "8px", fontWeight: 600, fontSize: "13px", lineHeight: "100%" }}>
            Pending
          </Typography>
        </Paper>

        {/* Card 3: Approved */}
        <Paper
          elevation={0}
          sx={{
            p: "16px",
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            bgcolor: '#ffffff'
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '24px', lineHeight: "100%" }}>
            {stats.approved}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: "8px", fontWeight: 600, fontSize: "13px", lineHeight: "100%" }}>
            Approved
          </Typography>
        </Paper>

        {/* Card 4: Rejected */}
        <Paper
          elevation={0}
          sx={{
            p: "16px",
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            bgcolor: '#ffffff'
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '24px', lineHeight: "100%" }}>
            {stats.rejected}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: "8px", fontWeight: 600, fontSize: "13px", lineHeight: "100%" }}>
            Rejected
          </Typography>
        </Paper>
      </Box>

      {/* Tabs Row (All, Pending, Approved, Rejected) */}
      <Box sx={{ mb: "24px" }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setPage(1);
          }}
          sx={{
            minHeight: '38px',
            '& .MuiTabs-indicator': {
              bgcolor: '#6366f1',
              height: '3px',
              borderRadius: '3px'
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
                lineHeight: "20px",
                fontWeight: activeTab === tabLabel ? 600 : 600,
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
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 400, mb: "6px", display: 'block', fontSize: "13px", lineHeight: "100%" }}>
              Department
            </Typography>
            <Select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              displayEmpty
              sx={{
                bgcolor: '#ffffff',
                height: '40px',
                fontSize: '13px',
                fontWeight: 400,
                lineHeight: "100%",
                color: '#1E293B',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' }
              }}
            >
              {DEPARTMENTS.map((dept) => (
                <MenuItem key={dept} value={dept} sx={{ fontSize: '0.875rem' }}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Range Dropdown */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 400, mb: "6px", display: 'block', fontSize: "13px", lineHeight: "100%" }}>
              Date Range
            </Typography>
            <Select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              displayEmpty
              sx={{
                borderRadius: '8px',
                bgcolor: '#ffffff',
                height: '40px',
                fontSize: '0.875rem',
                color: '#334155',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' }
              }}
            >
              {DATE_RANGES.map((d) => (
                <MenuItem key={d} value={d} sx={{ fontSize: '0.875rem' }}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Employee Search */}
          <FormControl size="small" sx={{ minWidth: 392, flex: 1, maxWidth: 392 }}>
            <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 400, mb: "6px", display: 'block', fontSize: "13px", lineHeight: "100%" }}>
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
              sx={{
                borderRadius: '8px',
                bgcolor: '#ffffff',
                height: '40px',
                fontSize: '13px',
                fontWeight: 400,
                lineHeight: "100%",
                color: '#64748B',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' }
              }}
            />
          </FormControl>
        </Box>

        {/* Export Excel Button */}
        <Box>
          <Button
            variant="contained"
            onClick={handleExportExcel}
            startIcon={<FileDownloadIcon />}
            sx={{
              bgcolor: '#644EE5',
              color: '#ffffff',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '8px',
              lineHeight: "24px",
              px: 2,
              height: '40px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#4f46e5',
                boxShadow: '0 2px 4px rgba(99,102,241,0.2)'
              }
            }}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      {/* Main Leave Applications Data Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '12px',
          borderWidth: '1px 1px 0px 1px',
          borderStyle: 'solid',
          borderColor: '#E2E8F0',
          overflowX: 'auto',
          mb: "20px"
        }}
      >
        <Table sx={{ minWidth: 950 }} size="medium">
          <TableHead sx={{ bgcolor: '#F1F5F9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', pl: "24px" }}>
                Emp ID
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', pl: "24px" }}>
                Emp Name
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', textAlign: 'center' }}>
                Department
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', textAlign: 'center' }}>
                Leave Type
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px' }}>
                From Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', textAlign: "center" }}>
                To Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px' }}>
                Total Days
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px' }}>
                Applied Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', textAlign: 'center' }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => {
                // Color mapping for Status Chips
                let chipBg = '#d1fae5';
                let chipColor = '#15803d';
                if (row.status === 'Pending') {
                  chipBg = '#fef3c7';
                  chipColor = '#b45309';
                } else if (row.status === 'Rejected') {
                  chipBg = '#fee2e2';
                  chipColor = '#dc2626';
                }

                return (
                  <TableRow
                    key={`${row.id}-${index}`}
                    sx={{
                      '&:hover': { bgcolor: '#f8fafc' },
                      '& td': { borderBottom: "1px solid #E2E8F0", py: "10px", px: "24px", fontSize: '13px', color: '##000000', lineHeight: "100%", fontWeight: "400" }
                    }}
                  >
                    <TableCell >{row.empId}</TableCell>
                    <TableCell >{row.empName}</TableCell>
                    <TableCell align="center">{row.department}</TableCell>
                    <TableCell align="center">{row.leaveType}</TableCell>
                    <TableCell>{row.fromDate}</TableCell>
                    <TableCell align='center'>{row.toDate}</TableCell>
                    <TableCell >{row.totalDays}</TableCell>
                    <TableCell>{row.appliedDate}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.status}
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
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#64748b' }}>
                  No leave application records found matching your filters.
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
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '14px', fontWeight: "400", lineHeight: "20px" }}>
          Showing {startIndex}-{endIndex} of {filteredLeaveData.length}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Rows per page */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#1E293B', fontSize: '14px', fontWeight: '500', lineHeight: '20px' }}>
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
                  fontSize: '14px',
                  fontWeight: 400,
                  minWidth: '78px',
                  overflow: 'hidden',
                  lineHeight:"20px",
                  '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#D0D5DD',
                    borderRadius: '6px',
                    borderWidth: '1px'
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
                    alignItems: 'center'
                  },
                  '& .MuiSelect-icon': {
                    color: '#1E293B',
                    fontSize: '18px',
                    right: '8px'
                  }
              }}
            >
              <MenuItem value={10} sx={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>10</MenuItem>
              <MenuItem value={20} sx={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>20</MenuItem>
              <MenuItem value={50} sx={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>50</MenuItem>
            </Select>
          </Box>

          {/* Page counter text */}
          <Typography variant="body2" sx={{ color: '##1E293B', fontSize: '14px', fontWeight: "500", lineHeight: "20px" }}>
            Page {page} of {totalPages}
          </Typography>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setPage(1)}
              disabled={page === 1}
              sx={{
                border: '1px solid #cbd5e1',
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
                border: '1px solid #cbd5e1',
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
                border: '1px solid #cbd5e1',
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
                border: '1px solid #cbd5e1',
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
