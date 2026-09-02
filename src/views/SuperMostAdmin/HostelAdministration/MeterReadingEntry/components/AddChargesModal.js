import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  OutlinedInput,
  Button,
  FormLabel,
  CircularProgress,
  Grid
} from '@mui/material';
import { toast } from 'react-toastify';
import { getEmployees } from 'services/allEmployeeService';

const DEFAULT_EMPLOYEE = {
  name: 'Dr.Shreya Krishnan',
  location: 'Building 1A · Room 101',
  building: 'Building 1A',
  room: '101',
  employeeId: 'PMCH-2041',
  buildingName: 'Ward 5A',
  buildingNo: 'Building 1A',
  roomNo: '101',
  meterNo: 'MTR-001',
  prevReading: '4,120'
};

const FALLBACK_EMPLOYEES = [
  {
    name: 'Dr.Shreya Krishnan',
    location: 'Building 1A · Room 101',
    building: 'Building 1A',
    room: '101',
    employeeId: 'PMCH-2041',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    meterNo: 'MTR-001',
    prevReading: '4,120'
  },
  {
    name: 'Amit Sharma',
    location: 'Building 1A · Room 101',
    building: 'Building 1A',
    room: '101',
    employeeId: 'PMCH-2041',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    meterNo: 'MTR-001',
    prevReading: '4,120'
  },
  {
    name: 'Rohan Verma',
    location: 'Building 2B · Room 102',
    building: 'Building 2B',
    room: '102',
    employeeId: 'PMCH-2042',
    buildingName: 'Ward 3B',
    buildingNo: 'Building 2B',
    roomNo: '102',
    meterNo: 'MTR-002',
    prevReading: '3,850'
  },
  {
    name: 'Priya Patel',
    location: 'Building 1B · Room 103',
    building: 'Building 1B',
    room: '103',
    employeeId: 'PMCH-2043',
    buildingName: 'Ward 4A',
    buildingNo: 'Building 1B',
    roomNo: '103',
    meterNo: 'MTR-003',
    prevReading: '2,400'
  },
  {
    name: 'Deepak Kumar',
    location: 'Building 3A · Room 104',
    building: 'Building 3A',
    room: '104',
    employeeId: 'PMCH-2044',
    buildingName: 'Ward 2C',
    buildingNo: 'Building 3A',
    roomNo: '104',
    meterNo: 'MTR-004',
    prevReading: '1,980'
  }
];

const AddChargesModal = ({ open, onClose, onConfirm, loading = false, defaultTab = 'metered' }) => {
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(DEFAULT_EMPLOYEE);

  // Metered specific fields
  const [meterNo, setMeterNo] = useState('MTR-001');
  const [prevReading, setPrevReading] = useState('4,120');
  const [currentReading, setCurrentReading] = useState('4,304');

  // Fixed specific fields
  const [fixedAmount, setFixedAmount] = useState('₹ 750');

  // Validation Error
  const [readingError, setReadingError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSearchEmployeeQuery('');
      setSelectedEmployee(DEFAULT_EMPLOYEE);
      setMeterNo('MTR-001');
      setPrevReading('4,120');
      setCurrentReading('4,304');
      setFixedAmount('₹ 750');
      setReadingError('');
    }
  }, [open, defaultTab]);

  // Handle Fixed Amount Change
  const handleFixedAmountChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (!rawVal) {
      setFixedAmount('₹ ');
      return;
    }
    const formatted = Number(rawVal).toLocaleString('en-IN');
    setFixedAmount(`₹ ${formatted}`);
  };

  // Handle Employee Search
  const handleSearch = async (e) => {
    e?.preventDefault();
    const query = searchEmployeeQuery.trim();
    if (!query) {
      toast.info('Please enter an employee name or ID');
      return;
    }

    setIsSearching(true);
    try {
      const apiRes = await getEmployees({ search: query, limit: 5 });
      if (apiRes && apiRes.items && apiRes.items.length > 0) {
        const found = apiRes.items[0];
        const empObj = {
          name: found.name || query,
          location: `${found.department || 'Building 1A'} · Room 101`,
          building: found.department || 'Building 1A',
          room: '101',
          employeeId: found.empId || 'PMCH-2041',
          buildingName: 'Ward 5A',
          buildingNo: 'Building 1A',
          roomNo: '101',
          meterNo: `MTR-${Math.floor(100 + Math.random() * 900)}`,
          prevReading: '4,120'
        };
        setSelectedEmployee(empObj);
        setMeterNo(empObj.meterNo);
        setPrevReading(empObj.prevReading);
        toast.success(`Selected employee: ${empObj.name}`);
        return;
      }

      const localFound = FALLBACK_EMPLOYEES.find(
        (emp) =>
          emp.name.toLowerCase().includes(query.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(query.toLowerCase())
      );

      if (localFound) {
        setSelectedEmployee(localFound);
        setMeterNo(localFound.meterNo);
        setPrevReading(localFound.prevReading);
        toast.success(`Selected employee: ${localFound.name}`);
      } else {
        const newEmp = {
          name: query,
          location: 'Building 1A · Room 101',
          building: 'Building 1A',
          room: '101',
          employeeId: `PMCH-${Math.floor(1000 + Math.random() * 9000)}`,
          buildingName: 'Ward 5A',
          buildingNo: 'Building 1A',
          roomNo: '101',
          meterNo: `MTR-${Math.floor(100 + Math.random() * 900)}`,
          prevReading: '4,120'
        };
        setSelectedEmployee(newEmp);
        setMeterNo(newEmp.meterNo);
        setPrevReading(newEmp.prevReading);
        toast.info(`Set employee to: ${query}`);
      }
    } catch (err) {
      console.warn('Employee search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    setReadingError('');
    const p = Number(String(prevReading).replace(/[^0-9.]/g, '')) || 0;
    const c = Number(String(currentReading).replace(/[^0-9.]/g, '')) || 0;

    if (defaultTab === 'metered') {
      if (!currentReading || isNaN(c)) {
        setReadingError('Please enter a valid current reading');
        return;
      }
      if (c < p) {
        setReadingError('Current reading cannot be lower than previous reading');
        return;
      }
    }

    const units = Math.max(0, c - p);
    const rate = 11.6;
    const calculatedTotal = Math.round(units * rate);

    if (onConfirm) {
      onConfirm({
        type: defaultTab,
        buildingName: defaultTab === 'fixed' ? 'Room 101' : (selectedEmployee.buildingName || 'Ward 5A'),
        buildingNo: selectedEmployee.buildingNo || 'Building 1A',
        roomNo: defaultTab === 'fixed' ? (selectedEmployee.building || 'Main Block') : String(selectedEmployee.roomNo || '101'),
        employeeName: selectedEmployee.name,
        employeeId: selectedEmployee.employeeId,
        meterNo: meterNo.trim() || 'MTR-001',
        prevReading: p.toLocaleString('en-IN'),
        currentReading: c.toLocaleString('en-IN'),
        unitsConsumed: String(units),
        ratePerUnit: rate,
        charge: defaultTab === 'fixed' ? String(fixedAmount).replace(/[^0-9.]/g, '') || '750' : calculatedTotal.toLocaleString('en-IN')
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* 1. Search Employee Input & Search Button */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%'
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
                color: '#0F172A',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0',
                  borderRadius: '8px !important'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#644EE5',
                  borderWidth: '1.5px'
                },
                '& input::placeholder': {
                  color: '#94A3B8',
                  fontSize: '14px'
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || isSearching}
              sx={{
                height: '40px',
                px: '22px',
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
                lineHeight: '120%'
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
                mt: '4px'
              }}
            >
              {selectedEmployee?.location || 'Building 1A · Room 101'}
            </Typography>
          </Box>

          {defaultTab === 'metered' ? (
            <>
              {/* 3. Meter Number Field */}
              <Box>
                <FormLabel
                  sx={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif',
                    mb: '8px'
                  }}
                >
                  Meter Number
                </FormLabel>
                <OutlinedInput
                  fullWidth
                  value={meterNo}
                  onChange={(e) => setMeterNo(e.target.value)}
                  placeholder="MTR-001"
                  sx={{
                    borderRadius: '8px !important',
                    height: '42px',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#0F172A',
                    bgcolor: '#ffffff',
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
              </Box>

              {/* 4. Previous Reading & Current Reading Fields */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormLabel
                    sx={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                      fontFamily: 'Inter, sans-serif',
                      mb: '8px'
                    }}
                  >
                    Previous Reading
                  </FormLabel>
                  <OutlinedInput
                    fullWidth
                    disabled
                    value={prevReading}
                    sx={{
                      borderRadius: '8px !important',
                      height: '42px',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      color: '#0F172A',
                      bgcolor: '#F8FAFC',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E2E8F0',
                        borderRadius: '8px !important'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormLabel
                    sx={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0F172A',
                      fontFamily: 'Inter, sans-serif',
                      mb: '8px'
                    }}
                  >
                    Current Reading
                  </FormLabel>
                  <OutlinedInput
                    fullWidth
                    value={currentReading}
                    onChange={(e) => {
                      setCurrentReading(e.target.value);
                      setReadingError('');
                    }}
                    placeholder="4,304"
                    error={Boolean(readingError)}
                    sx={{
                      borderRadius: '8px !important',
                      height: '42px',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      color: '#0F172A',
                      bgcolor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: readingError ? '#EF4444' : '#E2E8F0',
                        borderRadius: '8px !important'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#644EE5',
                        borderWidth: '1.5px'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            /* Fixed Building Specific Fields */
            <Box>
              <FormLabel
                sx={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif',
                  mb: '8px'
                }}
              >
                Fixed Charges
              </FormLabel>
              <OutlinedInput
                fullWidth
                value={fixedAmount}
                onChange={handleFixedAmountChange}
                placeholder="₹ 750"
                sx={{
                  borderRadius: '8px !important',
                  height: '42px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#0F172A',
                  bgcolor: '#F8FAFC',
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
            </Box>
          )}

          {readingError && (
            <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '13px', mt: -1 }}>
              {readingError}
            </Typography>
          )}

          {/* 5. Bottom Action Buttons: Cancel & Confirm */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', mt: 1 }}>
            <Button
              onClick={onClose}
              disabled={loading}
              variant="outlined"
              sx={{
                height: '40px',
                px: '24px',
                borderRadius: '8px',
                borderColor: '#E2E8F0',
                color: '#334155',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#CBD5E1',
                  boxShadow: 'none'
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
                height: '40px',
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
              {loading ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : 'Confirm'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddChargesModal;
