import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem } from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const LEAVE_DATES = ['15 March 2025', '14 March 2026', '01 Jan 2026'];

const DEFAULT_LEAVE_ROWS = [
  { type: 'CL', from: '14 March 2026', to: '14 March 2026', days: 5, status: 'Approved' },
  { type: 'EL', from: '14 March 2026', to: '14 March 2026', days: 5, status: 'Approved' },
  { type: 'CL', from: '14 March 2026', to: '14 March 2026', days: 5, status: 'Approved' }
];

const LeaveTab = ({
  leaveDate = '15 March 2025',
  setLeaveDate,
  leaveMonth = 'June',
  setLeaveMonth,
  filterSelectSx,
  leaveRows = DEFAULT_LEAVE_ROWS
}) => {
  return (
    <Box>
      {/* Top Filters: Date & Month */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
            {leaveRows.map((row, idx, arr) => (
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
                      px: 1.5,
                      py: '4px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      bgcolor: row.status === 'Approved' ? '#DCFCE7' : row.status === 'Pending' ? '#FEF3C7' : '#FEE2E2',
                      color: row.status === 'Approved' ? '#15803D' : row.status === 'Pending' ? '#92400E' : '#B91C1C',
                      border: `1px solid ${row.status === 'Approved' ? '#BBF7D0' : row.status === 'Pending' ? '#FDE68A' : '#FCA5A5'}`,
                      lineHeight: '100%',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {row.status}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
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
  filterSelectSx: PropTypes.object,
  leaveRows: PropTypes.array
};

export default LeaveTab;
