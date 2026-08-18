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
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { getShiftDetails } from 'services/shiftDetailServices';

const DEFAULT_EMPTY_ARRAY = [];

/**
 * ChangeShiftModal Component
 * 
 * Opens when clicking "Shift Change" on an employee row in Shift Details.
 * Dynamically fetches available shifts from the backend, allows searching and selecting a shift,
 * and confirming the reassignment.
 */
const ChangeShiftModal = ({
  open,
  onClose,
  onConfirm,
  employee,
  initialShiftId = '',
  shiftOptions = DEFAULT_EMPTY_ARRAY
}) => {
  const [dynamicShifts, setDynamicShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState(initialShiftId);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch dynamic shifts only once when modal opens
  useEffect(() => {
    if (!open) {
      setDynamicShifts([]);
      setSearchQuery('');
      setSubmitting(false);
      setLoadingShifts(false);
      return;
    }

    let isMounted = true;
    setSearchQuery('');
    setSubmitting(false);
    setLoadingShifts(true);

    getShiftDetails({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const items = Array.isArray(res?.items) ? res.items : [];
        if (items.length > 0) {
          setDynamicShifts(items);
          const match = items.find((s) => s.id === initialShiftId);
          setSelectedShiftId(match ? match.id : items[0].id);
        } else if (Array.isArray(shiftOptions) && shiftOptions.length > 0) {
          setDynamicShifts(shiftOptions);
          const match = shiftOptions.find((s) => s.id === initialShiftId);
          setSelectedShiftId(match ? match.id : shiftOptions[0].id);
        } else {
          setDynamicShifts([]);
          setSelectedShiftId('');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load dynamic shifts in ChangeShiftModal:', err);
        if (Array.isArray(shiftOptions) && shiftOptions.length > 0) {
          setDynamicShifts(shiftOptions);
          setSelectedShiftId(shiftOptions[0].id);
        } else {
          setDynamicShifts([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingShifts(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Combined list of shifts
  const effectiveShifts = dynamicShifts.length > 0 ? dynamicShifts : shiftOptions;

  // Filter shifts based on search query
  const filteredShifts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return effectiveShifts;
    return effectiveShifts.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.timeRange?.toLowerCase().includes(q) ||
        s.workingDays?.toLowerCase().includes(q)
    );
  }, [effectiveShifts, searchQuery]);

  // Handle confirm action
  const handleConfirm = async () => {
    const selectedShift = effectiveShifts.find((s) => s.id === selectedShiftId) || null;
    if (!selectedShift) return;

    if (onConfirm) {
      setSubmitting(true);
      try {
        await onConfirm(selectedShift, employee);
      } catch (err) {
        console.error('Error in onConfirm:', err);
      } finally {
        setSubmitting(false);
      }
    } else {
      onClose();
    }
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
              placeholder="Search shift by name or timing..."
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

        {/* Dynamic Shift Options List */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            mb: 2,
            maxHeight: '320px',
            overflowY: 'auto',
            pr: 0.5
          }}
        >
          {loadingShifts ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <CircularProgress size={26} sx={{ color: '#5B4BF2' }} />
              <Typography sx={{ color: '#64748B', fontSize: '13px', mt: 1.5 }}>
                Loading available shifts...
              </Typography>
            </Box>
          ) : filteredShifts.length > 0 ? (
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
                    bgcolor: isSelected ? '#F5F3FF' : '#FFFFFF',
                    border: isSelected ? '2px solid #5B4BF2' : '1px solid #E2E8F0',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                    '&:hover': {
                      borderColor: isSelected ? '#5B4BF2' : '#CBD5E1',
                      bgcolor: isSelected ? '#F5F3FF' : '#FAFAFC'
                    }
                  }}
                >
                  {/* Left: Radio + Shift Name & Working Days */}
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

                    <Box>
                      <Typography
                        sx={{
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: '14.5px',
                          color: isSelected ? '#0F172A' : '#334155'
                        }}
                      >
                        {shift.name}
                      </Typography>
                      {shift.workingDays && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#64748B',
                            fontSize: '12px',
                            display: 'block'
                          }}
                        >
                          {shift.workingDays}
                        </Typography>
                      )}
                    </Box>
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
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: '13px' }}>
                {searchQuery ? `No shifts found matching "${searchQuery}"` : 'No available shifts found.'}
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
          disabled={submitting}
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
          disabled={!selectedShiftId || loadingShifts || submitting}
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
            },
            '&.Mui-disabled': {
              bgcolor: '#a5b4fc',
              color: '#ffffff'
            }
          }}
        >
          {submitting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeShiftModal;
