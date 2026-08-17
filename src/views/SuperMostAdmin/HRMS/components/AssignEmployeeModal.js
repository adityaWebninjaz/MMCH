import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  InputAdornment,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Checkbox,
  Chip,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getEmployees, getDepartments } from 'services/allEmployeeService';
import { assignEmployeesToShift, assignMultipleDepartmentsToShift } from 'services/shiftDetailServices';

const DEFAULT_DEPARTMENT_LIST = [
  { id: 'cardiology', name: 'Cardiology', count: 0 },
  { id: 'neurology', name: 'Neurology', count: 0 },
  { id: 'emergency', name: 'Emergency', count: 0 },
  { id: 'orthopedics', name: 'Orthopedics', count: 0 },
  { id: 'pediatrics', name: 'Pediatrics', count: 0 },
  { id: 'radiology', name: 'Radiology', count: 0 }
];

/**
 * AssignEmployeeModal Component
 *
 * Supports 2 States matching designs:
 * 1. 'select_employees' - Individual employee selection from Employee Master with API department filter, search, and table.
 * 2. 'assign_department' - Bulk department selection with employee counts.
 */
const AssignEmployeeModal = ({ open, onClose, onAssign, shift, initialMode = 'select_employees', departmentList: propDepartmentList }) => {
  // State 1 vs State 2: 'select_employees' | 'assign_department'
  const [assignMode, setAssignMode] = useState(initialMode);

  // Master employees list from API
  const [employeeList, setEmployeeList] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [apiDepartments, setApiDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // State 1: Individual Employee Selection states
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedEmpIds, setSelectedEmpIds] = useState([]); // Stores employee UIDs (e.g. "PMCH0101")

  // State 2: Department Selection states
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);

  // Reset or initialize state when modal opens
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch departments when modal opens
  useEffect(() => {
    if (open) {
      getDepartments()
        .then((depts) => {
          if (Array.isArray(depts) && depts.length > 0) {
            setApiDepartments(depts);
          }
        })
        .catch((err) => {
          console.error('Failed to load departments in AssignEmployeeModal:', err);
        });

      setAssignMode(initialMode);
      setSearchQuery('');
      setDebouncedSearch('');
      setSelectedDepartmentFilter('All Departments');
      setSelectedEmpIds([]);
      setSelectedDepartmentIds([]);
    }
  }, [open, initialMode]);

  // Fetch employees from API using search and department_id filter
  const fetchEmployeesFromApi = useCallback(async () => {
    if (!open) return;
    setLoadingEmployees(true);
    try {
      const deptId =
        selectedDepartmentFilter && selectedDepartmentFilter !== 'All Departments' && selectedDepartmentFilter !== 'all'
          ? selectedDepartmentFilter
          : '';

      const res = await getEmployees({
        search: debouncedSearch.trim(),
        department_id: deptId,
        limit: 100,
        page: 1
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
      setEmployeeList(formatted);
    } catch (err) {
      console.error('Failed to load employees from API in AssignEmployeeModal:', err);
      setEmployeeList([]);
    } finally {
      setLoadingEmployees(false);
    }
  }, [open, selectedDepartmentFilter, debouncedSearch]);

  // Trigger API employee fetch on search or filter changes
  useEffect(() => {
    fetchEmployeesFromApi();
  }, [fetchEmployeesFromApi]);

  // Combined department list for department mode
  const effectiveDepartmentList = useMemo(() => {
    if (Array.isArray(propDepartmentList) && propDepartmentList.length > 0) {
      return propDepartmentList;
    }
    if (apiDepartments.length > 0) {
      return apiDepartments.map((d) => ({
        id: d.id || d.name,
        name: d.name || d.id,
        count: employeeList.filter((e) => e.department?.toLowerCase() === (d.name || d.id)?.toLowerCase()).length
      }));
    }
    return DEFAULT_DEPARTMENT_LIST;
  }, [propDepartmentList, apiDepartments, employeeList]);

  // Handle master select all for employees
  const handleSelectAllEmployees = (e) => {
    if (e.target.checked) {
      const allFilteredUids = employeeList.map((emp) => emp.empId);
      setSelectedEmpIds((prev) => Array.from(new Set([...prev, ...allFilteredUids])));
    } else {
      const filteredUidSet = new Set(employeeList.map((emp) => emp.empId));
      setSelectedEmpIds((prev) => prev.filter((id) => !filteredUidSet.has(id)));
    }
  };

  // Toggle individual employee selection by UID
  const handleToggleEmployee = (uid) => {
    setSelectedEmpIds((prev) => (prev.includes(uid) ? prev.filter((item) => item !== uid) : [...prev, uid]));
  };

  // Toggle department selection
  const handleToggleDepartment = (deptId) => {
    setSelectedDepartmentIds((prev) => (prev.includes(deptId) ? prev.filter((item) => item !== deptId) : [...prev, deptId]));
  };

  // Submit Assignment
  const handleAssign = async () => {
    if (assignMode === 'select_employees') {
      if (selectedEmpIds.length === 0) {
        toast.error('Please select at least one employee to assign');
        return;
      }

      if (!shift?.id) {
        toast.error('No shift selected for assignment');
        return;
      }

      setSubmitting(true);
      try {
        await assignEmployeesToShift(shift.id, selectedEmpIds);
        toast.success(`Successfully assigned ${selectedEmpIds.length} employee(s) to ${shift.name || 'shift'}`);

        const payload = {
          assignMode,
          shiftId: shift.id,
          selectedEmpIds,
          selectedEmployees: employeeList.filter((emp) => selectedEmpIds.includes(emp.empId)),
          selectedDepartmentIds: [],
          selectedDepartments: []
        };

        if (onAssign) {
          await onAssign(payload);
        }
        onClose();
      } catch (err) {
        console.error('Error assigning employees to shift:', err);
        const errMsg =
          err?.response?.data?.message ||
          (Array.isArray(err?.response?.data?.errors) ? err?.response?.data?.errors.join(', ') : null) ||
          err?.message ||
          'Failed to assign shift to selected employees';
        toast.error(errMsg);
      } finally {
        setSubmitting(false);
      }
    } else {
      // Department mode
      if (selectedDepartmentIds.length === 0) {
        toast.error('Please select at least one department');
        return;
      }

      if (!shift?.id) {
        toast.error('No shift selected for assignment');
        return;
      }

      setSubmitting(true);
      try {
        await assignMultipleDepartmentsToShift(shift.id, selectedDepartmentIds);
        toast.success(`Successfully assigned ${selectedDepartmentIds.length} department(s) to ${shift.name || 'shift'}`);

        const payload = {
          assignMode,
          shiftId: shift.id,
          selectedEmpIds: [],
          selectedEmployees: [],
          selectedDepartmentIds,
          selectedDepartments: effectiveDepartmentList.filter((dept) => selectedDepartmentIds.includes(dept.id))
        };

        if (onAssign) {
          await onAssign(payload);
        }
        onClose();
      } catch (err) {
        console.error('Error assigning departments to shift:', err);
        const errMsg =
          err?.response?.data?.message ||
          (Array.isArray(err?.response?.data?.errors) ? err?.response?.data?.errors.join(', ') : null) ||
          err?.message ||
          'Failed to assign departments to shift';
        toast.error(errMsg);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const isAllEmployeesSelected = employeeList.length > 0 && employeeList.every((emp) => selectedEmpIds.includes(emp.empId));

  const isSomeEmployeesSelected = employeeList.some((emp) => selectedEmpIds.includes(emp.empId)) && !isAllEmployeesSelected;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxWidth: '851px',
          p: 0,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header with Dynamic Title & Close Button */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          pt: 3,
          pb: 1.5
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#0F172A',
            fontSize: '18px',
            lineHeight: '24px'
          }}
        >
          {assignMode === 'select_employees' ? 'Assign Employee' : 'Assign Department'}
        </Typography>

        <IconButton
          onClick={onClose}
          size="small"
          aria-label="close"
          sx={{
            color: '#64748B',
            p: 0.5,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1 }}>
        {/* Top 2 State Switcher / Radio Cards Container */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 2.5
          }}
        >
          {/* Card 1: Select Employees */}
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
              px: 2.5,
              py: 2,
              borderRadius: '12px',
              cursor: 'pointer',
              bgcolor: '#FFFFFF',
              border: assignMode === 'select_employees' ? '2px solid #5B4BF2' : '1px solid #E2E8F0',
              transition: 'all 0.15s ease',
              outline: 'none',
              '&:hover': {
                borderColor: assignMode === 'select_employees' ? '#5B4BF2' : '#CBD5E1'
              }
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#0F172A'
              }}
            >
              {assignMode === 'assign_department' ? 'Select Employees Individually' : 'Select Employees'}
            </Typography>

            {/* Radio Circle Indicator */}
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: assignMode === 'select_employees' ? '2px solid #5B4BF2' : '2px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {assignMode === 'select_employees' && (
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#5B4BF2'
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Card 2: Assign to Department */}
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
              px: 2.5,
              py: 2,
              borderRadius: '12px',
              cursor: 'pointer',
              bgcolor: '#FFFFFF',
              border: assignMode === 'assign_department' ? '2px solid #5B4BF2' : '1px solid #E2E8F0',
              transition: 'all 0.15s ease',
              outline: 'none',
              '&:hover': {
                borderColor: assignMode === 'assign_department' ? '#5B4BF2' : '#CBD5E1'
              }
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#0F172A'
              }}
            >
              Assign to Department
            </Typography>

            {/* Radio Circle Indicator */}
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: assignMode === 'assign_department' ? '2px solid #5B4BF2' : '2px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {assignMode === 'assign_department' && (
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#5B4BF2'
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* STATE 1: SELECT EMPLOYEES INDIVIDUALLY */}
        {assignMode === 'select_employees' && (
          <Box>
            {/* Filter Row (Department Select & Search Input) */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1.1fr 1.9fr' },
                gap: 2,
                mb: 2.5
              }}
            >
              {/* Department Dropdown */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 600,
                    color: '#334155',
                    fontSize: '12.5px',
                    mb: 0.6
                  }}
                >
                  Department
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={selectedDepartmentFilter}
                    onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                    displayEmpty
                    sx={{
                      height: '38px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      bgcolor: '#FFFFFF',
                      color: '#334155',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E2E8F0'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#CBD5E1'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5B4BF2'
                      }
                    }}
                  >
                    <MenuItem value="All Departments" sx={{ fontSize: '13px' }}>
                      All Departments
                    </MenuItem>
                    {apiDepartments.length > 0
                      ? apiDepartments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id} sx={{ fontSize: '13px' }}>
                            {dept.name || dept.id}
                          </MenuItem>
                        ))
                      : effectiveDepartmentList.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id} sx={{ fontSize: '13px' }}>
                            {dept.name || dept.id}
                          </MenuItem>
                        ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Employee Search Input */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 600,
                    color: '#334155',
                    fontSize: '12.5px',
                    mb: 0.6
                  }}
                >
                  Employee Search
                </Typography>
                <FormControl size="small" fullWidth>
                  <OutlinedInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, designation, or ID..."
                    startAdornment={
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    }
                    sx={{
                      height: '38px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      bgcolor: '#FFFFFF',
                      color: '#334155',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E2E8F0'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#CBD5E1'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5B4BF2'
                      }
                    }}
                  />
                </FormControl>
              </Box>
            </Box>

            {/* Subheader Line: Title on Left, Counter on Right */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#0F172A'
                }}
              >
                Select Employee
              </Typography>

              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#5B4BF2'
                }}
              >
                {selectedEmpIds.length} of {employeeList.length} selected
              </Typography>
            </Box>

            {/* Employees Table Container */}
            <TableContainer
              sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                maxHeight: '260px',
                overflowY: 'auto'
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', py: 1.2, borderColor: '#E2E8F0' } }}>
                    <TableCell padding="checkbox" sx={{ pl: 2 }}>
                      <Checkbox
                        size="small"
                        checked={isAllEmployeesSelected}
                        indeterminate={isSomeEmployeesSelected}
                        onChange={handleSelectAllEmployees}
                        sx={{
                          p: 0.5,
                          color: '#CBD5E1',
                          '&.Mui-checked': { color: '#5B4BF2' },
                          '&.MuiCheckbox-indeterminate': { color: '#5B4BF2' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '12.5px' }}>Emp ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '12.5px' }}>Emp Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '12.5px' }}>Designation</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '12.5px' }}>Mobile No.</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '12.5px' }}>Department</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingEmployees ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} sx={{ color: '#5B4BF2' }} />
                        <Typography sx={{ color: '#64748b', fontSize: '13px', mt: 1 }}>Loading employees from master...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : employeeList.length > 0 ? (
                    employeeList.map((emp) => {
                      const isChecked = selectedEmpIds.includes(emp.empId);
                      return (
                        <TableRow
                          key={emp.id}
                          hover
                          onClick={() => handleToggleEmployee(emp.empId)}
                          sx={{
                            cursor: 'pointer',
                            '& td': { borderColor: '#F1F5F9', py: 1.2, fontSize: '13px' }
                          }}
                        >
                          <TableCell padding="checkbox" sx={{ pl: 2 }}>
                            <Checkbox
                              size="small"
                              checked={isChecked}
                              onChange={() => handleToggleEmployee(emp.empId)}
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                p: 0.5,
                                color: '#CBD5E1',
                                '&.Mui-checked': { color: '#5B4BF2' }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{emp.empId}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{emp.empName}</TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '12.5px' }}>{emp.designation}</TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '12.5px' }}>{emp.mobileNo}</TableCell>
                          <TableCell>
                            <Chip
                              label={emp.department}
                              size="small"
                              sx={{
                                bgcolor: '#F1F5F9',
                                color: '#334155',
                                fontWeight: 500,
                                fontSize: '12px',
                                height: '22px',
                                borderRadius: '12px'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#94A3B8', fontSize: '13px' }}>
                        No employees found matching filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* STATE 2: ASSIGN TO DEPARTMENT */}
        {assignMode === 'assign_department' && (
          <Box>
            {/* Subheader Line: Title on Left, Counter on Right */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#0F172A'
                }}
              >
                Select Departments
              </Typography>

              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#5B4BF2'
                }}
              >
                {selectedDepartmentIds.length} of {effectiveDepartmentList.length} selected
              </Typography>
            </Box>

            {/* Department List Container */}
            <Box
              sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                overflow: 'hidden',
                bgcolor: '#FFFFFF',
                maxHeight: '280px',
                overflowY: 'auto'
              }}
            >
              {effectiveDepartmentList.map((dept, index) => {
                const isChecked = selectedDepartmentIds.includes(dept.id);
                return (
                  <Box
                    key={dept.id}
                    onClick={() => handleToggleDepartment(dept.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2.5,
                      py: 1.4,
                      cursor: 'pointer',
                      bgcolor: '#FFFFFF',
                      borderBottom: index < effectiveDepartmentList.length - 1 ? '1px solid #F1F5F9' : 'none',
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        bgcolor: '#F8FAFC'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Checkbox
                        size="small"
                        checked={isChecked}
                        onChange={() => handleToggleDepartment(dept.id)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          p: 0.5,
                          color: '#CBD5E1',
                          '&.Mui-checked': { color: '#5B4BF2' }
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#0F172A'
                        }}
                      >
                        {dept.name}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        color: '#64748B',
                        fontSize: '13px',
                        fontWeight: 400
                      }}
                    >
                      {dept.count} employees
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Modal Actions Footer */}
      <DialogActions
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          pt: 2.5,
          pb: 3
        }}
      >
        {/* Cancel Button */}
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 600,
            color: '#64748B',
            p: 0,
            minWidth: 'auto',
            '&:hover': {
              color: '#0F172A',
              bgcolor: 'transparent'
            }
          }}
        >
          Cancel
        </Button>

        {/* Assign Submit Button */}
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={submitting}
          sx={{
            bgcolor: '#5B4BF2',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            borderRadius: '8px',
            px: 3.5,
            py: 0.9,
            height: '38px',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#4B3EE0',
              boxShadow: '0 2px 6px rgba(91, 75, 242, 0.3)'
            },
            '&.Mui-disabled': {
              bgcolor: '#a5b4fc',
              color: '#ffffff'
            }
          }}
        >
          {submitting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignEmployeeModal;
