import React from 'react';
import {
  Box,
  Typography,
  Paper
} from '@mui/material';
import { IconFileText } from '@tabler/icons-react';

const StatutoryCompliance = () => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '#FFFFFF',
        p: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: { xs: '22px', sm: '26px' },
            fontWeight: 700,
            color: '#0F172A',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Statutory Compliance
        </Typography>
        <Typography
          sx={{
            fontSize: '14px',
            color: '#64748B',
            fontFamily: 'Inter, sans-serif',
            mt: 0.5
          }}
        >
          PF, ESI, TDS, Professional Tax, and statutory compliance filings
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          textAlign: 'center',
          minHeight: '280px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#644EE5',
            mb: 1
          }}
        >
          <IconFileText size={28} />
        </Box>
        <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>
          Statutory Compliance View
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#64748B', maxWidth: '460px' }}>
          Ready for statutory filing reports, compliance tracking, and challan records.
        </Typography>
      </Paper>
    </Box>
  );
};

export default StatutoryCompliance;
