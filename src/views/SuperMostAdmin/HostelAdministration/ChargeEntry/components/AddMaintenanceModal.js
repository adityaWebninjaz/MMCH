import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  OutlinedInput,
  InputAdornment,
  Button,
  FormLabel,
  TextField,
  CircularProgress
} from '@mui/material';
import { PersonSearch as PersonSearchIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { searchHostelResidents } from '../../Services/chargeEntryService';

const AddMaintenanceModal = ({ open, onClose, onConfirm, loading = false }) => {
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [amount, setAmount] = useState('₹ 0');
  const [notes, setNotes] = useState('');
  const [amountError, setAmountError] = useState('');

  const isSelectingRef = useRef(false);

  // Reset form when modal opens: starts with search only (selectedEmployee = null)
  useEffect(() => {
    if (open) {
      isSelectingRef.current = false;
      setSearchEmployeeQuery('');
      setSelectedEmployee(null);
      setSearchResults([]);
      setShowDropdown(false);
      setSearchPerformed(false);
      setAmount('₹ 0');
      setNotes('');
      setAmountError('');
    }
  }, [open]);

  // Live search as user types with debouncing
  useEffect(() => {
    const query = searchEmployeeQuery.trim();
    if (!query) {
      setSearchResults([]);
      setShowDropdown(false);
      setSearchPerformed(false);
      return;
    }

    // Skip automated re-search when selecting a resident
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const apiRes = await searchHostelResidents(query);
        const results = apiRes?.data || apiRes?.items || [];
        setSearchResults(results);
        setShowDropdown(true);
        setSearchPerformed(true);
      } catch (err) {
        console.warn('Live search error:', err);
        setSearchResults([]);
        setShowDropdown(true);
        setSearchPerformed(true);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchEmployeeQuery]);

  // Format currency on amount input change
  const handleAmountChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setAmountError('');
    if (!rawVal) {
      setAmount('₹ ');
      return;
    }
    const formatted = Number(rawVal).toLocaleString('en-IN');
    setAmount(`₹ ${formatted}`);
  };

  // Handler when user selects a resident from dropdown
  const handleSelectResident = (resident) => {
    isSelectingRef.current = true;
    setShowDropdown(false);
    setSearchResults([]);
    setSearchPerformed(false);

    const studentName = resident.studentName || resident.employeeName || resident.name || '';
    const studentId = resident.studentId || "33201e53-a5a4-4ee5-bb4f-8aadbab51af5";
    const roomId = resident.roomId || "1b73ac24-daaa-4847-848c-0dfec0c7e31e";
    const roomNo = resident.roomNo || (resident.roomNumber ? `Room ${resident.roomNumber}` : 'Room 708');
    const bName = resident.buildingName ? `Building ${resident.buildingName}` : resident.buildingCategory || 'Staff Quarters';

    setSelectedEmployee({
      name: studentName,
      studentId,
      roomId,
      location: `${bName} - ${roomNo}`,
      employeeId: resident.UID || resident.employeeId || (studentId ? `PMCH-${studentId.slice(0, 5).toUpperCase()}` : 'PMCH-33201'),
      roomNo,
      accommodationType: resident.accommodationType || resident.buildingCategory || resident.roomType || 'Double'
    });
    setSearchEmployeeQuery(studentName);
    toast.success(`Selected resident: ${studentName}`);
  };

  // Explicit search on Enter or button click
  const handleSearch = async (e) => {
    e?.preventDefault();
    const query = searchEmployeeQuery.trim();
    if (!query) {
      toast.info('Please enter an employee name or ID to search');
      return;
    }

    isSelectingRef.current = false;
    setIsSearching(true);
    try {
      const apiRes = await searchHostelResidents(query);
      const results = apiRes?.data || apiRes?.items || [];
      setSearchResults(results);
      setShowDropdown(true);
      setSearchPerformed(true);
      if (results.length > 0) {
        handleSelectResident(results[0]);
      }
    } catch (err) {
      console.warn('Resident search error:', err);
      setSearchResults([]);
      setShowDropdown(true);
      setSearchPerformed(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedEmployee) {
      toast.error('Please search and select an employee/resident first');
      return;
    }

    const rawNumber = amount.replace(/[^0-9]/g, '');
    if (!rawNumber || Number(rawNumber) <= 0) {
      setAmountError('Please enter a valid amount');
      return;
    }

    const numAmount = Number(rawNumber);
    const formattedAmount = numAmount.toLocaleString('en-IN');

    if (onConfirm) {
      onConfirm({
        studentId: selectedEmployee.studentId || "33201e53-a5a4-4ee5-bb4f-8aadbab51af5",
        roomId: selectedEmployee.roomId || "1b73ac24-daaa-4847-848c-0dfec0c7e31e",
        amount: numAmount,
        notes: notes.trim() || 'Maintenance charge for room',
        employeeName: selectedEmployee.name,
        employeeId: selectedEmployee.employeeId,
        roomNo: selectedEmployee.roomNo || 'Room 708',
        accommodationType: selectedEmployee.accommodationType || 'Double',
        maintenanceAmount: formattedAmount,
        type: 'maintenance'
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: '92%', sm: '540px' },
          maxWidth: '540px',
          minHeight: { xs: '440px', sm: '460px' },
          borderRadius: '16px',
          p: { xs: '24px', sm: '32px' },
          boxSizing: 'border-box',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
          m: 'auto',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.25s ease-in-out'
        }
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'visible', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '22px', flex: 1 }}>
          {/* Header Title */}
          <Box>
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#0F172A',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Add Maintenance
            </Typography>
            <Typography
              sx={{
                fontSize: '13px',
                color: '#64748B',
                fontFamily: 'Inter, sans-serif',
                mt: 0.5
              }}
            >
              Search for a resident/employee to apply maintenance charges.
            </Typography>
          </Box>

          {/* 1. Search Section with Loader inside OutlinedInput endAdornment */}
          <Box sx={{ width: '100%' }}>
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                height: '40px'
              }}
            >
              <OutlinedInput
                fullWidth
                value={searchEmployeeQuery}
                onChange={(e) => {
                  isSelectingRef.current = false;
                  setSearchEmployeeQuery(e.target.value);
                  setSearchPerformed(false);
                }}
                onFocus={() => {
                  if (!selectedEmployee && (searchResults.length > 0 || (searchPerformed && searchEmployeeQuery.trim()))) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="Search Employee"
                disabled={loading}
                endAdornment={
                  isSearching ? (
                    <InputAdornment position="end">
                      <CircularProgress size={18} sx={{ color: '#644EE5' }} />
                    </InputAdornment>
                  ) : null
                }
                sx={{
                  height: '40px',
                  borderRadius: '8px !important',
                  bgcolor: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#1E293B',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E2E8F0',
                    borderRadius: '8px !important'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#94A3B8'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#644EE5',
                    borderWidth: '1.5px'
                  }
                }}
              />

              {/* Search Button (Stays completely still with constant normal color) */}
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  height: '40px',
                  minWidth: '85px',
                  px: '20px',
                  bgcolor: '#644EE5',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'none',
                  boxShadow: 'none',
                  flexShrink: 0,
                  '&:hover': {
                    bgcolor: '#523BCB',
                    boxShadow: 'none'
                  }
                }}
              >
                Search
              </Button>
            </Box>

            {/* Dropdown In-Flow: Expands the dialog box smoothly */}
            {showDropdown && searchEmployeeQuery.trim().length > 0 && (
              <Box
                sx={{
                  mt: 1.5,
                  width: '100%',
                  bgcolor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  boxSizing: 'border-box',
                  '&::-webkit-scrollbar': {
                    width: '6px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#CBD5E1',
                    borderRadius: '4px'
                  }
                }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((resident, idx) => {
                    const resName = resident.studentName || resident.employeeName || resident.name || 'Resident';
                    const resRoom = resident.roomNo || (resident.roomNumber ? `Room ${resident.roomNumber}` : 'Room 708');
                    const resType = resident.accommodationType || resident.buildingCategory || resident.roomType || '';

                    return (
                      <Box
                        key={resident.id || idx}
                        onClick={() => handleSelectResident(resident)}
                        sx={{
                          p: '10px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          borderBottom: idx < searchResults.length - 1 ? '1px solid #F1F5F9' : 'none',
                          transition: 'background-color 0.15s ease',
                          '&:hover': {
                            bgcolor: '#F8FAFC'
                          }
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#1E293B'
                          }}
                        >
                          {resName}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            color: '#64748B'
                          }}
                        >
                          {[resRoom, resType].filter(Boolean).join(' • ')}
                        </Typography>
                      </Box>
                    );
                  })
                ) : !isSearching ? (
                  <Box sx={{ p: '14px', textAlign: 'center' }}>
                    <Typography
                      sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        color: '#64748B'
                      }}
                    >
                      Not found
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            )}
          </Box>

          {/* Empty Space Search Graphic / Illustration */}
          {!selectedEmployee && !showDropdown && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 3,
                textAlign: 'center',
                userSelect: 'none'
              }}
            >
              <Box
                sx={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  bgcolor: '#F5F3FF',
                  border: '1.5px solid #EDE9FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 4px 16px rgba(100, 78, 229, 0.08)'
                }}
              >
                <PersonSearchIcon sx={{ fontSize: 38, color: '#644EE5' }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#64748B'
                }}
              >
                Search Resident or Employee
              </Typography>
            </Box>
          )}

          {/* 2. When data is selected, show whole form data */}
          {selectedEmployee && (
            <>
              {/* Selected Employee Details Summary Card */}
              <Box
                sx={{
                  p: '16px',
                  bgcolor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <Typography
                  sx={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {selectedEmployee.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {selectedEmployee.location} • {selectedEmployee.employeeId}
                </Typography>
              </Box>

              {/* Maintenance Amount Field */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <FormLabel
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Maintenance Amount *
                </FormLabel>
                <OutlinedInput
                  fullWidth
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="₹ 0"
                  error={!!amountError}
                  disabled={loading}
                  sx={{
                    height: '48px',
                    borderRadius: '8px !important',
                    bgcolor: '#ffffff',
                    fontSize: '15px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    color: '#0F172A',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: amountError ? '#EF4444' : '#E2E8F0',
                      borderRadius: '8px !important'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: amountError ? '#EF4444' : '#94A3B8'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: amountError ? '#EF4444' : '#644EE5',
                      borderWidth: '1.5px'
                    }
                  }}
                />
                {amountError && (
                  <Typography sx={{ color: '#EF4444', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                    {amountError}
                  </Typography>
                )}
              </Box>

              {/* Notes Field */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <FormLabel
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Notes
                </FormLabel>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Maintenance charge for room"
                  disabled={loading}
                  sx={{
                    bgcolor: '#ffffff',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px !important',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      color: '#0F172A',
                      '& fieldset': {
                        borderColor: '#E2E8F0'
                      },
                      '&:hover fieldset': {
                        borderColor: '#94A3B8'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#644EE5',
                        borderWidth: '1.5px'
                      }
                    }
                  }}
                />
              </Box>

              {/* Modal Action Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  pt: '8px'
                }}
              >
                <Button
                  variant="outlined"
                  onClick={onClose}
                  disabled={loading}
                  sx={{
                    height: '44px',
                    px: '24px',
                    borderColor: '#E2E8F0',
                    color: '#475569',
                    borderRadius: '8px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#CBD5E1',
                      bgcolor: '#F8FAFC'
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleConfirm}
                  disabled={loading}
                  sx={{
                    height: '44px',
                    px: '28px',
                    bgcolor: '#644EE5',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#523BCB',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Add Maintenance'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaintenanceModal;
