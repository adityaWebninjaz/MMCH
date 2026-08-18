import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Checkbox,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  UnfoldMore as UnfoldMoreIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getAllEmployees, getDepartments } from 'services/allEmployeeService';
import { getShiftDetails, assignEmployeesToShift, assignMultipleDepartmentsToShift } from '../../../services/shiftDetailServices';

const AssignShift = () => {
  const navigate = useNavigate();

  // Tabs State (0: Shift Details, 1: Assign Shift)
  const [activeTab, setActiveTab] = useState(1);

  // Assignment Mode: 'select_employees' or 'assign_department'
  const [assignMode, setAssignMode] = useState('select_employees');

  // Master employees list from API
  const [employeesList, setEmployeesList] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Pagination States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Available shifts list from API
  const [availableShifts, setAvailableShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(false);

  // Departments from API
  const [apiDepartments, setApiDepartments] = useState([]);

  // Selected Department IDs (empty by default)
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);

  // Filter States
  const [department, setDepartment] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Selected Employees (Array of employee objects e.g. [{ empId, empName, designation, department }])
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Selected Employee UIDs (e.g. ["PMCH0101", "PMCH0104"])
  const selectedIds = useMemo(() => selectedEmployees.map((e) => e.empId), [selectedEmployees]);

  // Shift Selection Modal States
  const [selectShiftModalOpen, setSelectShiftModalOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [shiftSearchQuery, setShiftSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch shifts and departments on component mount
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch all shifts from API
    setLoadingShifts(true);
    getShiftDetails({ limit: 100, page: 1 })
      .then((res) => {
        if (!isMounted) return;
        const items = Array.isArray(res?.items) ? res.items : [];
        setAvailableShifts(items);
        if (items.length > 0) {
          setSelectedShiftId(items[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load shifts in AssignShift:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingShifts(false);
      });

    // 2. Fetch departments
    getDepartments()
      .then((depts) => {
        if (!isMounted) return;
        if (Array.isArray(depts) && depts.length > 0) {
          setApiDepartments(depts);
        }
      })
      .catch((err) => {
        console.error('Failed to load departments in AssignShift:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch all employees from API with search and department_id across all backend pages
  const fetchEmployeesFromApi = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const deptId = department && department !== 'All Departments' && department !== 'all' ? department : '';

      const res = await getAllEmployees({
        search: debouncedSearch.trim(),
        department_id: deptId,
        batchSize: 100
      });

      const items = Array.isArray(res?.items) ? res.items : [];
      const formatted = items.map((emp) => ({
        id: emp.empId && emp.empId !== '-' ? emp.empId : emp.id,
        uid: emp.empId && emp.empId !== '-' ? emp.empId : emp.id,
        empId: emp.empId && emp.empId !== '-' ? emp.empId : emp.id,
        empName: emp.name || emp.full_name || '-',
        designation: emp.designation || '-',
        mobileNo: emp.mobile || emp.mobile_number || '-',
        department: emp.department || '-',
        departmentId: emp.departmentId || '',
        raw: emp
      }));
      setEmployeesList(formatted);
    } catch (err) {
      console.error('Failed to load employees in AssignShift:', err);
      setEmployeesList([]);
    } finally {
      setLoadingEmployees(false);
    }
  }, [department, debouncedSearch]);

  // Trigger employee API fetch whenever department or debounced search changes and reset page
  useEffect(() => {
    setPage(1);
    fetchEmployeesFromApi();
  }, [fetchEmployeesFromApi]);

  // Filtered Shifts inside Modal
  const filteredShifts = useMemo(() => {
    const q = shiftSearchQuery.trim().toLowerCase();
    if (!q) return availableShifts;
    return availableShifts.filter(
      (s) => s.name?.toLowerCase().includes(q) || s.timeRange?.toLowerCase().includes(q) || s.workingDays?.toLowerCase().includes(q)
    );
  }, [availableShifts, shiftSearchQuery]);

  // Open Shift Modal
  const handleOpenSelectShiftModal = () => {
    if (assignMode === 'select_employees' && selectedIds.length === 0) {
      toast.error('Please select at least one employee to assign');
      return;
    }
    if (assignMode === 'assign_department' && selectedDepartmentIds.length === 0) {
      toast.error('Please select at least one department to assign');
      return;
    }
    if (!selectedShiftId && availableShifts.length > 0) {
      setSelectedShiftId(availableShifts[0].id);
    }
    setSelectShiftModalOpen(true);
  };

  // Confirm Assignment Handler
  const handleConfirmAssignment = async () => {
    if (!selectedShiftId) {
      toast.error('Please select a shift');
      return;
    }

    setSubmitting(true);
    try {
      if (assignMode === 'select_employees') {
        await assignEmployeesToShift(selectedShiftId, selectedIds);
        const shiftObj = availableShifts.find((s) => s.id === selectedShiftId);
        toast.success(`Successfully assigned ${selectedIds.length} employee(s) to ${shiftObj?.name || 'shift'}`);
      } else {
        // Assign to department mode via POST /shifts/{id}/assign
        await assignMultipleDepartmentsToShift(selectedShiftId, selectedDepartmentIds);
        const shiftObj = availableShifts.find((s) => s.id === selectedShiftId);
        toast.success(`Successfully assigned ${selectedDepartmentIds.length} department(s) to ${shiftObj?.name || 'shift'}`);
      }

      setSelectShiftModalOpen(false);
      navigate('/supermostadmin/hrms/shift-details');
    } catch (err) {
      console.error('Error in handleConfirmAssignment:', err);
      const errMsg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors) ? err?.response?.data?.errors.join(', ') : null) ||
        err?.message ||
        'Failed to assign shift';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Department Selection
  const handleToggleDepartment = (id) => {
    setSelectedDepartmentIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Tab navigation handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      navigate('/supermostadmin/hrms/shift-details');
    }
  };

  // Sort selected employees to the top of the table list
  const orderedEmployeesList = useMemo(() => {
    // Selected employees matching current filters
    const matchingSelected = selectedEmployees.filter((emp) => {
      if (department && department !== 'All Departments' && department !== 'all') {
        if (emp.departmentId && emp.departmentId !== department && emp.department !== department) {
          return false;
        }
      }
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.trim().toLowerCase();
        return (
          emp.empName?.toLowerCase().includes(q) ||
          emp.empId?.toLowerCase().includes(q) ||
          emp.designation?.toLowerCase().includes(q) ||
          emp.mobileNo?.toLowerCase().includes(q) ||
          emp.department?.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const matchingSelectedIdSet = new Set(matchingSelected.map((e) => e.empId));
    const unselected = employeesList.filter((e) => !matchingSelectedIdSet.has(e.empId));

    return [...matchingSelected, ...unselected];
  }, [selectedEmployees, employeesList, debouncedSearch, department]);

  // Checkbox Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const existingIdSet = new Set(selectedEmployees.map((emp) => emp.empId));
      const toAdd = orderedEmployeesList.filter((emp) => !existingIdSet.has(emp.empId));
      setSelectedEmployees((prev) => [...prev, ...toAdd]);
    } else {
      const currentListIdSet = new Set(orderedEmployeesList.map((emp) => emp.empId));
      setSelectedEmployees((prev) => prev.filter((emp) => !currentListIdSet.has(emp.empId)));
    }
  };

  const handleToggleSelect = (emp) => {
    setSelectedEmployees((prev) =>
      prev.some((item) => item.empId === emp.empId)
        ? prev.filter((item) => item.empId !== emp.empId)
        : [emp, ...prev]
    );
  };

  const isAllSelected = orderedEmployeesList.length > 0 && orderedEmployeesList.every((emp) => selectedIds.includes(emp.empId));
  const isSomeSelected = orderedEmployeesList.some((emp) => selectedIds.includes(emp.empId)) && !isAllSelected;

  // Pagination calculations based on orderedEmployeesList
  const totalCount = orderedEmployeesList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = totalCount === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, totalCount);

  // Paginated employees for current page
  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return orderedEmployeesList.slice(start, start + rowsPerPage);
  }, [orderedEmployeesList, page, rowsPerPage]);

  return (
    <Box sx={{ width: '100%', bgcolor: '#F8FAFC', minHeight: '100vh', p: 4 }}>
      {/* Page Title & Subtitle */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: '#0F172A',
          fontSize: '24px',
          lineHeight: '32px',
          mb: '2px'
        }}
      >
        Shift Management
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#64748B',
          fontSize: '14px',
          fontWeight: '400',
          mb: '20px'
        }}
      >
        Track and manage shift schedule
      </Typography>

      {/* Tabs Row (Shift Details | Assign Shift) */}
      <Box sx={{ borderBottom: 1, borderColor: '#D1D5DB', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            minHeight: '38px',
            '& .MuiTabs-indicator': {
              bgcolor: '#6366f1',
              height: '3px',
              borderRadius: '3px'
            }
          }}
        >
          <Tab
            label="Shift Details"
            disableRipple
            sx={{
              textTransform: 'none',
              px: 2,
              py: 1,
              fontSize: '0.9rem',
              fontWeight: activeTab === 0 ? 600 : 500,
              color: activeTab === 0 ? '#6366f1' : '#6B7280',
              '&.Mui-selected': { color: '#6366f1' }
            }}
          />
          <Tab
            label="Assign Shift"
            disableRipple
            sx={{
              textTransform: 'none',
              px: 2,
              py: 1,
              fontSize: '0.9rem',
              fontWeight: activeTab === 1 ? 600 : 500,
              color: activeTab === 1 ? '#6366f1' : '#6B7280',
              '&.Mui-selected': { color: '#6366f1' }
            }}
          />
        </Tabs>
      </Box>

      {/* Outer White Card Container */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff'
        }}
      >
        {/* Mode Toggle Options: Select Employees Individually vs Assign to Department */}
        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '16px', mb: '24px' }}>
          {/* Card Option 1: Select Employees Individually */}
          <Box
            role="button"
            tabIndex={0}
            onClick={() => setAssignMode('select_employees')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setAssignMode('select_employees');
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 457,
              px: '20px',
              py: '20.5px',
              borderRadius: '14px',
              maxHeight: '60px',
              cursor: 'pointer',
              bgcolor: '#ffffff',
              border: assignMode === 'select_employees' ? '2px solid #6366f1' : '1px solid #e2e8f0',
              transition: 'all 0.15s ease',
              outline: 'none',
              '&:focus-visible': {
                boxShadow: '0 0 0 2px #6366f1'
              }
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#0F172A', lineHeight: '100%' }}>
              Select Employees Individually
            </Typography>

            {/* Custom Radio Circle */}
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: assignMode === 'select_employees' ? '2px solid #6366f1' : '2px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {assignMode === 'select_employees' && (
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#6366f1'
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Card Option 2: Assign to Department */}
          <Box
            role="button"
            tabIndex={0}
            onClick={() => setAssignMode('assign_department')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setAssignMode('assign_department');
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 457,
              px: 3,
              py: 2,
              borderRadius: '14px',
              maxHeight: '60px',
              cursor: 'pointer',
              bgcolor: '#ffffff',
              border: assignMode === 'assign_department' ? '2px solid #6366f1' : '1px solid #e2e8f0',
              transition: 'all 0.15s ease',
              outline: 'none',
              '&:focus-visible': {
                boxShadow: '0 0 0 2px #6366f1'
              }
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#0F172A', lineHeight: '100%' }}>Assign to Department</Typography>

            {/* Custom Radio Circle */}
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: assignMode === 'assign_department' ? '2px solid #6366f1' : '2px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {assignMode === 'assign_department' && (
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#6366f1'
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Section based on assignMode */}
        {assignMode === 'assign_department' ? (
          /* Department Selection List View */
          <Box sx={{}}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '16px',
                color: '#0f172a',
                lineHeight: '100%',
                mb: '24px'
              }}
            >
              Select Departments
            </Typography>

            <Box
              sx={{
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                bgcolor: '#ffffff'
              }}
            >
              {apiDepartments.length > 0 ? (
                apiDepartments.map((dept, index) => {
                  const isChecked = selectedDepartmentIds.includes(dept.id);
                  const deptCount = employeesList.filter((e) => e.department?.toLowerCase() === dept.name?.toLowerCase()).length;

                  return (
                    <Box
                      key={dept.id}
                      onClick={() => handleToggleDepartment(dept.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: '12px',
                        py: '16px',
                        cursor: 'pointer',
                        bgcolor: '#ffffff',
                        borderBottom: index < apiDepartments.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                          bgcolor: '#f8fafc'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={() => handleToggleDepartment(dept.id)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            height: 18,
                            width: 18,
                            p: 1,
                            color: '#64748B',
                            '&.Mui-checked': { color: '#6366f1' }
                          }}
                        />
                        <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#0F172A', lineHeight: '100%' }}>
                          {dept.name}
                        </Typography>
                      </Box>

                      <Typography sx={{ color: '#64748B', fontSize: '13px', fontWeight: 500, lineHeight: '100%' }}>
                        {deptCount} employees
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" sx={{ p: 3, color: '#64748b', textAlign: 'center' }}>
                  Loading departments...
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          /* Employee Selection Filters & Table View */
          <>
            {/* Filters & Selection Counter Row */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '16px',
                mb: '24px'
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 2, flex: 1 }}>
                {/* Department Select */}
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#1E293B', fontWeight: 400, mb: 0.5, display: 'block', fontSize: '14px', lineHeight: '100%' }}
                  >
                    Department
                  </Typography>
                  <Select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: '8px',
                      bgcolor: '#ffffff',
                      height: '40px',
                      fontSize: '0.875rem',
                      color: '#334155',
                      overflow: 'hidden',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E2E8F0',
                        borderRadius: '8px',
                        top: 0,
                        '& legend': {
                          display: 'none'
                        }
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366F1', borderWidth: '1.5px' }
                    }}
                  >
                    <MenuItem
                      value="All Departments"
                      sx={{ color: '#1E293B', fontWeight: 400, mb: 0.5, display: 'block', fontSize: '14px', lineHeight: '100%' }}
                    >
                      All Departments
                    </MenuItem>
                    {apiDepartments.map((dept) => (
                      <MenuItem
                        key={dept.id}
                        value={dept.id}
                        sx={{ color: '#1E293B', fontWeight: 400, mb: 0.5, display: 'block', fontSize: '14px', lineHeight: '100%' }}
                      >
                        {dept.name || dept.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Employee Search */}
                <FormControl size="small" sx={{ flex: 1, maxWidth: 400 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#1E293B', fontWeight: 400, mb: 0.5, display: 'block', fontSize: '14px', lineHeight: '100%' }}
                  >
                    Employee Search
                  </Typography>
                  <OutlinedInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, designation, or ID..."
                    startAdornment={
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#64748B', fontSize: 20 }} />
                      </InputAdornment>
                    }
                    sx={{
                      height: '40px',
                      borderRadius: '8px',
                      bgcolor: '#ffffff',
                      width: '392px',
                      fontSize: '13px',
                      color: '#64748B',
                      overflow: 'hidden',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E2E8F0',
                        borderRadius: '8px',
                        top: 0,
                        '& legend': {
                          display: 'none'
                        }
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366F1', borderWidth: '1.5px' }
                    }}
                  />
                </FormControl>
              </Box>

              {/* Selection Counter Badge & Assign Button */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
               <Button
            variant="contained"
            onClick={handleOpenSelectShiftModal}
            sx={{
              minWidth: 95,
              bgcolor: '#644EE5',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '8px',
              px: '24px',
              height: '37px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#4f46e5',
                boxShadow: '0 2px 6px rgba(99,102,241,0.25)'
              }
            }}
          >
            Assign
          </Button>

                <Typography
                  variant="body2"
                  sx={{
                    bgcolor: '#644EE50F',
                    color: '#644EE5',
                    fontWeight: 600,
                    fontSize: '14px',
                    px: 2,
                    py: 0.8,
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '8px'
                  }}
                >
                  {selectedIds.length} of {orderedEmployeesList.length} selected
                </Typography>
              </Box>
            </Box>

            {/* Employee Selection Table */}
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflowX: 'auto',
                mb: 3
              }}
            >
              <Table sx={{ minWidth: 900 }} size="medium">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ py: '16px', pl: '24px', pr: '38px' }}>
                      <Checkbox
                        size="small"
                        indeterminate={isSomeSelected}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        sx={{
                          height: 18,
                          width: 18,
                          color: '#64748B',
                          '&.Mui-checked': { color: '#6366f1' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', py: 1.5, lineHeight: '100%' }}>Emp ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', py: 1.5, lineHeight: '100%' }}>
                      Emp Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', py: 1.5, lineHeight: '100%' }}>
                      Designation
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', py: 1.5, lineHeight: '100%' }}>
                      Mobile No.
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', py: 1.5, lineHeight: '100%' }}>
                      Department
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingEmployees ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                        <Typography sx={{ mt: 1.5, color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
                          Loading employees from employee master...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((row) => {
                      const isChecked = selectedIds.includes(row.empId);
                      return (
                        <TableRow
                          key={row.id}
                          hover
                          onClick={() => handleToggleSelect(row)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: isChecked ? '#EEF2FF' : '#ffffff',
                            '&:hover': { bgcolor: isChecked ? '#E0E7FF' : '#f8fafc' },
                            '& td': { borderColor: '#f1f5f9', py: 1.6, fontSize: '0.875rem', color: '#1e293b' }
                          }}
                        >
                          <TableCell padding="checkbox" sx={{ py: '16px', pl: '24px', pr: '38px' }}>
                            <Checkbox
                              size="small"
                              checked={isChecked}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => handleToggleSelect(row)}
                              sx={{
                                height: 18,
                                width: 18,
                                color: '#64748B',
                                '&.Mui-checked': { color: '#6366f1' }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '14px', lineHeight: '100%', color: '#0F172A' }}>
                            {row.empId}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '14px', lineHeight: '100%', color: '#0F172A' }}>
                            {row.empName}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 400, fontSize: '12px', lineHeight: '100%', color: '#475569' }}>
                            {row.designation}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 400, fontSize: '12px', lineHeight: '100%', color: '#475569' }}>
                            {row.mobileNo}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.department}
                              size="small"
                              sx={{
                                bgcolor: '#f1f5f9',
                                color: '#1E293B',
                                fontWeight: 500,
                                fontSize: '12px',
                                height: '24px',
                                borderRadius: '12px'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                        No employees found matching your search.
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
                pt: 1,
                pb: 2.5
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
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#1E293B',
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '20px'
                    }}
                  >
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
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#1E293B',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '20px'
                  }}
                >
                  Page {page} of {Math.max(1, totalPages)}
                </Typography>

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => setPage(1)}
                    disabled={page === 1 || loadingEmployees}
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
                    disabled={page === 1 || loadingEmployees}
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
                    disabled={page >= totalPages || loadingEmployees}
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
                    disabled={page >= totalPages || loadingEmployees}
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
          </>
        )}

        {/* Action Buttons Footer (Back | Assign) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1
          }}
        >
          <Button
            onClick={() => navigate('/supermostadmin/hrms/shift-details')}
            sx={{
              color: '#64748B',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '100%',
              px: 1,
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
            }}
          >
            Back
          </Button>

          {/* <Button
            variant="contained"
            onClick={handleOpenSelectShiftModal}
            sx={{
              minWidth: 95,
              bgcolor: '#644EE5',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '8px',
              px: '24px',
              height: '37px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#4f46e5',
                boxShadow: '0 2px 6px rgba(99,102,241,0.25)'
              }
            }}
          >
            Assign
          </Button> */}
        </Box>
      </Paper>

      {/* Select Shift Modal Dialog matching design mockup */}
      <Dialog
        open={selectShiftModalOpen}
        onClose={() => !submitting && setSelectShiftModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1.5,
            maxWidth: '460px'
          }
        }}
      >
        {/* Modal Header */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            pb: 1.5
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>
            Select Shift
          </Typography>
          <IconButton
            onClick={() => !submitting && setSelectShiftModalOpen(false)}
            size="small"
            disabled={submitting}
            sx={{ color: '#64748b', p: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* Modal Body */}
        <DialogContent sx={{ p: 2, pt: 0.5 }}>
          {/* Search Shift Bar */}
          <OutlinedInput
            value={shiftSearchQuery}
            onChange={(e) => setShiftSearchQuery(e.target.value)}
            placeholder="Search shift..."
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8', fontSize: 19 }} />
              </InputAdornment>
            }
            sx={{
              width: '100%',
              height: '40px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: '#1e293b',
              bgcolor: '#ffffff',
              mb: 2.5,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' }
            }}
          />

          {/* Shift Options List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '320px', overflowY: 'auto' }}>
            {loadingShifts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: '#6366f1' }} />
              </Box>
            ) : filteredShifts.length > 0 ? (
              filteredShifts.map((shift) => {
                const isSelected = selectedShiftId === shift.id;
                return (
                  <Paper
                    key={shift.id}
                    elevation={0}
                    onClick={() => setSelectedShiftId(shift.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1.5,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      bgcolor: '#ffffff',
                      border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: isSelected ? '#6366f1' : '#cbd5e1',
                        bgcolor: '#fafafa'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {/* Custom Radio Circle */}
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: isSelected ? '2px solid #6366f1' : '2px solid #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#ffffff'
                        }}
                      >
                        {isSelected && (
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: '#6366f1'
                            }}
                          />
                        )}
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: '#0f172a'
                          }}
                        >
                          {shift.name}
                        </Typography>
                        {shift.workingDays && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#64748b',
                              fontSize: '0.75rem',
                              display: 'block'
                            }}
                          >
                            {shift.workingDays}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.825rem',
                        color: isSelected ? '#6366f1' : '#64748b'
                      }}
                    >
                      {shift.timeRange}
                    </Typography>
                  </Paper>
                );
              })
            ) : (
              <Typography variant="body2" align="center" sx={{ color: '#64748b', py: 2 }}>
                No shifts found matching search.
              </Typography>
            )}
          </Box>
        </DialogContent>

        {/* Modal Footer Actions */}
        <DialogActions
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            pt: 1,
            pb: 1.5
          }}
        >
          <Button
            onClick={() => setSelectShiftModalOpen(false)}
            disabled={submitting}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 1.5,
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirmAssignment}
            disabled={submitting || !selectedShiftId}
            sx={{
              bgcolor: '#6366f1',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: '8px',
              px: 3,
              height: '38px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#4f46e5',
                boxShadow: '0 2px 6px rgba(99,102,241,0.25)'
              },
              '&.Mui-disabled': {
                bgcolor: '#a5b4fc',
                color: '#ffffff'
              }
            }}
          >
            {submitting ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignShift;
