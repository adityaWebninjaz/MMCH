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
      
    </Box>
  );
};

DocumentsTab.propTypes = {
  documents: PropTypes.array
};

export default DocumentsTab;
