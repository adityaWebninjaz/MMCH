import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  IconButton,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { IconX, IconChevronDown } from '@tabler/icons-react';
import { ATTENDANCE_STATUS_OPTIONS, getStatusMeta } from '../../Services/hrAttendanceService';

const ManualAttendanceModal = ({
  open,
  onClose,
  cellData,
  onUpdate
}) => {
  const [newValue, setNewValue] = useState('P');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset/Initialize modal form state when a cell is selected
  useEffect(() => {
    if (open && cellData) {
      const currentCode = cellData.status || 'P';
      setNewValue(currentCode);
      setReason('');
      setError('');
      setSubmitting(false);
    }
  }, [open, cellData]);

  if (!cellData) return null;

  const { employee, day, month, year, status: oldStatusCode } = cellData;
  const oldStatusMeta = getStatusMeta(oldStatusCode);

  const formattedDate = `${month} ${day}, ${year}`;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason / justification for this audit log.');
      return;
    }

    setSubmitting(true);
    try {
      await onUpdate({
        rowId: employee.id,
        empId: employee.empId || employee.id,
        employee,
        day,
        month,
        year,
        oldStatus: oldStatusCode,
        newStatus: newValue,
        reason: reason.trim()
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to update attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '512px',
          maxWidth: '512px',
          minHeight: '370px',
          borderRadius: '12px', // rounded-xl (12px)
          bgcolor: '#FFFFFF',
          p: 0,
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E5E7EB',
          fontFamily: "'Inter', sans-serif"
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
        {/* 1. Header Section Frame (12px padding all sides, gap: 4px) */}
        <Box
          sx={{
            width: '100%',
            p: '12px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Typography
              component="h2"
              sx={{
                fontFamily: "'Inter', sans-serif !important",
                fontSize: '14px !important',
                fontWeight: '600 !important',
                lineHeight: '20px !important',
                letterSpacing: '0% !important',
                color: '#09090B !important',
                m: 0
              }}
            >
              Manual Attendance Correction
            </Typography>

            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif !important",
                fontSize: '14px !important',
                fontWeight: '400 !important',
                lineHeight: '20px !important',
                letterSpacing: '0% !important',
                color: '#737373 !important',
                m: 0
              }}
            >
              {employee?.name} · {formattedDate}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            sx={{
              color: '#737373',
              p: '4px',
              m: 0,
              borderRadius: '6px',
              '&:hover': { color: '#09090B', bgcolor: '#F4F4F5' }
            }}
          >
            <IconX size={20} stroke={1.8} />
          </IconButton>
        </Box>

        {/* 2. Body Section Frame (width: 512px, height: 302px hug, padding: 24px, gap: 20px) */}
        <Box
          sx={{
            width: '100%',
            boxSizing: 'border-box',
            p: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Row 1: Two Columns: OLD VALUE & NEW VALUE */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Old Value */}
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif !important",
                  fontSize: '11px !important',
                  fontWeight: '600 !important',
                  color: '#64748B !important',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05%',
                  lineHeight: '100%',
                  mb: '8px'
                }}
              >
                OLD VALUE
              </Typography>
              <Box
                sx={{
                  height: '38px',
                  borderRadius: '8px',
                  bgcolor: oldStatusMeta.bgcolor || '#DCFCE7',
                  color: oldStatusMeta.color || '#15803D',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  px: '14px',
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  boxSizing: 'border-box'
                }}
              >
                {oldStatusMeta.label}
              </Box>
            </Box>

            {/* New Value */}
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif !important",
                  fontSize: '11px !important',
                  fontWeight: '600 !important',
                  color: '#64748B !important',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05%',
                  lineHeight: '100%',
                  mb: '8px'
                }}
              >
                NEW VALUE
              </Typography>
              <Select
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                IconComponent={() => (
                  <IconChevronDown
                    size={18}
                    stroke={2}
                    style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }}
                  />
                )}
                sx={{
                  height: '38px',
                  width: '100%',
                  bgcolor: '#FFFFFF',
                  borderRadius: '8px !important',
                  fontFamily: "'Inter', sans-serif !important",
                  '& .MuiOutlinedInput-notchedOutline, & fieldset': {
                    borderColor: '#E5E7EB',
                    borderRadius: '8px !important'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline, &:hover fieldset': {
                    borderColor: '#CBD5E1'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused fieldset': {
                    borderColor: '#644EE5',
                    borderWidth: '1.5px'
                  },
                  '& .MuiSelect-select': {
                    py: 0,
                    pl: '14px !important',
                    pr: '36px !important',
                    display: 'flex',
                    alignItems: 'center',
                    height: '38px',
                    fontSize: '14px !important',
                    fontWeight: '400 !important',
                    color: '#09090B !important',
                    fontFamily: "'Inter', sans-serif !important",
                    boxSizing: 'border-box',
                    borderRadius: '8px !important'
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid #E5E7EB',
                      mt: 0.5,
                      maxHeight: '260px'
                    }
                  }
                }}
              >
                {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                  <MenuItem
                    key={opt.code}
                    value={opt.code}
                    sx={{
                      fontSize: '14px !important',
                      fontWeight: '400 !important',
                      fontFamily: "'Inter', sans-serif !important",
                      color: '#1E293B !important',
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '&.Mui-selected': { bgcolor: '#EEF2FF', color: '#644EE5 !important', fontWeight: '500 !important' }
                    }}
                  >
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          {/* Row 2: Reason (Audit Logged) */}
          <Box>
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif !important",
                fontSize: '11px !important',
                fontWeight: '600 !important',
                color: '#64748B !important',
                textTransform: 'uppercase',
                letterSpacing: '0.05%',
                lineHeight: '100%',
                mb: '8px'
              }}
            >
              REASON (AUDIT LOGGED) <span style={{ color: '#EF4444' }}>*</span>
            </Typography>

            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Provide justification. Old value, new value, actor and timestamp are recorded."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px 12px 20px 12px',
                borderRadius: '8px',
                border: error ? '1px solid #EF4444' : '1px solid #E5E7EB',
                outline: 'none',
                fontSize: '13px',
                fontFamily: "'Inter', sans-serif",
                color: '#94A3B8',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                resize: 'vertical',
                lineHeight: 1.5,
                transition: 'border-color 0.15s ease'
              }}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = '#644EE5';
              }}
              onBlur={(e) => {
                if (!error) e.target.style.borderColor = '#E5E7EB';
              }}
            />

            {error && (
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif !important",
                  fontSize: '12px !important',
                  color: '#EF4444 !important',
                  mt: '4px'
                }}
              >
                {error}
              </Typography>
            )}
          </Box>

          {/* Row 3: Footer Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={onClose}
              disabled={submitting}
              sx={{
                p: '6px 12px',
                borderRadius: '8px !important',
                border: '1px solid #E5E7EB',
                bgcolor: '#FFFFFF',
                color: '#475569',
                fontFamily: "'Inter', sans-serif !important",
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '24px',
                textTransform: 'none',
                boxSizing: 'border-box',
                '&:hover': {
                  borderColor: '#D1D5DB',
                  bgcolor: '#F8FAFC'
                }
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              sx={{
                p: '6px 12px',
                borderRadius: '8px !important',
                bgcolor: '#5D5FEF',
                color: '#FFFFFF',
                fontFamily: "'Inter', sans-serif !important",
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '24px',
                textTransform: 'none',
                boxShadow: 'none',
                boxSizing: 'border-box',
                '&:hover': {
                  bgcolor: '#4F46E5',
                  boxShadow: 'none'
                },
                '&:disabled': {
                  bgcolor: '#A5B4FC',
                  color: '#FFFFFF'
                }
              }}
            >
              {submitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
                  <span>Updating...</span>
                </Box>
              ) : (
                'Update'
              )}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

ManualAttendanceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cellData: PropTypes.shape({
    employee: PropTypes.object,
    day: PropTypes.number,
    month: PropTypes.string,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string
  }),
  onUpdate: PropTypes.func.isRequired
};

export default ManualAttendanceModal;
