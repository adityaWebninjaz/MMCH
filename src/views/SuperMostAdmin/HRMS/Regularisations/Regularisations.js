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
  CircularProgress,
  Tooltip,
  Drawer
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  UnfoldMore as UnfoldMoreIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { IconCalendar, IconDownload, IconEye } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import {
  getRegularisations,
  approveRegularisation,
  rejectRegularisation,
  exportRegularisationsPDF,
  exportRegularisationsExcel
} from './Services/regularisationService';

const STATUSES = ['Pending', 'Approved', 'Rejected'];

const Regularisations = () => {
  // Filter States
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const dateInputRef = useRef(null);

  // Format date for button display dynamically
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return 'All Dates';
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return 'All Dates';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [selectedDate]);

  // Data & Pagination
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isFirstMount = useRef(true);

  // Quick Reject Reason Dialog State
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedItemForReject, setSelectedItemForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Right Slide Drawer State (Triggered on Eye Icon click)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [drawerRejectReason, setDrawerRejectReason] = useState('');
  const [drawerReasonError, setDrawerReasonError] = useState('');
  const [drawerSubmitting, setDrawerSubmitting] = useState(false);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      fetchData(selectedStatus, searchQuery);
      return;
    }

    const timer = setTimeout(() => {
      fetchData(selectedStatus, searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async (overrideStatus = selectedStatus, overrideSearch = searchQuery, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getRegularisations({
        status: overrideStatus,
        search: overrideSearch
      });
      if (res && res.success) {
        setData(res.data || []);
      }
    } catch (err) {
      console.error('Error in Regularisations fetchData:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    setPage(1);
    setLoading(true);
    fetchData(newStatus, searchQuery, true);
  };

  // Dynamic available departments extracted directly from this module's GET API data
  const availableDepartments = useMemo(() => {
    const depts = new Set();
    data.forEach((row) => {
      if (row.department && row.department !== '-' && row.department !== 'All Departments') {
        depts.add(row.department.trim());
      }
    });
    return ['All Departments', ...Array.from(depts).sort()];
  }, [data]);

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Date filter: match against rawDate (YYYY-MM-DD) or ISO date
      const matchDate =
        !selectedDate ||
        row.rawDate === selectedDate ||
        (row.raw?.date && row.raw.date === selectedDate) ||
        (row.raw?.applied_at && row.raw.applied_at.startsWith(selectedDate));

      // 2. Department filter
      const matchDept = selectedDept === 'All Departments' || row.department === selectedDept;

      // 3. Status filter
      const matchStatus =
        !selectedStatus ||
        (row.status && row.status.toUpperCase() === selectedStatus.toUpperCase());

      // 4. Search query filter
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (row.empId && row.empId.toLowerCase().includes(q)) ||
        (row.empName && row.empName.toLowerCase().includes(q)) ||
        (row.department && row.department.toLowerCase().includes(q)) ||
        (row.punchType && row.punchType.toLowerCase().includes(q)) ||
        (row.status && row.status.toLowerCase().includes(q));

      return matchDate && matchDept && matchStatus && matchSearch;
    });
  }, [data, selectedDate, selectedDept, selectedStatus, searchQuery]);

  // Pagination calculation
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, startIndex, rowsPerPage]);

  const displayStart = totalCount > 0 ? startIndex + 1 : 0;
  const displayEnd = Math.min(startIndex + rowsPerPage, totalCount);

  // Quick Table Actions
  const handleApprove = async (id, name = '') => {
    // Instant optimistic state update
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Approved' } : item))
    );

    try {
      const res = await approveRegularisation(id);
      if (res && res.success) {
        toast.success(res.message || `Regularisation for ${name || 'employee'} approved successfully`);
        fetchData(selectedStatus, searchQuery, false);
      } else {
        toast.error(res?.message || 'Failed to approve regularisation');
        fetchData(selectedStatus, searchQuery, false);
      }
    } catch (err) {
      toast.error('An error occurred while approving regularisation');
      fetchData(selectedStatus, searchQuery, false);
    }
  };

  const handleOpenRejectDialog = (item) => {
    setSelectedItemForReject(item);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedItemForReject) return;
    if (!rejectionReason.trim()) {
      toast.error('Rejection remark is required');
      return;
    }

    const targetId = selectedItemForReject.id;
    const targetName = selectedItemForReject.empName;
    const remark = rejectionReason.trim();

    // Instant optimistic state update
    setData((prev) =>
      prev.map((item) =>
        item.id === targetId
          ? { ...item, status: 'Rejected', rejectionReason: remark, hodNote: remark }
          : item
      )
    );
    setRejectDialogOpen(false);

    try {
      const res = await rejectRegularisation(targetId, remark);
      if (res && res.success) {
        toast.success(res.message || `Regularisation for ${targetName} rejected successfully`);
        fetchData(selectedStatus, searchQuery, false);
      } else {
        toast.error(res?.message || 'Failed to reject regularisation');
        fetchData(selectedStatus, searchQuery, false);
      }
    } catch (err) {
      toast.error('An error occurred while rejecting regularisation');
      fetchData(selectedStatus, searchQuery, false);
    }
  };

  // Slide Drawer Handlers (Triggered by Eye Icon)
  const handleOpenDrawer = (row) => {
    setSelectedRow(row);
    setDrawerRejectReason('');
    setDrawerReasonError('');
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
    setDrawerRejectReason('');
    setDrawerReasonError('');
    setDrawerSubmitting(false);
  };

  const handleDrawerApprove = async () => {
    if (!selectedRow || drawerSubmitting) return;

    const targetId = selectedRow.id;
    const targetName = selectedRow.empName;

    // Instant optimistic update on both table data and active drawer object
    setData((prev) =>
      prev.map((item) => (item.id === targetId ? { ...item, status: 'Approved' } : item))
    );
    setSelectedRow((prev) => (prev && prev.id === targetId ? { ...prev, status: 'Approved' } : prev));
    handleCloseDrawer();

    setDrawerSubmitting(true);
    try {
      const res = await approveRegularisation(targetId);
      if (res && res.success) {
        toast.success(res.message || `Regularisation for ${targetName} approved successfully`);
        fetchData(selectedStatus, searchQuery, false);
      } else {
        toast.error(res?.message || 'Failed to approve regularisation');
        fetchData(selectedStatus, searchQuery, false);
      }
    } catch (err) {
      toast.error('An error occurred while approving regularisation');
      fetchData(selectedStatus, searchQuery, false);
    } finally {
      setDrawerSubmitting(false);
    }
  };

  const handleDrawerReject = async () => {
    if (!selectedRow || drawerSubmitting) return;

    if (!drawerRejectReason || drawerRejectReason.trim() === '') {
      setDrawerReasonError('Please provide a reason / remarks for rejection');
      toast.error('Please provide a reason for rejection');
      return;
    }

    const targetId = selectedRow.id;
    const targetName = selectedRow.empName;
    const remark = drawerRejectReason.trim();

    // Instant optimistic update on both table data and active drawer object
    setData((prev) =>
      prev.map((item) =>
        item.id === targetId
          ? { ...item, status: 'Rejected', rejectionReason: remark, hodNote: remark }
          : item
      )
    );
    setSelectedRow((prev) => (prev && prev.id === targetId ? { ...prev, status: 'Rejected', hodNote: remark } : prev));
    handleCloseDrawer();

    setDrawerSubmitting(true);
    try {
      const res = await rejectRegularisation(targetId, remark);
      if (res && res.success) {
        toast.success(res.message || `Regularisation for ${targetName} rejected successfully`);
        fetchData(selectedStatus, searchQuery, false);
      } else {
        toast.error(res?.message || 'Failed to reject regularisation');
        fetchData(selectedStatus, searchQuery, false);
      }
    } catch (err) {
      toast.error('An error occurred while rejecting regularisation');
      fetchData(selectedStatus, searchQuery, false);
    } finally {
      setDrawerSubmitting(false);
    }
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
          mb: '40px'
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
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
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
              {selectedDate && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate('');
                    setPage(1);
                  }}
                  sx={{
                    position: 'absolute',
                    right: '32px',
                    p: '2px',
                    color: '#94A3B8',
                    '&:hover': { color: '#0F172A' }
                  }}
                  title="Clear date filter"
                >
                  <CloseIcon sx={{ fontSize: '14px' }} />
                </IconButton>
              )}
            </Box>
            <input
              type="date"
              ref={dateInputRef}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(1);
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
              {availableDepartments.map((dept) => (
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
              onChange={handleStatusChange}
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

        {/* Action Buttons: Export PDF & Export Excel current comment out  */}
        {/* <Box
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
            startIcon={<IconDownload size={18} stroke={1.75} color="#475569" />}
            sx={{
              width: { xs: '100%', sm: '128px' },
              height: '36px',
              minWidth: '80px',
              gap: '4px',
              borderRadius: '6px !important',
              border: '1px solid #CBD5E1',
              bgcolor: '#ffffff',
              color: '#475569',
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
        </Box> */}
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
                const statusUpper = (row.status || '').toUpperCase();
                const isApproved = statusUpper === 'APPROVED';
                const isPending = statusUpper === 'PENDING';
                const isRejected = statusUpper === 'REJECTED';

                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '& td': { borderColor: '#E2E8F0', py: 1.5, fontSize: '13px', color: '#0F172A' }
                    }}
                  >
                    <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155', lineHeight: '100%', px: '24px', py: '14px' }}>
                      {row.empId}
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155', lineHeight: '100%', px: '24px', py: '14px' }}>
                      {row.empName}
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155', lineHeight: '100%', px: '24px', py: '14px' }}>
                      {row.department}
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155', lineHeight: '100%', px: '24px', py: '14px' }}>
                      {row.dateRequested}
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155', lineHeight: '100%', px: '24px', py: '14px' }}>
                      {row.punchType}
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155', lineHeight: '100%', px: '24px', py: '14px' }}>
                      {row.punchIn}
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 400, color: '#334155', lineHeight: '100%', px: '24px', py: '14px' }}>
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
                        {/* If pending, show quick accept/reject icons */}
                        {isPending && (
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
                                onClick={() => handleApprove(row.id, row.empName)}
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

                        {/* Eye Button: Opens the Detailed Verification Slide Drawer */}
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDrawer(row)}
                            sx={{
                              p: '4px',
                              color: '#475569',
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

          {/* Pagination buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => setPage(1)}
              disabled={page === 1}
              sx={{
                width: '32px',
                height: '32px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                color: '#1E293B',
                '&.Mui-disabled': { color: '#94A3B8', borderColor: '#E2E8F0' }
              }}
            >
              <FirstPageIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              sx={{
                width: '32px',
                height: '32px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                color: '#1E293B',
                '&.Mui-disabled': { color: '#94A3B8', borderColor: '#E2E8F0' }
              }}
            >
              <NavigateBeforeIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              sx={{
                width: '32px',
                height: '32px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                color: '#1E293B',
                '&.Mui-disabled': { color: '#94A3B8', borderColor: '#E2E8F0' }
              }}
            >
              <NavigateNextIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              sx={{
                width: '32px',
                height: '32px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                color: '#1E293B',
                '&.Mui-disabled': { color: '#94A3B8', borderColor: '#E2E8F0' }
              }}
            >
              <LastPageIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* DETAILED VERIFICATION RIGHT SLIDE DRAWER (Opened when clicking Eye Icon) */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        sx={{
          zIndex: 1400
        }}
        PaperProps={{
          sx: {
            height: '100vh',
            width: { xs: '100%', sm: 460 },
            borderRadius: '12px 0 0 12px',
            p: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.12)',
            overflowY: 'auto'
          }
        }}
      >
        {selectedRow && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
            {/* Header Title with Close Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: '100%',
                  color: '#0F172A'
                }}
              >
                Detailed Verification
              </Typography>
              <IconButton onClick={handleCloseDrawer} size="small" aria-label="close">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* 2-Column Info Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                width: '100%',
                minHeight: '86px',
                rowGap: '12px',
                columnGap: '12px',
                pb: '12px',
                borderBottom: '1px solid #F1F5F9'
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', textTransform: 'capitalize', color: '#373C43', display: 'block', mb: '4px' }}>
                  Emp ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px', lineHeight: '100%' }}>
                  {selectedRow.empId}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', textTransform: 'capitalize', color: '#373C43', display: 'block', mb: '4px' }}>
                  Full Name
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px', lineHeight: '100%' }}>
                  {selectedRow.empName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', textTransform: 'capitalize', color: '#373C43', display: 'block', mb: '4px' }}>
                  Department
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px', lineHeight: '100%' }}>
                  {selectedRow.department}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', textTransform: 'capitalize', color: '#373C43', display: 'block', mb: '4px' }}>
                  Designation
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px', lineHeight: '100%' }}>
                  {selectedRow.designation}
                </Typography>
              </Box>
            </Box>

            {/* Regularisation Request Details 2-Column Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                width: '100%',
                rowGap: '12px',
                columnGap: '12px',
                pb: '12px',
                borderBottom: '1px solid #F1F5F9'
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', color: '#64748B', display: 'block', mb: '4px' }}>
                  Date Requested
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px' }}>
                  {selectedRow.dateRequested}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', color: '#64748B', display: 'block', mb: '4px' }}>
                  Punch Type
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px' }}>
                  {selectedRow.punchType}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', color: '#64748B', display: 'block', mb: '4px' }}>
                  Requested Punch In
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px' }}>
                  {selectedRow.punchIn}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', color: '#64748B', display: 'block', mb: '4px' }}>
                  Requested Punch Out
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px' }}>
                  {selectedRow.punchOut}
                </Typography>
              </Box>

              {selectedRow.shiftName && selectedRow.shiftName !== '-' && (
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', color: '#64748B', display: 'block', mb: '4px' }}>
                    Assigned Shift
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px' }}>
                    {selectedRow.shiftName}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Employee Reason Box */}
            <Box sx={{ width: '100%' }}>
              <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '100%', color: '#0F172A', display: 'block', mb: '6px' }}>
                Reason for Regularisation:
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  minHeight: '70px',
                  p: '12px',
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#334155',
                  lineHeight: '18px',
                  boxSizing: 'border-box'
                }}
              >
                {selectedRow.employeeReason || 'No reason provided'}
              </Box>
            </Box>

            {/* Rejection / Remarks input (shown for pending requests) */}
            {selectedRow.status === 'Pending' && (
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '100%', color: '#0F172A', display: 'block' }}>
                  Remarks / Reason {drawerReasonError && <span style={{ color: '#DC2626' }}>*</span>}:
                </Typography>
                <OutlinedInput
                  multiline
                  rows={3}
                  value={drawerRejectReason}
                  onChange={(e) => {
                    setDrawerRejectReason(e.target.value);
                    if (drawerReasonError) setDrawerReasonError('');
                  }}
                  error={Boolean(drawerReasonError)}
                  placeholder="Enter remarks or reason if rejecting..."
                  sx={{
                    width: '100%',
                    minHeight: '90px',
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#0F172A',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: drawerReasonError ? '#DC2626' : '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: drawerReasonError ? '#DC2626' : '#CBD5E1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: drawerReasonError ? '#DC2626' : '#6366f1' },
                    '& input::placeholder, & textarea::placeholder': {
                      color: '#64748B',
                      opacity: 1,
                      fontSize: '13px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400
                    }
                  }}
                />
                {drawerReasonError && (
                  <Typography variant="caption" sx={{ color: '#DC2626', fontSize: '12px', mt: '2px', fontWeight: 500 }}>
                    {drawerReasonError}
                  </Typography>
                )}
              </Box>
            )}

            {/* If already reviewed (Approved or Rejected) */}
            {selectedRow.status !== 'Pending' && (
              <Box
                sx={{
                  p: '14px',
                  borderRadius: '8px',
                  bgcolor: selectedRow.status === 'Approved' ? '#DCFCE7' : '#FEE2E2',
                  border: selectedRow.status === 'Approved' ? '1px solid #BBF7D0' : '1px solid #FECACA'
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: '14px', color: selectedRow.status === 'Approved' ? '#15803D' : '#DC2626' }}>
                  Status: {selectedRow.status}
                </Typography>
                {selectedRow.hodName && selectedRow.hodName !== '-' && (
                  <Typography sx={{ fontSize: '13px', color: '#334155', mt: 0.5 }}>
                    <strong>Reviewed by:</strong> {selectedRow.hodName}
                  </Typography>
                )}
                {selectedRow.hodNote && selectedRow.hodNote !== '-' && (
                  <Typography sx={{ fontSize: '13px', color: '#334155', mt: 0.5 }}>
                    <strong>Remarks:</strong> {selectedRow.hodNote}
                  </Typography>
                )}
              </Box>
            )}

            {/* Action Buttons Row (Exact Approvals.js Drawer Button Styling) */}
            {selectedRow.status === 'Pending' && (
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px', mt: 'auto', pt: 2 }}>
                {/* Reject Light Red Button */}
                <Button
                  variant="outlined"
                  onClick={handleDrawerReject}
                  disabled={drawerSubmitting}
                  sx={{
                    flex: 1,
                    height: '41px',
                    bgcolor: '#FEE2E2',
                    color: '#DC2626',
                    border: '1px solid #DC2626',
                    borderRadius: '8px',
                    px: '16px',
                    py: '12px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#FECACA',
                      borderColor: '#DC2626'
                    }
                  }}
                >
                  {drawerSubmitting ? <CircularProgress size={18} sx={{ color: '#DC2626' }} /> : 'Reject'}
                </Button>

                {/* Approve Regularisation Solid Green Button */}
                <Button
                  variant="contained"
                  onClick={handleDrawerApprove}
                  disabled={drawerSubmitting}
                  sx={{
                    flex: 1,
                    height: '41px',
                    bgcolor: '#15803D',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    px: '16px',
                    py: '12px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#166534'
                    }
                  }}
                >
                  {drawerSubmitting ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : 'Approve'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      {/* Reject Confirmation Dialog */}
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
            mb: '16px'
          }}
        >
          Please provide a remark for rejecting this regularisation request:
        </Typography>

        {/* Rejection Remark Input */}
        <OutlinedInput
          multiline
          rows={3}
          fullWidth
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter rejection remark..."
          sx={{
            mb: '24px',
            borderRadius: '8px',
            fontSize: '13px',
            bgcolor: '#F8FAFC',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }
          }}
        />

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
