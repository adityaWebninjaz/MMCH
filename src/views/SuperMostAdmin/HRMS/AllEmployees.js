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
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Person as PersonIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  getEmployees,
  exportEmployeesMaster,
  updateEmployeeDevice,
  updateEmployeeReportingManager,
  updateEmployeeShift,
  getDesignations,
  getDepartments,
  getManagers,
  getShifts
} from 'services/allEmployeeService';
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
  // State for Employee Master Dataset & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDept, setSelectedDept] = useState('');

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
  const [updatingDevice, setUpdatingDevice] = useState(false);
  const [updatingShift, setUpdatingShift] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Devices & Shifts & Departments State
  const [devicesList, setDevicesList] = useState(DEVICES_LIST);
  const [shiftsList, setShiftsList] = useState([]);
  const [apiDepartments, setApiDepartments] = useState([]);
  const [managersList, setManagersList] = useState(MANAGERS_LIST);
  const [updatingHod, setUpdatingHod] = useState(false);

  // Data & Loading States
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Biometric Devices list from the device service
  useEffect(() => {
    let isMounted = true;
    getDevices()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDevicesList(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load devices:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Shifts list from API
  useEffect(() => {
    let isMounted = true;
    getShifts()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setShiftsList(data);
        }
      })
      .catch((err) => console.error('Failed to load shifts in AllEmployees:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Departments from API
  useEffect(() => {
    let isMounted = true;
    getDepartments()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setApiDepartments(data);
        }
      })
      .catch((err) => console.error('Failed to load departments in AllEmployees:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    getDesignations()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setManagersList(data);
        }
      })
      .catch((err) => console.error('Failed to load designations:', err));
    return () => { isMounted = false; };
  }, []);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  // Clear Search Input Handler
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(1);
  };

  // Debounce search query input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch employees from API with debounced search, page, limit, and department_id parameters
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getEmployees({
      search: debouncedSearch,
      page,
      limit,
      department_id: selectedDept || undefined
    })
      .then((data) => {
        if (isMounted) {
          const items = data?.items || (Array.isArray(data) ? data : []);
          setEmployees(items);
          setTotalCount(Number(data?.total ?? items.length) || 0);
          setTotalPages(
            Math.max(
              1,
              Number(data?.totalPages) ||
              Math.ceil((Number(data?.total ?? items.length) || 0) / limit)
            )
          );
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load employees:', err);
          setError(err?.message || 'Failed to load employees');
          setEmployees([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, page, limit, selectedDept]);

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
      getDesignations()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setManagersList(data);
        })
        .catch((err) => console.error('Failed to load designations:', err));
      setHodModalOpen(true);
    }
    handleCloseMenu();
  };

  const handleOpenShiftModal = () => {
    if (selectedEmp) {
      const matched = shiftsList.find(
        (s) =>
          typeof s === 'object' &&
          (s.id === selectedEmp.shiftId ||
            s.id === selectedEmp.current_shift_id ||
            s.id === selectedEmp.shift_id ||
            (s.name && selectedEmp.shift && s.name.trim().toLowerCase() === String(selectedEmp.shift).trim().toLowerCase()))
      );
      setNewShift(matched ? matched.id : (selectedEmp.shiftId || selectedEmp.current_shift_id || ''));

      getShifts()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setShiftsList(data);
        })
        .catch((err) => console.error('Failed to load shifts:', err));

      setShiftModalOpen(true);
    }
    handleCloseMenu();
  };

  const handleOpenDeviceModal = () => {
    if (selectedEmp) {
      setNewDevice('');
      getDevices()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setDevicesList(data);
          }
        })
        .catch((err) => console.error('Failed to load devices:', err));
      setDeviceModalOpen(true);
    }
    handleCloseMenu();
  };

  // Update Handlers
  const handleUpdateHod = async () => {
    if (!selectedEmp || !newHod) return;

    setUpdatingHod(true);
    try {
      const response = await updateEmployeeReportingManager(selectedEmp.id, { reporting_manager_id: newHod });

      if (response && (response.success || response.statusCode === 200 || response.status === 200 || response.data)) {
        toast.success(response.message || 'Reporting manager updated successfully');

        const matchedManager = managersList.find((m) => (typeof m === 'object' ? m.id === newHod || m.name === newHod : m === newHod));
        const updatedLabel = matchedManager
          ? typeof matchedManager === 'object'
            ? matchedManager.name || matchedManager.designation || matchedManager.designation_name || matchedManager.full_name || matchedManager.title || matchedManager.id
            : matchedManager
          : newHod;

        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === selectedEmp.id ? { ...emp, hod: updatedLabel, hodId: newHod } : emp
          )
        );

        setHodModalOpen(false);

        getEmployees({ search: debouncedSearch, page, limit, department_id: selectedDept || undefined })
          .then((data) => {
            const items = data?.items || (Array.isArray(data) ? data : []);
            if (items.length > 0) setEmployees(items);
          })
          .catch((e) => console.error('Background fetch failed:', e));
      } else {
        toast.error(response?.message || 'Failed to update reporting manager');
      }
    } catch (err) {
      console.error('Failed to update reporting manager:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update reporting manager');
    } finally {
      setUpdatingHod(false);
    }
  };

  const handleUpdateShift = async () => {
    if (!selectedEmp || !newShift) return;

    setUpdatingShift(true);
    try {
      const response = await updateEmployeeShift(selectedEmp.id, { shift_id: newShift });

      if (response && (response.success || response.statusCode === 200 || response.status === 200 || response.data)) {
        toast.success(response.message || 'Shift updated successfully');

        const matchedShift = shiftsList.find((s) => (typeof s === 'object' ? s.id === newShift : s === newShift));
        const updatedLabel = matchedShift
          ? typeof matchedShift === 'object'
            ? matchedShift.name || matchedShift.id
            : matchedShift
          : newShift;

        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === selectedEmp.id
              ? { ...emp, shift: updatedLabel, shiftId: newShift, current_shift_id: newShift }
              : emp
          )
        );

        setShiftModalOpen(false);

        // Re-fetch in background
        getEmployees({ search: debouncedSearch, page, limit, department_id: selectedDept || undefined })
          .then((data) => {
            const items = data?.items || (Array.isArray(data) ? data : []);
            if (items.length > 0) setEmployees(items);
          })
          .catch((e) => console.error('Background fetch failed:', e));
      } else {
        toast.error(response?.message || 'Failed to update shift');
      }
    } catch (err) {
      console.error('Failed to update shift:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update shift');
    } finally {
      setUpdatingShift(false);
    }
  };

  const handleUpdateDevice = async () => {
    if (!selectedEmp || !newDevice) return;

    setUpdatingDevice(true);
    try {
      const response = await updateEmployeeDevice(selectedEmp.id, { device_id: newDevice });

      if (response && (response.success || response.statusCode === 200 || response.status === 200 || response.data)) {
        toast.success(response.message || 'Device updated successfully');

        // Find device label for immediate UI update
        const matchedDevice = devicesList.find((d) => (typeof d === 'object' ? d.id === newDevice : d === newDevice));
        const updatedLabel = matchedDevice
          ? typeof matchedDevice === 'object'
            ? matchedDevice.deviceCode && matchedDevice.location
              ? `${matchedDevice.deviceCode} (${matchedDevice.location})`
              : matchedDevice.deviceCode || matchedDevice.id
            : matchedDevice
          : newDevice;

        setEmployees((prev) =>
          prev.map((emp) => (emp.id === selectedEmp.id ? { ...emp, device: updatedLabel } : emp))
        );

        setDeviceModalOpen(false);

        // Re-fetch employee list in background to ensure fresh data
        getEmployees({ search: debouncedSearch, page, limit, department_id: selectedDept || undefined })
          .then((data) => {
            const items = data?.items || (Array.isArray(data) ? data : []);
            if (items.length > 0) {
              setEmployees(items);
            }
          })
          .catch((e) => console.error('Background fetch failed:', e));
      } else {
        toast.error(response?.message || 'Failed to update device');
      }
    } catch (err) {
      console.error('Failed to update device:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update device');
    } finally {
      setUpdatingDevice(false);
    }
  };

  // Export Excel Handler
  const handleExportExcel = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportEmployeesMaster({
        search: debouncedSearch,
        department_id: selectedDept || undefined
      });
      toast.success('Employee Master exported successfully');
    } catch (err) {
      console.error('API export failed, falling back to CSV export:', err);
      try {
        const headers = ['Emp ID,Emp Name,Department,Designation,HOD,Mobile Number,Current Shift,Device Assigned\n'];
        const rows = filteredEmployees.map(
          (e) => `"${e.empId}","${e.name}","${e.department}","${e.designation}","${e.hod}","${e.mobile}","${e.shift}","${e.device}"\n`
        );
        const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Employee_Master_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast.success('Employee Master exported successfully');
      } catch (fallbackErr) {
        toast.error(err?.response?.data?.message || err?.message || 'Failed to export employee master');
      }
    } finally {
      setExporting(false);
    }
  };

  // Dynamic Departments Options with UUID ids
  const departmentOptions = useMemo(() => {
    const list = [{ id: '', name: 'All Departments' }];
    if (Array.isArray(apiDepartments) && apiDepartments.length > 0) {
      apiDepartments.forEach((d) => {
        const id = typeof d === 'object' ? d.id || d._id || d.department_id : d;
        const name = typeof d === 'object' ? d.name || d.department_name || d.title || id : d;
        if (id && name && name !== 'All Departments') {
          list.push({ id, name });
        }
      });
    }
    return list;
  }, [apiDepartments]);

  // Filtered employees list (server-side filtered)
  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    return employees;
  }, [employees]);

  const startIndex = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalCount);

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
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
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
                  {departmentOptions.map((dept) => (
                    <MenuItem key={dept.id || 'all'} value={dept.id}>
                      {dept.name}
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
                onChange={handleSearchChange}
                placeholder="Search by ID or name..."
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
                        onClick={handleClearSearch}
                        sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#475569' } }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null
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
              disabled={exporting}
              startIcon={exporting ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <FileDownloadIcon sx={{ fontSize: 18 }} />}
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
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(100, 78, 229, 0.7)',
                  color: '#ffffff'
                }
              }}
            >
              {exporting ? 'Exporting...' : 'Export Excel'}
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
            <TableHead sx={{ bgcolor: '#F1F5F9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: "24px", }}>Emp ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'rgba(22, 21, 28, 1)', fontSize: '14px', py: 1.5, lineHeight: "24px" }}>Emp Name</TableCell>
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
                      '& td': { borderColor: '#E2E8F0', py: 1.5, fontSize: '0.85rem', color: '#1e293b' }
                    }}
                  >
                    {/* Emp ID */}
                    <TableCell sx={{ fontWeight: 400, color: 'rgba(0, 0, 0, 1)', lineHeight: "100% " }}>{row.empId}</TableCell>

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

        {/* Pagination Bar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            pt: 2.5,
            pb: 0.5
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: '#64748B', fontSize: '14px', fontWeight: '400', lineHeight: '20px' }}
          >
            Showing {startIndex}-{endIndex} of {totalCount}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Rows per page */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography
                variant="body2"
                sx={{ fontFamily: 'Inter, sans-serif', color: '#1E293B', fontSize: '14px', fontWeight: 500, lineHeight: '20px', letterSpacing: '0%' }}
              >
                Rows per page
              </Typography>
              <Select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
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
                  lineHeight: '20px',
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
                    borderColor: '#644EE5'
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
                    color: '#1E293B'
                  },
                  '& .MuiSelect-icon': {
                    color: '#1E293B',
                    fontSize: '18px',
                    right: '8px'
                  }
                }}
              >
                <MenuItem value={10} sx={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#1E293B' }}>
                  10
                </MenuItem>
                <MenuItem value={20} sx={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#1E293B' }}>
                  20
                </MenuItem>
                <MenuItem value={50} sx={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#1E293B' }}>
                  50
                </MenuItem>
                <MenuItem value={100} sx={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#1E293B' }}>
                  100
                </MenuItem>
              </Select>
            </Box>

            {/* Page counter text */}
            <Typography
              variant="body2"
              sx={{ fontFamily: 'Inter, sans-serif', color: '#1E293B', fontSize: '14px', fontWeight: 500, lineHeight: '20px', letterSpacing: '0%' }}
            >
              Page {page} of {Math.max(1, totalPages)}
            </Typography>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => setPage(1)}
                disabled={page === 1 || loading}
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
                disabled={page === 1 || loading}
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
                disabled={page >= totalPages || loading}
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
                disabled={page >= totalPages || loading}
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
        // onClose={() => setHodModalOpen(false)}
        onClose={() => { if (!updatingHod) setHodModalOpen(false); }}
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
            // onClick={() => setHodModalOpen(false)}
            onClick={() => { if (!updatingHod) setHodModalOpen(false); }}
            disabled={updatingHod}
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
                disabled={updatingHod}
                IconComponent={KeyboardArrowDownIcon}
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography sx={{ color: '#64748B', fontSize: '15px', fontWeight: 400 }}>Select Manager</Typography>;
                  }
                  // return <Typography sx={{ color: '#0F172A', fontSize: '15px', fontWeight: 500 }}>{selected}</Typography>;
                  const match = managersList.find((m) => (typeof m === 'object' ? m.id === selected || m.name === selected : m === selected));
                  const label = match
                    ? typeof match === 'object'
                      ? match.name || match.designation || match.designation_name || match.full_name || match.title || match.id
                      : match
                    : selected;
                  return <Typography sx={{ color: '#0F172A', fontSize: '15px', fontWeight: 500 }}>{label}</Typography>;
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
                {managersList.map((m) => {
                  const mId = typeof m === 'object' ? (m.id || m.name) : m;
                  const mLabel = typeof m === 'object' ? (m.name || m.designation || m.designation_name || m.full_name || m.title || m.id) : m;
                  return (
                    <MenuItem key={mId} value={mId} sx={{ fontSize: '14px', color: '#0F172A' }}>
                      {mLabel}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <Button
            variant="outlined"
            onClick={() => setHodModalOpen(false)}
            disabled={updatingHod}
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
            // disabled={!newHod}
            disabled={!newHod || updatingHod}
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
           {updatingHod ? <CircularProgress size={22} sx={{ color: '#FFFFFF' }} /> : 'Update'}
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
                value={selectedEmp?.shift || '-'}
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
                <MenuItem value={selectedEmp?.shift || '-'}>
                  {selectedEmp?.shift || '-'}
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
                  const matched = shiftsList.find((s) => (typeof s === 'object' ? s.id === selected : s === selected));
                  const label = matched
                    ? typeof matched === 'object'
                      ? `${matched.name}${matched.timeRange ? ` (${matched.timeRange})` : ''}`
                      : matched
                    : selected;
                  return <Typography sx={{ color: '#0F172A', fontSize: '15px', fontWeight: 500 }}>{label}</Typography>;
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
                {shiftsList.map((s) => {
                  const sId = typeof s === 'object' ? s.id : s;
                  const sLabel =
                    typeof s === 'object'
                      ? s.timeRange
                        ? `${s.name} (${s.timeRange})`
                        : s.name || s.id
                      : s;
                  return (
                    <MenuItem key={sId} value={sId} sx={{ fontSize: '14px', color: '#0F172A' }}>
                      {sLabel}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <Button
            variant="outlined"
            onClick={() => setShiftModalOpen(false)}
            disabled={updatingShift}
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
            disabled={!newShift || updatingShift}
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
            {updatingShift ? <CircularProgress size={22} sx={{ color: '#FFFFFF' }} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 3: CHANGE BIOMETRIC DEVICE MODAL */}
      <Dialog
        open={deviceModalOpen}
        onClose={() => {
          if (!updatingDevice) setDeviceModalOpen(false);
        }}
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
            onClick={() => {
              if (!updatingDevice) setDeviceModalOpen(false);
            }}
            disabled={updatingDevice}
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
                value={selectedEmp?.device || 'None'}
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
                <MenuItem value={selectedEmp?.device || 'None'}>
                  {selectedEmp?.device && selectedEmp.device !== '-' ? selectedEmp.device : 'No device assigned'}
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
                disabled={updatingDevice}
                IconComponent={KeyboardArrowDownIcon}
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography sx={{ color: '#64748B', fontSize: '15px', fontWeight: 400 }}>Select Device</Typography>;
                  }
                  const match = devicesList.find((d) => (typeof d === 'object' ? d.id === selected : d === selected));
                  const label = match
                    ? typeof match === 'object'
                      ? match.deviceCode && match.location
                        ? `${match.deviceCode} (${match.location})`
                        : match.deviceCode || match.id
                      : match
                    : selected;
                  return <Typography sx={{ color: '#0F172A', fontSize: '15px', fontWeight: 500 }}>{label}</Typography>;
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
                {devicesList.map((d) => {
                  const dId = typeof d === 'object' ? d.id : d;
                  const dLabel =
                    typeof d === 'object'
                      ? d.deviceCode && d.location
                        ? `${d.deviceCode} (${d.location})`
                        : d.deviceCode || d.id
                      : d;
                  return (
                    <MenuItem key={dId} value={dId} sx={{ fontSize: '14px', color: '#0F172A' }}>
                      {dLabel}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <Button
            variant="outlined"
            onClick={() => setDeviceModalOpen(false)}
            disabled={updatingDevice}
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
            disabled={!newDevice || updatingDevice}
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
            {updatingDevice ? <CircularProgress size={22} sx={{ color: '#FFFFFF' }} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllEmployees;
