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
  IconButton,
  Avatar,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreHoriz as MoreHorizIcon,
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { getEmployees } from 'services/allEmployeeService';
import { updateEmployee } from './shiftService';

const DEPARTMENTS = [
  'All Departments',
  'Cardiology',
  'Emergency',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Radiology'
];

const MANAGERS_LIST = [
  'Annette Black',
  'Dr. Sudhanshu',
  'Dr. Priya Patel',
  'Dr. Ananya Sharma',
  'Dr. Ravi Mehta',
  'Dr. Rajesh Kumar'
];

const SHIFTS_LIST = [
  'Morning Shift (09:00 AM - 05:00 PM)',
  'Evening Shift (02:00 PM - 10:00 PM)',
  'Night Shift (10:00 PM - 06:00 AM)',
  'General Shift (09:00 AM - 05:00 PM)',
  'New S/N Duty (09:00 AM - 05:00 PM)'
];

const DEVICES_LIST = [
  'BioMax Pro 500 (ID: BM-2847)',
  'Device 1',
  'Device 2',
  'Device 3 (Emergency Gate)'
];

const AllEmployees = () => {
  // State for Employee Master Dataset
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Modals States
  const [hodModalOpen, setHodModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);

  // Form Fields inside Modals
  const [newHod, setNewHod] = useState('');
  const [newShift, setNewShift] = useState('');
  const [newDevice, setNewDevice] = useState('');

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getEmployees()
      .then((data) => {
        if (isMounted) {
          setEmployees(Array.isArray(data) ? data : []);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load employees:', err);
          setError(err?.message || 'Failed to load employees');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle 3 Dots Menu Open
  const handleOpenMenu = (event, emp) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmp(emp);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Open Specific Modals
  const handleOpenHodModal = () => {
    if (selectedEmp) {
      setNewHod('');
      setHodModalOpen(true);
    }
    handleCloseMenu();
  };

  const handleOpenShiftModal = () => {
    if (selectedEmp) {
      setNewShift('');
      setShiftModalOpen(true);
    }
    handleCloseMenu();
  };

  const handleOpenDeviceModal = () => {
    if (selectedEmp) {
      setNewDevice('');
      setDeviceModalOpen(true);
    }
    handleCloseMenu();
  };

  // Update Handlers
  const handleUpdateHod = () => {
    if (selectedEmp && newHod) {
      const updated = updateEmployee(selectedEmp.id, { hod: newHod });
      setEmployees(updated);
    }
    setHodModalOpen(false);
  };

  const handleUpdateShift = () => {
    if (selectedEmp && newShift) {
      const updated = updateEmployee(selectedEmp.id, { shift: newShift });
      setEmployees(updated);
    }
    setShiftModalOpen(false);
  };

  const handleUpdateDevice = () => {
    if (selectedEmp && newDevice) {
      const updated = updateEmployee(selectedEmp.id, { device: newDevice });
      setEmployees(updated);
    }
    setDeviceModalOpen(false);
  };

  // Export CSV Handler
  const handleExportExcel = () => {
    const headers = ['Emp ID,Emp Name,Department,Designation,HOD,Mobile Number,Current Shift,Device Assigned\n'];
    const rows = employees.map(
      (e) => `"${e.empId}","${e.name}","${e.department}","${e.designation}","${e.hod}","${e.mobile}","${e.shift}","${e.device}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Employee_Master_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Dynamic Departments List
  const departmentsList = useMemo(() => {
    const list = new Set(DEPARTMENTS);
    if (Array.isArray(employees)) {
      employees.forEach((emp) => {
        if (emp?.department && typeof emp.department === 'string' && emp.department !== '-') {
          list.add(emp.department);
        }
      });
    }
    return Array.from(list);
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    return employees.filter((emp) => {
      const empDept = String(emp?.department || '').trim().toLowerCase();
      const selDept = String(selectedDept || '').trim().toLowerCase();
      const matchesDept = selectedDept === 'All Departments' || empDept === selDept;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        String(emp?.empId || '').toLowerCase().includes(q) ||
        String(emp?.name || '').toLowerCase().includes(q) ||
        String(emp?.designation || '').toLowerCase().includes(q) ||
        String(emp?.department || '').toLowerCase().includes(q) ||
        String(emp?.mobile || '').toLowerCase().includes(q);

      return matchesDept && matchesSearch;
    });
  }, [employees, selectedDept, searchQuery]);

  return (
    <Box sx={{ width: '100%', bgcolor: '#FFFFFF', minHeight: '100vh', p: "32px" }}>
      {/* Page Title */}
      <Typography
        variant="h3"
        sx={{
          mb: "20px",
          fontWeight: 700,
          color: "rgba(15, 23, 42, 1)",
          fontSize: '24px',
        }}
      >
        Employee Master
      </Typography>

      {/* Main Container Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          bgcolor: '#ffffff'
        }}
      >
        {/* Top Control Bar: Filters & Export Button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justify: 'space-between',
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
                    borderRadius: '6px',
                    overflow: 'hidden',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0',
                      borderRadius: '6px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#cbd5e1'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1'
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
                  fontSize: '13px',
                  borderRadius: '8px',
                  bgcolor: '#ffffff',
                  height: '38px',
                  width: '260px',
                  color: 'rgba(100, 116, 139, 1)',
                  overflow: 'hidden',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cbd5e1',
                    borderRadius: '8px'
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

        {/* Employee Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflowX: 'auto'
          }}
        >
          <Table sx={{ minWidth: 1000 }} size="medium">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: "24px", }}>Emp ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: "24px", textAlign: 'center' }}>Emp Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: "24px" }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: "24px" }}>Designation</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: "24px" }}>HOD</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: "24px" }}>Mobile Number</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: "24px" }}>Current Shift</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: "24px" }}>Device Assigned</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: '24px', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                    <Typography sx={{ mt: 1.5, color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
                      Loading employees...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:hover': { bgcolor: '#f8fafc' },
                      '& td': { borderColor: '#f1f5f9', py: 1.5, fontSize: '0.85rem', color: '#1e293b' }
                    }}
                  >
                    {/* Emp ID */}
                    <TableCell sx={{ fontWeight: 400, color: 'rgba(0, 0, 0, 1)', lineHeight: "100% " }}>{row.empId}</TableCell>

                    {/* Emp Name with Avatar */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={row.avatar} alt={row.name} sx={{ width: 32, height: 32 }} />
                        <Typography sx={{ fontWeight: 400, fontSize: '13px', color: '#0F172A', lineHeight: "100% " }}>{row.name}</Typography>
                      </Box>
                    </TableCell>

                    {/* Department */}
                    <TableCell sx={{ fontWeight: 400, fontSize: '13px', color: '#0F172A', lineHeight: "100% " }}>{row.department}</TableCell>

                    {/* Designation */}
                    <TableCell sx={{ fontWeight: 400, fontSize: '13px', color: '#0F172A', lineHeight: "100% " }}>{row.designation}</TableCell>

                    {/* HOD */}
                    <TableCell sx={{ fontWeight: 400, fontSize: '13px', color: '#0F172A', lineHeight: "100%" }}>{row.hod}</TableCell>

                    {/* Mobile Number */}
                    <TableCell sx={{ fontWeight: 400, fontSize: '13px', color: '#0F172A', lineHeight: "100% " }}>{row.mobile}</TableCell>

                    {/* Current Shift */}
                    <TableCell sx={{ fontWeight: 400, fontSize: '13px', color: '#0F172A', lineHeight: "100% " }}>{row.shift}</TableCell>

                    {/* Device Assigned */}
                    <TableCell sx={{ fontWeight: 400, fontSize: '13px', color: '#0F172A', lineHeight: "100% " }}>{row.device}</TableCell>

                    {/* Actions Three Dots Button */}
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, row)}
                        sx={{ color: '#64748b', p: 0.5 }}
                      >
                        <MoreHorizIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#64748b' }}>
                    {error ? (
                      <Typography sx={{ color: '#ef4444', fontSize: '14px' }}>{error}</Typography>
                    ) : (
                      'No employees found matching search criteria.'
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Popover Menu (3 Dots Click) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0px 4px 16px 0px #0000001F',
            minWidth: "240px",
            py: 0.5
          }
        }}
      >
        <MenuItem
          onClick={handleOpenHodModal}
          sx={{ fontSize: '14px', fontWeight: 400, lineHeight: "100%", color: '#212121', py: "10px" }}
        >
          Change HOD
        </MenuItem>
        <MenuItem
          onClick={handleOpenShiftModal}
          sx={{ fontSize: '14px', fontWeight: 400, lineHeight: "100%", color: '#212121', py: "10px" }}
        >
          Change Shift
        </MenuItem>
        <MenuItem
          onClick={handleOpenDeviceModal}
          sx={{ fontSize: '14px', fontWeight: 400, lineHeight: "100%", color: '#212121', py: "10px" }}
        >
          Change Device
        </MenuItem>
      </Menu>

      {/* MODAL 1: CHANGE HOD MODAL */}
      <Dialog
        open={hodModalOpen}
        onClose={() => setHodModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: '24px',
            maxWidth: '430px',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <DialogTitle sx={{ p: 0, mb: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '18px', lineHeight: '24px' }}>
            Change HOD
          </Typography>
          <IconButton
            onClick={() => setHodModalOpen(false)}
            size="small"
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#F8FAFC',
              border: '1px solid #F1F5F9',
              color: '#64748B',
              '&:hover': { bgcolor: '#F1F5F9' }
            }}
          >
            <CloseIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, mb: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Current Manager */}
          <Box>
            <Typography sx={{ color: '#475569', fontWeight: 500, display: 'block', mb: '6px', fontSize: '14px', lineHeight: '20px' }}>
              Current Manager
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedEmp?.hod || 'Annette Black'}
                disabled
                IconComponent={KeyboardArrowDownIcon}
                sx={{
                  height: '46px',
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0F172A',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '&.Mui-disabled': {
                    WebkitTextFillColor: '#0F172A',
                    bgcolor: '#F8FAFC'
                  },
                  '& .MuiSelect-icon': {
                    color: '#64748B'
                  }
                }}
              >
                <MenuItem value={selectedEmp?.hod || 'Annette Black'}>
                  {selectedEmp?.hod || 'Annette Black'}
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* New Manager */}
          <Box>
            <Typography sx={{ color: '#475569', fontWeight: 500, display: 'block', mb: '6px', fontSize: '14px', lineHeight: '20px' }}>
              New Manager
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={newHod}
                onChange={(e) => setNewHod(e.target.value)}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography sx={{ color: '#64748B', fontSize: '15px', fontWeight: 400 }}>Select Manager</Typography>;
                  }
                  return <Typography sx={{ color: '#0F172A', fontSize: '15px', fontWeight: 500 }}>{selected}</Typography>;
                }}
                sx={{
                  height: '46px',
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0F172A',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#644EE5' },
                  '& .MuiSelect-icon': {
                    color: '#64748B'
                  }
                }}
              >
                <MenuItem value="" disabled sx={{ display: 'none' }}>
                  Select Manager
                </MenuItem>
                {MANAGERS_LIST.map((m) => (
                  <MenuItem key={m} value={m} sx={{ fontSize: '14px', color: '#0F172A' }}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <Button
            variant="outlined"
            onClick={() => setHodModalOpen(false)}
            sx={{
              flex: 1,
              height: '48px',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              bgcolor: '#FFFFFF',
              color: '#334155',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '15px',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#94A3B8'
              }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdateHod}
            disabled={!newHod}
            sx={{
              flex: 1,
              height: '48px',
              borderRadius: '12px',
              bgcolor: '#644EE5',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#4F3BCB',
                boxShadow: 'none'
              },
              '&.Mui-disabled': {
                bgcolor: '#CBD5E1',
                color: '#FFFFFF'
              }
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 2: CHANGE SHIFT MODAL */}
      <Dialog
        open={shiftModalOpen}
        onClose={() => setShiftModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: '24px',
            maxWidth: '430px',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <DialogTitle sx={{ p: 0, mb: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '18px', lineHeight: '24px' }}>
            Change Shift
          </Typography>
          <IconButton
            onClick={() => setShiftModalOpen(false)}
            size="small"
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#F8FAFC',
              border: '1px solid #F1F5F9',
              color: '#64748B',
              '&:hover': { bgcolor: '#F1F5F9' }
            }}
          >
            <CloseIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, mb: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Current Shift */}
          <Box>
            <Typography sx={{ color: '#475569', fontWeight: 500, display: 'block', mb: '6px', fontSize: '14px', lineHeight: '20px' }}>
              Current Shift
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedEmp?.shift || SHIFTS_LIST[0]}
                disabled
                IconComponent={KeyboardArrowDownIcon}
                sx={{
                  height: '46px',
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0F172A',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '&.Mui-disabled': {
                    WebkitTextFillColor: '#0F172A',
                    bgcolor: '#F8FAFC'
                  },
                  '& .MuiSelect-icon': {
                    color: '#64748B'
                  }
                }}
              >
                <MenuItem value={selectedEmp?.shift || SHIFTS_LIST[0]}>
                  {selectedEmp?.shift || SHIFTS_LIST[0]}
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* New Shift */}
          <Box>
            <Typography sx={{ color: '#475569', fontWeight: 500, display: 'block', mb: '6px', fontSize: '14px', lineHeight: '20px' }}>
              New Shift
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={newShift}
                onChange={(e) => setNewShift(e.target.value)}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography sx={{ color: '#64748B', fontSize: '15px', fontWeight: 400 }}>Select Shift</Typography>;
                  }
                  return <Typography sx={{ color: '#0F172A', fontSize: '15px', fontWeight: 500 }}>{selected}</Typography>;
                }}
                sx={{
                  height: '46px',
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0F172A',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#644EE5' },
                  '& .MuiSelect-icon': {
                    color: '#64748B'
                  }
                }}
              >
                <MenuItem value="" disabled sx={{ display: 'none' }}>
                  Select Shift
                </MenuItem>
                {SHIFTS_LIST.map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: '14px', color: '#0F172A' }}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <Button
            variant="outlined"
            onClick={() => setShiftModalOpen(false)}
            sx={{
              flex: 1,
              height: '48px',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              bgcolor: '#FFFFFF',
              color: '#334155',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '15px',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#94A3B8'
              }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdateShift}
            disabled={!newShift}
            sx={{
              flex: 1,
              height: '48px',
              borderRadius: '12px',
              bgcolor: '#644EE5',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#4F3BCB',
                boxShadow: 'none'
              },
              '&.Mui-disabled': {
                bgcolor: '#CBD5E1',
                color: '#FFFFFF'
              }
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 3: CHANGE BIOMETRIC DEVICE MODAL */}
      <Dialog
        open={deviceModalOpen}
        onClose={() => setDeviceModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: '24px',
            maxWidth: '430px',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <DialogTitle sx={{ p: 0, mb: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '18px', lineHeight: '24px' }}>
            Change Biometric Device
          </Typography>
          <IconButton
            onClick={() => setDeviceModalOpen(false)}
            size="small"
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#F8FAFC',
              border: '1px solid #F1F5F9',
              color: '#64748B',
              '&:hover': { bgcolor: '#F1F5F9' }
            }}
          >
            <CloseIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, mb: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Current Device */}
          <Box>
            <Typography sx={{ color: '#475569', fontWeight: 500, display: 'block', mb: '6px', fontSize: '14px', lineHeight: '20px' }}>
              Current Device
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedEmp?.device || 'BioMax Pro 500 (ID: BM-2847)'}
                disabled
                IconComponent={KeyboardArrowDownIcon}
                sx={{
                  height: '46px',
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0F172A',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '&.Mui-disabled': {
                    WebkitTextFillColor: '#0F172A',
                    bgcolor: '#F8FAFC'
                  },
                  '& .MuiSelect-icon': {
                    color: '#64748B'
                  }
                }}
              >
                <MenuItem value={selectedEmp?.device || 'BioMax Pro 500 (ID: BM-2847)'}>
                  {selectedEmp?.device || 'BioMax Pro 500 (ID: BM-2847)'}
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* New Device */}
          <Box>
            <Typography sx={{ color: '#475569', fontWeight: 500, display: 'block', mb: '6px', fontSize: '14px', lineHeight: '20px' }}>
              New Device
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={newDevice}
                onChange={(e) => setNewDevice(e.target.value)}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography sx={{ color: '#64748B', fontSize: '15px', fontWeight: 400 }}>Select Device</Typography>;
                  }
                  return <Typography sx={{ color: '#0F172A', fontSize: '15px', fontWeight: 500 }}>{selected}</Typography>;
                }}
                sx={{
                  height: '46px',
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0F172A',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#644EE5' },
                  '& .MuiSelect-icon': {
                    color: '#64748B'
                  }
                }}
              >
                <MenuItem value="" disabled sx={{ display: 'none' }}>
                  Select Device
                </MenuItem>
                {DEVICES_LIST.map((d) => (
                  <MenuItem key={d} value={d} sx={{ fontSize: '14px', color: '#0F172A' }}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <Button
            variant="outlined"
            onClick={() => setDeviceModalOpen(false)}
            sx={{
              flex: 1,
              height: '48px',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              bgcolor: '#FFFFFF',
              color: '#334155',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '15px',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#94A3B8'
              }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdateDevice}
            disabled={!newDevice}
            sx={{
              flex: 1,
              height: '48px',
              borderRadius: '12px',
              bgcolor: '#644EE5',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#4F3BCB',
                boxShadow: 'none'
              },
              '&.Mui-disabled': {
                bgcolor: '#CBD5E1',
                color: '#FFFFFF'
              }
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllEmployees;
