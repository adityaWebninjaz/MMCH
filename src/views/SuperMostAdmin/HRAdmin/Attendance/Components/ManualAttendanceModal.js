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
          width: '540px',
          maxWidth: '92vw',
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          p: 0,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E2E8F0',
          fontFamily: "'Inter', sans-serif"
        }
      }}
    >
      <DialogContent sx={{ p: '28px 28px 24px 28px', position: 'relative' }}>
        {/* 1. Header: Title & Close Button */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pr: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Inter', sans-serif !important",
              fontSize: '18px !important',
              fontWeight: '600 !important',
              color: '#0F172A !important',
              lineHeight: 1.3
            }}
          >
            Manual Attendance Correction
          </Typography>

          <IconButton
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            sx={{
              position: 'absolute',
              right: 18,
              top: 18,
              color: '#64748B',
              p: 0.5,
              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' }
            }}
          >
            <IconX size={20} />
          </IconButton>
        </Box>

        {/* 2. Subtitle: Employee Name & Date */}
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif !important",
            fontSize: '14px !important',
            fontWeight: '400 !important',
            color: '#64748B !important',
            mt: '4px',
            mb: '24px'
          }}
        >
          {employee?.name} · {formattedDate}
        </Typography>

        {/* 3. Two Columns: OLD VALUE & NEW VALUE */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', mb: '22px' }}>
          {/* Old Value */}
          <Box>
            <Typography
              sx={{
                fontFamily: "'Inter', sans-serif !important",
                fontSize: '12px !important',
                fontWeight: '600 !important',
                color: '#475569 !important',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                mb: '8px'
              }}
            >
              OLD VALUE
            </Typography>
            <Box
              sx={{
                height: '42px',
                borderRadius: '8px',
                bgcolor: '#F8FAFC',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                px: '14px',
                fontSize: '14px',
                fontWeight: 400,
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
                fontSize: '12px !important',
                fontWeight: '600 !important',
                color: '#475569 !important',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
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
                height: '42px',
                width: '100%',
                bgcolor: '#FFFFFF',
                borderRadius: '8px !important',
                fontFamily: "'Inter', sans-serif !important",
                '& .MuiOutlinedInput-notchedOutline, & fieldset': {
                  borderColor: '#E2E8F0',
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
                  height: '42px',
                  fontSize: '14px !important',
                  fontWeight: '400 !important',
                  color: '#1E293B !important',
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
                    border: '1px solid #E2E8F0',
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

        {/* 4. Reason (Audit Logged) */}
        <Box sx={{ mb: '24px' }}>
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif !important",
              fontSize: '12px !important',
              fontWeight: '600 !important',
              color: '#475569 !important',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              mb: '8px'
            }}
          >
            REASON (AUDIT LOGGED) <span style={{ color: '#EF4444' }}>*</span>
          </Typography>

          <textarea
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="Provide justification. Old value, new value, actor and timestamp are recorded."
            style={{
              width: '100%',
              minHeight: '90px',
              padding: '12px 14px',
              borderRadius: '8px',
              border: error ? '1px solid #EF4444' : '1px solid #E2E8F0',
              outline: 'none',
              fontSize: '13px',
              fontFamily: "'Inter', sans-serif",
              color: '#0F172A',
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
              if (!error) e.target.style.borderColor = '#E2E8F0';
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

        {/* 5. Footer Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={submitting}
            sx={{
              height: '38px',
              minWidth: '80px',
              px: '20px',
              borderRadius: '8px !important',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              color: '#334155',
              fontFamily: "'Inter', sans-serif !important",
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              boxSizing: 'border-box',
              '&:hover': {
                borderColor: '#CBD5E1',
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
              height: '38px',
              minWidth: '88px',
              px: '22px',
              borderRadius: '8px !important',
              bgcolor: '#644EE5',
              color: '#FFFFFF',
              fontFamily: "'Inter', sans-serif !important",
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: 'none',
              boxSizing: 'border-box',
              '&:hover': {
                bgcolor: '#533DC7',
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
