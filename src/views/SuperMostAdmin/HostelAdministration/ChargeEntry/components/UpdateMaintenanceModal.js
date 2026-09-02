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
  CircularProgress
} from '@mui/material';

const UpdateMaintenanceModal = ({ open, onClose, onConfirm, initialData = null, loading = false }) => {
  const [amount, setAmount] = useState('₹ 4,304');
  const [notes, setNotes] = useState('Updated maintenance charge');
  const [amountError, setAmountError] = useState('');

  // Pre-fill form values when modal opens or initialData changes
  useEffect(() => {
    if (open && initialData) {
      const rawNum =
        typeof initialData.amount === 'number'
          ? initialData.amount
          : Number(String(initialData.maintenanceAmount || initialData.amount || 4304).replace(/[^0-9.]/g, '')) || 4304;

      setAmount(`₹ ${rawNum.toLocaleString('en-IN')}`);
      setNotes(initialData.notes && initialData.notes !== '-' ? initialData.notes : 'Updated maintenance charge');
      setAmountError('');
    }
  }, [open, initialData]);

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

  const handleUpdate = () => {
    const rawNumber = amount.replace(/[^0-9]/g, '');
    if (!rawNumber || Number(rawNumber) <= 0) {
      setAmountError('Please enter a valid amount');
      return;
    }

    const numAmount = Number(rawNumber);

    if (onConfirm) {
      onConfirm({
        id: initialData?.id || initialData?._id || initialData?.maintenanceId,
        amount: numAmount,
        notes: notes.trim() || 'Updated maintenance charge'
      });
    }
  };

  const employeeName =
    initialData?.employeeName || initialData?.studentName || initialData?.name || 'Dr. Shreya Krishnan';
  const employeeId =
    initialData?.employeeId || initialData?.UID || (initialData?.studentId ? `PMCH-${initialData.studentId.slice(0, 5).toUpperCase()}` : 'PMCH-2041');
  const roomNo =
    initialData?.roomNo || (initialData?.roomNumber ? `Room ${initialData.roomNumber}` : 'Room 101');
  const location =
    initialData?.location || (initialData?.buildingName ? `Building ${initialData.buildingName} - ${roomNo}` : `${roomNo}`);

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
              Update Maintenance Charge
            </Typography>
            <Typography
              sx={{
                fontSize: '13px',
                color: '#64748B',
                fontFamily: 'Inter, sans-serif',
                mt: 0.5
              }}
            >
              Update the charge amount and notes for this maintenance entry.
            </Typography>
          </Box>

          {/* Resident Details (Read-only Summary) */}
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
              {employeeName}
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#475569',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {location} • {employeeId}
            </Typography>
          </Box>

          {/* 1. Maintenance Amount Input */}
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
              placeholder="₹ 4,304"
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

          {/* 2. Notes Field */}
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
              placeholder="e.g. Updated maintenance charge"
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

          {/* Action Buttons */}
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
              onClick={handleUpdate}
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
              {loading ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Update'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateMaintenanceModal;
