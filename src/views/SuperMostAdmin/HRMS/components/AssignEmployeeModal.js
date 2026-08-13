import React, { useState, useMemo, useEffect } from 'react';
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
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';

// Sample dataset of hospital employees for assignment matching design mockup
const DEFAULT_EMPLOYEE_LIST = [
  { id: 'EM123456-1', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123456-2', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123456-3', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123456-4', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123456-5', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123456-6', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123456-7', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123457', empId: 'EM123457', empName: 'Dr. Ravi Mehta', designation: 'Senior Surgeon', mobileNo: '+91 9876543210', department: 'Emergency' },
  { id: 'EM123458', empId: 'EM123458', empName: 'Dr. Vikram Patel', designation: 'Neurologist', mobileNo: '+91 9876543211', department: 'Neurology' },
  { id: 'EM123459', empId: 'EM123459', empName: 'Dr. Priya Nair', designation: 'Pediatrician', mobileNo: '+91 9876543212', department: 'Pediatrics' },
  { id: 'EM123460', empId: 'EM123460', empName: 'Dr. Rajesh Gupta', designation: 'Orthopedic Surgeon', mobileNo: '+91 9876543213', department: 'Orthopedics' },
  { id: 'EM123461', empId: 'EM123461', empName: 'Dr. Sneha Roy', designation: 'Radiologist', mobileNo: '+91 9876543214', department: 'Radiology' }
];

const DEFAULT_DEPARTMENT_LIST = [
  { id: 'cardiology', name: 'Cardiology', count: 42 },
  { id: 'neurology', name: 'Neurology', count: 28 },
  { id: 'emergency', name: 'Emergency', count: 65 },
  { id: 'orthopedics', name: 'Orthopedics', count: 31 },
  { id: 'pediatrics', name: 'Pediatrics', count: 24 },
  { id: 'radiology', name: 'Radiology', count: 18 }
];

const DEPARTMENTS_FILTER = [
  'All Departments',
  'Cardiology',
  'Emergency',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Radiology'
];

/**
 * AssignEmployeeModal Component
 * 
 * Supports 2 States matching designs:
 * 1. 'select_employees' - Individual employee selection with department filter, search, and table.
 * 2. 'assign_department' - Bulk department selection with employee counts.
 */
const AssignEmployeeModal = ({
  open,
  onClose,
  onAssign,
  shift,
  initialMode = 'select_employees',
  departmentList = DEFAULT_DEPARTMENT_LIST,
  employeeList = DEFAULT_EMPLOYEE_LIST
}) => {
  // State 1 vs State 2: 'select_employees' | 'assign_department'
  const [assignMode, setAssignMode] = useState(initialMode);

  // State 1: Individual Employee Selection states
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmpIds, setSelectedEmpIds] = useState(['EM123456-1', 'EM123456-2', 'EM123456-3']);

  // State 2: Department Selection states
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState(['cardiology', 'emergency']);

  // Total employee pool size for counter display (e.g. 340)
  const totalEmployeesCount = 340;

  // Reset or initialize state when modal opens
  useEffect(() => {
    if (open) {
      setAssignMode(initialMode);
      setSearchQuery('');
      setSelectedDepartmentFilter('All Departments');
      if (selectedEmpIds.length === 0) {
        setSelectedEmpIds(['EM123456-1', 'EM123456-2', 'EM123456-3']);
      }
      if (selectedDepartmentIds.length === 0) {
        setSelectedDepartmentIds(['cardiology', 'emergency']);
      }
    }
  }, [open, initialMode]);

  // Filtered employees for State 1
  const filteredEmployees = useMemo(() => {
    return employeeList.filter((emp) => {
      const matchesDept =
        selectedDepartmentFilter === 'All Departments' ||
        emp.department.toLowerCase() === selectedDepartmentFilter.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        emp.empId.toLowerCase().includes(q) ||
        emp.empName.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        emp.mobileNo.includes(q) ||
        emp.department.toLowerCase().includes(q);

      return matchesDept && matchesSearch;
    });
  }, [employeeList, selectedDepartmentFilter, searchQuery]);

  // Handle master select all for employees
  const handleSelectAllEmployees = (e) => {
    if (e.target.checked) {
      setSelectedEmpIds(filteredEmployees.map((emp) => emp.id));
    } else {
      setSelectedEmpIds([]);
    }
  };

  // Toggle individual employee selection
  const handleToggleEmployee = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle department selection
  const handleToggleDepartment = (deptId) => {
    setSelectedDepartmentIds((prev) =>
      prev.includes(deptId) ? prev.filter((item) => item !== deptId) : [...prev, deptId]
    );
  };

  // Submit Assignment
  const handleAssign = () => {
    const payload = {
      assignMode,
      selectedEmpIds: assignMode === 'select_employees' ? selectedEmpIds : [],
      selectedEmployees:
        assignMode === 'select_employees'
          ? employeeList.filter((emp) => selectedEmpIds.includes(emp.id))
          : [],
      selectedDepartmentIds: assignMode === 'assign_department' ? selectedDepartmentIds : [],
      selectedDepartments:
        assignMode === 'assign_department'
          ? departmentList.filter((dept) => selectedDepartmentIds.includes(dept.id))
          : []
    };

    if (onAssign) {
      onAssign(payload);
    }
    onClose();
  };

  const isAllEmployeesSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((emp) => selectedEmpIds.includes(emp.id));

  const isSomeEmployeesSelected =
    filteredEmployees.some((emp) => selectedEmpIds.includes(emp.id)) && !isAllEmployeesSelected;

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
                    {DEPARTMENTS_FILTER.map((dept) => (
                      <MenuItem key={dept} value={dept} sx={{ fontSize: '13px' }}>
                        {dept}
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
                    placeholder="Search name, role, or ID..."
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
                {selectedEmpIds.length} of {totalEmployeesCount} selected
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
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => {
                      const isChecked = selectedEmpIds.includes(emp.id);
                      return (
                        <TableRow
                          key={emp.id}
                          hover
                          onClick={() => handleToggleEmployee(emp.id)}
                          sx={{
                            cursor: 'pointer',
                            '& td': { borderColor: '#F1F5F9', py: 1.2, fontSize: '13px' }
                          }}
                        >
                          <TableCell padding="checkbox" sx={{ pl: 2 }}>
                            <Checkbox
                              size="small"
                              checked={isChecked}
                              onChange={() => handleToggleEmployee(emp.id)}
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
                {selectedDepartmentIds.length} of {departmentList.length} selected
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
              {departmentList.map((dept, index) => {
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
                      borderBottom:
                        index < departmentList.length - 1 ? '1px solid #F1F5F9' : 'none',
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
            }
          }}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignEmployeeModal;
