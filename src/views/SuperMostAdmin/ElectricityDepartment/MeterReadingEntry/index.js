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
  Close as CloseIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  UnfoldMore as UnfoldMoreIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  getMeterReadings,
  saveMeterReading,
  exportMeterReadingsExcel,
  exportMeterReadingsPDF
} from '../Services/meterReadingService';
import AddChargesModal from './components/AddChargesModal';

const ROOM_FILTER_OPTIONS = [
  'All',
  '101',
  '102',
  '103',
  '104',
  '105',
  '106',
  '107',
  '108',
  '109',
  '110',
  '111',
  '201',
  '202',
  '301',
  '302'
];

const MeterReadingEntry = () => {
  // Tab State: 'metered' | 'fixed'
  const [activeTab, setActiveTab] = useState('metered');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('All');

  // Data & Loading States
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Pagination States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch meter readings whenever active tab changes
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMeterReadings({
        tab: activeTab,
        search: searchQuery,
        roomNo: activeTab === 'metered' ? selectedRoom : 'All'
      });
      if (res && res.success) {
        setData(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching meter reading entries:', err);
      toast.error('Failed to load meter reading entries');
    } finally {
      setLoading(false);
    }
  };

  // Client-side search and room filter for instant responsiveness
  const filteredData = useMemo(() => {
    let list = [...data];

    if (activeTab === 'metered' && selectedRoom && selectedRoom !== 'All') {
      list = list.filter((item) => String(item.roomNo).toLowerCase() === String(selectedRoom).toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (item) =>
          (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
          (item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
          (item.buildingName && item.buildingName.toLowerCase().includes(q)) ||
          (item.buildingNo && item.buildingNo.toLowerCase().includes(q)) ||
          (item.roomNo && String(item.roomNo).toLowerCase().includes(q)) ||
          (item.meterNo && item.meterNo.toLowerCase().includes(q))
      );
    }

    return list;
  }, [data, searchQuery, selectedRoom, activeTab]);

  // Pagination Slicing
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, startIndex, rowsPerPage]);

  const displayStart = totalCount > 0 ? startIndex + 1 : 0;
  const displayEnd = Math.min(startIndex + rowsPerPage, totalCount);

  // Handle Adding new Charge / Meter Reading
  const handleSaveCharge = async (formData) => {
    setModalLoading(true);
    try {
      const res = await saveMeterReading(formData);
      if (res && res.success) {
        toast.success(res.message || 'Charge entry added successfully');
        setAddModalOpen(false);
        await fetchData();
      } else {
        toast.error(res?.message || 'Failed to save charge entry');
      }
    } catch (err) {
      console.error('Error saving meter reading:', err);
      toast.error('An error occurred while saving charge entry');
    } finally {
      setModalLoading(false);
    }
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const res = exportMeterReadingsExcel({ data: filteredData, tab: activeTab });
    if (res && res.success) {
      toast.success(res.message || 'Excel export downloaded');
    } else {
      toast.error(res?.message || 'Export failed');
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    const res = exportMeterReadingsPDF({ data: filteredData, tab: activeTab });
    if (res && res.success) {
      toast.success(res.message || 'PDF export ready');
    } else {
      toast.error(res?.message || 'PDF export failed');
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '#ffffff',
        p: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* 1. Top Controls Bar: Tabs (Left) & Add Charges (Right) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: '24px'
        }}
      >
        {/* Segmented Pill Tabs: Metered Building / Fixed Building */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            bgcolor: '#F1F5F9',
            borderRadius: '8px',
            p: '4px',
            gap: '4px',
            width: 'fit-content'
          }}
        >
          <Button
            onClick={() => {
              setActiveTab('metered');
              setPage(1);
            }}
            disableRipple
            sx={{
              bgcolor: activeTab === 'metered' ? '#644EE5' : 'transparent',
              color: activeTab === 'metered' ? '#FFFFFF' : '#1E293B',
              borderRadius: '6px',
              px: { xs: '16px', sm: '22px' },
              py: '7px',
              fontSize: '16px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              textTransform: 'none',
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: activeTab === 'metered' ? '#523BCB' : '#E2E8F0',
                color: activeTab === 'metered' ? '#FFFFFF' : '#0F172A',
                boxShadow: 'none'
              }
            }}
          >
            Metered Building
          </Button>

          <Button
            onClick={() => {
              setActiveTab('fixed');
              setPage(1);
            }}
            disableRipple
            sx={{
              bgcolor: activeTab === 'fixed' ? '#644EE5' : 'transparent',
              color: activeTab === 'fixed' ? '#FFFFFF' : '#1E293B',
              borderRadius: '6px',
              px: { xs: '16px', sm: '22px' },
              py: '7px',
              fontSize: '16px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              textTransform: 'none',
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: activeTab === 'fixed' ? '#523BCB' : '#E2E8F0',
                color: activeTab === 'fixed' ? '#FFFFFF' : '#0F172A',
                boxShadow: 'none'
              }
            }}
          >
            Fixed Building
          </Button>
        </Box>

        {/* Right side: Add Charges Action Button */}
        <Button
          variant="contained"
          onClick={() => setAddModalOpen(true)}
          sx={{
            height: '36px',
            borderRadius: '8px',
            px: '16px',
            py: '8px',
            bgcolor: '#644EE5',
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            textTransform: 'none',
            boxShadow: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            '&:hover': {
              bgcolor: '#523BCB',
              boxShadow: 'none'
            }
          }}
        >
          Add Charges
        </Button>
      </Box>

      {/* 2. Filter & Export Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'flex-end' },
          justifyContent: 'space-between',
          gap: 2,
          mb: '20px'
        }}
      >
        {/* Left Filters: Employee Search (& Room Number if Metered) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'flex-end' },
            gap: 2
          }}
        >
          {/* Employee Search */}
          <Box sx={{ width: { xs: '100%', sm: 320, md: 392 } }}>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#1E293B',
                fontFamily: 'Inter, sans-serif',
                mb: '4px',
                lineHeight: '100%'
              }}
            >
              Employee Search
            </Typography>
            <FormControl fullWidth size="small">
              <OutlinedInput
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by Building No. , Name ..."
                startAdornment={
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <SearchIcon sx={{ fontSize: 16, color: '#64748B' }} />
                  </InputAdornment>
                }
                endAdornment={
                  searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSearchQuery('');
                          setPage(1);
                        }}
                        edge="end"
                      >
                        <CloseIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }
                sx={{
                  width: '100%',
                  borderRadius: '8px !important',
                  bgcolor: '#ffffff',
                  height: '32px',
                  fontFamily: 'Inter, sans-serif',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E2E8F0',
                    borderRadius: '8px !important'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#644EE5',
                    borderWidth: '1.5px'
                  },
                  '& input': {
                    py: 0,
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
            </FormControl>
          </Box>

          {/* Room Number Dropdown (Only in Metered Building tab) */}
          {activeTab === 'metered' && (
            <Box sx={{ width: { xs: '100%', sm: 130, md: 150 } }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#1E293B',
                  fontFamily: 'Inter, sans-serif',
                  mb: '4px',
                  lineHeight: '100%'
                }}
              >
                Room Number
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedRoom}
                  onChange={(e) => {
                    setSelectedRoom(e.target.value);
                    setPage(1);
                  }}
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    height: '32px',
                    borderRadius: '8px',
                    bgcolor: '#FFFFFF',
                    color: '#1E293B',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E2E8F0',
                      borderRadius: '8px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#94A3B8'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#644EE5',
                      borderWidth: '1.5px'
                    },
                    '& .MuiSelect-select': {
                      py: '5px',
                      pl: '14px',
                      pr: '30px !important',
                      display: 'flex',
                      alignItems: 'center'
                    },
                    '& .MuiSelect-icon': {
                      color: '#64748B',
                      fontSize: '20px',
                      right: '8px'
                    }
                  }}
                >
                  {ROOM_FILTER_OPTIONS.map((room) => (
                    <MenuItem
                      key={room}
                      value={room}
                      sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        color: '#1E293B'
                      }}
                    >
                      {room}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>

        {/* Right Actions: Export PDF & Export Excel */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap'
          }}
        >
          {/* Export PDF Button */}
          <Button
            variant="outlined"
            onClick={handleExportPDF}
            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              height: '36px',
              borderRadius: '8px',
              px: '16px',
              borderColor: '#E2E8F0',
              color: '#475569',
              bgcolor: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '24px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                borderColor: '#CBD5E1',
                bgcolor: '#F8FAFC',
                boxShadow: 'none'
              }
            }}
          >
            Export PDF
          </Button>

          {/* Export Excel Button */}
          <Button
            variant="contained"
            onClick={handleExportExcel}
            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              height: '36px',
              borderRadius: '8px',
              px: '16px',
              bgcolor: '#644EE5',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '24px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#523BCB',
                boxShadow: 'none'
              }
            }}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      {/* 3. Main Data Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          overflowX: 'auto',
          bgcolor: '#ffffff',
          mb: 2.5
        }}
      >
        <Table
          sx={{
            minWidth: activeTab === 'metered' ? 950 : 700,
            '& .MuiTableCell-root': {
              borderBottom: '1px solid #E2E8F0',
              fontFamily: 'Inter, sans-serif'
            }
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              {activeTab === 'metered' ? (
                <>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Building Name
                  </TableCell>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Building No.
                  </TableCell>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Room No.
                  </TableCell>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Employee Name
                  </TableCell>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Meter No.
                  </TableCell>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Prev. Reading
                  </TableCell>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Current Reading
                  </TableCell>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Units Consumed
                  </TableCell>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Charge (₹)
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Room No.
                  </TableCell>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Building Name
                  </TableCell>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Employee Name
                  </TableCell>
                  <TableCell sx={{ color: '#16151C', fontWeight: 600, fontSize: '14px', py: '12px', px: '16px', lineHeight: '20px' }}>
                    Charge (₹)
                  </TableCell>
                </>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={activeTab === 'metered' ? 9 : 4} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                  <CircularProgress size={32} sx={{ color: '#644EE5' }} />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={activeTab === 'metered' ? 9 : 4}
                  align="center"
                  sx={{ py: 6, color: '#64748B', borderBottom: 'none' }}
                >
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: '#F8FAFC'
                    }
                  }}
                >
                  {activeTab === 'metered' ? (
                    <>
                      <TableCell sx={{ fontSize: '15px', fontWeight: 500, color: '#1F2937', py: '18px', px: '16px', lineHeight: '20px' }}>
                        {row.buildingName || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px', fontWeight: 500, color: '#1F2937', py: '18px', px: '16px', lineHeight: '20px' }}>
                        {row.buildingNo || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px', fontWeight: 500, color: '#1F2937', py: '18px', px: '16px', lineHeight: '20px' }}>
                        {row.roomNo || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px', fontWeight: 500, color: '#1F2937', py: '18px', px: '16px', lineHeight: '20px' }}>
                        {row.employeeName || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px', fontWeight: 500, color: '#1F2937', py: '18px', px: '16px', lineHeight: '20px' }}>
                        {row.meterNo || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', fontWeight: 500, color: '#1F2937', py: '18px', px: '16px', lineHeight: '20px' }}>
                        {row.prevReading || '0'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px', fontWeight: 500, color: '#1F2937', py: '18px', px: '16px', lineHeight: '20px' }}>
                        {row.currentReading || '0'}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#644EE5',
                          py: '18px',
                          px: '16px',
                          lineHeight: '20px'
                        }}
                      >
                        {row.unitsConsumed ? `${row.unitsConsumed} units` : '0 units'}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#0F172A',
                          py: '16px',
                          px: '16px'
                        }}
                      >
                        ₹ {row.charge || '0'}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ fontSize: '15px', fontWeight: 500, color: '#1F2937', py: '18px', px: '16px', lineHeight: '20px' }}>
                        {row.roomNo || 'Main Block'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px', fontWeight: 500, color: '#1F2937', py: '18px', px: '16px', lineHeight: '20px' }}>
                        {row.buildingName || 'Room 101'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px', fontWeight: 500, color: '#1F2937', py: '18px', px: '16px', lineHeight: '20px' }}>
                        {row.employeeName || 'Amit Sharma'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '15px', fontWeight: 500, color: '#1F2937', py: '18px', px: '16px', lineHeight: '20px' }}>
                        {row.charge || '750'}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 4. Pagination Footer */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        {/* Count text */}
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
                lineHeight: '20px',
                minWidth: '78px',
                overflow: 'hidden',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setPage(1)}
              disabled={page === 1}
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
              disabled={page === 1}
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
              disabled={page === totalPages}
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
              disabled={page === totalPages}
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

      {/* 5. Add Charges / Meter Reading Modal */}
      <AddChargesModal
        open={addModalOpen}
        defaultTab={activeTab}
        onClose={() => setAddModalOpen(false)}
        onConfirm={handleSaveCharge}
        loading={modalLoading}
      />
    </Box>
  );
};

export default MeterReadingEntry;
