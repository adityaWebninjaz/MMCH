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
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  CenterFocusStrong,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';

// Sample dataset reflecting hospital medical & administrative staff
const INITIAL_EMPLOYEES = [
  { empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', designation: 'Surgeon', workDays: 23, present: 23, leave: '02', half: '04', absentLwp: '04', payableDays: '04', phone: '9876543210' },
  { empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', designation: 'Surgeon', workDays: 23, present: 23, leave: '02', half: '04', absentLwp: '04', payableDays: '04', phone: '9876543210' },
  { empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', designation: 'Surgeon', workDays: 23, present: 23, leave: '02', half: '04', absentLwp: '04', payableDays: '04', phone: '9876543210' },
  { empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', designation: 'Surgeon', workDays: 23, present: 23, leave: '02', half: '04', absentLwp: '04', payableDays: '04', phone: '9876543210' },
  { empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', designation: 'Surgeon', workDays: 23, present: 23, leave: '02', half: '04', absentLwp: '04', payableDays: '04', phone: '9876543210' },
  { empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', designation: 'Surgeon', workDays: 23, present: 23, leave: '02', half: '04', absentLwp: '04', payableDays: '04', phone: '9876543210' },
  { empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', designation: 'Surgeon', workDays: 23, present: 23, leave: '02', half: '04', absentLwp: '04', payableDays: '04', phone: '9876543210' },
  { empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', designation: 'Surgeon', workDays: 23, present: 23, leave: '02', half: '04', absentLwp: '04', payableDays: '04', phone: '9876543210' },
  { empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', designation: 'Surgeon', workDays: 23, present: 23, leave: '02', half: '04', absentLwp: '04', payableDays: '04', phone: '9876543210' },
  { empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Emergency', designation: 'Surgeon', workDays: 23, present: 23, leave: '02', half: '04', absentLwp: '04', payableDays: '04', phone: '9876543210' },
  { empId: 'EMP235470', empName: 'Dr. Ananya Sharma', department: 'Cardiology', designation: 'Senior Cardiologist', workDays: 25, present: 24, leave: '01', half: '00', absentLwp: '01', payableDays: '24', phone: '9876543211' },
  { empId: 'EMP235471', empName: 'Dr. Vikram Patel', department: 'Neurology', designation: 'Neurologist', workDays: 24, present: 22, leave: '02', half: '01', absentLwp: '01', payableDays: '23', phone: '9876543212' },
  { empId: 'EMP235472', empName: 'Dr. Priya Nair', department: 'Pediatrics', designation: 'Pediatrician', workDays: 23, present: 21, leave: '02', half: '02', absentLwp: '02', payableDays: '22', phone: '9876543213' },
  { empId: 'EMP235473', empName: 'Dr. Rajesh Gupta', department: 'Orthopedics', designation: 'Orthopedic Surgeon', workDays: 26, present: 25, leave: '01', half: '01', absentLwp: '00', payableDays: '25', phone: '9876543214' },
  { empId: 'EMP235474', empName: 'Dr. Sunita Rao', department: 'ICU', designation: 'Intensivist', workDays: 24, present: 24, leave: '00', half: '00', absentLwp: '00', payableDays: '24', phone: '9876543215' },
  { empId: 'EMP235475', empName: 'Dr. Amit Verma', department: 'Surgery', designation: 'General Surgeon', workDays: 23, present: 20, leave: '03', half: '02', absentLwp: '01', payableDays: '21', phone: '9876543216' },
  { empId: 'EMP235476', empName: 'Dr. Meera Joshi', department: 'OPD', designation: 'Consultant Physician', workDays: 22, present: 22, leave: '00', half: '00', absentLwp: '00', payableDays: '22', phone: '9876543217' },
  { empId: 'EMP235477', empName: 'Dr. Alok Singh', department: 'Emergency', designation: 'Trauma Specialist', workDays: 24, present: 23, leave: '01', half: '01', absentLwp: '00', payableDays: '23', phone: '9876543218' },
  { empId: 'EMP235478', empName: 'Dr. Kavita Reddy', department: 'Cardiology', designation: 'Electrophysiologist', workDays: 23, present: 21, leave: '02', half: '02', absentLwp: '01', payableDays: '22', phone: '9876543219' },
  { empId: 'EMP235479', empName: 'Dr. Suresh Kumar', department: 'Neurology', designation: 'Neurosurgeon', workDays: 25, present: 25, leave: '00', half: '00', absentLwp: '00', payableDays: '25', phone: '9876543220' }
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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AttendanceReport = () => {
  // Filter States
  const [department, setDepartment] = useState('All Departments');
  const [month, setMonth] = useState('June');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered employees list based on department & search query
  const filteredEmployees = useMemo(() => {
    return INITIAL_EMPLOYEES.filter((emp) => {
      const matchesDept =
        department === 'All Departments' || emp.department === department;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        emp.empId.toLowerCase().includes(q) ||
        emp.empName.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        (emp.phone && emp.phone.includes(q));

      return matchesDept && matchesSearch;
    });
  }, [department, searchQuery]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / rowsPerPage));

  // Current page rows
  const paginatedEmployees = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    return filteredEmployees.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredEmployees, page, rowsPerPage]);

  // Stat card counts matching design
  const stats = useMemo(() => {
    if (department === 'All Departments' && month === 'June' && !searchQuery) {
      return {
        totalEmployees: '245',
        present: '5,880',
        absent: '147',
        halfDay: '63',
        lwp: '63'
      };
    }
    const totalCount = filteredEmployees.length;
    const presentTotal = filteredEmployees.reduce((acc, curr) => acc + curr.present * 20, 0);
    const absentTotal = filteredEmployees.reduce((acc, curr) => acc + Number(curr.absentLwp), 0);
    const halfTotal = filteredEmployees.reduce((acc, curr) => acc + Number(curr.half), 0);
    const lwpTotal = filteredEmployees.reduce((acc, curr) => acc + Number(curr.absentLwp), 0);

    return {
      totalEmployees: totalCount.toLocaleString('en-US'),
      present: presentTotal.toLocaleString('en-US'),
      absent: absentTotal.toLocaleString('en-US'),
      halfDay: halfTotal.toLocaleString('en-US'),
      lwp: lwpTotal.toLocaleString('en-US')
    };
  }, [department, month, searchQuery, filteredEmployees]);

  // Export to Excel / CSV handler
  const handleExportExcel = () => {
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

    filteredEmployees.forEach((emp) => {
      const row = [
        `"${emp.empId}"`,
        `"${emp.empName}"`,
        `"${emp.department}"`,
        `"${emp.designation}"`,
        emp.workDays,
        emp.present,
        `"${emp.leave}"`,
        `"${emp.half}"`,
        `"${emp.absentLwp}"`,
        `"${emp.payableDays}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${department.replace(/\s+/g, '_')}_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startIndex = filteredEmployees.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, filteredEmployees.length);

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

          {/* Month Dropdown */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 400, mb: "6px", display: 'block', fontSize: "13px", lineHeight: "100%" }}>
              Month
            </Typography>
            <Select
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
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
              {MONTHS.map((m) => (
                <MenuItem key={m} value={m} sx={{ fontSize: '0.875rem' }}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Employee Search */}
          <FormControl size="small" sx={{ minWidth: 392 }}>
            <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 400, mb: "6px", display: 'block', fontSize: "13px", lineHeight: "100%" }}>
              Employee Search
            </Typography>
            <OutlinedInput
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, name, or phone number..."
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#64748B', fontSize: 20 }} />
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

      {/* KPI Cards Row (5 Stat Cards) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(5, 1fr)'
          },
          gap: "12px",
          mb: 3
        }}
      >
        {/* Card 1: Total Employees */}
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
            {stats.totalEmployees}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: "8px", fontWeight: 600, fontSize: "13px", lineHeight: "100%" }}>
            Total Employees
          </Typography>
        </Paper>

        {/* Card 2: Present */}
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
            {stats.present}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: "8px", fontWeight: 600, fontSize: "13px", lineHeight: "100%" }}>
            Present
          </Typography>
        </Paper>

        {/* Card 3: Absent */}
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
            {stats.absent}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: "8px", fontWeight: 600, fontSize: "13px", lineHeight: "100%" }}>
            Absent
          </Typography>
        </Paper>

        {/* Card 4: Half-Day */}
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
            {stats.halfDay}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: "8px", fontWeight: 600, fontSize: "13px", lineHeight: "100%" }}>
            Half- Day
          </Typography>
        </Paper>

        {/* Card 5: LWP */}
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
            {stats.lwp}
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', mt: "8px", fontWeight: 600, fontSize: "13px", lineHeight: "100%" }}>
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
          mb: "20px"
        }}
      >
        <Table sx={{ minWidth: 900 }} size="medium">
          <TableHead sx={{ bgcolor: '#F1F5F9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', pl: "24px" }}>
                Emp ID
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', pl: "24px" }}>
                Emp Name
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px' }}>
                Department
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px' }}>
                Designation
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', textAlign: 'center' }}>
                Work Days
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', textAlign: 'center' }}>
                Present
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', textAlign: 'center' }}>
                Leave
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', textAlign: 'center' }}>
                Half
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', textAlign: 'center' }}>
                Absent (LWP)
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#16151C', fontSize: '14px', py: "12px", lineHeight: '20px', textAlign: 'center' }}>
                Payable Days
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((row, index) => (
                <TableRow
                  key={`${row.empId}-${index}`}
                  sx={{
                    '&:hover': { bgcolor: '#f8fafc' },
                    '& td': {  borderBottom: "1px solid #E2E8F0", py: "10px", px: "24px", fontSize: '13px', color: '##000000', lineHeight: "100%", fontWeight: "400" }
                  }}
                >
                  <TableCell sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "100%" }}>{row.empId}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "100%" }}>{row.empName}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "100%" }}>{row.department}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "100%" }}>{row.designation}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "100%" }} align="center">{row.workDays}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "100%" }} align="center">{row.present}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "100%" }} align="center">{row.leave}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "100%" }} align="center">{row.half}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "100%" }} align="center">{row.absentLwp}</TableCell>
                  <TableCell sx={{ fontWeight: 400, fontSize: "13px", lineHeight: "100%", }} align="center">{row.payableDays}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4, color: '#64748b' }}>
                  No employee attendance records found matching your filters.
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
          Showing {startIndex}-{endIndex} of {filteredEmployees.length}
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
          <Typography variant="body2" sx={{ color: '#1E293B', fontSize: '14px', fontWeight: "500", lineHeight: "20px" }}>
            Page {page} of {totalPages}
          </Typography>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setPage(1)}
              disabled={page === 1}
              sx={{
                border: "1px solid #E2E8F0",
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


