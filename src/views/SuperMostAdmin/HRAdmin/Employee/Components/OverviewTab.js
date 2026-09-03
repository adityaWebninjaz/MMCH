import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Grid } from '@mui/material';

const labelSx = {
  fontSize: '14px',
  color: '#334155',
  mb: 1,
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  lineHeight: '18px'
};

const valueSx = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#1E293B',
  fontFamily: 'Inter, sans-serif',
  lineHeight: '18px'
};

const sectionTitleSx = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#1E293B',
  fontFamily: 'Inter, sans-serif',
  lineHeight: '100%',
  mb: 2
};

const cardPaperSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  bgcolor: '#FFFFFF'
};

const OverviewTab = ({ empData, renderVal }) => {
  const getVal = (v) => (renderVal ? renderVal(v) : v === null || v === undefined || v === '' ? '-' : v);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Card 1: Personal Information */}
      <Box>
        <Typography sx={sectionTitleSx}>Personal Information</Typography>
        <Paper elevation={0} sx={cardPaperSx}>
          <Grid container spacing={2.5}>
            {/* Row 1 */}
            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>DoB</Typography>
              <Typography sx={valueSx}>{getVal(empData?.dob)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Gender</Typography>
              <Typography sx={valueSx}>{getVal(empData?.gender)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Mobile Number</Typography>
              <Typography sx={valueSx}>{getVal(empData?.phone)}</Typography>
            </Grid>

            {/* Row 2 */}
            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>{"Father's Name"}</Typography>
              <Typography sx={valueSx}>{getVal(empData?.fatherName)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Emergency Contact Name</Typography>
              <Typography sx={valueSx}>{getVal(empData?.emergencyContactName)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Email Address</Typography>
              <Typography sx={valueSx}>{getVal(empData?.email)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Card 2: Employment Details */}
      <Box>
        <Typography sx={sectionTitleSx}>Employment Details</Typography>
        <Paper elevation={0} sx={cardPaperSx}>
          <Grid container spacing={2.5}>
            {/* Row 1 */}
            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Department</Typography>
              <Typography sx={valueSx}>{getVal(empData?.department)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Designation</Typography>
              <Typography sx={valueSx}>{getVal(empData?.designation)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Salary Grade</Typography>
              <Typography sx={valueSx}>{getVal(empData?.salaryGrade)}</Typography>
            </Grid>

            {/* Row 2 */}
            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>HoD Assigned</Typography>
              <Typography sx={valueSx}>{getVal(empData?.hodAssigned)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Card 3: Bank Details */}
      <Box>
        <Typography sx={sectionTitleSx}>Bank Details</Typography>
        <Paper elevation={0} sx={cardPaperSx}>
          <Grid container spacing={2.5}>
            {/* Row 1 */}
            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Salary Account Bank</Typography>
              <Typography sx={valueSx}>{getVal(empData?.bankName)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Account Number</Typography>
              <Typography sx={valueSx}>{getVal(empData?.accountNumber)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>PF Number</Typography>
              <Typography sx={valueSx}>{getVal(empData?.pfNumber)}</Typography>
            </Grid>

            {/* Row 2 */}
            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Branch/IFSC</Typography>
              <Typography sx={valueSx}>{getVal(empData?.ifsc ? empData.ifsc.toUpperCase() : empData?.ifsc)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>PAN</Typography>
              <Typography sx={valueSx}>{getVal(empData?.pan ? empData.pan.toUpperCase() : empData?.pan)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Aadhaar Number</Typography>
              <Typography sx={valueSx}>{getVal(empData?.aadhaar)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Card 4: Address Details */}
      <Box>
        <Typography sx={sectionTitleSx}>Address Details</Typography>
        <Paper elevation={0} sx={cardPaperSx}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Alternate Phone Number</Typography>
              <Typography sx={valueSx}>{getVal(empData?.alternatePhone)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Address</Typography>
              <Typography sx={valueSx}>{getVal(empData?.address)}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography sx={labelSx}>Pin Code</Typography>
              <Typography sx={valueSx}>{getVal(empData?.pinCode)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

OverviewTab.propTypes = {
  empData: PropTypes.object.isRequired,
  renderVal: PropTypes.func
};

export default OverviewTab;
