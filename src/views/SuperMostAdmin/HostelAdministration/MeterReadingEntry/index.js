import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const MeterReadingEntry = () => {
  return (
    <Box sx={{ width: '100%', bgcolor: '#ffffff', minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Title */}
      <Box sx={{ mb: '24px' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: '#0F172A',
            fontSize: { xs: '20px', sm: '24px' },
            lineHeight: '100%'
          }}
        >
          Meter Reading Entry
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontSize: '14px',
            mt: 1
          }}
        >
          Record and monitor electricity and utility meter readings for hostel rooms and blocks.
        </Typography>
      </Box>

      {/* Main Container */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          textAlign: 'center',
          color: '#64748B'
        }}
      >
        <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 600, mb: 1 }}>
          Meter Reading Entry Module
        </Typography>
        <Typography variant="body2">
          Meter reading entry logs and form inputs will be displayed here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default MeterReadingEntry;
