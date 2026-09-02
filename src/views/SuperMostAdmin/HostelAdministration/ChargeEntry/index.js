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
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  UnfoldMore as UnfoldMoreIcon,
  EditOutlined as EditOutlinedIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  getChargeEntries,
  saveChargeEntry,
  updateMaintenanceCharge,
  updateAccommodationCharge
} from '../Services/chargeEntryService';
import AddMaintenanceModal from './components/AddMaintenanceModal';
import AddAccommodationModal from './components/AddAccommodationModal';
import UpdateMaintenanceModal from './components/UpdateMaintenanceModal';
import UpdateAccommodationModal from './components/UpdateAccommodationModal';

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

  // Add Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addAccommodationModalOpen, setAddAccommodationModalOpen] = useState(false);

  // Update Maintenance Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEditRow, setSelectedEditRow] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Update Accommodation Modal States
  const [editAccommodationModalOpen, setEditAccommodationModalOpen] = useState(false);
  const [selectedAccommodationRow, setSelectedAccommodationRow] = useState(null);
  const [editAccommodationLoading, setEditAccommodationLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, page, rowsPerPage, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getChargeEntries({
        tab: activeTab,
        page,
        limit: rowsPerPage,
        search: searchQuery
      });
      if (res && res.success) {
        const items = res.data || [];
        setData(items);

        if (typeof res.total === 'number' && res.total > items.length) {
          setTotalRecords(res.total);
          setHasNextPage(page * rowsPerPage < res.total);
        } else if (items.length >= rowsPerPage) {
          setTotalRecords(page * rowsPerPage + 1);
          setHasNextPage(true);
        } else {
          setTotalRecords((page - 1) * rowsPerPage + items.length);
          setHasNextPage(false);
        }
      }
    } catch (err) {
      console.error('Error fetching charge entries:', err);
      toast.error('Failed to load charge entries');
    } finally {
      setLoading(false);
    }
  };

  // Save new Maintenance / Accommodation
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

  // Update existing Maintenance charge
  const handleUpdateMaintenance = async (updatePayload) => {
    setEditLoading(true);
    try {
      const res = await updateMaintenanceCharge(updatePayload.id, {
        amount: updatePayload.amount,
        notes: updatePayload.notes
      });
      if (res && res.success) {
        toast.success(res.message || 'Maintenance charge updated successfully');
        setEditModalOpen(false);
        setSelectedEditRow(null);
        await fetchData();
      } else {
        toast.error(res?.message || 'Failed to update maintenance charge');
      }
    } catch (err) {
      console.error('Error updating maintenance charge:', err);
      toast.error('An error occurred while updating maintenance charge');
    } finally {
      setEditLoading(false);
    }
  };

  // Update existing Accommodation charge
  const handleUpdateAccommodation = async (updatePayload) => {
    setEditAccommodationLoading(true);
    try {
      const res = await updateAccommodationCharge(updatePayload.id, {
        amount: updatePayload.amount,
        duration: updatePayload.duration,
        notes: updatePayload.notes
      });
      if (res && res.success) {
        toast.success(res.message || 'Accommodation charge updated successfully');
        setEditAccommodationModalOpen(false);
        setSelectedAccommodationRow(null);
        await fetchData();
      } else {
        toast.error(res?.message || 'Failed to update accommodation charge');
      }
    } catch (err) {
      console.error('Error updating accommodation charge:', err);
      toast.error('An error occurred while updating accommodation charge');
    } finally {
      setEditAccommodationLoading(false);
    }
  };

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return safeData;
    const q = searchQuery.trim().toLowerCase();
    return safeData.filter(
      (item) =>
        (item && item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
        (item && item.studentName && item.studentName.toLowerCase().includes(q)) ||
        (item && item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
        (item && item.studentId && item.studentId.toLowerCase().includes(q)) ||
        (item && item.roomNo && item.roomNo.toLowerCase().includes(q)) ||
        (item && item.roomNumber && String(item.roomNumber).toLowerCase().includes(q)) ||
        (item && item.accommodationType && item.accommodationType.toLowerCase().includes(q)) ||
        (item && item.buildingCategory && item.buildingCategory.toLowerCase().includes(q)) ||
        (item && item.notes && item.notes.toLowerCase().includes(q))
    );
  }, [safeData, searchQuery]);

  const totalCount = Math.max(totalRecords, filteredData.length);
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;

  const paginatedData = useMemo(() => {
    if (filteredData.length <= rowsPerPage) return filteredData;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, startIndex, rowsPerPage]);

  const currentTabMeta = useMemo(() => TABS.find((t) => t.id === activeTab) || TABS[0], [activeTab]);
  const hasActionButton = Boolean(currentTabMeta.buttonLabel);
  const hasNotesColumn = activeTab === 'maintenance' || activeTab === 'accommodation';
  const isActionTab = activeTab === 'maintenance' || activeTab === 'accommodation';
  const totalCols = (hasNotesColumn ? 6 : 5) + (isActionTab ? 1 : 0);

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#FFFFFF',
        p: { xs: 2, sm: 3, md: 3.5 },
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header Controls Row */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3
        }}
      >
        {/* Left side: Segmented Tab Buttons */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            bgcolor: '#F1F5F9',
            p: '4px',
            borderRadius: '8px',
            gap: 0.5,
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
                  color: isActive ? '#FFFFFF' : '#1E293B',
                  borderRadius: '6px',
                  px: { xs: '14px', sm: '20px' },
                  py: '6px',
                  fontSize: '16px',
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
                  width: isActionTab ? '13%' : hasNotesColumn ? '14%' : '18%'
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
                  width: isActionTab ? '16%' : hasNotesColumn ? '18%' : '20%'
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
                  width: isActionTab ? '18%' : hasNotesColumn ? '20%' : '24%'
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
                  width: isActionTab ? '16%' : hasNotesColumn ? '18%' : '20%'
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
                  width: isActionTab ? '14%' : hasNotesColumn ? '14%' : '18%'
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
                    width: isActionTab ? '15%' : '16%'
                  }}
                >
                  Notes
                </TableCell>
              )}
              {isActionTab && (
                <TableCell
                  align="center"
                  sx={{
                    color: '#0F172A',
                    fontWeight: 600,
                    fontSize: '14px',
                    py: '12px',
                    px: '16px',
                    lineHeight: '20px',
                    width: '8%'
                  }}
                >
                  Action
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={totalCols} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                  <CircularProgress size={32} sx={{ color: '#644EE5' }} />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalCols} align="center" sx={{ py: 6, color: '#64748B', borderBottom: 'none' }}>
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={row.id || row._id || `row-${index}`}
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
                    {row.roomNo || (row.roomNumber ? `Room ${row.roomNumber}` : '') || row.room_no || row.room || '-'}
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
                    {activeTab === 'room_rent' ? 'null' : (row.employeeId || row.UID || (row.studentId ? `PMCH-${row.studentId.slice(0, 5).toUpperCase()}` : '') || row.employee_id || row.empId || '-')}
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
                    {row.employeeName || row.studentName || row.employee_name || row.name || row.empName || '-'}
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
                    {row.accommodationType || row.buildingCategory || row.roomType || row.accommodation_type || '-'}
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
                    {row[currentTabMeta.amountKey] || (row.amount !== undefined ? (typeof row.amount === 'number' ? `₹ ${row.amount.toLocaleString('en-IN')}` : String(row.amount).startsWith('₹') ? row.amount : `₹ ${row.amount}`) : '') || (row.roomRent !== undefined ? `₹ ${row.roomRent}` : '') || row.rentAmount || '₹ 0.00'}
                  </TableCell>
                  {hasNotesColumn && (
                    <TableCell
                      sx={{
                        fontSize: '14px',
                        fontWeight: (row.notes || row.note || row.description) && (row.notes || row.note || row.description) !== '-' ? 600 : 400,
                        color: (row.notes || row.note || row.description) && (row.notes || row.note || row.description) !== '-' ? '#0F172A' : '#1F2937',
                        lineHeight: '20px',
                        px: '16px',
                        py: '18px'
                      }}
                    >
                      {row.notes || row.note || row.description || '-'}
                    </TableCell>
                  )}
                  {isActionTab && (
                    <TableCell align="center" sx={{ px: '16px', py: '14px' }}>
                      <Tooltip title={activeTab === 'maintenance' ? 'Update Maintenance Charge' : 'Update Accommodation Charge'}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (activeTab === 'maintenance') {
                              setSelectedEditRow(row);
                              setEditModalOpen(true);
                            } else {
                              setSelectedAccommodationRow(row);
                              setEditAccommodationModalOpen(true);
                            }
                          }}
                          sx={{
                            color: '#644EE5',
                            bgcolor: '#F5F3FF',
                            borderRadius: '8px',
                            p: '7px',
                            border: '1px solid #DDD6FE',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#EDE9FE',
                              borderColor: '#C4B5FD',
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
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
          Showing {totalCount === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, totalCount)} of {totalCount} entries
        </Typography>

        {/* Controls Container */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'space-between', md: 'flex-end' }
          }}
        >
          {/* Rows per page dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              Rows per page:
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              IconComponent={UnfoldMoreIcon}
              sx={{
                height: '32px',
                borderRadius: '6px !important',
                bgcolor: '#ffffff',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                color: '#1E293B',
                fontWeight: 500,
                '& .MuiSelect-select': {
                  py: '4px',
                  pl: '10px',
                  pr: '28px !important'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0',
                  borderRadius: '6px !important'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#644EE5',
                  borderWidth: '1.5px'
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '16px',
                  color: '#64748B',
                  right: '6px'
                }
              }}
            >
              {[10, 20, 50, 100].map((pageSize) => (
                <MenuItem
                  key={pageSize}
                  value={pageSize}
                  sx={{
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
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
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
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
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={!hasNextPage && page >= totalPages}
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
              disabled={!hasNextPage && page >= totalPages}
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

      {/* 6. Update Maintenance Modal */}
      <UpdateMaintenanceModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEditRow(null);
        }}
        onConfirm={handleUpdateMaintenance}
        initialData={selectedEditRow}
        loading={editLoading}
      />

      {/* 7. Update Accommodation Modal */}
      <UpdateAccommodationModal
        open={editAccommodationModalOpen}
        onClose={() => {
          setEditAccommodationModalOpen(false);
          setSelectedAccommodationRow(null);
        }}
        onConfirm={handleUpdateAccommodation}
        initialData={selectedAccommodationRow}
        loading={editAccommodationLoading}
      />
    </Box>
  );
};

export default ChargeEntry;
