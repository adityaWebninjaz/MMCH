import React, { useState, useEffect, useMemo } from 'react';
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
    CircularProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    CalendarTodayOutlined as CalendarIcon,
    KeyboardArrowDown as ChevronDownIcon,
    FirstPage as FirstPageIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
    LastPage as LastPageIcon,
    UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getChargeEntries, saveChargeEntry } from '../Services/chargeEntryService';
import AddDeductionModal from './components/AddDeductionModal';

const DEPARTMENTS = [
    'All Departments',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Radiology',
    'General Medicine',
    'Administration'
];

const ChargeEntry = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [department, setDepartment] = useState('All Departments');
    const [selectedDate, setSelectedDate] = useState('12 July 2025');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Modal State
    const [addModalOpen, setAddModalOpen] = useState(false);

    // Pagination states
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
    }, [department]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getChargeEntries({
                search: searchQuery,
                department,
                date: selectedDate
            });
            if (res && res.success) {
                setData(res.data || []);
            }
        } catch (err) {
            console.error('Error fetching charge entries:', err);
            toast.error('Failed to load charge entries');
        } finally {
            setLoading(false);
        }
    };

    // Handler for saving deduction
    const handleSaveCharge = async (formData) => {
        setModalLoading(true);
        try {
            const res = await saveChargeEntry(formData);
            if (res && res.success) {
                toast.success(res.message || 'Deduction added successfully');
                setAddModalOpen(false);
                await fetchData();
            } else {
                toast.error(res?.message || 'Failed to save deduction');
            }
        } catch (err) {
            console.error('Error saving deduction:', err);
            toast.error('An error occurred while saving deduction');
        } finally {
            setModalLoading(false);
        }
    };

    // Filter by search query
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;
        const q = searchQuery.trim().toLowerCase();
        return data.filter(
            (item) =>
                (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
                (item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
                (item.department && item.department.toLowerCase().includes(q)) ||
                (item.designation && item.designation.toLowerCase().includes(q)) ||
                (item.notes && item.notes.toLowerCase().includes(q))
        );
    }, [data, searchQuery]);

    // Pagination calculations
    const totalCount = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
    const startIndex = (page - 1) * rowsPerPage;
    const paginatedData = useMemo(() => {
        return filteredData.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredData, startIndex, rowsPerPage]);

    const displayStart = totalCount > 0 ? startIndex + 1 : 0;
    const displayEnd = Math.min(startIndex + rowsPerPage, totalCount);

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100%',
                bgcolor: '#FFFFFF',
                p: { xs: 2, sm: 3, md: 4 },
                boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif'
            }}
        >
            {/* 1. Header Row: Charges Entry Title (Left) & Add Deduction Button (Right) */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: '20px'
                }}
            >
                <Typography
                    sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '24px',
                        lineHeight: '24px',
                        color: '#1E293B'
                    }}
                >
                    Charges Entry
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => setAddModalOpen(true)}
                    sx={{
                        height: '36px',
                        borderRadius: '8px',
                        py: '8px',
                        px: '16px',
                        bgcolor: '#644EE5',
                        color: '#FFFFFF',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        textTransform: 'none',
                        boxShadow: 'none',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                            bgcolor: '#523BCB',
                            boxShadow: 'none'
                        }
                    }}
                >
                    Add Deduction
                </Button>
            </Box>

            {/* 2. Filters Row: Employee Search, Department, Date */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'flex-start' },
                    gap: '16px',
                    mb: '20px'
                }}
            >
                {/* Filter 1: Employee Search */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', width: { xs: '100%', md: 392 } }}>
                    <Typography
                        sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '13px',
                            lineHeight: '16px',
                            color: '#1E293B'
                        }}
                    >
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
                                <SearchIcon sx={{ fontSize: 16, color: '#64748B' }} />
                            </InputAdornment>
                        }
                        sx={{
                            borderRadius: '6px !important',
                            bgcolor: '#FFFFFF',
                            height: '36px',
                            fontSize: '13px',
                            fontFamily: 'Inter, sans-serif',
                            color: '#1E293B',
                            '& .MuiOutlinedInput-input': {
                                py: '8px',
                                pl: 0.5,
                                '&::placeholder': {
                                    color: '#64748B',
                                    opacity: 1
                                }
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                                borderRadius: '6px !important'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#644EE5',
                                borderWidth: '1px'
                            }
                        }}
                    />
                </Box>

                {/* Filter 2: Department */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', width: { xs: '100%', md: 180 } }}>
                    <Typography
                        sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '13px',
                            lineHeight: '16px',
                            color: '#1E293B'
                        }}
                    >
                        Department
                    </Typography>
                    <Select
                        value={department}
                        onChange={(e) => {
                            setDepartment(e.target.value);
                            setPage(1);
                        }}
                        size="small"
                        IconComponent={ChevronDownIcon}
                        sx={{
                            height: '36px',
                            borderRadius: '6px',
                            bgcolor: '#FFFFFF',
                            color: '#1E293B',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '13px',
                            fontWeight: 400,
                            lineHeight: '16px',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                                borderRadius: '6px'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#94A3B8'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#644EE5'
                            },
                            '& .MuiSelect-select': {
                                py: '8px',
                                pl: '12px',
                                pr: '32px !important',
                                display: 'flex',
                                alignItems: 'center'
                            },
                            '& .MuiSelect-icon': {
                                color: '#64748B',
                                fontSize: '18px',
                                right: '8px'
                            }
                        }}
                    >
                        {DEPARTMENTS.map((dept) => (
                            <MenuItem
                                key={dept}
                                value={dept}
                                sx={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '13px',
                                    color: '#1E293B'
                                }}
                            >
                                {dept}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* Filter 3: Date */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', width: { xs: '100%', md: 180 } }}>
                    <Typography
                        sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '13px',
                            lineHeight: '16px',
                            color: '#1E293B'
                        }}
                    >
                        Date
                    </Typography>
                    <OutlinedInput
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        endAdornment={
                            <InputAdornment position="end">
                                <CalendarIcon sx={{ fontSize: 18, color: '#1E293B' }} />
                            </InputAdornment>
                        }
                        sx={{
                            borderRadius: '6px !important',
                            bgcolor: '#FFFFFF',
                            height: '36px',
                            fontSize: '13px',
                            fontFamily: 'Inter, sans-serif',
                            color: '#1E293B',
                            '& .MuiOutlinedInput-input': {
                                py: '8px',
                                pl: '12px'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#E2E8F0',
                                borderRadius: '6px !important'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#644EE5',
                                borderWidth: '1px'
                            }
                        }}
                    />
                </Box>
            </Box>

            {/* 3. Main Data Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    borderRadius: '12px',
                    border: '1px solid #F1F5F9',
                    overflowX: 'auto',
                    bgcolor: '#FFFFFF',
                    mb: '20px'
                }}
            >
                <Table
                    sx={{
                        minWidth: 900,
                        '& .MuiTableCell-root': {
                            borderBottom: '1px solid #F1F5F9',
                            fontFamily: 'Inter, sans-serif'
                        }
                    }}
                >
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#F1F5F9', height: '48px' }}>
                            <TableCell
                                sx={{
                                    color: '#475569',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    py: '8px',
                                    px: '14px',
                                    lineHeight: '18px',
                                    width: '12%'
                                }}
                            >
                                Emp ID
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: '#475569',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    py: '8px',
                                    px: '14px',
                                    lineHeight: '18px',
                                    width: '16%'
                                }}
                            >
                                Name
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: '#475569',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    py: '8px',
                                    px: '14px',
                                    lineHeight: '18px',
                                    width: '15%'
                                }}
                            >
                                Department
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: '#475569',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    py: '8px',
                                    px: '14px',
                                    lineHeight: '18px',
                                    width: '20%'
                                }}
                            >
                                Designation
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: '#475569',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    py: '8px',
                                    px: '14px',
                                    lineHeight: '18px',
                                    width: '13%'
                                }}
                            >
                                Charged Amount
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: '#475569',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    py: '8px',
                                    px: '14px',
                                    lineHeight: '18px',
                                    width: '13%'
                                }}
                            >
                                Submission date
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: '#475569',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    py: '8px',
                                    px: '14px',
                                    lineHeight: '18px',
                                    width: '11%'
                                }}
                            >
                                Notes
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                                    <CircularProgress size={32} sx={{ color: '#644EE5' }} />
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748B', borderBottom: 'none' }}>
                                    No records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row) => (
                                <TableRow
                                    key={row.id}
                                    hover
                                    sx={{
                                        height: '48px',
                                        '&:hover': {
                                            bgcolor: '#F8FAFC'
                                        }
                                    }}
                                >
                                    <TableCell
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#1E293B',
                                            lineHeight: '18px',
                                            px: '14px',
                                            py: '8px'
                                        }}
                                    >
                                        {row.employeeId}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#475569',
                                            lineHeight: '18px',
                                            px: '14px',
                                            py: '8px'
                                        }}
                                    >
                                        {row.employeeName}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#1E293B',
                                            lineHeight: '18px',
                                            px: '14px',
                                            py: '8px'
                                        }}
                                    >
                                        {row.department}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#475569',
                                            lineHeight: '18px',
                                            px: '14px',
                                            py: '8px'
                                        }}
                                    >
                                        {row.designation}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#475569',
                                            lineHeight: '18px',
                                            px: '14px',
                                            py: '8px'
                                        }}
                                    >
                                        {row.chargedAmount}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#475569',
                                            lineHeight: '18px',
                                            px: '14px',
                                            py: '8px'
                                        }}
                                    >
                                        {row.submissionDate}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            color: '#1E293B',
                                            lineHeight: '18px',
                                            px: '14px',
                                            py: '8px'
                                        }}
                                    >
                                        {row.notes || '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 4. Table Base / Pagination */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    height: '36px'
                }}
            >
                {/* Showing 1-10 of 20 */}
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

                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 1.5, sm: 3 } }}>
                    {/* Rows per page selector */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                lineHeight: '20px',
                                minWidth: '72px',
                                overflow: 'hidden',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#E2E8F0',
                                    borderRadius: '6px',
                                    borderWidth: '1px'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#94A3B8'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#644EE5'
                                },
                                '& .MuiSelect-select': {
                                    py: '8px',
                                    pl: '12px',
                                    pr: '28px !important',
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
                                    fontSize: '16px',
                                    right: '6px'
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
                                        color: '#1E293B'
                                    }}
                                >
                                    {pageSize}
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
                        Page {page} of {totalPages}
                    </Typography>

                    {/* Pagination Navigation Icons */}
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
                                p: 0,
                                color: '#1E293B',
                                bgcolor: '#FFFFFF',
                                '&.Mui-disabled': { borderColor: '#E2E8F0', color: '#CBD5E1', opacity: 0.4 }
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
                                p: 0,
                                color: '#1E293B',
                                bgcolor: '#FFFFFF',
                                '&.Mui-disabled': { borderColor: '#E2E8F0', color: '#CBD5E1', opacity: 0.4 }
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
                                p: 0,
                                color: '#1E293B',
                                bgcolor: '#FFFFFF',
                                '&.Mui-disabled': { borderColor: '#E2E8F0', color: '#CBD5E1', opacity: 0.4 }
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
                                p: 0,
                                color: '#1E293B',
                                bgcolor: '#FFFFFF',
                                '&.Mui-disabled': { borderColor: '#E2E8F0', color: '#CBD5E1', opacity: 0.4 }
                            }}
                        >
                            <LastPageIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            {/* 5. Add Deduction Modal */}
            <AddDeductionModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onConfirm={handleSaveCharge}
                loading={modalLoading}
            />
        </Box>
    );
};

export default ChargeEntry;
