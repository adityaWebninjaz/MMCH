import React, { useState, useMemo } from 'react';
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
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { assignShift, getShifts, DEPARTMENT_EMPLOYEE_LIST } from './shiftService';

// Sample dataset of hospital employees for shift assignment
const INITIAL_EMPLOYEES = [
  { id: 'EM123456-1', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123456-2', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123456-3', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123456-4', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123456-5', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123456-6', empId: 'EM123456', empName: 'Dr. Ananya Sharma', designation: 'HOD Cardiology', mobileNo: '+91 7879536495', department: 'Cardiology' },
  { id: 'EM123457', empId: 'EM123457', empName: 'Dr. Ravi Mehta', designation: 'Senior Surgeon', mobileNo: '+91 9876543210', department: 'Emergency' },
  { id: 'EM123458', empId: 'EM123458', empName: 'Dr. Vikram Patel', designation: 'Neurologist', mobileNo: '+91 9876543211', department: 'Neurology' },
  { id: 'EM123459', empId: 'EM123459', empName: 'Dr. Priya Nair', designation: 'Pediatrician', mobileNo: '+91 9876543212', department: 'Pediatrics' },
  { id: 'EM123460', empId: 'EM123460', empName: 'Dr. Rajesh Gupta', designation: 'Orthopedic Surgeon', mobileNo: '+91 9876543213', department: 'Orthopedics' }
];

const DEPARTMENTS = [
  'All Departments',
  'Cardiology',
  'Emergency',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'ICU',
  'Surgery',
  'OPD'
];

const SHIFT_OPTIONS = [
  { id: 'morning_shift', name: 'Morning Shift', timeRange: '6:00 AM - 2:00 PM' },
  { id: 'evening_shift', name: 'Evening Shift', timeRange: '2:00 PM - 10:00 PM' },
  { id: 'night_shift', name: 'Night Shift', timeRange: '10:00 PM - 6:00 AM' },
  { id: 'general_shift', name: 'General Shift', timeRange: '9:00 AM - 5:00 PM' },
  { id: 'new_sn_duty', name: 'New S/N Duty', timeRange: '9:00 AM - 5:00 PM' }
];

const AssignShift = () => {
  const navigate = useNavigate();

  // Tabs State (0: Shift Details, 1: Assign Shift)
  const [activeTab, setActiveTab] = useState(1);

  // Assignment Mode: 'select_employees' or 'assign_department'
  const [assignMode, setAssignMode] = useState('select_employees');

  // Selected Department IDs (empty by default)
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);

  // Filter States
  const [department, setDepartment] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Employee IDs (empty by default)
  const [selectedIds, setSelectedIds] = useState([]);

  // Shift Selection Modal States
  const [selectShiftModalOpen, setSelectShiftModalOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState('morning_shift');
  const [shiftSearchQuery, setShiftSearchQuery] = useState('');

  // Filtered Shifts inside Modal (matching design mockup exact 5 shifts)
  const filteredShifts = useMemo(() => {
    const q = shiftSearchQuery.trim().toLowerCase();
    if (!q) return SHIFT_OPTIONS;
    return SHIFT_OPTIONS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.timeRange.toLowerCase().includes(q)
    );
  }, [shiftSearchQuery]);

  // Open Shift Modal
  const handleOpenSelectShiftModal = () => {
    setSelectShiftModalOpen(true);
  };

  // Confirm Assignment Handler
  const handleConfirmAssignment = () => {
    assignShift({
      shiftId: selectedShiftId,
      assignMode,
      selectedDepartmentIds,
      selectedIds
    });
    setSelectShiftModalOpen(false);
    navigate('/supermostadmin/hrms/shift-details');
  };

  // Toggle Department Selection
  const handleToggleDepartment = (id) => {
    setSelectedDepartmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Tab navigation handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      navigate('/supermostadmin/hrms/shift-details');
    }
  };

  // Filtered Employee list
  const filteredEmployees = useMemo(() => {
    return INITIAL_EMPLOYEES.filter((emp) => {
      const matchesDept = department === 'All Departments' || emp.department === department;
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
  }, [department, searchQuery]);

  // Checkbox Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredEmployees.map((emp) => emp.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((emp) => selectedIds.includes(emp.id));
  const isSomeSelected =
    filteredEmployees.some((emp) => selectedIds.includes(emp.id)) && !isAllSelected;

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
          mb:"2px"
        }}
      >
        Shift Managment
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#64748B',
          fontSize: '14px',
          fontWeight:"400",
          mb: "20px"
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

      {/* Outer White Card Container  the Container to show th info about table */}
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
        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap:"16px", mb:"24px" }}>
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
              px: "20px",
              py: "20.5px",
              borderRadius: '14px',
              maxHeight:"60px",
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
            <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#0F172A',lineHeight:"100%" }}>
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
                maxHeight:"60px",
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
            <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#0F172A',lineHeight:"100%" }}>
              Assign to Department
            </Typography>

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
          {/* Here we buil the department section in the Assignmenet Tab */}
        {assignMode === 'assign_department' ? (
          /* Department Selection List View matching design mockup */
          <Box sx={{ }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                color: '#0f172a',
                lineHeight:"100%",
                mb: "24px"
              }}
            >
              Select Departments
            </Typography>

            <Box
              sx={{
                borderRadius: '8px',
                border: "1px solid #E2E8F0",
                overflow: 'hidden',
                bgcolor: '#ffffff'
              }}
            >
              {DEPARTMENT_EMPLOYEE_LIST.map((dept, index) => {
                const isChecked = selectedDepartmentIds.includes(dept.id);
                return (
                  <Box
                    key={dept.id}
                    onClick={() => handleToggleDepartment(dept.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: "12px",
                      py: "16px",
                      cursor: 'pointer',
                      bgcolor: '#ffffff',
                      borderBottom:
                        index < DEPARTMENT_EMPLOYEE_LIST.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        bgcolor: '#f8fafc'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: "12px" }}>
                      <Checkbox
                        size="small"
                        checked={isChecked}
                        onChange={() => handleToggleDepartment(dept.id)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          height:18,
                          width:18,
                          p: 1,
                          color: '#64748B',
                          '&.Mui-checked': { color: '#6366f1' }
                        }}
                      />
                      <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#0F172A',lineHeight:"100%" }}>
                        {dept.name}
                      </Typography>
                    </Box>

                    <Typography sx={{ color: '#64748B', fontSize: '13px', fontWeight: 500,lineHeight:"100%" }}>
                      {dept.count} employees
                    </Typography>
                  </Box>
                );
              })}
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
                gap: "16px",
                mb: "24px"
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 2, flex: 1 }}>
                {/* Department Select */}
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 400, mb: 0.5, display: 'block', fontSize: '14px', lineHeight: '100%' }}>
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
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept} value={dept} sx={{ color: '#1E293B', fontWeight: 400, mb: 0.5, display: 'block', fontSize: '14px', lineHeight: '100%' }}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Employee Search */}
                <FormControl size="small" sx={{ flex: 1, maxWidth: 400 }}>
                  <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 400, mb: 0.5, display: 'block', fontSize: '14px', lineHeight: '100%' }}>
                    Employee Search
                  </Typography>
                  <OutlinedInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, role, or ID..."
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

              {/* Selection Counter Badge */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    bgcolor: '#644EE50F',
                    color: '#644EE5',
                    fontWeight: 600,
                    fontSize: '14px',
                    px: 2,
                    py: 0.8,
                    borderRadius: '8px'
                  }}
                >
                  {selectedIds.length} of {filteredEmployees.length} selected
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
                    <TableCell padding="checkbox" sx={{ py: "16px", pl: "24px",pr:"38px" }}>
                      <Checkbox
                        size="small"
                        indeterminate={isSomeSelected}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        sx={{
                          height:18,
                          width:18,
                          color: '#64748B',
                          '&.Mui-checked': { color: '#6366f1' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', py: 1.5,lineHeight:"100%"}}>
                      Emp ID
                    </TableCell>
                    <TableCell sx={{fontWeight: 600, color: '#0F172A', fontSize: '13px', py: 1.5,lineHeight:"100%"}}>
                      Emp Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', py: 1.5,lineHeight:"100%"}}>
                      Designation
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', py: 1.5,lineHeight:"100%"}}>
                      Mobile No.
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', py: 1.5,lineHeight:"100%"}}>
                      Department
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((row) => {
                      const isChecked = selectedIds.includes(row.id);
                      return (
                        <TableRow
                          key={row.id}
                          hover
                          onClick={() => handleToggleSelect(row.id)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#f8fafc' },
                            '& td': { borderColor: '#f1f5f9', py: 1.6, fontSize: '0.875rem', color: '#1e293b' }
                          }}
                        >
                          <TableCell padding="checkbox" sx={{  py: "16px", pl: "24px",pr:"38px"  }}>
                            <Checkbox
                              size="small"
                              checked={isChecked}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => handleToggleSelect(row.id)}
                              sx={{
                                  height:18,
                                  width:18,
                                  color: '#64748B',
                                  '&.Mui-checked': { color: '#6366f1' }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600,fontSize:"14px" ,lineHeight:"100%",color:"#0F172A"}}>{row.empId}</TableCell>
                          <TableCell sx={{ fontWeight: 600,fontSize:"14px" ,lineHeight:"100%",color:"#0F172A"}}>{row.empName}</TableCell>
                          <TableCell sx={{ fontWeight: 400,fontSize:"12px" ,lineHeight:"100%",color:"#475569" }}>{row.designation}</TableCell>
                          <TableCell sx={{ fontWeight: 400,fontSize:"12px" ,lineHeight:"100%",color:"#475569" }}>{row.mobileNo}</TableCell>
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
              lineHeight:"100%",
              px: 1,
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
            }}
          >
            Back
          </Button>

          <Button
            variant="contained"
            onClick={handleOpenSelectShiftModal}
            sx={{
              width:95,
              bgcolor: '#644EE5',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '8px',
              px: "24px",
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
        </Box>
      </Paper>

      {/* Select Shift Modal Dialog matching design mockup */}
      <Dialog
        open={selectShiftModalOpen}
        onClose={() => setSelectShiftModalOpen(false)}
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
            onClick={() => setSelectShiftModalOpen(false)}
            size="small"
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
            placeholder="Search shift"
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filteredShifts.length > 0 ? (
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

                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#0f172a'
                        }}
                      >
                        {shift.name}
                      </Typography>
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
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignShift;
