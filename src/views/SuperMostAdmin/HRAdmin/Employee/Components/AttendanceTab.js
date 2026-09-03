import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';

const LEGENDS = [
  { label: 'P (Present)', bgcolor: '#DCFCE7', color: '#BBF7D0' },
  { label: 'A (Absent)', bgcolor: '#FEE2E2', color: '#FCA5A5' },
  { label: 'O (Weekly Off)', bgcolor: '#F1F5F9', color: '#E2E8F0' },
  { label: 'HD (Half Day)', bgcolor: '#FEF3C7', color: '#FDE68A' },
  { label: 'L (Leave)', bgcolor: '#DBEAFE', color: '#93C5FD' },
  { label: 'H (Holiday)', bgcolor: '#F1F5F9', color: '#E2E8F0' },
  { label: 'OT (Overtime)', bgcolor: '#EDE9FE', color: '#C4B5FD' }
];

const STATUS_COLOR_MAP = {
  P: { bgcolor: '#DCFCE7', color: '#15803D', border: '#BBF7D0' },
  A: { bgcolor: '#FEE2E2', color: '#B91C1C', border: '#FCA5A5' },
  O: { bgcolor: '#F1F5F9', color: '#475569', border: '#E2E8F0' },
  HD: { bgcolor: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  L: { bgcolor: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
  H: { bgcolor: '#F1F5F9', color: '#475569', border: '#E2E8F0' },
  OT: { bgcolor: '#EDE9FE', color: '#6B21A8', border: '#C4B5FD' }
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const AttendanceTab = ({ attendanceData, attendanceYear, loadingAttendance }) => {
  if (loadingAttendance) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          gap: 1.5
        }}
      >
        <CircularProgress size={28} sx={{ color: '#644EE5' }} />
        <Typography
          sx={{
            fontSize: '14px',
            color: '#64748B',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Loading attendance records...
        </Typography>
      </Box>
    );
  }

  if (!attendanceData || !attendanceData.months || attendanceData.months.length === 0) {
    return (
      <Box
        sx={{
          py: 8,
          px: 3,
          textAlign: 'center',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF'
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#64748B',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          No Attendance Record Available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header: Year + Legends */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: '12px'
        }}
      >
        {/* Year Label */}
        <Typography
          sx={{
            px: '10px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#0F172A',
            fontFamily: 'Inter, sans-serif',
            lineHeight: '100%'
          }}
        >
          {attendanceData?.year || attendanceYear || 2026}
        </Typography>

        {/* Legend List */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          {LEGENDS.map((legend, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  bgcolor: legend.bgcolor,
                  border: `1px solid ${legend.color}`
                }}
              />
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#1A1D1F',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '100%'
                }}
              >
                {legend.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Attendance Matrix Table */}
      <TableContainer
        sx={{
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          overflowX: 'auto'
        }}
      >
        <Table sx={{ minWidth: 1060, borderCollapse: 'collapse' }} size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#FFFFFF' }}>
              <TableCell
                sx={{
                  width: '110px',
                  minWidth: '110px',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#0F172A',
                  borderBottom: '1px solid #E2E8F0',
                  borderRight: '1px solid #E2E8F0',
                  lineHeight: '100%',
                  py: '14px',
                  px: 2,
                  fontFamily: 'Inter, sans-serif',
                  bgcolor: '#F8FAFC'
                }}
              >
                Month
              </TableCell>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <TableCell
                  key={day}
                  align="center"
                  sx={{
                    minWidth: '28px',
                    width: '28px',
                    fontWeight: 600,
                    fontSize: '11px',
                    color: '#1A1D1F',
                    borderBottom: '1px solid #E2E8F0',
                    lineHeight: '100%',
                    bgcolor: '#F8FAFC',
                    borderRight: day < 31 ? '1px solid #E2E8F0' : 'none',
                    p: '8px 2px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {MONTH_NAMES.map((monthName, mIdx) => {
              // Find month in attendanceData.months
              const mObj = attendanceData?.months?.find(
                (m, idx) => m?.month === mIdx + 1 || idx === mIdx || m?.name?.toLowerCase() === monthName.toLowerCase()
              );

              const getStatus = (day) => {
                if (!mObj?.days || !Array.isArray(mObj.days)) return null;
                const dayObj = mObj.days.find((d, idx) => d?.day === day || idx + 1 === day);
                if (!dayObj) return null;
                if (dayObj.flag && dayObj.flag !== 'null' && dayObj.flag !== '-') {
                  return dayObj.flag.toUpperCase();
                }
                if (dayObj.overtime) {
                  return 'OT';
                }
                return null;
              };

              return (
                <TableRow key={monthName} sx={{ height: '42px' }}>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: '13px',
                      color: '#1E293B',
                      borderBottom: mIdx < 11 ? '1px solid #E2E8F0' : 'none',
                      borderRight: '1px solid #E2E8F0',
                      py: '19px',
                      px: 2,
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {monthName}
                  </TableCell>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const status = getStatus(day);
                    const conf = status ? STATUS_COLOR_MAP[status] : null;
                    return (
                      <TableCell
                        key={day}
                        align="center"
                        sx={{
                          borderBottom: mIdx < 11 ? '1px solid #E2E8F0' : 'none',
                          borderRight: day < 31 ? '1px solid #E2E8F0' : 'none',
                          p: '4px 2px',
                          height: '42px'
                        }}
                      >
                        {conf ? (
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '26px',
                              height: '26px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 700,
                              bgcolor: conf.bgcolor,
                              color: conf.color,
                              border: `1px solid ${conf.border}`,
                              fontFamily: 'Inter, sans-serif',
                              lineHeight: '100%'
                            }}
                          >
                            {status}
                          </Box>
                        ) : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

AttendanceTab.propTypes = {
  attendanceData: PropTypes.object,
  attendanceYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  loadingAttendance: PropTypes.bool
};

export default AttendanceTab;
