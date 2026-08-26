import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Tooltip,
  TextField,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';
import { IconCalendar, IconDownload, IconEye } from '@tabler/icons-react';
import {
  getRegularisations,
  approveRegularisation,
  rejectRegularisation,
  exportRegularisationsPDF,
  exportRegularisationsExcel
} from 'services/regularisationService';

const DEPARTMENTS = ['All Departments', 'Emergency', 'Radiology', 'ICU', 'Housekeeping', 'OPD', 'Admin'];
const STATUSES = ['All Status', 'Approved', 'Pending', 'Rejected'];

const Regularisations = () => {
  // Filter States
  const [selectedDate, setSelectedDate] = useState('2025-07-12');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const dateInputRef = useRef(null);

  // Format date for button display
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '12 July 2025';
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return '12 July 2025';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [selectedDate]);

  // Data & Pagination
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Accordion Expand State: set of expanded row IDs (hidden by default)
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  // Reject Reason Dialog State
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedItemForReject, setSelectedItemForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await getRegularisations({
      date: selectedDate,
      department: selectedDept,
      status: selectedStatus,
      search: searchQuery
    });
    if (res && res.success) {
      setData(res.data || []);
    }
    setLoading(false);
  };

  // Toggle Row Expansion
  const toggleRowExpand = (id) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchDept = selectedDept === 'All Departments' || row.department === selectedDept;
      const matchStatus = selectedStatus === 'All Status' || row.status === selectedStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        row.empId.toLowerCase().includes(q) ||
        row.empName.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        row.punchType.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q);

      return matchDept && matchStatus && matchSearch;
    });
  }, [data, selectedDept, selectedStatus, searchQuery]);

  // Pagination calculation
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, startIndex, rowsPerPage]);

  const displayStart = totalCount > 0 ? startIndex + 1 : 0;
  const displayEnd = Math.min(startIndex + rowsPerPage, totalCount);

  // Actions
  const handleApprove = async (id) => {
    await approveRegularisation(id);
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Approved' } : item))
    );
  };

  const handleOpenRejectDialog = (item) => {
    setSelectedItemForReject(item);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedItemForReject) return;
    await rejectRegularisation(selectedItemForReject.id, rejectionReason);
    setData((prev) =>
      prev.map((item) =>
        item.id === selectedItemForReject.id
          ? { ...item, status: 'Rejected', rejectionReason }
          : item
      )
    );
    setRejectDialogOpen(false);
  };

  const handleExportPDF = () => {
    exportRegularisationsPDF({
      date: selectedDate,
      department: selectedDept,
      status: selectedStatus,
      search: searchQuery
    });
    window.print();
  };

  const handleExportExcel = () => {
    exportRegularisationsExcel({
      date: selectedDate,
      department: selectedDept,
      status: selectedStatus,
      search: searchQuery
    });
    const headers = ['Employee ID', 'Name', 'Department', 'Date Requested', 'Punch Type', 'Punch In', 'Punch Out', 'Status'];
    const csvRows = [headers.join(',')];
    filteredData.forEach((row) => {
      csvRows.push([
        `"${row.empId}"`,
        `"${row.empName}"`,
        `"${row.department}"`,
        `"${row.dateRequested}"`,
        `"${row.punchType}"`,
        `"${row.punchIn}"`,
        `"${row.punchOut}"`,
        `"${row.status}"`
      ].join(','));
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `Regularisations_${new Date().toISOString().slice(0, 10)}.csv`;
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
        Regularisations
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
          {/* Date Picker Button */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 }, flex: { xs: '1 1 100%', sm: 'none' }, position: 'relative' }}>
            <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 400, mb: '6px', fontSize: '13px', lineHeight: '100%' }}>
              Date
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                if (dateInputRef.current) {
                  if (typeof dateInputRef.current.showPicker === 'function') {
                    dateInputRef.current.showPicker();
                  } else {
                    dateInputRef.current.click();
                  }
                }
              }}
              endIcon={<IconCalendar size={18} stroke={1.75} color="#1E293B" />}
              sx={{
                width: { xs: '100%', sm: '180px' },
                height: '32px',
                gap: '4px',
                borderRadius: '6px !important',
                border: '1px solid #E2E8F0',
                bgcolor: '#ffffff',
                color: '#1E293B',
                fontSize: '13px',
                fontWeight: 400,
                textTransform: 'none',
                px: '12px',
                py: '8px',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                '&:hover': {
                  borderColor: '#94A3B8',
                  bgcolor: '#ffffff'
                }
              }}
            >
              {formattedDisplayDate}
            </Button>
            <input
              type="date"
              ref={dateInputRef}
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }
              }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '1px',
                height: '1px',
                opacity: 0,
                pointerEvents: 'none'
              }}
            />
          </FormControl>

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

      {/* Main Regularisations Data Table */}
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
            minWidth: 1000,
            '& .MuiTableCell-root': {
              borderBottom: '1px solid #E2E8F0',
              whiteSpace: 'nowrap'
            }
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: '#F1F5F9' }}>
              <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Employee ID</TableCell>
              <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Name</TableCell>
              <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Department</TableCell>
              <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Date Requested</TableCell>
              <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Punch Type</TableCell>
              <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Punch In</TableCell>
              <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Punch Out</TableCell>
              <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Status</TableCell>
              <TableCell align="center" sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: 1.5, px: '24px', lineHeight: '20px' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                  <CircularProgress size={32} sx={{ color: '#644EE5' }} />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#64748B', borderBottom: 'none' }}>
                  No regularisation records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => {
                const isApproved = row.status === 'Approved';
                const isPending = row.status === 'Pending';
                const isRejected = row.status === 'Rejected';
                const isExpanded = expandedRowIds.has(row.id);

                return (
                  <React.Fragment key={row.id}>
                    {/* Main Row */}
                    <TableRow hover sx={{ bgcolor: isExpanded ? '#FAFAFB' : 'inherit' }}>
                      <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '14px' }}>
                        {row.empId}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '14px' }}>
                        {row.empName}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '14px' }}>
                        {row.department}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '14px' }}>
                        {row.dateRequested}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '14px' }}>
                        {row.punchType}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '14px' }}>
                        {row.punchIn}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#000000', lineHeight: '100%', px: '24px', py: '14px' }}>
                        {row.punchOut}
                      </TableCell>
                      <TableCell sx={{ px: '24px', py: '10px' }}>
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
                            width: isApproved ? '82px' : isPending ? '76px' : isRejected ? '76px' : 'auto',
                            boxSizing: 'border-box',
                            px: '10px',
                            py: '4px',
                            bgcolor: isApproved ? '#DCFCE7' : isPending ? '#FEF3C7' : isRejected ? '#FECACA' : '#F1F5F9',
                            color: isApproved ? '#15803D' : isPending ? '#D97706' : isRejected ? '#DC2626' : '#475569',
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
                      <TableCell align="center" sx={{ px: '24px', py: '10px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                          {/* If pending and NOT expanded, show quick accept/reject icons */}
                          {isPending && !isExpanded && (
                            <>
                              {/* Reject Button (Red Cross) */}
                              <Tooltip title="Reject Regularisation">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenRejectDialog(row)}
                                  sx={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    bgcolor: '#DC26261A',
                                    color: '#DC2626',
                                    p: 0,
                                    '&:hover': { bgcolor: '#FECACA' }
                                  }}
                                >
                                  <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>

                              {/* Approve Button (Green Check) */}
                              <Tooltip title="Approve Regularisation">
                                <IconButton
                                  size="small"
                                  onClick={() => handleApprove(row.id)}
                                  sx={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    bgcolor: '#BBF7D0',
                                    color: '#298E66',
                                    p: 0,
                                    '&:hover': { bgcolor: '#BBF7D0' }
                                  }}
                                >
                                  <CheckIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          {/* Eye Toggle Button */}
                          <Tooltip title={isExpanded ? 'Hide Details' : 'View Details'}>
                            <IconButton
                              size="small"
                              onClick={() => toggleRowExpand(row.id)}
                              sx={{
                                p: '4px',
                                color: isExpanded ? '#644EE5' : '#475569',
                                bgcolor: isExpanded ? '#EEF2FF' : 'transparent',
                                outline: 'none !important',
                                transition: 'color 0.2s ease, background-color 0.2s ease',
                                '&:focus': { outline: 'none' },
                                '&:focus-visible': { outline: 'none' },
                                '&:hover': { color: '#644EE5', bgcolor: '#EEF2FF' }
                              }}
                            >
                              <IconEye size={18} stroke={1.75} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Inline Expandable Accordion Sub-row with zero border flash */}
                    <TableRow sx={{ bgcolor: '#ffffffff', '& td': { p: 0, border: 'none !important' } }}>
                      <TableCell colSpan={9} sx={{ p: 0, border: 'none !important', bgcolor: '#ffffffff' }}>
                        <Collapse in={isExpanded} timeout={300} unmountOnExit={false}>
                          <Box
                            sx={{
                              px: { xs: 2, sm: 3, md: '24px' },
                              py: '18px',
                              bgcolor: 'transparent',
                              borderBottom: '1px solid #E2E8F0'
                            }}
                          >
                            <Grid container spacing={2} alignItems="flex-start">
                              {/* Left Box: EMPLOYEE REASON */}
                              <Grid item xs={12} md={isPending ? 5.2 : 6}>
                                <Typography
                                  sx={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#64748B',
                                    textTransform: 'uppercase',
                                    mb: '8px',
                                    lineHeight:"100%"
                                  }}
                                >
                                  EMPLOYEE REASON
                                </Typography>
                                <Box
                                  sx={{
                                    minHeight: '96px',
                                    p: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    bgcolor: '#FFFFFF',
                                    color: '#1E293B',
                                    fontSize: '13px',
                                    lineHeight: '20px',
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  {row.employeeReason || 'No reason specified by employee.'}
                                </Box>
                              </Grid>

                              {/* Middle Box: HOD FORWARDED NOTE */}
                              <Grid item xs={12} md={isPending ? 4.5 : 6}>
                                <Typography
                                  sx={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#64748B',
                                    textTransform: 'uppercase',
                                    mb: '8px',
                                    lineHeight:"100%"
                                  }}
                                >
                                  HOD FORWARDED NOTE <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                                </Typography>
                                <Box
                                  sx={{
                                    minHeight: '96px',
                                    p: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    bgcolor: '#FFFFFF',
                                    color: '#1E293B',
                                    fontSize: '13px',
                                    lineHeight: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  <Typography sx={{ fontSize: '13px', color: '#1E293B', lineHeight: '20px', fontStyle: 'normal' }}>
                                    &ldquo;{row.hodNote}&rdquo;
                                  </Typography>
                                  <Typography sx={{ fontSize: '13px', color: '#475569', mt: 1.5, fontWeight: 400 }}>
                                    — {row.hodName}
                                  </Typography>
                                </Box>
                              </Grid>

                              {/* Right Actions: Reject & Accept (Only for Pending state) */}
                              {isPending && (
                                <Grid
                                  item
                                  xs={12}
                                  md={2.3}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                    gap: 1.5,
                                    pt: { xs: 0, md: '32px' }
                                  }}
                                >
                                  <Button
                                    variant="outlined"
                                    onClick={() => handleOpenRejectDialog(row)}
                                    startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                      height: '36px',
                                      minWidth: '88px',
                                      borderRadius: '6px !important',
                                      border: '1px solid #CBD5E1',
                                      color: '#334155',
                                      fontSize: '13px',
                                      fontWeight: 500,
                                      textTransform: 'none',
                                      px: '14px',
                                      boxSizing: 'border-box',
                                      '&:hover': {
                                        borderColor: '#EF4444',
                                        color: '#EF4444',
                                        bgcolor: '#FEF2F2'
                                      }
                                    }}
                                  >
                                    Reject
                                  </Button>

                                  <Button
                                    variant="contained"
                                    onClick={() => handleApprove(row.id)}
                                    startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                      height: '36px',
                                      minWidth: '94px',
                                      borderRadius: '6px !important',
                                      bgcolor: '#644EE5',
                                      color: '#ffffff',
                                      fontSize: '13px',
                                      fontWeight: 500,
                                      textTransform: 'none',
                                      px: '16px',
                                      boxShadow: 'none',
                                      boxSizing: 'border-box',
                                      '&:hover': {
                                        bgcolor: '#523BCB',
                                        boxShadow: 'none'
                                      }
                                    }}
                                  >
                                    Accept
                                  </Button>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
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

      {/* Reject Confirmation Dialog matching exact Figma specs */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '520px',
            maxWidth: '90vw',
            minHeight: '250px',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            p: '32px',
            bgcolor: '#FFFFFF',
            boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }
        }}
      >
        {/* Warning Icon Circle */}
        <Box
          sx={{
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            bgcolor: '#DC26261A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: '20px'
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64538 18.3024 1.55296 18.6453 1.55201 18.9945C1.55106 19.3437 1.64162 19.6873 1.81454 19.991C1.98746 20.2947 2.23668 20.5474 2.53707 20.7239C2.83746 20.9004 3.17822 20.9944 3.525 20.996H20.475C20.8218 20.9944 21.1625 20.9004 21.4629 20.7239C21.7633 20.5474 22.0125 20.2947 22.1855 19.991C22.3584 19.6873 22.4489 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56613 13.2807 3.32313 12.9812 3.15439C12.6817 2.98565 12.3437 2.89688 12 2.89688C11.6563 2.89688 11.3183 2.98565 11.0188 3.15439C10.7193 3.32313 10.4683 3.56613 10.29 3.86Z"
              stroke="#DC2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>

        {/* Modal Title */}
        <Typography
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '28px',
            letterSpacing: '0%',
            textAlign: 'center',
            color: '#0F172A',
            mb: '8px'
          }}
        >
          Reject Regularisation
        </Typography>

        {/* Modal Subtitle / Description */}
        <Typography
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '13px',
            lineHeight: '18px',
            letterSpacing: '0%',
            textAlign: 'center',
            color: '#334155',
            mb: '24px'
          }}
        >
          Are you Sure you Want to reject this Regularisation
        </Typography>

        {/* Modal Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
          <Button
            variant="outlined"
            onClick={() => setRejectDialogOpen(false)}
            sx={{
              height: '36px',
              minWidth: '80px',
              px: '16px',
              borderRadius: '6px !important',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              color: '#334155',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              boxSizing: 'border-box',
              '&:hover': {
                borderColor: '#94A3B8',
                bgcolor: '#F8FAFC'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmReject}
            sx={{
              height: '36px',
              minWidth: '80px',
              px: '20px',
              borderRadius: '6px !important',
              bgcolor: '#EF4444',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: 'none',
              boxSizing: 'border-box',
              '&:hover': {
                bgcolor: '#DC2626',
                boxShadow: 'none'
              }
            }}
          >
            Reject
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Regularisations;
