import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress
} from '@mui/material';
import { IconX, IconLock } from '@tabler/icons-react';
import editIcon from 'assets/icon/edit-2.svg';
import DeductionOverrideModal from './DeductionOverrideModal';
import { getDepartmentDeductionDetails } from '../Services/deductionControlCenterService';

const DepartmentDetailsModal = ({ open, onClose, departmentData, departmentId, onLock }) => {
  const [detailsData, setDetailsData] = useState(departmentData || null);
  const [loading, setLoading] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedRecordForOverride, setSelectedRecordForOverride] = useState(null);

  useEffect(() => {
    if (open) {
      if (departmentData) {
        setDetailsData(departmentData);
      } else if (departmentId) {
        setLoading(true);
        getDepartmentDeductionDetails(departmentId)
          .then((res) => {
            if (res && res.success) {
              setDetailsData(res.data);
            }
          })
          .finally(() => setLoading(false));
      }
    }
  }, [open, departmentData, departmentId]);

  const currentData = detailsData || departmentData || {};
  const { department = 'Hostel Administration', status = 'Submitted', totalEntries = 44, details = [] } = currentData;

  const isLocked = status?.toLowerCase() === 'locked';

  const getStatusBadge = (st) => {
    switch (st?.toLowerCase()) {
      case 'submitted':
        return { bg: '#DCFCE7', color: '#15803D', width: '86px', label: 'Submitted' };
      case 'locked':
        return { bg: '#DBEAFE', color: '#1D4ED8', width: '66px', label: 'Locked' };
      case 'open':
        return { bg: '#FEF3C7', color: '#D97706', width: '54px', label: 'Open' };
      case 'close':
      case 'closed':
        return { bg: '#FEE2E2', color: '#B91C1C', width: '66px', label: 'Closed' };
      default:
        return { bg: '#F1F5F9', color: '#475569', width: '70px', label: st || 'Unknown' };
    }
  };

  const badgeStyle = getStatusBadge(status);

  const handleLockClick = () => {
    setDetailsData((prev) => (prev ? { ...prev, status: 'Locked' } : { ...departmentData, status: 'Locked' }));
    if (onLock) {
      onLock(currentData);
    }
  };

  const handleOpenOverride = (record) => {
    setSelectedRecordForOverride(record);
    setOverrideModalOpen(true);
  };

  const handleCloseOverride = () => {
    setOverrideModalOpen(false);
    setSelectedRecordForOverride(null);
  };

  const handleOverrideSuccess = (payload) => {
    const parseCurrency = (val) => {
      if (!val) return 0;
      const num = Number(String(val).replace(/[^0-9.-]+/g, ''));
      return isNaN(num) ? 0 : num;
    };

    setDetailsData((prev) => {
      if (!prev || !prev.details) return prev;
      const updatedDetails = prev.details.map((rec) => {
        if (rec.id === payload.recordId || rec.name === payload.employeeName) {
          const type = (payload.deductionType || '').toLowerCase();
          let newRent = rec.rent;
          let newMaint = rec.maintenance;
          let newAcc = rec.accommodation;
          let newTotal = rec.total;

          if (type.includes('rent') && !type.includes('mess')) {
            newRent = payload.newAmount;
            const t = parseCurrency(newRent) + parseCurrency(newMaint) + parseCurrency(newAcc);
            newTotal = `₹${t.toLocaleString('en-IN')}`;
          } else if (type.includes('maintenance')) {
            newMaint = payload.newAmount;
            const t = parseCurrency(newRent) + parseCurrency(newMaint) + parseCurrency(newAcc);
            newTotal = `₹${t.toLocaleString('en-IN')}`;
          } else if (type.includes('accommodation')) {
            newAcc = payload.newAmount;
            const t = parseCurrency(newRent) + parseCurrency(newMaint) + parseCurrency(newAcc);
            newTotal = `₹${t.toLocaleString('en-IN')}`;
          } else {
            newTotal = payload.newAmount;
          }

          return {
            ...rec,
            rent: newRent,
            maintenance: newMaint,
            accommodation: newAcc,
            total: newTotal
          };
        }
        return rec;
      });
      return {
        ...prev,
        details: updatedDetails
      };
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={{ enter: 450, exit: 350 }}
      SlideProps={{
        easing: {
          enter: 'cubic-bezier(0.25, 1, 0.5, 1)',
          exit: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }}
      sx={{
        zIndex: 1400,
        '& .MuiBackdrop-root': {
          bgcolor: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(2px)',
          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1) !important'
        }
      }}
      PaperProps={{
        sx: {
          width: { xs: '100vw', md: isLocked ? '551px' : '793px' },
          maxWidth: '100vw',
          height: '100vh',
          borderTopLeftRadius: '12px',
          borderBottomLeftRadius: '12px',
          bgcolor: '#FFFFFF',
          boxShadow: '-12px 0 36px rgba(0, 0, 0, 0.14)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Inter', sans-serif",
          transition: 'width 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          p: 0
        }
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          px: '16px',
          py: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 500,
              color: '#1F2937',
              lineHeight: '24px',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {department}
          </Typography>
          {isLocked && <IconLock size={18} color="#2563EB" style={{ strokeWidth: 2 }} />}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '24px',
              width: badgeStyle.width,
              px: '10px',
              py: '4px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 600,
              lineHeight: '100%',
              boxSizing: 'border-box',
              bgcolor: badgeStyle.bg,
              color: badgeStyle.color,
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {badgeStyle.label}
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            disableRipple
            sx={{
              width: 28,
              height: 28,
              color: '#64748B',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '50%',
              p: 0,
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A', borderColor: '#CBD5E1' }
            }}
          >
            <IconX size={16} />
          </IconButton>
        </Box>
      </Box>

      {/* Drawer Body */}
      <Box
        sx={{
          flex: 1,
          p: '16px 16px 0px 16px',
          overflowY: 'auto',
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress size={32} sx={{ color: '#6366F1' }} />
          </Box>
        ) : (
          <>
            {/* Total entries count */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 300,
                  color: '#000000',
                  lineHeight: '20px',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Total Entries -{totalEntries || details.length}
              </Typography>
            </Box>

            {/* Table Container */}
            <TableContainer
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden'
              }}
            >
              <Table sx={{ minWidth: isLocked ? 480 : 600 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow sx={{ borderBottom: '1px solid #E2E8F0' }}>
                    <TableCell
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#475569',
                        py: '15px',
                        px: '14px',
                        lineHeight: '18px',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#475569',
                        py: '15px',
                        px: '14px',
                        lineHeight: '18px',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      Rent
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#475569',
                        py: '15px',
                        px: '14px',
                        lineHeight: '18px',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      Maintenance
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#475569',
                        py: '15px',
                        px: '14px',
                        lineHeight: '18px',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      Accommodation
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#475569',
                        py: '15px',
                        px: '14px',
                        lineHeight: '18px',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      Total
                    </TableCell>
                    {!isLocked && (
                      <TableCell
                        align="center"
                        sx={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#475569',
                          py: '15px',
                          px: '14px',
                          lineHeight: '18px',
                          fontFamily: "'Inter', sans-serif"
                        }}
                      >
                        Action
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.length > 0 ? (
                    details.map((item) => (
                      <TableRow
                        key={item.id}
                        sx={{
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background-color 0.15s ease',
                          '&:hover': { bgcolor: '#F8FAFC' }
                        }}
                      >
                        <TableCell
                          sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1E293B',
                            py: '15px',
                            px: '14px',
                            lineHeight: '18px',
                            fontFamily: "'Inter', sans-serif"
                          }}
                        >
                          {item.name}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1E293B',
                            py: '15px',
                            px: '14px',
                            lineHeight: '18px',
                            fontFamily: "'Inter', sans-serif"
                          }}
                        >
                          {item.rent}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1E293B',
                            py: '15px',
                            px: '14px',
                            lineHeight: '18px',
                            fontFamily: "'Inter', sans-serif"
                          }}
                        >
                          {item.maintenance}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1E293B',
                            py: '15px',
                            px: '14px',
                            lineHeight: '18px',
                            fontFamily: "'Inter', sans-serif"
                          }}
                        >
                          {item.accommodation}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#1E293B',
                            py: '15px',
                            px: '14px',
                            lineHeight: '18px',
                            fontFamily: "'Inter', sans-serif"
                          }}
                        >
                          {item.total}
                        </TableCell>
                        {!isLocked && (
                          <TableCell align="center" sx={{ py: '10px', px: '14px' }}>
                            <Box
                              component="button"
                              type="button"
                              onClick={() => handleOpenOverride(item)}
                              sx={{
                                width: '28px',
                                height: '28px',
                                minWidth: '28px',
                                maxWidth: '28px',
                                borderRadius: '6px',
                                bgcolor: '#F1F5F9',
                                p: 0,
                                m: 0,
                                border: 'none',
                                outline: 'none',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.15s ease',
                                '&:hover': {
                                  bgcolor: '#E2E8F0'
                                },
                                '&:active': {
                                  bgcolor: '#CBD5E1'
                                }
                              }}
                            >
                              <img src={editIcon} alt="Edit" width={16} height={16} style={{ display: 'block', pointerEvents: 'none' }} />
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isLocked ? 5 : 6} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                        No breakdown records available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>

      {/* Drawer Bottom Action Footer (Only shown when not locked) */}
      {!isLocked && (
        <Box
          sx={{
            p: '12px 12px 16px 16px',
            display: 'flex',
            justifyContent: 'flex-end',
            bgcolor: '#FFFFFF'
          }}
        >
          <Button
            onClick={handleLockClick}
            variant="contained"
            sx={{
              textTransform: 'none',
              bgcolor: '#644EE5',
              color: '#FFFFFF',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '24px',
              letterSpacing: '0%',
              width: '64px',
              height: '36px',
              minWidth: '64px',
              borderRadius: '6px',
              p: '6px 8px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#5038DE',
                boxShadow: 'none'
              }
            }}
          >
            Lock
          </Button>
        </Box>
      )}
      {/* Deduction Override Popup Modal */}
      <DeductionOverrideModal
        open={overrideModalOpen}
        onClose={handleCloseOverride}
        record={selectedRecordForOverride}
        departmentName={department}
        onOverrideSuccess={handleOverrideSuccess}
        employeeList={details}
      />
    </Drawer>
  );
};

DepartmentDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  departmentData: PropTypes.object,
  departmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onLock: PropTypes.func
};

export default DepartmentDetailsModal;
