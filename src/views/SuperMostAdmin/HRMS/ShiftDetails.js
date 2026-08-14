import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Checkbox,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  Close as CloseIcon,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { toast } from 'react-toastify';
import {
  getShiftDetails,
  getShiftEmployees,
  createShift,
  createShiftDetail,
  deleteShift,
  deleteShiftDetail
} from '../../../services/shiftDetailServices';
import AssignEmployeeModal from './components/AssignEmployeeModal';
import ChangeShiftModal from './components/ChangeShiftModal';

dayjs.extend(customParseFormat);

const parseTimeString = (timeStr) => {
  if (!timeStr) return null;
  if (dayjs.isDayjs(timeStr)) return timeStr.isValid() ? timeStr : null;
  const formats = ['hh:mm A', 'h:mm A', 'hh:mm a', 'h:mm a', 'HH:mm', 'H:mm', 'HH:mm:ss'];
  const parsed = dayjs(timeStr, formats);
  if (parsed.isValid()) return parsed;
  const fallback = dayjs(`2000-01-01 ${timeStr}`);
  if (fallback.isValid()) return fallback;
  const direct = dayjs(timeStr);
  return direct.isValid() ? direct : null;
};

const timePickerPopperSx = {
  '& .MuiPickersActionBar-root': {
    display: 'none !important'
  },
  '& .MuiMultiSectionDigitalClock-root': {
    maxHeight: '210px',
    padding: '10px 0px'
  },
  '& .MuiMultiSectionDigitalClockSection-root': {
    '&::after': {
      display: 'none !important',
      height: '0px !important'
    },
    '&::before': {
      display: 'none !important',
      height: '0px !important'
    }
  },
  '& ul::after': {
    display: 'none !important',
    height: '0px !important'
  },
  '& ul::before': {
    display: 'none !important',
    height: '0px !important'
  }
};

// Inline SVG Icon components matching design spec
const ViewIcon = ({ size = 18, color = '#475569' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DeleteBinIcon = ({ size = 18, color = '#475569' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// Initial Shift dataset
const INITIAL_SHIFTS = [
  {
    id: 1,
    name: 'Morning General',
    description: 'Full system access with all permissions',
    timeRange: '06:00 AM - 02:00 PM',
    assignedCount: 24,
    workingDays: 'Mon, Tue, Wed'
  },
  {
    id: 2,
    name: 'Night ICU',
    description: 'Full system access with all permissions',
    timeRange: '06:00 AM - 02:00 PM',
    assignedCount: 24,
    workingDays: 'Mon, Tue, Wed'
  },
  {
    id: 3,
    name: 'Morning General',
    description: 'Full system access with all permissions',
    timeRange: '06:00 AM - 02:00 PM',
    assignedCount: 24,
    workingDays: 'Mon, Tue, Wed'
  },
  {
    id: 4,
    name: 'Morning General',
    description: 'Full system access with all permissions',
    timeRange: '06:00 AM - 02:00 PM',
    assignedCount: 24,
    workingDays: 'Mon, Tue, Wed'
  },
  {
    id: 5,
    name: 'Morning General',
    description: 'Full system access with all permissions',
    timeRange: '06:00 AM - 02:00 PM',
    assignedCount: 24,
    workingDays: 'Mon, Tue, Wed'
  },
  {
    id: 6,
    name: 'Morning General',
    description: 'Full system access with all permissions',
    timeRange: '06:00 AM - 02:00 PM',
    assignedCount: 24,
    workingDays: 'Mon, Tue, Wed'
  },
  {
    id: 7,
    name: 'Morning General',
    description: 'Full system access with all permissions',
    timeRange: '06:00 AM - 02:00 PM',
    assignedCount: 24,
    workingDays: 'Mon, Tue, Wed'
  },
  {
    id: 8,
    name: 'Evening OPD',
    description: 'Outpatient consultation evening rotation',
    timeRange: '02:00 PM - 10:00 PM',
    assignedCount: 18,
    workingDays: 'Mon, Tue, Wed, Thu, Fri'
  },
  {
    id: 9,
    name: 'Night Emergency',
    description: 'Dedicated shift layout for overnight trauma response and emergency ward triage management.',
    timeRange: '09:00 AM - 07:00 PM',
    assignedCount: 15,
    workingDays: 'Mon, Tue, Wed, Thu, Fri'
  }
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ShiftDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // View Mode: 'list' or 'create'
  const [viewMode, setViewMode] = useState('list');

  // Tabs State: 0 = Shift Details, 1 = Assign Shift
  const [activeTab, setActiveTab] = useState(0);

  // Search & Pagination States (loaded directly from backend API)
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search query input (400ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch shifts from backend API with debounced search, page, and limit
  const fetchApiShifts = async () => {
    setLoading(true);
    try {
      const apiData = await getShiftDetails({
        search: debouncedSearch,
        page,
        limit: rowsPerPage
      });
      const items = apiData?.items || (Array.isArray(apiData) ? apiData : []);
      setShifts(items);
      const total = Number(apiData?.total ?? items.length) || 0;
      setTotalCount(total);
      setTotalPages(Math.max(1, Number(apiData?.totalPages) || Math.ceil(total / rowsPerPage)));
    } catch (err) {
      console.error('Error fetching shift details:', err);
      setShifts([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Reload shifts on mount, query change, page/limit change, or location navigation
  useEffect(() => {
    fetchApiShifts();
  }, [debouncedSearch, page, rowsPerPage, location.key]);

  // Reset view to list when route changes
  useEffect(() => {
    setViewMode('list');
    setActiveTab(0);
  }, [location.key]);

  // Clear Search Input Handler
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(1);
  };

  // Form State for Create / Edit
  const [editingShift, setEditingShift] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Detail View & Delete Modal States
  const [selectedDetailShift, setSelectedDetailShift] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [changeShiftModalOpen, setChangeShiftModalOpen] = useState(false);
  const [selectedEmployeeForShiftChange, setSelectedEmployeeForShiftChange] = useState(null);
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [assignedDepartmentFilter, setAssignedDepartmentFilter] = useState('All Departments');
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [assignedEmployeesList, setAssignedEmployeesList] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Dynamic unique departments list from assigned employees
  const uniqueAssignedDepartments = useMemo(() => {
    const depts = new Set();
    assignedEmployeesList.forEach((e) => {
      if (e.department && e.department !== '-') depts.add(e.department);
    });
    return Array.from(depts);
  }, [assignedEmployeesList]);

  // Handle Assignment from AssignEmployeeModal
  const handleAssignEmployees = async (payload) => {
    const shiftId = payload?.shiftId || selectedDetailShift?.id;
    if (shiftId) {
      try {
        setLoadingEmployees(true);
        const emps = await getShiftEmployees(shiftId);
        setAssignedEmployeesList(Array.isArray(emps) ? emps : []);
        fetchApiShifts();
      } catch (err) {
        console.error('Error refreshing assigned employees:', err);
      } finally {
        setLoadingEmployees(false);
      }
    }
  };

  // Handle Confirm from ChangeShiftModal
  const handleConfirmShiftChange = (selectedShift, employee) => {
    if (!selectedShift || !employee) return;
    setChangeShiftModalOpen(false);
  };

  const [formData, setFormData] = useState({
    name: 'Night Emergency',
    description: 'Dedicated shift layout for overnight trauma response and emergency ward triage management.',
    startTime: '09:00 AM',
    endTime: '07:00 PM',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  });

  // Tab navigation handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setViewMode('list');
    } else if (newValue === 1) {
      navigate('/supermostadmin/hrms/assign-shift');
    }
  };

  // Pagination display indices
  const startIndex = totalCount === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, totalCount);

  // Open Create Shift View
  const handleOpenCreateView = () => {
    setEditingShift(null);
    setFormData({
      name: '',
      description: '',
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    });
    setViewMode('create');
  };

  // Open Shift Detail Page View & Fetch Assigned Employees
  const handleOpenShiftDetailView = async (shift) => {
    setSelectedDetailShift(shift);
    setSelectedEmpIds([]);
    setAssignedSearchQuery('');
    setAssignedDepartmentFilter('All Departments');
    setViewMode('detail');

    if (shift?.id) {
      setLoadingEmployees(true);
      try {
        const emps = await getShiftEmployees(shift.id);
        setAssignedEmployeesList(Array.isArray(emps) ? emps : []);
      } catch (err) {
        console.error('Error fetching shift employees:', err);
        setAssignedEmployeesList([]);
      } finally {
        setLoadingEmployees(false);
      }
    } else {
      setAssignedEmployeesList([]);
    }
  };

  // Open Edit Shift View
  const handleOpenEditView = (shift) => {
    setEditingShift(shift);
    const times = shift.timeRange.split(' - ');
    const daysArr = shift.workingDays.split(', ').map((d) => d.trim());
    setFormData({
      name: shift.name,
      description: shift.description,
      startTime: times[0] || '09:00 AM',
      endTime: times[1] || '07:00 PM',
      workingDays: daysArr
    });
    setViewMode('create');
  };

  // Delete shift handler
  const handleDeleteShift = async (id) => {
    if (!id) return;
    setDeleting(true);
    try {
      const response = await deleteShift(id);
      if (response && response.success === false) {
        const errorMsg = response.message || (Array.isArray(response.errors) ? response.errors.join(', ') : 'Failed to delete shift');
        toast.error(errorMsg);
        setDeleteModalOpen(false);
      } else {
        toast.success(response?.message || 'Shift deleted successfully');
        setDeleteModalOpen(false);
        if (viewMode === 'detail') {
          setViewMode('list');
        }
        await fetchApiShifts();
      }
    } catch (e) {
      console.error('API delete error:', e);
      const errMsg =
        e?.response?.data?.message ||
        (Array.isArray(e?.response?.data?.errors) ? e?.response?.data?.errors.join(', ') : null) ||
        e?.message ||
        'Failed to delete shift';
      toast.error(errMsg);
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  // Toggle Working Day Pill
  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const exists = prev.workingDays.includes(day);
      if (exists) {
        return { ...prev, workingDays: prev.workingDays.filter((d) => d !== day) };
      } else {
        return { ...prev, workingDays: [...prev.workingDays, day] };
      }
    });
  };

  // Save Shift Form in the page of Shift Details in Shift Management
  const handleSaveShift = async () => {
    const shiftName = formData.name?.trim();
    if (!shiftName) {
      toast.error('Shift name is required');
      return;
    }
    if (!formData.startTime) {
      toast.error('Start time is required');
      return;
    }
    if (!formData.endTime) {
      toast.error('End time is required');
      return;
    }
    if (!formData.workingDays || formData.workingDays.length === 0) {
      toast.error('Please select at least one working day');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createShift({
        name: shiftName,
        description: formData.description?.trim() || '',
        startTime: formData.startTime,
        endTime: formData.endTime,
        workingDays: formData.workingDays
      });

      if (response && response.success === false) {
        const errorMsg = response.message || (Array.isArray(response.errors) ? response.errors.join(', ') : 'Failed to create shift');
        toast.error(errorMsg);
      } else {
        toast.success(response?.message || 'Shift created successfully');
        setViewMode('list');
        await fetchApiShifts();
      }
    } catch (e) {
      console.error('Error saving shift:', e);
      const errMsg =
        e?.response?.data?.message ||
        (Array.isArray(e?.response?.data?.errors) ? e?.response?.data?.errors.join(', ') : null) ||
        e?.message ||
        'Error creating shift';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter assigned employees
  const filteredAssignedEmps = useMemo(() => {
    return assignedEmployeesList.filter((emp) => {
      const matchesDept = assignedDepartmentFilter === 'All Departments' || emp.department === assignedDepartmentFilter;
      const q = assignedSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q || emp.empId.toLowerCase().includes(q) || emp.empName.toLowerCase().includes(q) || emp.designation.toLowerCase().includes(q);
      return matchesDept && matchesSearch;
    });
  }, [assignedEmployeesList, assignedDepartmentFilter, assignedSearchQuery]);

  // ================= MAIN RENDER =================
  const currentShift = selectedDetailShift || {
    id: 'night_emergency',
    name: 'Night Emergency',
    timeRange: '09:00 AM - 07:00 PM',
    assignedDepartments: 'Cardiology, Emergency',
    description: 'Dedicated shift layout for overnight trauma response and emergency ward triage management.',
    assignedCount: 42
  };

  return (
    <>
      {/* VIEW 3: SHIFT DETAIL PAGE VIEW */}
      {viewMode === 'detail' && (
        <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
          {/* Breadcrumb */}
          <Typography
            variant="caption"
            sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Button
              variant="text"
              size="small"
              onClick={() => setViewMode('list')}
              sx={{
                p: 0,
                minWidth: 'auto',
                textTransform: 'none',
                color: '#64748b',
                fontSize: '0.85rem',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
              }}
            >
              Shift Management
            </Button>
            <span>/</span>
            <span style={{ color: '#6366f1', fontWeight: 600 }}>Shift Detail</span>
          </Typography>

          {/* Heading */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              fontSize: '1.5rem',
              letterSpacing: '-0.01em',
              mt: 0.5,
              mb: 3
            }}
          >
            Shift Detail
          </Typography>

          {/* Top Shift Info White Card */}
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              p: 3.5
            }}
          >
            <Paper
              elevation={0}
              sx={{
                mb: 3
              }}
            >
              {/* Info Grid (4 Columns) */}
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  mb: 3
                }}
              >
                {/* Card Header: Shift Name & Action Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.15rem' }}>
                    {currentShift.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* Delete Shift Red Button */}
                    <Button
                      variant="contained"
                      onClick={() => setDeleteModalOpen(true)}
                      sx={{
                        bgcolor: '#ef4444',
                        color: '#ffffff',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        px: 2.5,
                        height: '38px',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#dc2626' }
                      }}
                    >
                      Delete Shift
                    </Button>

                    {/* Assign Employee Purple Button */}
                    <Button
                      variant="contained"
                      onClick={() => setAssignModalOpen(true)}
                      sx={{
                        bgcolor: '#6366f1',
                        color: '#ffffff',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        px: 2.5,
                        height: '38px',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#4f46e5' }
                      }}
                    >
                      + Assign Employee
                    </Button>
                  </Box>
                </Box>

                {/* Info Grid (4 Columns) */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.2fr 1.2fr 1.5fr 2.5fr' },
                    gap: 3
                  }}
                >
                  {/* Col 1: Shift Name */}
                  <Box sx={{ maxWidth: 640, width: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}>
                      Shift Name
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                      {currentShift.name}
                    </Typography>
                  </Box>

                  {/* Col 2: Time Range */}
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}>
                      Time Range
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                      {currentShift.timeRange}
                    </Typography>
                  </Box>

                  {/* Col 3: Assigned Departments */}
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}>
                      Assigned Departments
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                      {uniqueAssignedDepartments.length > 0 ? uniqueAssignedDepartments.join(', ') : '-'}
                    </Typography>
                  </Box>

                  {/* Col 4: Description */}
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 0.5 }}>
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#475569', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      {currentShift.description || '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Bottom Card: Assigned Employees Table */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#ffffff'
              }}
            >
              {/* Section Header & Filters Row */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                  Assigned Employees ({assignedEmployeesList.length})
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                  {/* Search Input */}
                  <FormControl size="small" sx={{ minWidth: 260 }}>
                    <OutlinedInput
                      value={assignedSearchQuery}
                      onChange={(e) => setAssignedSearchQuery(e.target.value)}
                      placeholder="Search name, role, or ID..."
                      startAdornment={
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#94a3b8', fontSize: 19 }} />
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: '8px',
                        bgcolor: '#ffffff',
                        height: '38px',
                        fontSize: '0.85rem',
                        color: '#334155',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }
                      }}
                    />
                  </FormControl>

                  {/* Department Dropdown */}
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                      value={assignedDepartmentFilter}
                      onChange={(e) => setAssignedDepartmentFilter(e.target.value)}
                      displayEmpty
                      sx={{
                        borderRadius: '8px',
                        bgcolor: '#ffffff',
                        height: '38px',
                        fontSize: '0.85rem',
                        color: '#334155',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' }
                      }}
                    >
                      <MenuItem value="All Departments">All Departments</MenuItem>
                      {uniqueAssignedDepartments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Employees Table */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  overflowX: 'auto'
                }}
              >
                <Table sx={{ minWidth: 800 }} size="medium">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem', py: 1.5, width: '130px' }}>Emp ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem', py: 1.5 }}>Emp Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem', py: 1.5, width: '260px' }}>
                        Department
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: '#334155',
                          fontSize: '0.85rem',
                          py: 1.5,
                          width: '160px',
                          maxWidth: '160px',
                          textAlign: 'center',
                          pr: 3
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingEmployees ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                          <Typography sx={{ color: '#64748b', fontSize: '0.875rem', mt: 1 }}>Loading assigned employees...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredAssignedEmps.length > 0 ? (
                      filteredAssignedEmps.map((emp) => {
                        const isEmpSelected = selectedEmpIds.includes(emp.id);
                        return (
                          <TableRow
                            key={emp.id}
                            sx={{ '&:hover': { bgcolor: '#f8fafc' }, '& td': { borderColor: '#E2E8F0', py: 1.6, fontSize: '0.875rem' } }}
                          >
                            <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>{emp.empId}</TableCell>
                            <TableCell>
                              <Box>
                                <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{emp.empName}</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                                  {emp.designation}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={emp.department}
                                size="small"
                                sx={{
                                  bgcolor: '#f1f5f9',
                                  color: '#334155',
                                  fontWeight: 500,
                                  fontSize: '0.8rem',
                                  height: '24px',
                                  borderRadius: '12px'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ width: '140px', maxWidth: '140px', pr: 3 }}>
                              <Button
                                size="small"
                                onClick={() => {
                                  setSelectedEmployeeForShiftChange(emp);
                                  setChangeShiftModalOpen(true);
                                }}
                                sx={{
                                  textTransform: 'none',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: '#334155',
                                  bgcolor: '#F1F5F9',
                                  borderRadius: '6px',
                                  py: 0.4,
                                  px: 1.5,
                                  '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
                                }}
                              >
                                Shift Change
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                          <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>No employees assigned to this shift.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      )}

      {/* VIEW 2: CREATE / EDIT NEW SHIFT FORM */}
      {viewMode === 'create' && (
        <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
          {/* Breadcrumb */}
          <Typography
            variant="caption"
            sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Button
              variant="text"
              size="small"
              onClick={() => setViewMode('list')}
              sx={{
                p: 0,
                minWidth: 'auto',
                textTransform: 'none',
                color: '#64748b',
                fontSize: '0.85rem',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
              }}
            >
              Shift Management
            </Button>
            <span>/</span>
            <span style={{ color: '#6366f1', fontWeight: 600 }}>{editingShift ? 'Edit Shift' : 'Create New Shift'}</span>
          </Typography>

          {/* Heading */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              fontSize: '1.5rem',
              letterSpacing: '-0.01em',
              mt: 0.5,
              mb: 3
            }}
          >
            {editingShift ? 'Edit Shift Details' : 'Create New Shift'}
          </Typography>

          {/* White Form Card Container */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              maxWidth: '100%'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, maxWidth: '100%' }}>
              {/* Shift Name Field */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                  Shift Name <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <OutlinedInput
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Night Emergency"
                  sx={{
                    width: '100%',
                    maxWidth: 640,
                    height: '42px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1e293b',
                    bgcolor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' }
                  }}
                />
              </Box>

              {/* Start Time & End Time Fields (Inline Row) */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                      Start Time <span style={{ color: '#ef4444' }}>*</span>
                    </Typography>
                    <TimePicker
                      value={parseTimeString(formData.startTime)}
                      onChange={(newValue) => {
                        setFormData((prev) => ({
                          ...prev,
                          startTime: newValue && newValue.isValid() ? newValue.format('hh:mm A') : ''
                        }));
                      }}
                      format="hh:mm A"
                      slotProps={{
                        actionBar: {
                          actions: []
                        },
                        popper: {
                          sx: timePickerPopperSx
                        },
                        desktopPaper: {
                          sx: timePickerPopperSx
                        },
                        layout: {
                          sx: timePickerPopperSx
                        },
                        textField: {
                          placeholder: '09:00 AM',
                          size: 'small',
                          sx: {
                            width: { xs: '100%', sm: 312 },
                            bgcolor: '#ffffff',
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-root': {
                              height: '42px',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              color: '#1e293b',
                              '& fieldset': {
                                borderColor: '#cbd5e1'
                              },
                              '&:hover fieldset': {
                                borderColor: '#94a3b8'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#6366f1'
                              }
                            },
                            '& .MuiInputBase-input': {
                              py: '9px',
                              fontSize: '0.875rem'
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.25rem',
                              color: '#64748b'
                            }
                          }
                        }
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                      End Time <span style={{ color: '#ef4444' }}>*</span>
                    </Typography>
                    <TimePicker
                      value={parseTimeString(formData.endTime)}
                      onChange={(newValue) => {
                        setFormData((prev) => ({
                          ...prev,
                          endTime: newValue && newValue.isValid() ? newValue.format('hh:mm A') : ''
                        }));
                      }}
                      format="hh:mm A"
                      slotProps={{
                        actionBar: {
                          actions: []
                        },
                        popper: {
                          sx: timePickerPopperSx
                        },
                        desktopPaper: {
                          sx: timePickerPopperSx
                        },
                        layout: {
                          sx: timePickerPopperSx
                        },
                        textField: {
                          placeholder: '07:00 PM',
                          size: 'small',
                          sx: {
                            width: { xs: '100%', sm: 312 },
                            bgcolor: '#ffffff',
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-root': {
                              height: '42px',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              color: '#1e293b',
                              '& fieldset': {
                                borderColor: '#cbd5e1'
                              },
                              '&:hover fieldset': {
                                borderColor: '#94a3b8'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#6366f1'
                              }
                            },
                            '& .MuiInputBase-input': {
                              py: '9px',
                              fontSize: '0.875rem'
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.25rem',
                              color: '#64748b'
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
              </LocalizationProvider>

              {/* Description Field */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.8 }}>
                  Description
                </Typography>
                <OutlinedInput
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Dedicated shift layout for overnight trauma response and emergency ward triage management."
                  sx={{
                    width: '100%',
                    maxWidth: 640,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1e293b',
                    bgcolor: '#ffffff',
                    p: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' }
                  }}
                />
              </Box>

              {/* Working Days Field */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 1 }}>
                  Working Days <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
                  {WEEKDAYS.map((day) => {
                    const isSelected = formData.workingDays.includes(day);
                    return (
                      <Button
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        sx={{
                          px: 2.5,
                          py: 0.8,
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 500,
                          textTransform: 'none',
                          minWidth: 'auto',
                          lineHeight: 1.2,
                          bgcolor: isSelected ? '#6366f1' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#475569',
                          border: isSelected ? '1px solid #6366f1' : '1px solid #cbd5e1',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: isSelected ? '#4f46e5' : '#f8fafc',
                            boxShadow: 'none'
                          }
                        }}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              {/* Create shift Submit Button */}
              <Box sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveShift}
                  disabled={submitting}
                  sx={{
                    bgcolor: '#6366f1',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    borderRadius: '10px',
                    height: '44px',
                    width: '100%',
                    maxWidth: 640,
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
                  {submitting ? <CircularProgress size={22} sx={{ color: '#ffffff' }} /> : editingShift ? 'Save shift' : 'Create shift'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* VIEW 1: SHIFT DETAILS TABLE DASHBOARD */}
      {viewMode === 'list' && (
        <Box sx={{ width: '100%', minHeight: '100vh', p: 4 }}>
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
            Shift Managment
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
          <Box sx={{ borderBottom: '1px solid #D1D5DB', mb: 3 }}>
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

          {/* Filter & Action Bar */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 2,
              mb: 3
            }}
          >
            {/* Shift Search */}
            <FormControl size="small" sx={{ minWidth: 280, flex: 1, maxWidth: 360 }}>
              <Typography
                variant="caption"
                sx={{ color: '#1E293B', fontWeight: 400, mb: 0.5, display: 'block', fontSize: '14px', lineHeight: '100%' }}
              >
                Shift Search
              </Typography>
              <OutlinedInput
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by shift name"
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#64748B', fontSize: 20 }} />
                  </InputAdornment>
                }
                endAdornment={
                  searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch} edge="end" sx={{ color: '#94a3b8', p: 0.5 }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }
                sx={{
                  minHeight: '32px',
                  borderRadius: '8px',
                  bgcolor: '#ffffff',
                  width: '392px',
                  fontSize: '13px',
                  color: '#64748B',
                  overflow: 'hidden',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E2E8F0',
                    borderRadius: '8px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' }
                }}
              />
            </FormControl>

            {/* + Create Shift Button */}
            <Button
              variant="contained"
              onClick={handleOpenCreateView}
              sx={{
                bgcolor: '#644EE5',
                color: '#ffffff',
                fontWeight: 500,
                fontSize: '14px',
                borderRadius: '8px',
                lineHeight: '24px',
                px: 2,
                height: '40px',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#4f46e5',
                  boxShadow: '0 2px 4px rgba(99,102,241,0.2)'
                }
              }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 600, lineHeight: 1 }}>+</span> Create Shift
            </Button>
          </Box>

          {/* Main Shift Details Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflowX: 'auto',
              mb: 2.5
            }}
          >
            <Table sx={{ minWidth: 900 }} size="medium">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#18181B', fontSize: '14px', lineHeight: '20px', py: '12px' }}>
                    Shift Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#18181B', fontSize: '14px', lineHeight: '20px', py: '12px', width: '360px' }}>
                    Description
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#18181B', fontSize: '14px', lineHeight: '20px', py: '12px' }}>
                    Time Range
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: '#18181B', fontSize: '14px', lineHeight: '20px', py: '12px', textAlign: 'center' }}
                  >
                    Employees Assigned
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#18181B', fontSize: '14px', lineHeight: '20px', py: '12px' }}>
                    Working Days
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: '#18181B', fontSize: '14px', lineHeight: '20px', py: '12px', textAlign: 'center' }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                      <Typography sx={{ mt: 1.5, color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Loading shifts...</Typography>
                    </TableCell>
                  </TableRow>
                ) : shifts.length > 0 ? (
                  shifts.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:hover': { bgcolor: '#f8fafc' },
                        '& td': { borderColor: '#E2E8F0', py: '12px', fontSize: '0.875rem', color: '#1F2937' }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: '#1F2937', lineHeight: '20px', fontSize: '14px' }}>{row.name}</TableCell>
                      <TableCell sx={{ color: '#1F2937', fontSize: '14px', fontWeight: 400, lineHeight: '20px' }}>
                        {row.description}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '100%', color: '#0F172A' }}>
                        {row.timeRange}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '14px', lineHeight: '100%' }}>
                        {row.assignedCount}
                      </TableCell>
                      <TableCell sx={{ color: '#0F172A', fontWeight: 600, fontSize: '14px' }}>{row.workingDays}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenShiftDetailView(row)}
                            title="View Details"
                            sx={{
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              width: 34,
                              height: 34,
                              p: 0,
                              bgcolor: '#ffffff',
                              color: '#1E293B',
                              '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8', color: '#6366f1' }
                            }}
                          >
                            <ViewIcon size={18} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedDetailShift(row);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete Shift"
                            sx={{
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              width: 34,
                              height: 34,
                              p: 0,
                              bgcolor: '#ffffff',
                              color: '#1E293B',
                              '&:hover': { bgcolor: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }
                            }}
                          >
                            <DeleteBinIcon size={18} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No shifts found matching your search.
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
              pt: 1
            }}
          >
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '14px', fontWeight: '400', lineHeight: '20px' }}>
              Showing {startIndex}-{endIndex} of {totalCount}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Rows per page */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#1E293B', fontSize: '14px', fontWeight: '500', lineHeight: '20px' }}>
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
                      borderWidth: '1px'
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
                      alignItems: 'center'
                    },
                    '& .MuiSelect-icon': {
                      color: '#1E293B',
                      fontSize: '18px',
                      right: '8px'
                    }
                  }}
                >
                  <MenuItem value={10} sx={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>
                    10
                  </MenuItem>
                  <MenuItem value={20} sx={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>
                    20
                  </MenuItem>
                  <MenuItem value={50} sx={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>
                    50
                  </MenuItem>
                </Select>
              </Box>

              {/* Page counter text */}
              <Typography variant="body2" sx={{ color: '#1E293B', fontSize: '14px', fontWeight: '500', lineHeight: '20px' }}>
                Page {page} of {totalPages}
              </Typography>

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  sx={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
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
                    border: '1px solid #cbd5e1',
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
                    border: '1px solid #cbd5e1',
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
                    border: '1px solid #cbd5e1',
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
        </Box>
      )}

      {/* SINGLE Delete Shift Confirmation Modal matching Mockup 2 */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxWidth: '480px'
          }
        }}
      >
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: '26.5px', borderBottom: '1px solid #E2E8F0' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '16px' }}>
            Delete Shift
          </Typography>
          <IconButton onClick={() => setDeleteModalOpen(false)} size="small" sx={{ color: '#64748b' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: '24px', borderBottom: '1px solid #E2E8F0' }}>
          <Typography
            variant="body2"
            sx={{ color: '#475569', fontSize: '14px', lineHeight: '20px', mb: '16px', fontWeight: 400, pt: '24px' }}
          >
            This shift has <strong>{selectedDetailShift?.assignedCount ?? 0} employees</strong> assigned across{' '}
            <strong>
              {uniqueAssignedDepartments.length} {uniqueAssignedDepartments.length === 1 ? 'department' : 'departments'}
            </strong>
            . Deleting will remove their shift assignment and notify all affected employees.
          </Typography>
          <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', px: 2, pt: '26px', pb: '16px', bgcolor: '#F8FAFC' }}
        >
          <Button
            onClick={() => setDeleteModalOpen(false)}
            sx={{
              width: '80px',
              minWidth: '80px',
              height: '33px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              py: '8px',
              px: '16px',
              bgcolor: '#FFFFFF',
              color: '#0F172A',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#f8fafc',
                borderColor: '#cbd5e1'
              }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={deleting}
            onClick={() => {
              if (selectedDetailShift?.id) {
                handleDeleteShift(selectedDetailShift.id);
              }
            }}
            sx={{
              bgcolor: '#ef4444',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '6px',
              px: '16px',
              py: '8px',
              height: '33px',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#dc2626' },
              '&.Mui-disabled': {
                bgcolor: '#fca5a5',
                color: '#ffffff'
              }
            }}
          >
            {deleting ? <CircularProgress size={18} sx={{ color: '#ffffff' }} /> : 'Delete Shift'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Employee / Assign Department Dual-State Modal */}
      <AssignEmployeeModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleAssignEmployees}
        shift={currentShift}
      />

      {/* Change Shift Modal */}
      <ChangeShiftModal
        open={changeShiftModalOpen}
        onClose={() => setChangeShiftModalOpen(false)}
        onConfirm={handleConfirmShiftChange}
        employee={selectedEmployeeForShiftChange}
      />
    </>
  );
};

export default ShiftDetails;
