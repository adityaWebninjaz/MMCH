import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  OutlinedInput,
  Button,
  FormLabel,
  TextField,
  CircularProgress,
  Grid,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { toast } from 'react-toastify';
import { getEmployees } from 'services/allEmployeeService';

const DEFAULT_EMPLOYEE = {
  name: 'Amit Sharma',
  location: 'Ward 5A - Building 1A - Room 101',
  employeeId: 'PMCH-2041',
  buildingName: 'Ward 5A',
  buildingNo: 'Building 1A',
  roomNo: '101',
  meterNo: 'MTR-001',
  prevReading: '4120'
};

const FALLBACK_EMPLOYEES = [
  { name: 'Amit Sharma', location: 'Ward 5A - Building 1A - Room 101', employeeId: 'PMCH-2041', buildingName: 'Ward 5A', buildingNo: 'Building 1A', roomNo: '101', meterNo: 'MTR-001', prevReading: '4120' },
  { name: 'Dr.Shreya Krishnan', location: 'Ward 5A - Building 1A - Room 101', employeeId: 'PMCH-2041', buildingName: 'Ward 5A', buildingNo: 'Building 1A', roomNo: '101', meterNo: 'MTR-001', prevReading: '4120' },
  { name: 'Rohan Verma', location: 'Ward 3B - Building 2B - Room 102', employeeId: 'PMCH-2042', buildingName: 'Ward 3B', buildingNo: 'Building 2B', roomNo: '102', meterNo: 'MTR-002', prevReading: '3850' },
  { name: 'Priya Patel', location: 'Ward 4A - Building 1B - Room 103', employeeId: 'PMCH-2043', buildingName: 'Ward 4A', buildingNo: 'Building 1B', roomNo: '103', meterNo: 'MTR-003', prevReading: '2400' },
  { name: 'Deepak Kumar', location: 'Ward 2C - Building 3A - Room 104', employeeId: 'PMCH-2044', buildingName: 'Ward 2C', buildingNo: 'Building 3A', roomNo: '104', meterNo: 'MTR-004', prevReading: '1980' }
];

const ROOM_OPTIONS = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '201', '202', '301', '302'];

const AddChargesModal = ({ open, onClose, onConfirm, loading = false, defaultTab = 'metered' }) => {
  const [chargeType, setChargeType] = useState(defaultTab);
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(DEFAULT_EMPLOYEE);

  // Form Fields
  const [buildingName, setBuildingName] = useState('Ward 5A');
  const [buildingNo, setBuildingNo] = useState('Building 1A');
  const [roomNo, setRoomNo] = useState('101');
  const [meterNo, setMeterNo] = useState('MTR-001');
  const [prevReading, setPrevReading] = useState('4,120');
  const [currentReading, setCurrentReading] = useState('4,350');
  const [ratePerUnit, setRatePerUnit] = useState('11.60');
  const [fixedAmount, setFixedAmount] = useState('₹ 750');
  const [notes, setNotes] = useState('');

  // Error States
  const [readingError, setReadingError] = useState('');

  useEffect(() => {
    if (open) {
      setChargeType(defaultTab);
      setSearchEmployeeQuery('');
      setSelectedEmployee(DEFAULT_EMPLOYEE);
      setBuildingName('Ward 5A');
      setBuildingNo('Building 1A');
      setRoomNo('101');
      setMeterNo('MTR-001');
      setPrevReading('4,120');
      setCurrentReading('4,350');
      setRatePerUnit('11.60');
      setFixedAmount('₹ 750');
      setNotes('');
      setReadingError('');
    }
  }, [open, defaultTab]);

  // Live calculation of units consumed and charge
  const { unitsConsumed, calculatedCharge } = useMemo(() => {
    const p = Number(String(prevReading).replace(/[^0-9.]/g, '')) || 0;
    const c = Number(String(currentReading).replace(/[^0-9.]/g, '')) || 0;
    const rate = Number(ratePerUnit) || 11.6;

    if (c < p) {
      return { unitsConsumed: 0, calculatedCharge: 0 };
    }

    const units = Math.max(0, c - p);
    const total = Math.round(units * rate);
    return {
      unitsConsumed: units,
      calculatedCharge: total
    };
  }, [prevReading, currentReading, ratePerUnit]);

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
          location: `${found.department || 'Ward 5A'} - Room 101`,
          employeeId: found.empId || 'PMCH-2041',
          buildingName: 'Ward 5A',
          buildingNo: 'Building 1A',
          roomNo: '101',
          meterNo: `MTR-${Math.floor(100 + Math.random() * 900)}`,
          prevReading: '4120'
        };
        setSelectedEmployee(empObj);
        setBuildingName(empObj.buildingName);
        setBuildingNo(empObj.buildingNo);
        setRoomNo(empObj.roomNo);
        setMeterNo(empObj.meterNo);
        setPrevReading('4,120');
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
        setBuildingName(localFound.buildingName);
        setBuildingNo(localFound.buildingNo);
        setRoomNo(localFound.roomNo);
        setMeterNo(localFound.meterNo);
        setPrevReading(Number(localFound.prevReading).toLocaleString('en-IN'));
        toast.success(`Selected employee: ${localFound.name}`);
      } else {
        const newEmp = {
          name: query,
          location: 'Ward 5A - Building 1A - Room 101',
          employeeId: `PMCH-${Math.floor(1000 + Math.random() * 9000)}`,
          buildingName: 'Ward 5A',
          buildingNo: 'Building 1A',
          roomNo: '101',
          meterNo: `MTR-${Math.floor(100 + Math.random() * 900)}`,
          prevReading: '4120'
        };
        setSelectedEmployee(newEmp);
        setBuildingName(newEmp.buildingName);
        setBuildingNo(newEmp.buildingNo);
        setRoomNo(newEmp.roomNo);
        setMeterNo(newEmp.meterNo);
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

    if (chargeType === 'metered') {
      if (!currentReading || isNaN(c)) {
        setReadingError('Please enter a valid current reading');
        return;
      }
      if (c < p) {
        setReadingError('Current reading cannot be lower than previous reading');
        return;
      }
    }

    if (onConfirm) {
      onConfirm({
        type: chargeType,
        buildingName: buildingName.trim() || 'Ward 5A',
        buildingNo: buildingNo.trim() || 'Building 1A',
        roomNo: String(roomNo),
        employeeName: selectedEmployee.name,
        employeeId: selectedEmployee.employeeId,
        meterNo: meterNo.trim() || 'MTR-001',
        prevReading: p.toLocaleString('en-IN'),
        currentReading: c.toLocaleString('en-IN'),
        unitsConsumed: String(unitsConsumed),
        ratePerUnit: Number(ratePerUnit) || 11.6,
        charge: chargeType === 'fixed' ? '750' : calculatedCharge.toLocaleString('en-IN'),
        ratePlan: 'Fixed Flat Rate',
        monthlyRate: '750',
        notes: notes.trim() || '-'
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
          width: { xs: '92%', sm: '560px' },
          maxWidth: '560px',
          borderRadius: '16px',
          p: { xs: '20px', sm: '28px' },
          boxSizing: 'border-box',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
          m: 'auto'
        }
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'visible' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Title & Segmented Type Switcher */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#0F172A',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '120%'
              }}
            >
              Add Electricity Charges
            </Typography>

            {/* Type selector pill */}
            <Box
              sx={{
                display: 'inline-flex',
                bgcolor: '#F1F5F9',
                borderRadius: '8px',
                p: '3px',
                gap: '2px'
              }}
            >
              <Button
                size="small"
                onClick={() => setChargeType('metered')}
                sx={{
                  bgcolor: chargeType === 'metered' ? '#644EE5' : 'transparent',
                  color: chargeType === 'metered' ? '#FFFFFF' : '#475569',
                  borderRadius: '6px',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: chargeType === 'metered' ? '#523BCB' : '#E2E8F0'
                  }
                }}
              >
                Metered
              </Button>
              <Button
                size="small"
                onClick={() => setChargeType('fixed')}
                sx={{
                  bgcolor: chargeType === 'fixed' ? '#644EE5' : 'transparent',
                  color: chargeType === 'fixed' ? '#FFFFFF' : '#475569',
                  borderRadius: '6px',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: chargeType === 'fixed' ? '#523BCB' : '#E2E8F0'
                  }
                }}
              >
                Fixed Building
              </Button>
            </Box>
          </Box>

          {/* 1. Search Employee Bar */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%'
            }}
          >
            <OutlinedInput
              fullWidth
              value={searchEmployeeQuery}
              onChange={(e) => setSearchEmployeeQuery(e.target.value)}
              placeholder="Search Employee by Name / ID"
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
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || isSearching}
              sx={{
                height: '40px',
                px: '18px',
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

          {/* 2. Selected Employee Details Card */}
          <Box
            sx={{
              bgcolor: '#F8FAFC',
              p: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
                {selectedEmployee?.name || 'Amit Sharma'}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#64748B', fontFamily: 'Inter, sans-serif', mt: 0.5 }}>
                {selectedEmployee?.employeeId} • {buildingName} - {buildingNo}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Room</Typography>
              <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#644EE5' }}>{roomNo}</Typography>
            </Box>
          </Box>

          {/* 3. Location & Room Fields */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormLabel sx={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', mb: 0.8 }}>
                Building Name
              </FormLabel>
              <OutlinedInput
                fullWidth
                size="small"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                sx={{
                  borderRadius: '8px !important',
                  height: '38px',
                  fontSize: '13px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormLabel sx={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', mb: 0.8 }}>
                Building No.
              </FormLabel>
              <OutlinedInput
                fullWidth
                size="small"
                value={buildingNo}
                onChange={(e) => setBuildingNo(e.target.value)}
                sx={{
                  borderRadius: '8px !important',
                  height: '38px',
                  fontSize: '13px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormLabel sx={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', mb: 0.8 }}>
                Room No.
              </FormLabel>
              <Select
                fullWidth
                size="small"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                sx={{
                  borderRadius: '8px !important',
                  height: '38px',
                  fontSize: '13px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }
                }}
              >
                {ROOM_OPTIONS.map((r) => (
                  <MenuItem key={r} value={r} sx={{ fontSize: '13px' }}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>

          {/* 4. Meter / Reading Fields */}
          {chargeType === 'metered' ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormLabel sx={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', mb: 0.8 }}>
                  Meter No.
                </FormLabel>
                <OutlinedInput
                  fullWidth
                  size="small"
                  value={meterNo}
                  onChange={(e) => setMeterNo(e.target.value)}
                  placeholder="MTR-001"
                  sx={{
                    borderRadius: '8px !important',
                    height: '38px',
                    fontSize: '13px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormLabel sx={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', mb: 0.8 }}>
                  Prev. Reading
                </FormLabel>
                <OutlinedInput
                  fullWidth
                  size="small"
                  value={prevReading}
                  onChange={(e) => setPrevReading(e.target.value)}
                  sx={{
                    borderRadius: '8px !important',
                    height: '38px',
                    fontSize: '13px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormLabel sx={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', mb: 0.8 }}>
                  Current Reading
                </FormLabel>
                <OutlinedInput
                  fullWidth
                  size="small"
                  value={currentReading}
                  onChange={(e) => {
                    setCurrentReading(e.target.value);
                    setReadingError('');
                  }}
                  error={Boolean(readingError)}
                  sx={{
                    borderRadius: '8px !important',
                    height: '38px',
                    fontSize: '13px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: readingError ? '#EF4444' : '#E2E8F0'
                    }
                  }}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormLabel sx={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', mb: 0.8 }}>
                  Rate Plan
                </FormLabel>
                <OutlinedInput
                  fullWidth
                  disabled
                  size="small"
                  value="Fixed Flat Rate (₹750 / Month)"
                  sx={{
                    borderRadius: '8px !important',
                    height: '38px',
                    fontSize: '13px',
                    bgcolor: '#F8FAFC'
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormLabel sx={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', mb: 0.8 }}>
                  Monthly Charge (₹)
                </FormLabel>
                <OutlinedInput
                  fullWidth
                  size="small"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(e.target.value)}
                  sx={{
                    borderRadius: '8px !important',
                    height: '38px',
                    fontSize: '13px'
                  }}
                />
              </Grid>
            </Grid>
          )}

          {readingError && (
            <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '12px', mt: -1.5 }}>
              {readingError}
            </Typography>
          )}

          {/* 5. Live Calculation Highlight Box */}
          {chargeType === 'metered' && (
            <Box
              sx={{
                bgcolor: '#EEF2FF',
                borderRadius: '8px',
                p: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #C7D2FE'
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '13px', color: '#4338CA', fontWeight: 500 }}>
                  Units Consumed: <strong>{unitsConsumed} units</strong>
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#6366F1', mt: 0.3 }}>
                  Rate: ₹ {ratePerUnit} per unit
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '12px', color: '#4338CA', fontWeight: 500 }}>Total Charge</Typography>
                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#1E1B4B' }}>
                  ₹ {calculatedCharge.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          )}

          {/* 6. Notes */}
          <Box>
            <FormLabel sx={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', mb: 0.8 }}>
              Notes (Optional)
            </FormLabel>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add additional remarks..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#ffffff',
                  fontSize: '13px',
                  p: '8px 12px',
                  color: '#0F172A',
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#94A3B8' },
                  '&.Mui-focused fieldset': { borderColor: '#644EE5' }
                }
              }}
            />
          </Box>

          {/* 7. Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
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
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' }
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
                '&:hover': { bgcolor: '#523BCB', boxShadow: 'none' }
              }}
            >
              {loading ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : 'Confirm & Save'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddChargesModal;
