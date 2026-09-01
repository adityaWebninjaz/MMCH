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
  Close as CloseIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getChargeEntries, saveChargeEntry } from '../Services/chargeEntryService';
import AddMaintenanceModal from './components/AddMaintenanceModal';
import AddAccommodationModal from './components/AddAccommodationModal';

const TABS = [
  { id: 'room_rent', label: 'Room Rent', amountKey: 'rentAmount', headerTitle: 'Rent Amount (₹)' },
  { id: 'maintenance', label: 'Maintenance', amountKey: 'maintenanceAmount', headerTitle: 'Amount (₹)', buttonLabel: 'Add Maintenance Charges' },
  { id: 'accommodation', label: 'Accommodation', amountKey: 'accommodationCharges', headerTitle: 'Amount (₹)', buttonLabel: 'Add Accommodation Charges' }
];

const ChargeEntry = () => {
  const [activeTab, setActiveTab] = useState('room_rent');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addAccommodationModalOpen, setAddAccommodationModalOpen] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getChargeEntries({
        tab: activeTab,
        search: searchQuery
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

  // Handler for adding maintenance / accommodation charge
  const handleSaveCharge = async (formData) => {
    setModalLoading(true);
    try {
      const res = await saveChargeEntry(formData);
      if (res && res.success) {
        toast.success(res.message || 'Charge entry added successfully');
        setAddModalOpen(false);
        setAddAccommodationModalOpen(false);
        await fetchData();
      } else {
        toast.error(res?.message || 'Failed to save charge entry');
      }
    } catch (err) {
      console.error('Error saving charge entry:', err);
      toast.error('An error occurred while saving charge entry');
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
        (item.roomNo && item.roomNo.toLowerCase().includes(q)) ||
        (item.accommodationType && item.accommodationType.toLowerCase().includes(q)) ||
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

  // Current tab metadata
  const currentTabMeta = useMemo(() => {
    return TABS.find((t) => t.id === activeTab) || TABS[0];
  }, [activeTab]);

  const hasActionButton = activeTab === 'maintenance' || activeTab === 'accommodation';
  const hasNotesColumn = activeTab === 'maintenance' || activeTab === 'accommodation';

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
      {/* 1. Top Controls Bar: Tabs (Left) & Action / Search (Right) */}
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
        {/* Segmented Pill Tabs */}
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
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                disableRipple
                sx={{
                  bgcolor: isActive ? '#644EE5' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#475569',
                  borderRadius: '6px',
                  px: { xs: '14px', sm: '20px' },
                  py: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  textTransform: 'none',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isActive ? '#523BCB' : '#E2E8F0',
                    color: isActive ? '#FFFFFF' : '#0F172A',
                    boxShadow: 'none'
                  }
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>

        {/* Right side: Action Button for Maintenance & Accommodation, Search Input for Room Rent */}
        {hasActionButton ? (
          <Button
            variant="contained"
            onClick={() => {
              if (activeTab === 'maintenance') {
                setAddModalOpen(true);
              } else if (activeTab === 'accommodation') {
                setAddAccommodationModalOpen(true);
              }
            }}
            sx={{
              height: '36px',
              borderRadius: '8px',
              pt: '8px',
              pr: '16px',
              pb: '8px',
              pl: '16px',
              bgcolor: '#644EE5',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '0%',
              textTransform: 'none',
              boxShadow: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: '#523BCB',
                boxShadow: 'none'
              }
            }}
          >
            {currentTabMeta.buttonLabel}
          </Button>
        ) : (
          <FormControl
            size="small"
            sx={{
              width: { xs: '100%', sm: 280, md: 320 }
            }}
          >
            <OutlinedInput
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search Employee"
              endAdornment={
                searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchQuery('');
                        setPage(1);
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
              sx={{
                borderRadius: '8px !important',
                bgcolor: '#ffffff',
                height: '38px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                color: '#0F172A',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0',
                  borderRadius: '8px !important'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#644EE5',
                  borderWidth: '1.5px'
                }
              }}
            />
          </FormControl>
        )}
      </Box>

      {/* 2. Main Data Table */}
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
            minWidth: 850,
            '& .MuiTableCell-root': {
              borderBottom: '1px solid #E2E8F0',
              fontFamily: 'Inter, sans-serif'
            }
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: '#F1F5F9' }}>
              <TableCell
                sx={{
                  color: '#0F172A',
                  fontWeight: 600,
                  fontSize: '14px',
                  py: '12px',
                  px: '16px',
                  lineHeight: '20px',
                  width: hasNotesColumn ? '14%' : '18%'
                }}
              >
                Room No.
              </TableCell>
              <TableCell
                sx={{
                  color: '#0F172A',
                  fontWeight: 600,
                  fontSize: '14px',
                  py: '12px',
                  px: '16px',
                  lineHeight: '20px',
                  width: hasNotesColumn ? '18%' : '20%'
                }}
              >
                Employee ID
              </TableCell>
              <TableCell
                sx={{
                  color: '#0F172A',
                  fontWeight: 600,
                  fontSize: '14px',
                  py: '12px',
                  px: '16px',
                  lineHeight: '20px',
                  width: hasNotesColumn ? '20%' : '24%'
                }}
              >
                Employee Name
              </TableCell>
              <TableCell
                sx={{
                  color: '#0F172A',
                  fontWeight: 600,
                  fontSize: '14px',
                  py: '12px',
                  px: '16px',
                  lineHeight: '20px',
                  width: hasNotesColumn ? '18%' : '20%'
                }}
              >
                Accommodation Type
              </TableCell>
              <TableCell
                sx={{
                  color: '#0F172A',
                  fontWeight: 600,
                  fontSize: '14px',
                  py: '12px',
                  px: '16px',
                  lineHeight: '20px',
                  width: hasNotesColumn ? '14%' : '18%'
                }}
              >
                {currentTabMeta.headerTitle}
              </TableCell>
              {hasNotesColumn && (
                <TableCell
                  sx={{
                    color: '#0F172A',
                    fontWeight: 600,
                    fontSize: '14px',
                    py: '12px',
                    px: '16px',
                    lineHeight: '20px',
                    width: '16%'
                  }}
                >
                  Notes
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={hasNotesColumn ? 6 : 5} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                  <CircularProgress size={32} sx={{ color: '#644EE5' }} />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={hasNotesColumn ? 6 : 5} align="center" sx={{ py: 6, color: '#64748B', borderBottom: 'none' }}>
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
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#1F2937',
                      lineHeight: '20px',
                      px: '16px',
                      py: '18px'
                    }}
                  >
                    {row.roomNo}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#1F2937',
                      lineHeight: '20px',
                      px: '16px',
                      py: '18px'
                    }}
                  >
                    {row.employeeId}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#1F2937',
                      lineHeight: '20px',
                      px: '16px',
                      py: '18px'
                    }}
                  >
                    {row.employeeName}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#1F2937',
                      lineHeight: '20px',
                      px: '16px',
                      py: '18px'
                    }}
                  >
                    {row.accommodationType}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1F2937',
                      lineHeight: '20px',
                      px: '16px',
                      py: '18px'
                    }}
                  >
                    {row[currentTabMeta.amountKey] || '3,000'}
                  </TableCell>
                  {hasNotesColumn && (
                    <TableCell
                      sx={{
                        fontSize: '14px',
                        fontWeight: row.notes && row.notes !== '-' ? 600 : 400,
                        color: row.notes && row.notes !== '-' ? '#0F172A' : '#1F2937',
                        lineHeight: '20px',
                        px: '16px',
                        py: '18px'
                      }}
                    >
                      {row.notes || '-'}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 3. Pagination Footer */}
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

      {/* 4. Add Maintenance Modal */}
      <AddMaintenanceModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onConfirm={handleSaveCharge}
        loading={modalLoading}
      />

      {/* 5. Add Accommodation Modal */}
      <AddAccommodationModal
        open={addAccommodationModalOpen}
        onClose={() => setAddAccommodationModalOpen(false)}
        onConfirm={handleSaveCharge}
        loading={modalLoading}
      />
    </Box>
  );
};

export default ChargeEntry;
