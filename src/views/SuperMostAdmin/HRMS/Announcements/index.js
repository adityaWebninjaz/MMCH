import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';
import { IconCalendar } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import {
  getAnnouncements
} from './services/announcementService';


const Announcements = () => {
  const navigate = useNavigate();
  // Filter States
  const [selectedDate, setSelectedDate] = useState('2025-07-12');
  const [searchQuery, setSearchQuery] = useState('');
  const dateInputRef = useRef(null);

  // Format date for button display
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '12 July 2025';
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return '12 July 2025';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [selectedDate]);

  // Data & Pagination
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAnnouncements({
        date: selectedDate,
        search: searchQuery
      });
      if (res && res.success) {
        setData(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (row.title && row.title.toLowerCase().includes(q)) ||
        (row.targetAudience && row.targetAudience.toLowerCase().includes(q)) ||
        (row.description && row.description.toLowerCase().includes(q)) ||
        (row.publishedDate && row.publishedDate.toLowerCase().includes(q));

      return matchSearch;
    });
  }, [data, searchQuery]);

  // Pagination calculation
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, startIndex, rowsPerPage]);

  const displayStart = totalCount > 0 ? startIndex + 1 : 0;
  const displayEnd = Math.min(startIndex + rowsPerPage, totalCount);

  return (
    <Box sx={{ width: '100%', bgcolor: '#ffffff', minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Title and Top Action Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: '24px'
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: '#0F172A',
            fontSize: { xs: '20px', sm: '24px' },
            lineHeight: '100%'
          }}
        >
          Announcements
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate('/supermostadmin/hrms/announcements/create')}
          sx={{
            width: '191px',
            height: '36px',
            gap: '8px',
            borderRadius: '6px',
            pt: '6px',
            pr: '16px',
            pb: '6px',
            pl: '16px',
            bgcolor: '#644EE5',
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '24px',
            letterSpacing: '0%',
            textTransform: 'none',
            boxShadow: 'none',
            boxSizing: 'border-box',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              bgcolor: '#523BCB',
              boxShadow: 'none'
            }
          }}
        >
          Create Announcement
        </Button>
      </Box>

      {/* Filter Controls Bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          gap: 2,
          mb: '24px'
        }}
      >
        {/* Date Filter Button */}
        <FormControl
          size="small"
          sx={{
            minWidth: { xs: '100%', sm: 180 },
            flex: { xs: '1 1 100%', sm: 'none' },
            position: 'relative'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#1E293B',
              fontWeight: 400,
              mb: '6px',
              fontSize: '13px',
              lineHeight: '100%'
            }}
          >
            Date
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              if (dateInputRef.current) {
                if (typeof dateInputRef.current.showPicker === 'function') {
                  dateInputRef.current.showPicker();
                } else {
                  dateInputRef.current.click();
                }
              }
            }}
            endIcon={<IconCalendar size={18} stroke={1.75} color="#1E293B" />}
            sx={{
              width: { xs: '100%', sm: '180px' },
              height: '32px',
              gap: '4px',
              borderRadius: '6px !important',
              border: '1px solid #E2E8F0',
              bgcolor: '#ffffff',
              color: '#1E293B',
              fontSize: '13px',
              fontWeight: 400,
              textTransform: 'none',
              px: '12px',
              py: '8px',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              '&:hover': {
                borderColor: '#94A3B8',
                bgcolor: '#ffffff'
              }
            }}
          >
            {formattedDisplayDate}
          </Button>
          <input
            type="date"
            ref={dateInputRef}
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
                setPage(1);
              }
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '1px',
              height: '1px',
              opacity: 0,
              pointerEvents: 'none'
            }}
          />
        </FormControl>

        {/* Search Announcement Input */}
        <FormControl
          size="small"
          sx={{
            flexGrow: 1,
            maxWidth: { xs: '100%', md: 392 },
            minWidth: { xs: '100%', sm: 240 }
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#1E293B',
              fontWeight: 400,
              mb: '6px',
              fontSize: '13px',
              lineHeight: '100%'
            }}
          >
            Search Announcement
          </Typography>
          <OutlinedInput
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="search announcement"
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#64748B', fontSize: 18 }} />
              </InputAdornment>
            }
            endAdornment={
              searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null
            }
            sx={{
              borderRadius: '6px !important',
              bgcolor: '#ffffff',
              height: '32px',
              fontSize: '13px',
              color: '#64748B',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E2E8F0',
                borderRadius: '6px !important'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366F1', borderWidth: '1.5px' }
            }}
          />
        </FormControl>
      </Box>

      {/* Main Announcements Data Table */}
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
            minWidth: 800,
            '& .MuiTableCell-root': {
              borderBottom: '1px solid #E2E8F0'
            }
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: '#F1F5F9' }}>
              <TableCell sx={{ color: '#0F172A', fontWeight: 600, fontSize: '13px', py: "14px", px: '24px', lineHeight: '100%', width: '22%' }}>
                Announcement Title
              </TableCell>
              <TableCell sx={{ color: '#0F172A', fontWeight: 600, fontSize: '13px', py: "14px", px: '24px', lineHeight: '100%', width: '18%' }}>
                Target Audience
              </TableCell>
              <TableCell sx={{ color: '#0F172A', fontWeight: 600, fontSize: '13px',py: "14px", px: '24px', lineHeight: '100%', width: '45%' }}>
                Description
              </TableCell>
              <TableCell sx={{ color: '#0F172A', fontWeight: 600, fontSize: '13px', py: "14px", px: '24px', lineHeight: '100%', width: '15%' }}>
                Published Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                  <CircularProgress size={32} sx={{ color: '#644EE5' }} />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#64748B', borderBottom: 'none' }}>
                  No announcements found
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
                  <TableCell
                    sx={{
                      fontSize: '13px',
                      fontWeight: 400,
                      color: '#0F172A',
                      lineHeight: '100%',
                      px: '24px',
                      py: '14px'
                    }}
                  >
                    {row.title}
                  </TableCell>
                  <TableCell
                    sx={{
                       fontSize: '13px',
                      fontWeight: 400,
                      color: '#0F172A',
                      lineHeight: '100%',
                      px: '24px',
                      py: '14px'
                    }}
                  >
                    {row.targetAudience}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '13px',
                      fontWeight: 400,
                      color: '#0F172A',
                      lineHeight: '100%',
                      px: '24px',
                      py: '14px'
                    }}
                  >
                    {row.description}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '13px',
                      fontWeight: 400,
                      color: '#0F172A',
                      lineHeight: '100%',
                      px: '24px',
                      py: '14px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {row.publishedDate}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Inter, sans-serif',
            color: '#64748B',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            letterSpacing: '0%'
          }}
        >
          {totalCount > 0 ? `Showing ${displayStart}-${displayEnd} of ${totalCount}` : 'Showing 0-0 of 0'}
        </Typography>

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
                lineHeight: '20px',
                letterSpacing: '0%'
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
                letterSpacing: '0%',
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
                  borderColor: '#6366F1'
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
                  letterSpacing: '0%',
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
                    letterSpacing: '0%',
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
              lineHeight: '20px',
              letterSpacing: '0%'
            }}
          >
            Page {page} of {totalPages}
          </Typography>

          {/* Navigation Buttons */}
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
    </Box>
  );
};

export default Announcements;
