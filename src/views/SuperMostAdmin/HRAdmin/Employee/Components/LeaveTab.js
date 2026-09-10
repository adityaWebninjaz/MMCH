import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const LEAVE_DATES = ['15 March 2025', '14 March 2026', '01 Jan 2026'];

const STATUS_OPTIONS = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' }
];

const DEFAULT_LEAVE_ROWS = [
  { type: 'CL', from: '14 March 2026', to: '14 March 2026', days: 5, status: 'Approved' },
  { type: 'EL', from: '10 April 2026', to: '12 April 2026', days: 3, status: 'Pending' },
  { type: 'CL', from: '01 May 2026', to: '02 May 2026', days: 2, status: 'Rejected' },
  { type: 'SL', from: '18 June 2026', to: '19 June 2026', days: 2, status: 'Cancelled' }
];

const LeaveTab = ({
  leaveDate = '15 March 2025',
  setLeaveDate,
  leaveMonth = 'June',
  setLeaveMonth,
  leaveStatus = 'ALL',
  setLeaveStatus,
  filterSelectSx,
  leaveRows = DEFAULT_LEAVE_ROWS,
  loading = false
}) => {
  const [internalStatus, setInternalStatus] = useState('ALL');
  const currentStatus = leaveStatus !== undefined ? leaveStatus : internalStatus;

  const handleStatusChange = (e) => {
    const val = e.target.value;
    if (setLeaveStatus) {
      setLeaveStatus(val);
    } else {
      setInternalStatus(val);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = String(status || '')
      .trim()
      .toUpperCase();
    switch (s) {
      case 'APPROVED':
        return {
          bgcolor: '#DCFCE7',
          color: '#15803D'
        };
      case 'PENDING':
        return {
          bgcolor: '#FEF3C7',
          color: '#92400E'
        };
      case 'REJECTED':
        return {
          bgcolor: '#FEE2E2',
          color: '#B91C1C'
        };
      case 'CANCELLED':
        return {
          bgcolor: '#F1F5F9',
          color: '#64748B'
        };
      default:
        return {
          bgcolor: '#F1F5F9',
          color: '#475569'
        };
    }
  };

  const formatStatusDisplay = (status) => {
    if (!status) return '-';
    const s = String(status).trim();
    if (s.toUpperCase() === 'PENDING') return 'Pending';
    if (s.toUpperCase() === 'APPROVED') return 'Approved';
    if (s.toUpperCase() === 'REJECTED') return 'Rejected';
    if (s.toUpperCase() === 'CANCELLED') return 'Cancelled';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const rowsToDisplay = useMemo(() => {
    const baseRows = Array.isArray(leaveRows) ? leaveRows : DEFAULT_LEAVE_ROWS;
    if (!currentStatus || currentStatus === '--' || currentStatus === 'ALL') {
      return baseRows;
    }
    const targetStatus = currentStatus.toUpperCase();
    return baseRows.filter((row) => {
      const rowStatus = String(row.status || '')
        .trim()
        .toUpperCase();
      return rowStatus === targetStatus;
    });
  }, [leaveRows, currentStatus]);

  return (
    <Box>
      {/* Top Filters: Date, Month & Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {/* Date Dropdown */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 400,
              color: '#1E293B',
              mb: '6px',
              lineHeight: '18px',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Date
          </Typography>
          <Select
            size="small"
            value={leaveDate}
            onChange={(e) => setLeaveDate && setLeaveDate(e.target.value)}
            IconComponent={() => (
              <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
            )}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '6px !important'
                }
              }
            }}
            sx={filterSelectSx}
          >
            {LEAVE_DATES.map((d) => (
              <MenuItem key={d} value={d} sx={{ fontSize: '13px' }}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Month Dropdown */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 400,
              color: '#1E293B',
              mb: '6px',
              lineHeight: '18px',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Month
          </Typography>
          <Select
            size="small"
            value={leaveMonth}
            onChange={(e) => setLeaveMonth && setLeaveMonth(e.target.value)}
            IconComponent={() => (
              <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
            )}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '6px !important'
                }
              }
            }}
            sx={filterSelectSx}
          >
            {MONTHS.map((m) => (
              <MenuItem key={m} value={m} sx={{ fontSize: '13px' }}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Status Dropdown */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 400,
              color: '#1E293B',
              mb: '6px',
              lineHeight: '18px',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Status
          </Typography>
          <Select
            size="small"
            value={currentStatus}
            onChange={handleStatusChange}
            IconComponent={() => (
              <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
            )}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '6px !important'
                }
              }
            }}
            sx={filterSelectSx}
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '13px' }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Leave Table */}
      <TableContainer
        sx={{
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          bgcolor: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell
                sx={{
                  py: '12px',
                  px: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16151C',
                  fontFamily: 'Inter, sans-serif',
                  borderBottom: '1px solid #E2E8F0'
                }}
              >
                Type
              </TableCell>
              <TableCell
                sx={{
                  py: '12px',
                  px: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16151C',
                  fontFamily: 'Inter, sans-serif',
                  borderBottom: '1px solid #E2E8F0'
                }}
              >
                From
              </TableCell>
              <TableCell
                sx={{
                  py: '12px',
                  px: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16151C',
                  fontFamily: 'Inter, sans-serif',
                  borderBottom: '1px solid #E2E8F0'
                }}
              >
                To
              </TableCell>
              <TableCell
                sx={{
                  py: '12px',
                  px: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16151C',
                  fontFamily: 'Inter, sans-serif',
                  borderBottom: '1px solid #E2E8F0'
                }}
              >
                Days
              </TableCell>
              <TableCell
                sx={{
                  py: '12px',
                  px: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#16151C',
                  fontFamily: 'Inter, sans-serif',
                  borderBottom: '1px solid #E2E8F0'
                }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 6, textAlign: 'center', borderBottom: 'none' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                    <CircularProgress size={26} sx={{ color: '#644EE5' }} />
                    <Typography sx={{ fontSize: '13px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                      Loading leave records...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : rowsToDisplay.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  sx={{
                    py: 5,
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#64748B',
                    fontFamily: 'Inter, sans-serif',
                    borderBottom: 'none'
                  }}
                >
                  No leave records found
                </TableCell>
              </TableRow>
            ) : (
              rowsToDisplay.map((row, idx, arr) => {
                const badgeStyle = getStatusBadgeStyle(row.status);
                return (
                  <TableRow
                    key={idx}
                    sx={{
                      '&:hover': { bgcolor: '#F8FAFC' }
                    }}
                  >
                    <TableCell
                      sx={{
                        py: '10px !important',
                        px: '24px !important',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#000000',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: '100%',
                        borderBottom: idx === arr.length - 1 ? 'none !important' : '1px solid #E2E8F0 !important'
                      }}
                    >
                      {row.type}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: '10px !important',
                        px: '24px !important',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#000000',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: '100%',
                        borderBottom: idx === arr.length - 1 ? 'none !important' : '1px solid #E2E8F0 !important'
                      }}
                    >
                      {row.from}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: '10px !important',
                        px: '24px !important',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#000000',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: '100%',
                        borderBottom: idx === arr.length - 1 ? 'none !important' : '1px solid #E2E8F0 !important'
                      }}
                    >
                      {row.to}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: '10px !important',
                        px: '24px !important',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#000000',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: '100%',
                        borderBottom: idx === arr.length - 1 ? 'none !important' : '1px solid #E2E8F0 !important'
                      }}
                    >
                      {row.days}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: '10px !important',
                        px: '24px !important',
                        borderBottom: idx === arr.length - 1 ? 'none !important' : '1px solid #E2E8F0 !important'
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          px: '10px',
                          py: '4px',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: 600,
                          bgcolor: badgeStyle.bgcolor,
                          color: badgeStyle.color,
                          lineHeight: '100%',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        {formatStatusDisplay(row.status)}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

LeaveTab.propTypes = {
  leaveDate: PropTypes.string,
  setLeaveDate: PropTypes.func,
  leaveMonth: PropTypes.string,
  setLeaveMonth: PropTypes.func,
  leaveStatus: PropTypes.string,
  setLeaveStatus: PropTypes.func,
  filterSelectSx: PropTypes.object,
  leaveRows: PropTypes.array,
  loading: PropTypes.bool
};

export default LeaveTab;
