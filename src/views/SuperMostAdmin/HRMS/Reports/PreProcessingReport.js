import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  InputAdornment,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';
import { IconDownload } from '@tabler/icons-react';
import {
  getPreProcessingReport,
  exportPreProcessingReportPDF,
  exportPreProcessingReportExcel
} from 'services/preProcessingReportService';

const DEPARTMENTS = ['All Departments', 'Emergency', 'Radiology', 'ICU', 'Housekeeping', 'OPD', 'Admin'];
const STATUSES = ['All Status', 'Ready', 'Review', 'Exception'];

const PreProcessingReport = () => {
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');

  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({
    totalEmployeeProcessed: '147',
    totalPayableAmount: '04',
    totalOtAmount: '75',
    totalDeduction: '12',
    payrollReadiness: '12%'
  });
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    const res = await getPreProcessingReport({
      department: selectedDept,
      status: selectedStatus,
      search: searchQuery
    });
    if (res && res.success) {
      setReportData(res.data || []);
      if (res.stats) {
        setStats(res.stats);
      }
    }
    setLoading(false);
  };

  const filteredData = useMemo(() => {
    return reportData.filter((row) => {
      const matchesDept = selectedDept === 'All Departments' || row.department === selectedDept;
      const matchesStatus = selectedStatus === 'All Status' || row.status === selectedStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        row.empId.toLowerCase().includes(q) ||
        row.empName.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q);

      return matchesDept && matchesStatus && matchesQuery;
    });
  }, [reportData, selectedDept, selectedStatus, searchQuery]);

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, startIndex, rowsPerPage]);

  const displayStart = totalCount > 0 ? startIndex + 1 : 0;
  const displayEnd = Math.min(startIndex + rowsPerPage, totalCount);

  const handleExportPDF = () => {
    exportPreProcessingReportPDF({
      department: selectedDept,
      status: selectedStatus,
      search: searchQuery
    });
    window.print();
  };

  const handleExportExcel = () => {
    exportPreProcessingReportExcel({
      department: selectedDept,
      status: selectedStatus,
      search: searchQuery
    });
    const headers = [
      'Emp ID',
      'Emp Name',
      'Department',
      'Working Days',
      'Present Days',
      'Leave Days',
      'Half Days',
      'Payable Days',
      'OT Amount',
      'Total Deduction',
      'Status'
    ];
    const csvRows = [headers.join(',')];
    filteredData.forEach((row) => {
      csvRows.push([
        `"${row.empId}"`,
        `"${row.empName}"`,
        `"${row.department}"`,
        `"${row.workingDays}"`,
        `"${row.presentDays}"`,
        `"${row.leaveDays}"`,
        `"${row.halfDays}"`,
        `"${row.payableDays}"`,
        `"${row.otAmount}"`,
        `"${row.totalDeduction}"`,
        `"${row.status}"`
      ].join(','));
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `Pre_Processing_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ width: '100%', bgcolor: '#ffffff', minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Title */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: '#0F172A',
          fontSize: { xs: '20px', sm: '24px' },
          lineHeight: '100%',
          mb: '24px'
        }}
      >
        Pre Processing Report
      </Typography>

      {/* Filter Controls Bar & Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'stretch', lg: 'flex-end' },
          justifyContent: 'space-between',
          gap: 2,
          mb: '24px'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: 2,
            flex: 1,
            width: { xs: '100%', lg: 'auto' }
          }}
        >
          {/* Department Filter */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 }, flex: { xs: '1 1 100%', sm: 'none' } }}>
            <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 400, mb: '6px', fontSize: '13px', lineHeight: '100%' }}>
              Department
            </Typography>
            <Select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              sx={{
                borderRadius: '6px !important',
                bgcolor: '#ffffff',
                height: '32px',
                fontSize: '13px',
                color: '#1E293B',
                lineHeight: '100%',
                fontWeight: 400,
                '& .MuiSelect-select': {
                  fontSize: '13px',
                  color: '#1E293B',
                  lineHeight: '100%',
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0',
                  borderRadius: '6px !important'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366F1', borderWidth: '1.5px' }
              }}
            >
              {DEPARTMENTS.map((dept) => (
                <MenuItem key={dept} value={dept} sx={{ fontSize: '13px', color: '#1E293B', lineHeight: '100%', fontWeight: 400 }}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 }, flex: { xs: '1 1 100%', sm: 'none' } }}>
            <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 400, mb: '6px', fontSize: '13px', lineHeight: '100%' }}>
              Status
            </Typography>
            <Select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              sx={{
                borderRadius: '6px !important',
                bgcolor: '#ffffff',
                height: '32px',
                fontSize: '13px',
                color: '#1E293B',
                lineHeight: '100%',
                fontWeight: 400,
                '& .MuiSelect-select': {
                  fontSize: '13px',
                  color: '#1E293B',
                  lineHeight: '100%',
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0',
                  borderRadius: '6px !important'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366F1', borderWidth: '1.5px' }
              }}
            >
              {STATUSES.map((status) => (
                <MenuItem key={status} value={status} sx={{ fontSize: '13px', color: '#1E293B', lineHeight: '100%', fontWeight: 400 }}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Employee Search */}
          <FormControl size="small" sx={{ flexGrow: 1, maxWidth: { xs: '100%', md: 392 }, minWidth: { xs: '100%', sm: 220 } }}>
            <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 400, mb: '6px', fontSize: '13px', lineHeight: '100%' }}>
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
                  <SearchIcon sx={{ color: '#64748B', fontSize: 18 }} />
                </InputAdornment>
              }
              endAdornment={
                searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
              sx={{
                borderRadius: '6px !important',
                bgcolor: '#ffffff',
                height: '32px',
                fontSize: '13px',
                color: '#1E293B',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0',
                  borderRadius: '6px !important'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366F1', borderWidth: '1.5px' }
              }}
            />
          </FormControl>
        </Box>

        {/* Action Buttons: Export PDF & Export Excel */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            width: { xs: '100%', lg: 'auto' },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            flexWrap: 'wrap'
          }}
        >
          <Button
            variant="outlined"
            onClick={handleExportPDF}
            startIcon={<IconDownload size={18} stroke={1.75} color="#334155" />}
            sx={{
              width: { xs: '100%', sm: '128px' },
              height: '36px',
              minWidth: '80px',
              gap: '4px',
              borderRadius: '6px !important',
              border: '1px solid #CBD5E1',
              bgcolor: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'none',
              pt: '6px',
              pb: '6px',
              pl: '12px',
              pr: '12px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& .MuiButton-startIcon': {
                mr: 0,
                ml: 0
              },
              '&:hover': {
                borderColor: '#94A3B8',
                bgcolor: '#F8FAFC'
              }
            }}
          >
            Export PDF
          </Button>

          <Button
            variant="contained"
            onClick={handleExportExcel}
            startIcon={<IconDownload size={18} stroke={1.75} color="#ffffff" />}
            sx={{
              width: { xs: '100%', sm: '148px' },
              height: '36px',
              gap: '8px',
              borderRadius: '6px !important',
              bgcolor: '#644EE5',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: 'none',
              pt: '6px',
              pb: '6px',
              pl: '16px',
              pr: '16px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& .MuiButton-startIcon': {
                mr: 0,
                ml: 0
              },
              '&:hover': {
                bgcolor: '#523BCB',
                boxShadow: 'none'
              }
            }}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      {/* Top 5 Analytics Stat Cards */}
      <Grid container spacing="12px" sx={{ mb: '24px' }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            elevation={0}
            sx={{
              minHeight: '85px',
              height: 'auto',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#ffffff',
              p: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '24px', lineHeight: '100%', mb: '8px' }}>
              {stats.totalEmployeeProcessed}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', lineHeight: '100%' }}>
              Employee Processed
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            elevation={0}
            sx={{
              minHeight: '85px',
              height: 'auto',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#ffffff',
              p: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '24px', lineHeight: '100%', mb: '8px' }}>
              {stats.totalPayableAmount}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', lineHeight: '100%' }}>
              Total Payable Amount
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            elevation={0}
            sx={{
              minHeight: '85px',
              height: 'auto',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#ffffff',
              p: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '24px', lineHeight: '100%', mb: '8px' }}>
              {stats.totalOtAmount}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', lineHeight: '100%' }}>
              Total OT Amount
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            elevation={0}
            sx={{
              minHeight: '85px',
              height: 'auto',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#ffffff',
              p: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '24px', lineHeight: '100%', mb: '8px' }}>
              {stats.totalDeduction}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', lineHeight: '100%' }}>
              Total Deduction
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            elevation={0}
            sx={{
              minHeight: '85px',
              height: 'auto',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#ffffff',
              p: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '24px', lineHeight: '100%', mb: '8px' }}>
              {stats.payrollReadiness}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', lineHeight: '100%' }}>
              Payroll Readiness
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Pre Processing Data Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          overflowX: 'auto',
          bgcolor: '#ffffff',
          mb: 2.5
        }}
      >
        <Table
          sx={{
            minWidth: 1200,
            '& .MuiTableCell-root': {
              borderBottom: '1px solid #E2E8F0',
              whiteSpace: 'nowrap'
            }
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: '#F1F5F9' }}>
              <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Emp ID</TableCell>
              <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Emp Name</TableCell>
              <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Department</TableCell>
              <TableCell align="center" sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Working Days</TableCell>
              <TableCell align="center" sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Present Days</TableCell>
              <TableCell align="center" sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Leave Days</TableCell>
              <TableCell align="center" sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Half Days</TableCell>
              <TableCell align="center" sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Payable Days</TableCell>
              <TableCell align="center" sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>OT Amount</TableCell>
              <TableCell align="center" sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Total Deduction</TableCell>
              <TableCell align="center" sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                  <CircularProgress size={32} sx={{ color: '#644EE5' }} />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 6, color: '#64748B', borderBottom: 'none' }}>
                  No pre processing records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => {
                const isReady = row.status === 'Ready';
                const isReview = row.status === 'Review';
                const isException = row.status === 'Exception';

                return (
                  <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '10px' }}>
                      {row.empId}
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '10px' }}>
                      {row.empName}
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '10px' }}>
                      {row.department}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '10px' }}>
                      {row.workingDays}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '10px' }}>
                      {row.presentDays}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '10px' }}>
                      {row.leaveDays}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '10px' }}>
                      {row.halfDays}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '10px' }}>
                      {row.payableDays}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '10px' }}>
                      {row.otAmount}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '10px' }}>
                      {row.totalDeduction}
                    </TableCell>
                    <TableCell align="center" sx={{ px: '24px', py: '10px' }}>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          fontSize: '13px',
                          lineHeight: '100%',
                          borderRadius: '100px',
                          height: '24px',
                          width: isReady ? '72px' : isReview ? '76px' : isException ? '90px' : 'auto',
                          boxSizing: 'border-box',
                          px: '10px',
                          py: '4px',
                          bgcolor: isReady ? '#DCFCE7' : isReview ? '#FEF3C7' : isException ? '#EFF6FF' : '#F1F5F9',
                          color: isReady ? '#15803D' : isReview ? '#D97706' : isException ? '#3B82F6' : '#475569',
                          '& .MuiChip-label': {
                            px: 0,
                            py: 0,
                            lineHeight: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'visible !important'
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', color: '#64748B', fontSize: '14px', fontWeight: 400, lineHeight: '20px', letterSpacing: '0%' }}>
          {totalCount > 0 ? `Showing ${displayStart}-${displayEnd} of ${totalCount}` : 'Showing 0-0 of 0'}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 1.5, sm: 3 } }}>
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
                  borderColor: '#E2E8F0',      
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
              {[10, 20, 50, 100].map((pageSize) => (
                <MenuItem
                  key={pageSize}
                  value={pageSize}
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '20px',
                    letterSpacing: '0%',
                    color: '#1E293B'
                  }}
                >
                  {pageSize}
                </MenuItem>
              ))}
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

export default PreProcessingReport;
