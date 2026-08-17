import React, { useState, useMemo, useEffect } from 'react';
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
  Avatar,
  Chip,
  Drawer,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getProfileApprovals, approveOrRejectProfile, getShifts, getDepartments } from 'services/allEmployeeService';
import { getDevices } from 'services/deviceServices';

const DEPARTMENTS = [
  'All Departments',
  'Cardiology',
  'Emergency',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Radiology'
];

const DEFAULT_DEVICES = [
  'BioMax Pro 500 (ID: BM-2847)',
  'Device 1',
  'Device 2',
  'Device 3 (Emergency Gate)'
];

const HOD_LIST = [
  'Department HOD',
  'Dr. Annette Black',
  'Dr. Sudhanshu',
  'Dr. Priya Patel',
  'Dr. Ananya Sharma'
];

const Approvals = () => {
  const [approvalsList, setApprovalsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [devicesList, setDevicesList] = useState([]);
  const [shiftsList, setShiftsList] = useState([]);
  const [apiDepartments, setApiDepartments] = useState([]);

  // Review Drawer State
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form states in Drawer
  const [assignedDevice, setAssignedDevice] = useState('');
  const [assignedShift, setAssignedShift] = useState('');
  const [assignedHod, setAssignedHod] = useState('Department HOD');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch approval requests, devices, shifts, and departments on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Fetch profile approval requests from /profile/approvals API
    getProfileApprovals()
      .then((data) => {
        if (isMounted) {
          const items = Array.isArray(data) ? data : [];
          setApprovalsList(items);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load profile approval requests:', err);
          setError(err?.message || 'Failed to load profile approval requests');
          setApprovalsList([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Fetch device options
    getDevices()
      .then((devs) => {
        if (isMounted && Array.isArray(devs) && devs.length > 0) {
          setDevicesList(devs);
        }
      })
      .catch((err) => {
        console.warn('Failed to load devices:', err?.message || err);
      });

    // Fetch shifts options
    getShifts()
      .then((shifts) => {
        if (isMounted && Array.isArray(shifts) && shifts.length > 0) {
          setShiftsList(shifts);
        }
      })
      .catch((err) => {
        console.warn('Failed to load shifts:', err?.message || err);
      });

    // Fetch departments options
    getDepartments()
      .then((depts) => {
        if (isMounted && Array.isArray(depts) && depts.length > 0) {
          setApiDepartments(depts);
        }
      })
      .catch((err) => {
        console.warn('Failed to load departments:', err?.message || err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenReviewDrawer = (row) => {
    setSelectedRequest(row);

    const matchedDevice = devicesList.find(
      (d) =>
        typeof d === 'object' &&
        (d.id === row.deviceId ||
          d.id === row.device_id ||
          d.deviceCode === row.device ||
          d.id === row.device)
    );
    setAssignedDevice(matchedDevice ? matchedDevice.id : (row.deviceId || row.device_id || ''));

    const matchedShift = shiftsList.find(
      (s) =>
        typeof s === 'object' &&
        (s.id === row.shiftId ||
          s.id === row.current_shift_id ||
          s.id === row.shift_id ||
          (s.name && row.shift && s.name.trim().toLowerCase() === String(row.shift).trim().toLowerCase()))
    );
    const initialShiftId = matchedShift
      ? matchedShift.id
      : row.shiftId || row.current_shift_id || row.shift_id || (shiftsList[0] ? shiftsList[0].id : '');

    setAssignedShift(initialShiftId);
    setAssignedHod(row.hod && HOD_LIST.includes(row.hod) ? row.hod : 'Department HOD');
    setRejectionReason('');
    setReasonError('');
    setReviewDrawerOpen(true);
  };

  const handleCloseReviewDrawer = () => {
    setReviewDrawerOpen(false);
    setSelectedRequest(null);
    setReasonError('');
    setSubmitting(false);
  };

  const handleApprove = async () => {
    if (!selectedRequest || submitting) return;

    setSubmitting(true);
    try {
      const shiftIdToSend =
        assignedShift ||
        selectedRequest.shiftId ||
        selectedRequest.current_shift_id ||
        selectedRequest.shift_id ||
        (shiftsList.find((s) => s.name?.toLowerCase() === selectedRequest.shift?.toLowerCase())?.id) ||
        (shiftsList[0]?.id) ||
        undefined;

      const deviceIdToSend =
        assignedDevice ||
        selectedRequest.deviceId ||
        selectedRequest.device_id ||
        (devicesList[0]?.id) ||
        undefined;

      const payload = {
        action: 'APPROVE',
        device_id: deviceIdToSend,
        shift_id: shiftIdToSend,
        remarks: rejectionReason.trim() || undefined
      };

      const response = await approveOrRejectProfile(selectedRequest.id, payload);

      if (response && (response.success || response.statusCode === 200 || response.status === 200 || response.data)) {
        toast.success(response.message || `Profile photo for ${selectedRequest.name} has been approved successfully`);
        setApprovalsList((prev) => prev.filter((item) => item.id !== selectedRequest.id));
        handleCloseReviewDrawer();
      } else {
        toast.error(response?.message || 'Failed to approve profile photo');
      }
    } catch (err) {
      console.error('Approval request failed:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to approve profile photo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || submitting) return;

    if (!rejectionReason || rejectionReason.trim() === '') {
      setReasonError('Please provide a reason / remarks for rejection');
      toast.error('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        action: 'REJECT',
        remarks: rejectionReason.trim()
      };

      const response = await approveOrRejectProfile(selectedRequest.id, payload);

      if (response && (response.success || response.statusCode === 200 || response.status === 200 || response.data)) {
        toast.error(response.message || `Profile photo for ${selectedRequest.name} has been rejected`);
        setApprovalsList((prev) => prev.filter((item) => item.id !== selectedRequest.id));
        handleCloseReviewDrawer();
      } else {
        toast.error(response?.message || 'Failed to reject profile photo');
      }
    } catch (err) {
      console.error('Rejection request failed:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to reject profile photo');
    } finally {
      setSubmitting(false);
    }
  };

  // Export CSV Handler
  const handleExportExcel = () => {
    const headers = ['Emp Name,Emp ID,Department,Designation,Mobile Number,Submitted,Status\n'];
    const rows = filteredApprovals.map(
      (a) => `"${a.name}","${a.empId}","${a.department}","${a.designation}","${a.mobile}","${a.submitted}","${a.status}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const elem = document.createElement('a');
    elem.href = url;
    elem.download = `Approval_Requests_${new Date().toISOString().slice(0, 10)}.csv`;
    elem.click();
  };

  // Dynamic Departments List (from API + dynamic approval requests)
  const departmentsList = useMemo(() => {
    const set = new Set(['All Departments']);
    if (Array.isArray(apiDepartments)) {
      apiDepartments.forEach((d) => {
        const name = typeof d === 'object' ? d.name || d.department_name : d;
        if (name && typeof name === 'string' && name.trim() !== '' && name !== '-') {
          set.add(name.trim());
        }
      });
    }
    if (Array.isArray(approvalsList)) {
      approvalsList.forEach((item) => {
        if (item?.department && typeof item.department === 'string' && item.department !== '-') {
          set.add(item.department.trim());
        }
      });
    }
    return Array.from(set);
  }, [apiDepartments, approvalsList]);

  // Filtered requests list
  const filteredApprovals = useMemo(() => {
    if (!Array.isArray(approvalsList)) return [];
    return approvalsList.filter((item) => {
      const empDept = String(item?.department || '').trim().toLowerCase();
      const selDept = String(selectedDept || '').trim().toLowerCase();
      const matchesDept = selectedDept === 'All Departments' || empDept === selDept;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        String(item?.empId || '').toLowerCase().includes(q) ||
        String(item?.name || '').toLowerCase().includes(q) ||
        String(item?.designation || '').toLowerCase().includes(q) ||
        String(item?.department || '').toLowerCase().includes(q);

      return matchesDept && matchesSearch;
    });
  }, [approvalsList, selectedDept, searchQuery]);

  return (
    <Box sx={{ width: '100%', bgcolor: '#F8FAFC', minHeight: '100vh', p: '32px' }}>
      {/* Page Title */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: 'rgba(15, 23, 42, 1)',
          fontSize: '24px',
          mb: '20px'
        }}
      >
        Approval Requests
      </Typography>

      {/* Top Control Bar: Filters & Export Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          width: '100%',
          gap: 2,
          mb: 3
        }}
      >
        {/* Left: Department & Search Filters */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          {/* Department Dropdown */}
          <Box>
            <Typography variant="caption" sx={{ color: '#1e293b', fontWeight: 400, display: 'block', mb: '6px', fontSize: '13px' }}>
              Department
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                sx={{
                  bgcolor: '#ffffff',
                  height: '38px',
                  fontSize: '13px',
                  color: '#1e293b',
                  fontWeight: 400,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cbd5e1',
                    borderRadius: '8px',
                    top: 0,
                    '& legend': {
                      display: 'none'
                    }
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#94a3b8'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6366f1',
                    borderWidth: '1.5px'
                  }
                }}
              >
                {departmentsList.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Employee Search Input */}
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(30, 41, 59, 1)', fontWeight: 400, display: 'block', mb: '6px', fontSize: '13px' }}>
              Employee Search
            </Typography>
            <OutlinedInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or name..."
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(100, 116, 139, 1)', fontSize: 16 }} />
                </InputAdornment>
              }
              sx={{
                width: 392,
                fontSize: '13px',
                borderRadius: '8px',
                bgcolor: '#ffffff',
                height: '38px',
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
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#94a3b8'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6366f1',
                  borderWidth: '1.5px'
                }
              }}
            />
          </Box>
        </Box>

        {/* Right: Export Excel Button matching mockup */}
        <Box sx={{ ml: 'auto', alignSelf: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleExportExcel}
            startIcon={<FileDownloadIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: 'rgba(100, 78, 229, 1)',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '8px',
              px: 2.5,
              height: '36px',
              boxShadow: 'none',
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: '#4f46e5',
                boxShadow: '0 2px 6px rgba(99,102,241,0.25)'
              }
            }}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      {/* Approval Requests Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          overflowX: 'auto'
        }}
      >
        <Table sx={{ minWidth: 950 }} size="medium">
          <TableHead sx={{ bgcolor: '#F1F5F9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: '24px' }}>Emp Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: '24px' }}>Emp ID</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: '24px' }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: '24px' }}>Submitted</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: '24px', textAlign: 'center' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: '24px', textAlign: 'center' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : filteredApprovals.length > 0 ? (
              filteredApprovals.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:hover': { bgcolor: '#f8fafc' },
                    '& td': { borderColor: '#E2E8F0', py: 1.5, fontSize: '13px', color: '#0F172A' }
                  }}
                >
                  {/* Emp Name with Avatar */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {row.avatar ? (
                        <Avatar src={row.avatar} alt={row.name} sx={{ width: 32, height: 32 }} />
                      ) : (
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#90caf9',
                            color: '#1565c0'
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                      )}
                      <Typography sx={{ fontWeight: 400, fontSize: '13px', color: '#0F172A', lineHeight: '100%' }}>{row.name}</Typography>
                    </Box>
                  </TableCell>

                  {/* Emp ID */}
                  <TableCell sx={{ fontWeight: 400, color: '#0F172A', lineHeight: '100%' }}>{row.empId}</TableCell>

                  {/* Department */}
                  <TableCell sx={{ fontWeight: 400, fontSize: '13px', color: '#0F172A', lineHeight: '100%' }}>{row.department}</TableCell>

                  {/* Submitted Date */}
                  <TableCell sx={{ fontWeight: 400, fontSize: '13px', color: '#0F172A', lineHeight: '100%' }}>{row.submitted}</TableCell>

                  {/* Status Badge */}
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: row.status === 'Pending' ? '72px' : row.status === 'Rejected' ? '76px' : '82px',
                        height: '24px',
                        opacity: 1,
                        borderRadius: '100px',
                        pt: '4px',
                        pr: '10px',
                        pb: '4px',
                        pl: '10px',
                        boxSizing: 'border-box',
                        bgcolor: row.status === 'Approved' ? '#DCFCE7' : row.status === 'Rejected' ? '#FECACA' : '#FEF3C7',
                        color: row.status === 'Approved' ? '#15803D' : row.status === 'Rejected' ? '#DC2626' : '#D97706',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '13px',
                        lineHeight: '100%',
                        letterSpacing: '0%'
                      }}
                    >
                      {row.status}
                    </Box>
                  </TableCell>

                  {/* Action Button */}
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenReviewDrawer(row)}
                      sx={{
                        bgcolor: '#f1f5f9',
                        color: '#334155',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '13px',
                        borderRadius: '6px',
                        px: 2,
                        py: 0.4,
                        height: '28px',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#e2e8f0'
                        }
                      }}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#64748b' }}>
                  {error ? error : 'No approval requests found matching search criteria.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DETAILED VERIFICATION SIDE DRAWER */}
      <Drawer
        anchor="right"
        open={reviewDrawerOpen}
        onClose={handleCloseReviewDrawer}
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
        {selectedRequest && (
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
              <IconButton onClick={handleCloseReviewDrawer} size="small" aria-label="close">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Employee Doctor Large Image Card or Person Icon Fallback Card */}
            {selectedRequest.avatar ? (
              <Box
                component="img"
                src={selectedRequest.avatar}
                alt={selectedRequest.name}
                sx={{
                  width: '100%',
                  height: '405px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '405px',
                  bgcolor: '#90caf9',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PersonIcon sx={{ fontSize: 120, color: '#1565c0' }} />
              </Box>
            )}

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
                  {selectedRequest.empId}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', textTransform: 'capitalize', color: '#373C43', display: 'block', mb: '4px' }}>
                  Full Name
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px', lineHeight: '100%' }}>
                  {selectedRequest.name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', textTransform: 'capitalize', color: '#373C43', display: 'block', mb: '4px' }}>
                  Department
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px', lineHeight: '100%' }}>
                  {selectedRequest.department}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '100%', textTransform: 'capitalize', color: '#373C43', display: 'block', mb: '4px' }}>
                  Designation
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#0F172A', fontSize: '14px', lineHeight: '100%' }}>
                  {selectedRequest.designation}
                </Typography>
              </Box>
            </Box>

            {/* Field 1: Assign biometric device */}
            <Box>
              <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '100%', color: '#0F172A', display: 'block', mb: '6px' }}>
                Assign biometric device:
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={assignedDevice}
                  onChange={(e) => setAssignedDevice(e.target.value)}
                  displayEmpty
                  MenuProps={{ style: { zIndex: 1500 } }}
                  sx={{
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: assignedDevice ? '#0F172A' : '#64748B',
                    height: '40px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' }
                  }}
                >
                  <MenuItem value="" disabled sx={{ fontSize: '13px', color: '#64748B', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    Select device
                  </MenuItem>
                  {devicesList.map((d) => {
                    const dId = typeof d === 'object' ? d.id : d;
                    const dLabel =
                      typeof d === 'object'
                        ? d.deviceCode && d.location
                          ? `${d.deviceCode} (${d.location})`
                          : d.deviceCode || d.id
                        : d;
                    return (
                      <MenuItem key={dId} value={dId} sx={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                        {dLabel}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>

            {/* Field 2: Assign Shift */}
            <Box>
              <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '100%', color: '#0F172A', display: 'block', mb: '6px' }}>
                Assign shift:
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={assignedShift}
                  onChange={(e) => setAssignedShift(e.target.value)}
                  displayEmpty
                  MenuProps={{ style: { zIndex: 1500 } }}
                  sx={{
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: assignedShift ? '#0F172A' : '#64748B',
                    height: '40px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' }
                  }}
                >
                  <MenuItem value="" disabled sx={{ fontSize: '13px', color: '#64748B', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    Select shift
                  </MenuItem>
                  {shiftsList.map((s) => {
                    const sId = typeof s === 'object' ? s.id : s;
                    const sLabel =
                      typeof s === 'object'
                        ? s.timeRange
                          ? `${s.name} (${s.timeRange})`
                          : s.name || s.id
                        : s;
                    return (
                      <MenuItem key={sId} value={sId} sx={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                        {sLabel}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>

            {/* Field 3: Remarks / Reason for rejection */}
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Typography variant="caption" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '100%', color: '#0F172A', display: 'block' }}>
                Remarks / Reason {reasonError && <span style={{ color: '#DC2626' }}>*</span>}:
              </Typography>
              <OutlinedInput
                multiline
                rows={3}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (reasonError) setReasonError('');
                }}
                error={Boolean(reasonError)}
                placeholder="Enter remarks or reason if rejecting (e.g. Blurry or bad lighting)..."
                sx={{
                  width: '100%',
                  minHeight: '90px',
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  color: '#0F172A',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: reasonError ? '#DC2626' : '#E2E8F0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: reasonError ? '#DC2626' : '#CBD5E1' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: reasonError ? '#DC2626' : '#6366f1' },
                  '& input::placeholder, & textarea::placeholder': {
                    color: '#64748B',
                    opacity: 1,
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400
                  }
                }}
              />
              {reasonError && (
                <Typography variant="caption" sx={{ color: '#DC2626', fontSize: '12px', mt: '2px', fontWeight: 500 }}>
                  {reasonError}
                </Typography>
              )}
            </Box>

            {/* Action Buttons Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px', mt: 'auto', pt: 2 }}>
              {/* Reject Light Red Button */}
              <Button
                variant="outlined"
                onClick={handleReject}
                disabled={submitting}
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
                {submitting ? <CircularProgress size={18} sx={{ color: '#DC2626' }} /> : 'Reject'}
              </Button>

              {/* Approve Photo Solid Green Button */}
              <Button
                variant="contained"
                onClick={handleApprove}
                disabled={submitting}
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
                {submitting ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : 'Approve Photo'}
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default Approvals;
