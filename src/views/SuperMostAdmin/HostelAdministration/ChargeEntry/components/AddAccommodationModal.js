import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  OutlinedInput,
  Button,
  FormLabel,
  TextField,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getEmployees } from 'services/allEmployeeService';

const DEFAULT_EMPLOYEE = {
  name: 'Dr.Shreya Krishnan',
  location: 'Building 1A - Room 101',
  employeeId: 'PMCH-2041',
  roomNo: 'Room 101',
  accommodationType: '1BHK'
};

const FALLBACK_EMPLOYEES = [
  { name: 'Dr.Shreya Krishnan', location: 'Building 1A - Room 101', employeeId: 'PMCH-2041', roomNo: 'Room 101', accommodationType: '1BHK' },
  { name: 'Amit Sharma', location: 'Building 1A - Room 101', employeeId: 'PMCH-2041', roomNo: 'Room 101', accommodationType: '1BHK' },
  { name: 'Dr. Rohan Verma', location: 'Building 2B - Room 204', employeeId: 'PMCH-2042', roomNo: 'Room 204', accommodationType: '2BHK' },
  { name: 'Priya Patel', location: 'Building 1B - Room 103', employeeId: 'PMCH-2043', roomNo: 'Room 103', accommodationType: '1BHK' },
  { name: 'Deepak Kumar', location: 'Building 3A - Room 104', employeeId: 'PMCH-2044', roomNo: 'Room 104', accommodationType: 'Single Room' }
];

const DURATION_OPTIONS = ['1 Month', '3 Months', '6 Months', '12 Months', '24 Months'];

const AddAccommodationModal = ({ open, onClose, onConfirm, loading = false }) => {
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(DEFAULT_EMPLOYEE);
  const [amount, setAmount] = useState('₹ 4,304');
  const [duration, setDuration] = useState('12 Months');
  const [notes, setNotes] = useState('');
  const [amountError, setAmountError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSearchEmployeeQuery('');
      setSelectedEmployee(DEFAULT_EMPLOYEE);
      setAmount('₹ 4,304');
      setDuration('12 Months');
      setNotes('');
      setAmountError('');
    }
  }, [open]);

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

  // Search employee by name or ID
  const handleSearch = async (e) => {
    e?.preventDefault();
    const query = searchEmployeeQuery.trim();
    if (!query) {
      toast.info('Please enter an employee name or ID to search');
      return;
    }

    setIsSearching(true);
    try {
      // 1. Try API search
      const apiRes = await getEmployees({ search: query, limit: 5 });
      if (apiRes && apiRes.items && apiRes.items.length > 0) {
        const found = apiRes.items[0];
        setSelectedEmployee({
          name: found.name || query,
          location: found.department ? `${found.department} - Room 101` : 'Building 1A - Room 101',
          employeeId: found.empId || 'PMCH-2041',
          roomNo: 'Room 101',
          accommodationType: '1BHK'
        });
        toast.success(`Selected employee: ${found.name}`);
        return;
      }

      // 2. Fallback search
      const localFound = FALLBACK_EMPLOYEES.find(
        (emp) =>
          emp.name.toLowerCase().includes(query.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(query.toLowerCase())
      );

      if (localFound) {
        setSelectedEmployee(localFound);
        toast.success(`Selected employee: ${localFound.name}`);
      } else {
        setSelectedEmployee({
          name: query,
          location: 'Building 1A - Room 101',
          employeeId: `PMCH-${Math.floor(1000 + Math.random() * 9000)}`,
          roomNo: 'Room 101',
          accommodationType: '1BHK'
        });
        toast.info(`Set employee to: ${query}`);
      }
    } catch (err) {
      console.warn('Employee search error:', err);
      setSelectedEmployee({
        name: query,
        location: 'Building 1A - Room 101',
        employeeId: 'PMCH-2041',
        roomNo: 'Room 101',
        accommodationType: '1BHK'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    const rawNumber = amount.replace(/[^0-9]/g, '');
    if (!rawNumber || Number(rawNumber) <= 0) {
      setAmountError('Please enter a valid amount');
      return;
    }

    const formattedAmount = Number(rawNumber).toLocaleString('en-IN');

    if (onConfirm) {
      onConfirm({
        employeeName: selectedEmployee.name,
        employeeId: selectedEmployee.employeeId,
        roomNo: selectedEmployee.roomNo || 'Room 101',
        accommodationType: selectedEmployee.accommodationType || '1BHK',
        accommodationCharges: formattedAmount,
        duration: duration,
        notes: notes.trim() || '-',
        type: 'accommodation'
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
          width: { xs: '92%', sm: '520px' },
          maxWidth: '520px',
          borderRadius: '16px',
          p: { xs: '24px', sm: '32px' },
          boxSizing: 'border-box',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
          m: 'auto'
        }
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'visible' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. Search Bar */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              height: '40px'
            }}
          >
            <OutlinedInput
              fullWidth
              value={searchEmployeeQuery}
              onChange={(e) => setSearchEmployeeQuery(e.target.value)}
              placeholder="Search Employee"
              disabled={loading || isSearching}
              sx={{
                height: '40px',
                borderRadius: '8px !important',
                bgcolor: '#ffffff',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                color: '#64748B',
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
            <Button
              type="submit"
              variant="contained"
              disabled={loading || isSearching}
              sx={{
                height: '40px',
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
              {isSearching ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : 'Search'}
            </Button>
          </Box>

          {/* 2. Selected Employee Details */}
          <Box sx={{ mt: 0.5 }}>
            <Typography
              sx={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#0F172A',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '100%'
              }}
            >
              {selectedEmployee?.name || 'Dr.Shreya Krishnan'}
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#64748B',
                fontFamily: 'Inter, sans-serif',
                mt: 1,
                lineHeight: '100%'
              }}
            >
              {selectedEmployee?.location || 'Building 1A - Room 101'}
            </Typography>
          </Box>

          {/* 3. Amount & Duration Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* Amount Field */}
            <Box>
              <FormLabel
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif',
                  mb: 1,
                  lineHeight: '100%'
                }}
              >
                Amount
              </FormLabel>
              <OutlinedInput
                fullWidth
                value={amount}
                onChange={handleAmountChange}
                error={Boolean(amountError)}
                placeholder="₹ 4,304"
                sx={{
                  height: '40px',
                  borderRadius: '8px !important',
                  bgcolor: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 400,
                  fontFamily: 'Inter, sans-serif',
                  color: '#0F172A',
                  lineHeight: '100%',
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
                <Typography variant="caption" sx={{ color: '#EF4444', mt: 0.5, display: 'block', fontSize: '12px' }}>
                  {amountError}
                </Typography>
              )}
            </Box>

            {/* Duration Dropdown */}
            <Box>
              <FormLabel
                sx={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif',
                  mb: 1,
                  lineHeight: '100%'
                }}
              >
                Duration
              </FormLabel>
              <Select
                fullWidth
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                IconComponent={KeyboardArrowDownIcon}
                sx={{
                  height: '40px',
                  borderRadius: '8px',
                  bgcolor: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 400,
                  fontFamily: 'Inter, sans-serif',
                  color: '#0F172A',
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
                  },
                  '& .MuiSelect-select': {
                    py: '9px',
                    px: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#0F172A'
                  },
                  '& .MuiSelect-icon': {
                    color: '#0F172A',
                    fontSize: '20px',
                    right: '10px'
                  }
                }}
              >
                {DURATION_OPTIONS.map((opt) => (
                  <MenuItem
                    key={opt}
                    value={opt}
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      color: '#0F172A'
                    }}
                  >
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          {/* 4. Notes Field */}
          <Box>
            <FormLabel
              sx={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#0F172A',
                fontFamily: 'Inter, sans-serif',
                mb: 1
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
              placeholder="provide description about charge"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  p: '10px 14px',
                  color: '#0F172A',
                  '& fieldset': {
                    borderColor: '#E2E8F0',
                    borderRadius: '8px'
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

          {/* 5. Bottom Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 1.5,
              mt: 1
            }}
          >
            <Button
              onClick={onClose}
              disabled={loading}
              variant="outlined"
              sx={{
                height: '38px',
                px: '20px',
                borderRadius: '8px',
                borderColor: '#E2E8F0',
                color: '#475569',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#CBD5E1'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              variant="contained"
              sx={{
                height: '38px',
                px: '24px',
                borderRadius: '8px',
                bgcolor: '#644EE5',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#523BCB',
                  boxShadow: 'none'
                }
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Confirm'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccommodationModal;
