import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  FormControl,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';

// Standard shift list matching design mockup
const DEFAULT_SHIFT_OPTIONS = [
  { id: 'morning_shift', name: 'Morning Shift', timeRange: '6:00 AM - 2:00 PM' },
  { id: 'evening_shift', name: 'Evening Shift', timeRange: '2:00 PM - 10:00 PM' },
  { id: 'night_shift', name: 'Night Shift', timeRange: '10:00 PM - 6:00 AM' },
  { id: 'general_shift', name: 'General Shift', timeRange: '9:00 AM - 5:00 PM' },
  { id: 'new_sn_duty', name: 'New S/N Duty', timeRange: '9:00 AM - 5:00 PM' }
];

/**
 * ChangeShiftModal Component
 * 
 * Opens when clicking "Shift Change" on an employee row.
 * Allows searching and selecting a new shift and confirming the assignment.
 */
const ChangeShiftModal = ({
  open,
  onClose,
  onConfirm,
  employee,
  initialShiftId = 'morning_shift',
  shiftOptions = DEFAULT_SHIFT_OPTIONS
}) => {
  const [selectedShiftId, setSelectedShiftId] = useState(initialShiftId);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset or initialize when modal opens
  useEffect(() => {
    if (open) {
      setSelectedShiftId(initialShiftId || 'morning_shift');
      setSearchQuery('');
    }
  }, [open, initialShiftId]);

  // Filter shifts based on search query
  const filteredShifts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return shiftOptions;
    return shiftOptions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.timeRange.toLowerCase().includes(q)
    );
  }, [shiftOptions, searchQuery]);

  // Handle confirm action
  const handleConfirm = () => {
    const selectedShift = shiftOptions.find((s) => s.id === selectedShiftId) || null;
    if (onConfirm) {
      onConfirm(selectedShift, employee);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxWidth: '540px',
          p: 0,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header with Title and Close Button */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          pt: 3,
          pb: 2
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#0F172A',
            fontSize: '18px',
            lineHeight: '24px'
          }}
        >
          Change Shift
        </Typography>

        <IconButton
          onClick={onClose}
          size="small"
          aria-label="close"
          sx={{
            color: '#64748B',
            p: 0.5,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 0.5 }}>
        {/* Search Shift Input */}
        <Box sx={{ mb: 2.5 }}>
          <FormControl size="small" fullWidth>
            <OutlinedInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shift"
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                </InputAdornment>
              }
              sx={{
                height: '42px',
                borderRadius: '8px',
                fontSize: '13.5px',
                bgcolor: '#FFFFFF',
                color: '#334155',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#CBD5E1'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#5B4BF2'
                }
              }}
            />
          </FormControl>
        </Box>

        {/* Shift Options List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          {filteredShifts.length > 0 ? (
            filteredShifts.map((shift) => {
              const isSelected = selectedShiftId === shift.id;
              return (
                <Box
                  key={shift.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedShiftId(shift.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedShiftId(shift.id);
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1.8,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    bgcolor: '#FFFFFF',
                    border: isSelected ? '2px solid #5B4BF2' : '1px solid #E2E8F0',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                    '&:hover': {
                      borderColor: isSelected ? '#5B4BF2' : '#CBD5E1',
                      bgcolor: isSelected ? '#FFFFFF' : '#FAFAFC'
                    }
                  }}
                >
                  {/* Left: Radio + Shift Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* Custom Radio Indicator */}
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: isSelected ? '2px solid #5B4BF2' : '2px solid #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {isSelected && (
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: '#5B4BF2'
                          }}
                        />
                      )}
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: '14.5px',
                        color: isSelected ? '#0F172A' : '#334155'
                      }}
                    >
                      {shift.name}
                    </Typography>
                  </Box>

                  {/* Right: Time Range */}
                  <Typography
                    sx={{
                      fontSize: '13.5px',
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? '#5B4BF2' : '#64748B'
                    }}
                  >
                    {shift.timeRange}
                  </Typography>
                </Box>
              );
            })
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: '13px' }}>
                {`No shifts found matching "${searchQuery}"`}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Modal Actions Footer */}
      <DialogActions
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          pt: 2,
          pb: 3
        }}
      >
        {/* Cancel Button */}
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 600,
            color: '#64748B',
            p: 0,
            minWidth: 'auto',
            '&:hover': {
              color: '#0F172A',
              bgcolor: 'transparent'
            }
          }}
        >
          Cancel
        </Button>

        {/* Confirm Action Button */}
        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{
            bgcolor: '#5B4BF2',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            borderRadius: '8px',
            px: 3.5,
            py: 0.9,
            height: '38px',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#4B3EE0',
              boxShadow: '0 2px 6px rgba(91, 75, 242, 0.3)'
            }
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeShiftModal;
