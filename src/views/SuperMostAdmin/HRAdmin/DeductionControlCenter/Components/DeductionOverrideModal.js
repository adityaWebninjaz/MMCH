import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Box, Typography, Button, TextField, Select, MenuItem, FormControl } from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';

const DEDUCTION_TYPES = [
  'Hostel Rent Mess Recovery',
  'Hostel Rent',
  'Room Rent',
  'Maintenance Charge',
  'Accommodation Charge',
  'Electricity Charge',
  'Misc Recovery'
];

const DropdownIcon = (props) => <IconChevronDown size={18} color="#64748B" style={{ marginRight: 10, pointerEvents: 'none' }} {...props} />;

const selectMenuProps = {
  sx: {
    zIndex: 2000
  },
  PaperProps: {
    sx: {
      zIndex: 2000,
      maxHeight: 280,
      borderRadius: '8px',
      boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.12)',
      mt: '4px',
      border: '1px solid #E2E8F0'
    }
  }
};

const labelSx = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#000000',
  lineHeight: '100%',
  fontFamily: "'Inter', sans-serif",
  mb: '6px'
};

const selectSx = {
  height: '42px',
  borderRadius: '8px',
  bgcolor: '#FFFFFF',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: '100%',
  letterSpacing: '0%',
  color: '#1E293B',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E2E8F0',
    borderRadius: '8px'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#CBD5E1'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#644EE5',
    borderWidth: '1.5px'
  },
  '& .MuiSelect-select': {
    py: 0,
    px: '14px',
    display: 'flex',
    alignItems: 'center',
    height: '42px',
    boxSizing: 'border-box'
  }
};

const menuItemSx = {
  fontSize: '13px',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 400,
  lineHeight: '100%',
  letterSpacing: '0%',
  color: '#1E293B'
};

const DeductionOverrideModal = ({ open, onClose, record, departmentName, onOverrideSuccess, employeeList = [] }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [deductionType, setDeductionType] = useState('Hostel Rent Mess Recovery');
  const [currentAmount, setCurrentAmount] = useState('₹ 4,350');
  const [newAmount, setNewAmount] = useState('₹ 3,200');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const findEmployeeRecord = (empString) => {
    if (!empString || !employeeList || employeeList.length === 0) return record;
    const match = empString.match(/(.*)\s*\((.*)\)/);
    const empName = match ? match[1].trim() : empString;
    const empId = match ? match[2].trim() : '';

    return (
      employeeList.find((e) => {
        const idStr = String(e.id || e.empId || '');
        const cleanId = idStr.startsWith('EMP') ? idStr : `EMP${idStr}`;
        return (cleanId && cleanId === empId) || e.name === empName;
      }) || record
    );
  };

  const getAmountForType = (empRec, type) => {
    if (!empRec) return '₹ 4,350';
    const t = (type || '').toLowerCase();
    let val;
    if (t.includes('rent') && !t.includes('mess')) {
      val = empRec.rent || '₹ 2,500';
    } else if (t.includes('maintenance')) {
      val = empRec.maintenance || '₹ 800';
    } else if (t.includes('accommodation')) {
      val = empRec.accommodation || '₹ 1,150';
    } else if (t.includes('electricity')) {
      val = empRec.electricity || '₹ 500';
    } else {
      val = empRec.total || '₹ 4,450';
    }

    const str = String(val).trim();
    return str.startsWith('₹') ? str : `₹ ${str}`;
  };

  useEffect(() => {
    if (open && record) {
      const empName = record.name || 'Ayush Kumar';
      const empId = record.empId || record.id || 'EMP235469';
      const empDisplay = `${empName} (${typeof empId === 'string' && empId.startsWith('EMP') ? empId : `EMP${empId}`})`;
      const defaultType = record.deductionType || 'Hostel Rent Mess Recovery';

      setSelectedEmployee(empDisplay);
      setDeductionType(defaultType);

      const computedCurrent = getAmountForType(record, defaultType);
      setCurrentAmount(computedCurrent);

      setNewAmount(record.newAmount || '₹ 3,200');
      setReason(record.reason || '');
      setErrors({});
    } else if (!open) {
      setReason('');
      setErrors({});
      setSubmitting(false);
    }
  }, [open, record]);

  if (!open) return null;

  const handleEmployeeChange = (newEmp) => {
    setSelectedEmployee(newEmp);
    const empRec = findEmployeeRecord(newEmp);
    const updatedCurrent = getAmountForType(empRec, deductionType);
    setCurrentAmount(updatedCurrent);
  };

  const handleDeductionTypeChange = (newType) => {
    setDeductionType(newType);
    const empRec = findEmployeeRecord(selectedEmployee);
    const updatedCurrent = getAmountForType(empRec, newType);
    setCurrentAmount(updatedCurrent);
  };

  const handleNewAmountChange = (e) => {
    let val = e.target.value;
    if (val.startsWith('₹')) {
      val = val.replace('₹', '').trim();
    }
    const numericOnly = val.replace(/[^0-9.]/g, '');
    if (numericOnly === '') {
      setNewAmount('');
    } else {
      const parts = numericOnly.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      setNewAmount(`₹ ${parts.join('.')}`);
    }

    if (errors.newAmount) {
      setErrors((prev) => ({ ...prev, newAmount: null }));
    }
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    if (errors.reason) {
      setErrors((prev) => ({ ...prev, reason: null }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const newErrors = {};
    if (!newAmount || newAmount.trim() === '' || newAmount === '₹') {
      newErrors.newAmount = 'New amount is required';
    }
    if (!reason || reason.trim() === '') {
      newErrors.reason = 'Reason for audit log is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const empRec = findEmployeeRecord(selectedEmployee);
      const payload = {
        recordId: empRec?.id || record?.id,
        employeeName: empRec?.name || record?.name,
        employee: selectedEmployee,
        deductionType,
        currentAmount,
        newAmount,
        reason,
        department: departmentName,
        timestamp: new Date().toISOString()
      };

      if (onOverrideSuccess) {
        await onOverrideSuccess(payload);
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit override:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const employees =
    employeeList.length > 0
      ? employeeList.map(
          (emp) => `${emp.name} (${emp.empId || (typeof emp.id === 'string' && emp.id.startsWith('EMP') ? emp.id : `EMP${emp.id}`)})`
        )
      : [selectedEmployee || 'Ayush Kumar (EMP235469)', 'Amit Sharma (EMP235470)', 'Pooja Verma (EMP235471)'];

  if (selectedEmployee && !employees.includes(selectedEmployee)) {
    employees.unshift(selectedEmployee);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1500,
        '& .MuiBackdrop-root': {
          bgcolor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(.5px)'
        }
      }}
      PaperProps={{
        sx: {
          width: '520px',
          maxWidth: 'calc(100vw - 32px)',
          minHeight: '545px',
          p: '32px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
          boxSizing: 'border-box',
          m: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: "'Inter', sans-serif"
        }
      }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Modal Title */}
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#0F172A',
            lineHeight: '28px',
            fontFamily: "'Inter', sans-serif",
            m: 0
          }}
        >
          Deduction Override Panel
        </Typography>

        {/* Fields Container */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Field 1: Select Employee */}
          <Box>
            <Typography sx={labelSx}>
              Select Employee <span style={{ color: '#EF4444' }}>*</span>
            </Typography>

            <FormControl fullWidth size="small">
              <Select
                value={selectedEmployee}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                IconComponent={DropdownIcon}
                MenuProps={selectMenuProps}
                sx={selectSx}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp} value={emp} sx={menuItemSx}>
                    {emp}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Field 2: Deduction Type */}
          <Box>
            <Typography sx={labelSx}>
              Deduction Type <span style={{ color: '#EF4444' }}>*</span>
            </Typography>

            <FormControl fullWidth size="small">
              <Select
                value={deductionType}
                onChange={(e) => handleDeductionTypeChange(e.target.value)}
                IconComponent={DropdownIcon}
                MenuProps={selectMenuProps}
                sx={selectSx}
              >
                {DEDUCTION_TYPES.map((type) => (
                  <MenuItem key={type} value={type} sx={menuItemSx}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Field 3 & 4: Current Amount & New Amount Side-by-Side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Current Amount (Readonly) */}
            <Box>
              <Typography sx={labelSx}>Current Amount</Typography>
              <Box
                sx={{
                  height: '42px',
                  px: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  color: '#475569',
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  fontFamily: "'Inter', sans-serif",
                  boxSizing: 'border-box',
                  userSelect: 'none'
                }}
              >
                {currentAmount}
              </Box>
            </Box>

            {/* New Amount (Editable / Active Border) */}
            <Box>
              <Typography sx={labelSx}>
                New Amount <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={newAmount}
                onChange={handleNewAmountChange}
                error={Boolean(errors.newAmount)}
                helperText={errors.newAmount}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '42px',
                    borderRadius: '8px',
                    bgcolor: '#FFFFFF',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    color: '#1E293B',
                    '& fieldset': {
                      borderColor: errors.newAmount ? '#EF4444' : '#0F172A',
                      borderWidth: '1.5px',
                      borderRadius: '8px'
                    },
                    '&:hover fieldset': {
                      borderColor: errors.newAmount ? '#EF4444' : '#0F172A'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: errors.newAmount ? '#EF4444' : '#644EE5',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    px: '14px',
                    py: 0,
                    height: '42px',
                    boxSizing: 'border-box'
                  }
                }}
              />
            </Box>
          </Box>

          {/* Field 5: Reason (Audit Logged) */}
          <Box>
            <Typography sx={labelSx}>
              Reason (Audit Logged) <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={reason}
              onChange={handleReasonChange}
              placeholder="Provide justification. Old value, new value, actor and timestamp are recorded."
              error={Boolean(errors.reason)}
              helperText={errors.reason}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#1E293B',
                  p: '12px 14px',
                  lineHeight: '20px',
                  '& fieldset': {
                    borderColor: errors.reason ? '#EF4444' : '#E2E8F0',
                    borderRadius: '8px'
                  },
                  '&:hover fieldset': {
                    borderColor: errors.reason ? '#EF4444' : '#CBD5E1'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.reason ? '#EF4444' : '#644EE5',
                    borderWidth: '1.5px'
                  }
                },
                '& .MuiOutlinedInput-input::placeholder': {
                  color: '#94A3B8',
                  opacity: 1,
                  fontSize: '13px',
                  fontFamily: "'Inter', sans-serif"
                }
              }}
            />
          </Box>
        </Box>

        {/* Modal Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            mt: '8px'
          }}
        >
          <Button
            type="button"
            onClick={onClose}
            disabled={submitting}
            variant="outlined"
            sx={{
              textTransform: 'none',
              width: '71px',
              height: '36px',
              minWidth: '64px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              pt: '6px',
              pb: '6px',
              pl: '8px',
              pr: '8px',
              bgcolor: '#FFFFFF',
              color: '#475569',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '24px',
              letterSpacing: '0%',
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
            type="submit"
            disabled={submitting}
            variant="contained"
            sx={{
              textTransform: 'none',
              width: '82px',
              height: '36px',
              minWidth: '64px',
              borderRadius: '6px',
              pt: '6px',
              pb: '6px',
              pl: '8px',
              pr: '8px',
              bgcolor: '#644EE5',
              color: '#FFFFFF',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '24px',
              letterSpacing: '0%',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#5038DE',
                boxShadow: 'none'
              },
              '&:disabled': {
                bgcolor: '#A5B4FC',
                color: '#FFFFFF'
              }
            }}
          >
            {submitting ? 'Overriding...' : 'Override'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

DeductionOverrideModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  record: PropTypes.object,
  departmentName: PropTypes.string,
  onOverrideSuccess: PropTypes.func,
  employeeList: PropTypes.array
};

export default DeductionOverrideModal;
