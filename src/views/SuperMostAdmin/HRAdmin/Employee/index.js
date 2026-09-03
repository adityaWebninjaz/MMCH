import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { IconSearch, IconDownload, IconPlus, IconEye, IconChevronDown } from '@tabler/icons-react';
import {
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';
import { getEmployees, getDepartments } from '../Services/hrEmployeeService';
import EmployeeDetails from './Components/EmployeeDetails';
import AddEditEmployee from './Components/AddEditEmployee';

const HREmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dynamic dropdown options
  const [departmentOptions, setDepartmentOptions] = useState([{ id: 'all', name: 'All Departments' }]);
  const [categoryOptions, setCategoryOptions] = useState([{ id: 'all', name: 'All Category' }]);
  const statusOptions = [
    { id: 'all', name: 'All Status' },
    { id: 'active', name: 'Active' },
    { id: 'exited', name: 'Exited' }
  ];

  // Filter IDs
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Search with 1500ms debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // View Mode: 'list' | 'details' | 'create'
  const [viewMode, setViewMode] = useState('list');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Toast state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  // 1. Fetch departments from backend on mount
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const depts = await getDepartments();
        if (Array.isArray(depts) && depts.length > 0) {
          setDepartmentOptions([{ id: 'all', name: 'All Departments' }, ...depts]);
        }
      } catch (err) {
        console.info('Failed to load departments:', err?.message);
      }
    };
    fetchDepts();
  }, []);

  // 2. 1000ms Debounce effect on search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // 3. Fetch employee list from backend API
  const fetchEmployeeData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees({
        search: debouncedSearch,
        page,
        limit: rowsPerPage,
        department_id: departmentFilter === 'all' ? '' : departmentFilter,
        status: statusFilter === 'all' ? 'all' : statusFilter
      });

      if (res) {
        let items = res.items || [];

        // Client-side category filter if selected
        if (categoryFilter !== 'all') {
          const catLow = categoryFilter.toLowerCase();
          items = items.filter((e) => e.category?.toLowerCase() === catLow);
        }

        setEmployees(items);
        setTotalCount(res.total ?? items.length);
        setTotalPages(res.totalPages || Math.max(1, Math.ceil((res.total || items.length) / rowsPerPage)));

        // Dynamically add unique categories
        if (res.items && res.items.length > 0) {
          const uniqueCats = Array.from(new Set(res.items.map((emp) => emp.category).filter(Boolean)));
          setCategoryOptions((prev) => {
            const existingIds = new Set(prev.map((c) => c.id?.toLowerCase()));
            const newAdditions = uniqueCats.filter((c) => !existingIds.has(c.toLowerCase())).map((c) => ({ id: c, name: c }));
            return newAdditions.length > 0 ? [...prev, ...newAdditions] : prev;
          });
        }
      }
    } catch (err) {
      console.error('Failed to load employee list:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, rowsPerPage, departmentFilter, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  // Pagination calculations supporting both server and client side pagination
  const currentPage = page;
  const effectiveTotal = totalCount || employees.length;
  const effectiveTotalPages = totalPages || Math.max(1, Math.ceil(effectiveTotal / rowsPerPage));
  const safePage = Math.min(Math.max(1, page), effectiveTotalPages);

  // If backend returns unpaginated full array, slice for current page; otherwise use items directly
  const paginatedEmployees =
    employees.length > rowsPerPage ? employees.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage) : employees;

  const displayStart = effectiveTotal === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const displayEnd = Math.min(safePage * rowsPerPage, effectiveTotal);

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          bgcolor: '#DCFCE7',
          color: '#16A34A'
        };
      case 'exited':
      case 'suspended':
        return {
          bgcolor: '#FEE2E2',
          color: '#EF4444'
        };
      case 'on leave':
        return {
          bgcolor: '#FEF3C7',
          color: '#D97706'
        };
      default:
        return {
          bgcolor: '#F1F5F9',
          color: '#475569'
        };
    }
  };

  const handleViewDetails = (emp) => {
    setSelectedEmployee(emp);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedEmployee(null);
    fetchEmployeeData();
  };

  const handleCreateEmployee = (newEmpData) => {
    const created = { ...newEmpData, id: Date.now() };
    setEmployees((prev) => [created, ...prev]);
    setViewMode('list');
    setToast({
      open: true,
      message: `Employee "${created.name}" created successfully!`,
      severity: 'success'
    });
  };

  const handleUpdateEmployee = (updatedEmp) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? { ...e, ...updatedEmp } : e)));
    setSelectedEmployee(updatedEmp);
    setToast({
      open: true,
      message: 'Employee details updated successfully!',
      severity: 'success'
    });
  };

  const handleExportExcel = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Designation', 'Status', 'Email', 'Phone'];
    const rows = employees.map((e) => [
      e.employeeId || e.empId,
      e.name,
      e.department,
      e.designation,
      e.status,
      e.email || '',
      e.phone || e.mobile || ''
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({
      open: true,
      message: 'Employee data exported successfully!',
      severity: 'success'
    });
  };

  // If in 'create' mode, show the full AddEditEmployee component
  if (viewMode === 'create') {
    return <AddEditEmployee mode="create" onSave={handleCreateEmployee} onCancel={() => setViewMode('list')} />;
  }

  // If in 'details' mode, show the full EmployeeDetails component
  if (viewMode === 'details' && selectedEmployee) {
    return <EmployeeDetails employee={selectedEmployee} onBack={handleBackToList} onUpdateEmployee={handleUpdateEmployee} />;
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '#FFFFFF',
        p: 4,
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* 1. Page Title */}
      <Box sx={{ mb: '20px' }}>
        <Typography
          sx={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#0F172A',
            lineHeight: '32px',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Employee
        </Typography>
      </Box>

      {/* 2. Unified Filter & Action Bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
          mb: '20px'
        }}
      >
        {/* Left: 4 Filter Bars with Labels */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: 2,
            flex: { xs: '1 1 100%', md: '1 1 auto' }
          }}
        >
          {/* Bar 1: Department (Backend Dynamic) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: { xs: '100%', sm: '165px' } }}>
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 400,
                color: '#1E293B',
                mb: '6px',
                lineHeight: '18px',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Department
            </Typography>
            <Select
              size="small"
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              IconComponent={() => (
                <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
              )}
              sx={{
                height: '32px',
                width: '180px',
                bgcolor: '#FFFFFF',
                borderRadius: '6px !important',
                fontSize: '13px',
                fontWeight: 400,
                color: '#1E293B',
                '& .MuiOutlinedInput-notchedOutline, & fieldset': {
                  borderColor: '#E2E8F0',
                  borderRadius: '6px !important'
                },
                '&:hover .MuiOutlinedInput-notchedOutline, &:hover fieldset': {
                  borderColor: '#CBD5E1'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused fieldset': {
                  borderColor: '#644EE5',
                  borderWidth: '1.5px'
                },
                '& .MuiSelect-select': {
                  py: 0,
                  px: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  height: '32px',
                  boxSizing: 'border-box',
                  borderRadius: '6px !important'
                }
              }}
            >
              {departmentOptions.map((opt) => (
                <MenuItem key={opt.id || opt.name} value={opt.id || opt.name} sx={{ fontSize: '13px' }}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Bar 2: Category */}
          {/* <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: { xs: '100%', sm: '155px' } }}>
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                mb: '6px',
                lineHeight: 1.2
              }}
            >
              Category
            </Typography>
            <Select
              size="small"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              IconComponent={() => (
                <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
              )}
              sx={{
                height: '40px',
                bgcolor: '#FFFFFF',
                borderRadius: '12px',
                fontSize: '13.5px',
                fontWeight: 500,
                color: '#0F172A',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0',
                  borderRadius: '12px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#CBD5E1'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#644EE5',
                  borderWidth: '1.5px'
                },
                '& .MuiSelect-select': {
                  py: 0,
                  px: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  height: '40px',
                  boxSizing: 'border-box'
                }
              }}
            >
              {categoryOptions.map((opt) => (
                <MenuItem key={opt.id || opt.name} value={opt.id || opt.name} sx={{ fontSize: '13px' }}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          </Box> */}

          {/* Bar 3: Status */}
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: { xs: '100%', sm: '135px' } }}>
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 400,
                color: '#1E293B',
                mb: '6px',
                lineHeight: '18px',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Status
            </Typography>
            <Select
              size="small"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              IconComponent={() => (
                <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '6px !important'
                  }
                }
              }}
              sx={{
                height: '32px',
                width: '180px',
                bgcolor: '#FFFFFF',
                borderRadius: '6px !important',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 400,
                color: '#0F172A',
                '& .MuiOutlinedInput-notchedOutline, & fieldset': {
                  borderColor: '#E2E8F0',
                  borderRadius: '6px !important'
                },
                '&:hover .MuiOutlinedInput-notchedOutline, &:hover fieldset': {
                  borderColor: '#94A3B8'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused fieldset': {
                  borderColor: '#644EE5',
                  borderWidth: '1.5px'
                },
                '& .MuiSelect-select': {
                  py: 0,
                  px: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  height: '32px',
                  boxSizing: 'border-box',
                  borderRadius: '6px !important',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '13px',
                  lineHeight: '100%',
                  color: '#0F172A'
                }
              }}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: '13px' }}>
                  {opt.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Bar 4: Employee Search (1500ms Debounced Backend Request) */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: { xs: '100%', sm: '230px', md: '280px' },
              flex: { md: 1 },
              maxWidth: { md: '360px' }
            }}
          >
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 400,
                color: '#1E293B',
                mb: '6px',
                lineHeight: '18px',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Employee Search
            </Typography>
            <TextField
              size="small"
              placeholder="Search by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <IconSearch size={18} stroke={1.8} style={{ color: '#64748B' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                width: '392px',
                maxWidth: '100%',
                bgcolor: '#ffffff',
                borderRadius: '6px !important',
                fontFamily: 'Inter, sans-serif',
                '& .MuiOutlinedInput-root': {
                  height: '32px',
                  borderRadius: '6px !important',
                  '& .MuiOutlinedInput-notchedOutline, & fieldset': {
                    borderColor: '#E2E8F0',
                    borderRadius: '6px !important'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline, &:hover fieldset': {
                    borderColor: '#94A3B8'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused fieldset': {
                    borderColor: '#644EE5',
                    borderWidth: '1.5px'
                  }
                },
                '& input, & .MuiOutlinedInput-input': {
                  py: 0,
                  height: '100%',
                  borderRadius: '6px !important',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '13px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#0F172A',
                  '&::placeholder': {
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '13px',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    color: '#64748B',
                    opacity: 1
                  }
                }
              }}
            />
          </Box>
        </Box>

        {/* Right: Export Excel & Add Employee Buttons */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' }
          }}
        >
          {/* Export Excel Button */}
          <Button
            variant="outlined"
            onClick={handleExportExcel}
            startIcon={<IconDownload size={18} stroke={2} />}
            sx={{
              width: '136px',
              height: '36px',
              minWidth: '80px',
              gap: '4px',
              pt: '6px',
              pb: '6px',
              px: '12px',
              bgcolor: '#FFFFFF',
              color: '#475569',
              borderColor: '#CBD5E1 !important',
              borderRadius: '6px !important',
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '24px',
              letterSpacing: '0%',
              boxShadow: 'none',
              '& .MuiButton-startIcon': {
                mr: 0,
                ml: 0
              },
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#94A3B8 !important',
                color: '#334155',
                boxShadow: 'none'
              }
            }}
          >
            Export Excel
          </Button>

          {/* + Add Employee Button */}
          <Button
            variant="contained"
            onClick={() => setViewMode('create')}
            startIcon={<IconPlus size={18} stroke={2.5} />}
            sx={{
              width: '161px',
              height: '36px',
              gap: '8px',
              pt: '6px',
              pb: '6px',
              px: '16px',
              bgcolor: '#644EE5',
              color: '#FFFFFF',
              borderRadius: '6px !important',
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '24px',
              letterSpacing: '0%',
              boxShadow: 'none',
              '& .MuiButton-startIcon': {
                mr: 0,
                ml: 0
              },
              '&:hover': {
                bgcolor: '#533DC7',
                boxShadow: 'none'
              }
            }}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* 3. Employee Data Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          overflowX: 'auto',
          bgcolor: '#FFFFFF'
        }}
      >
        <Table
          sx={{
            minWidth: 900,
            '& .MuiTableCell-root': {
              borderBottom: '1px solid #E2E8F0',
              fontFamily: 'Inter, sans-serif'
            }
          }}
          size="medium"
        >
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell
                sx={{
                  py: '12px',
                  px: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16151C',
                  borderBottom: '1px solid #E2E8F0',
                  lineHeight: '20px'
                }}
              >
                Employee ID
              </TableCell>
              <TableCell
                sx={{
                  py: '12px',
                  px: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16151C',
                  borderBottom: '1px solid #E2E8F0',
                  lineHeight: '20px'
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  py: '12px',
                  px: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16151C',
                  borderBottom: '1px solid #E2E8F0',
                  lineHeight: '20px'
                }}
              >
                Department
              </TableCell>
              <TableCell
                sx={{
                  py: '12px',
                  px: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16151C',
                  borderBottom: '1px solid #E2E8F0',
                  lineHeight: '20px'
                }}
              >
                Designation
              </TableCell>
              {/* <TableCell
                sx={{
                  py: '14px',
                  px: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1E293B',
                  borderBottom: '1px solid #E2E8F0'
                }}
              >
                Category
              </TableCell> */}
              <TableCell
                sx={{
                  py: '12px',
                  px: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16151C',
                  borderBottom: '1px solid #E2E8F0',
                  lineHeight: '20px'
                }}
              >
                Status
              </TableCell>
              {/* Action Column with Eye Icon / View Details */}
              <TableCell
                align="center"
                sx={{
                  py: '12px',
                  px: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16151C',
                  borderBottom: '1px solid #E2E8F0',
                  lineHeight: '20px'
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: '1px solid #E2E8F0' }}>
                  <CircularProgress size={32} sx={{ color: '#644EE5' }} />
                  <Typography sx={{ fontSize: '13px', color: '#64748B', mt: 1.5 }}>Loading employees...</Typography>
                </TableCell>
              </TableRow>
            ) : paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '14px', color: '#64748B' }}>No employees found matching the filters.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((emp) => {
                const statusStyle = getStatusBadgeStyle(emp.status);
                return (
                  <TableRow
                    key={emp.id || emp.employeeId || emp.empId}
                    sx={{
                      '&:hover': { bgcolor: '#F8FAFC' },
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* Employee ID */}
                    <TableCell
                      sx={{
                        py: '14px !important',
                        px: '24px !important',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#000000',
                        borderBottom: '1px solid #E2E8F0 !important',
                        lineHeight: '20px',
                        verticalAlign: 'middle'
                      }}
                    >
                      {emp.employeeId || emp.empId || '-'}
                    </TableCell>

                    {/* Name */}
                    <TableCell
                      sx={{
                        py: '14px !important',
                        px: '24px !important',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#000000',
                        borderBottom: '1px solid #E2E8F0 !important',
                        lineHeight: '20px',
                        verticalAlign: 'middle'
                      }}
                    >
                      {emp.name}
                    </TableCell>

                    {/* Department */}
                    <TableCell
                      sx={{
                        py: '14px !important',
                        px: '24px !important',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#000000',
                        borderBottom: '1px solid #E2E8F0 !important',
                        lineHeight: '20px',
                        verticalAlign: 'middle'
                      }}
                    >
                      {emp.department}
                    </TableCell>

                    {/* Designation */}
                    <TableCell
                      sx={{
                        py: '14px !important',
                        px: '24px !important',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#000000',
                        borderBottom: '1px solid #E2E8F0 !important',
                        lineHeight: '20px',
                        verticalAlign: 'middle'
                      }}
                    >
                      {emp.designation}
                    </TableCell>

                    {/* Category */}
                    {/* <TableCell
                      sx={{
                        py: '14px',
                        px: '20px',
                        fontSize: '13px',
                        color: '#475569',
                        borderBottom: '1px solid #E2E8F0'
                      }}
                    >
                      {emp.category}
                    </TableCell> */}

                    {/* Status */}
                    <TableCell
                      sx={{
                        py: '14px !important',
                        px: '24px !important',
                        borderBottom: '1px solid #E2E8F0 !important',
                        verticalAlign: 'middle'
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          px: '10px',
                          py: '2px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 500,
                          lineHeight: '16px',
                          bgcolor: statusStyle.bgcolor,
                          color: statusStyle.color
                        }}
                      >
                        {emp.status}
                      </Box>
                    </TableCell>

                    {/* Action Column: View Details Eye Button */}
                    <TableCell
                      align="center"
                      sx={{
                        py: '10px !important',
                        px: '24px !important',
                        borderBottom: '1px solid #E2E8F0 !important',
                        verticalAlign: 'middle'
                      }}
                    >
                      <Tooltip title="View Details" arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(emp)}
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '6px',
                            bgcolor: '#F1F5F9',
                            color: '#475569',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#644EE5',
                              color: '#FFFFFF'
                            }
                          }}
                        >
                          <IconEye size={16} stroke={1.8} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 4. Table Pagination Footer (No outer border, matching MMCH standard) */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          pt: 2.5,
          pb: 1,
          bgcolor: 'transparent'
        }}
      >
        {/* Left: Showing entries count */}
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Inter, sans-serif',
            color: '#64748B',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px'
          }}
        >
          {totalCount > 0 ? `Showing ${displayStart}-${displayEnd} of ${totalCount}` : 'Showing 0-0 of 0'}
        </Typography>

        {/* Right: Rows per page + Page number + Navigation buttons */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 1.5, sm: 3 } }}>
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
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                minWidth: '78px',
                overflow: 'hidden',
                lineHeight: '20px',
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
              {[10, 20, 50, 100].map((num) => (
                <MenuItem
                  key={num}
                  value={num}
                  sx={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#1E293B' }}
                >
                  {num}
                </MenuItem>
              ))}
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
            Page {safePage} of {effectiveTotalPages}
          </Typography>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* First Page */}
            <IconButton
              size="small"
              onClick={() => setPage(1)}
              disabled={safePage <= 1 || loading}
              sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                p: '4px',
                color: '#475569',
                cursor: safePage <= 1 || loading ? 'default' : 'pointer',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#CBD5E1'
                },
                '&.Mui-disabled': { borderColor: '#F1F5F9', color: '#CBD5E1' }
              }}
            >
              <FirstPageIcon fontSize="small" />
            </IconButton>

            {/* Prev Page */}
            <IconButton
              size="small"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage <= 1 || loading}
              sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                p: '4px',
                color: '#475569',
                cursor: safePage <= 1 || loading ? 'default' : 'pointer',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#CBD5E1'
                },
                '&.Mui-disabled': { borderColor: '#F1F5F9', color: '#CBD5E1' }
              }}
            >
              <NavigateBeforeIcon fontSize="small" />
            </IconButton>

            {/* Next Page */}
            <IconButton
              size="small"
              onClick={() => setPage((prev) => Math.min(effectiveTotalPages, prev + 1))}
              disabled={safePage >= effectiveTotalPages || loading}
              sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                p: '4px',
                color: '#475569',
                cursor: safePage >= effectiveTotalPages || loading ? 'default' : 'pointer',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#CBD5E1'
                },
                '&.Mui-disabled': { borderColor: '#F1F5F9', color: '#CBD5E1' }
              }}
            >
              <NavigateNextIcon fontSize="small" />
            </IconButton>

            {/* Last Page */}
            <IconButton
              size="small"
              onClick={() => setPage(effectiveTotalPages)}
              disabled={safePage >= effectiveTotalPages || loading}
              sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                p: '4px',
                color: '#475569',
                cursor: safePage >= effectiveTotalPages || loading ? 'default' : 'pointer',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#CBD5E1'
                },
                '&.Mui-disabled': { borderColor: '#F1F5F9', color: '#CBD5E1' }
              }}
            >
              <LastPageIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Snackbar feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%', borderRadius: '10px' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HREmployee;
