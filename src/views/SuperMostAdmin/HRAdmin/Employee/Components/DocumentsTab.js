import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Grid, IconButton } from '@mui/material';
import { IconFileText, IconDownload } from '@tabler/icons-react';

const DEFAULT_DOCUMENTS = [
  { name: 'Aadhaar Card.pdf', size: '1.2 MB', date: '12 Jan 2021' },
  { name: 'PAN Card.pdf', size: '850 KB', date: '12 Jan 2021' },
  { name: 'Medical Council Registration.pdf', size: '2.4 MB', date: '15 Jan 2021' },
  { name: 'Offer Letter Signed.pdf', size: '1.8 MB', date: '10 Jan 2021' }
];

const DocumentsTab = ({ documents = DEFAULT_DOCUMENTS }) => {
  const docList = Array.isArray(documents) && documents.length > 0 ? documents : DEFAULT_DOCUMENTS;

  return (
    <Box>
      <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', mb: 2 }}>Uploaded Documents</Typography>
      <Grid container spacing={2}>
        {docList.map((doc, idx) => (
          <Grid item xs={12} sm={6} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#FFFFFF'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <IconFileText size={24} color="#644EE5" style={{ flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    {doc.name}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: '11px', color: '#64748B' }}>
                    {doc.size} {doc.date ? `· Uploaded ${doc.date}` : ''}
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" sx={{ color: '#64748B', flexShrink: 0, ml: 1 }}>
                <IconDownload size={18} />
              </IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

DocumentsTab.propTypes = {
  documents: PropTypes.array
};

export default DocumentsTab;
