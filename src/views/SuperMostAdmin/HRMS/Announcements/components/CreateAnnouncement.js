import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  FormControl,
  FormLabel,
  OutlinedInput,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  CircularProgress,
  IconButton
} from '@mui/material';
import { IconCalendar, IconArrowLeft } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { createAnnouncement } from '../services/announcementService';

const CreateAnnouncement = () => {
  const navigate = useNavigate();
  const expiryDateInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    targetAudience: 'All Employees', // 'All Employees' or 'Department-wise'
    allEmployees: true,
    departmentWise: false,
    content: '',
    expiryDate: ''
  });

  const [loading, setLoading] = useState(false);

  const handleTitleChange = (e) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleAudienceChange = (type) => {
    if (type === 'all') {
      setFormData((prev) => ({
        ...prev,
        allEmployees: true,
        departmentWise: false,
        targetAudience: 'All Employees'
      }));
    } else if (type === 'department') {
      setFormData((prev) => ({
        ...prev,
        allEmployees: false,
        departmentWise: true,
        targetAudience: 'Department-Wise'
      }));
    }
  };

  const handleContentChange = (e) => {
    setFormData((prev) => ({ ...prev, content: e.target.value }));
  };

  const handleExpiryDateChange = (e) => {
    setFormData((prev) => ({ ...prev, expiryDate: e.target.value }));
  };

  const formattedDisplayExpiryDate = formData.expiryDate
    ? new Date(formData.expiryDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'Select date (Optional)';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Announcement Title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Announcement Content is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        targetAudience: formData.targetAudience,
        target_audience: formData.allEmployees ? 'all_employees' : 'department_wise',
        description: formData.content.trim(),
        content: formData.content.trim(),
        expiryDate: formData.expiryDate || null,
        expiry_date: formData.expiryDate || null,
        publishedDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        }),
        date: new Date().toISOString().split('T')[0]
      };

      const response = await createAnnouncement(payload);
      if (response && response.success) {
        toast.success(response.message || 'Announcement published successfully');
        navigate('/supermostadmin/hrms/announcements');
      } else {
        toast.error(response?.message || 'Failed to publish announcement');
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
      toast.error(err?.response?.data?.message || 'An error occurred while publishing announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', bgcolor: '#ffffff', minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Top Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: '24px'
        }}
      >
        <IconButton
          onClick={() => navigate('/supermostadmin/hrms/announcements')}
          size="small"
          sx={{
            p: '4px',
            color: '#64748B',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' }
          }}
        >
          <IconArrowLeft size={18} />
        </IconButton>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: '#0F172A',
            fontSize: { xs: '20px', sm: '24px' },
            lineHeight: '100%',
            m: 0,
            p: 0
          }}
        >
          Create New Announcement
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        {/* Main Card Container */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            bgcolor: '#ffffff',
            p: { xs: 2.5, sm: 3.5, md: 4 },
            maxWidth: '1200px',
            width: '100%',
            mb: 3
          }}
        >
          {/* 1. Announcement Title */}
          <Box sx={{ mb: 3.5 }}>
            <FormLabel
              sx={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#0F172A',
                mb: 1
              }}
            >
              Announcement Title <span style={{ color: '#644EE5' }}>*</span>
            </FormLabel>
            <OutlinedInput
              fullWidth
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter a clear, descriptive title"
              required
              disabled={loading}
              sx={{
                borderRadius: '6px',
                bgcolor: '#ffffff',
                height: '40px',
                fontSize: '14px',
                color: '#0F172A',
                fontFamily: 'Inter, sans-serif',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0',
                  borderRadius: '6px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#644EE5',
                  borderWidth: '1.5px'
                }
              }}
            />
          </Box>

          {/* 2. Target Audience */}
          <Box sx={{ mb: 3.5 }}>
            <FormLabel
              sx={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#0F172A',
                mb: 1
              }}
            >
              Target Audience
            </FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.allEmployees}
                    onChange={() => handleAudienceChange('all')}
                    disabled={loading}
                    sx={{
                      p: '4px',
                      mr: '4px',
                      color: '#CBD5E1',
                      '&.Mui-checked': {
                        color: '#644EE5'
                      }
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#0F172A'
                    }}
                  >
                    All Employees
                  </Typography>
                }
                sx={{ m: 0 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.departmentWise}
                    onChange={() => handleAudienceChange('department')}
                    disabled={loading}
                    sx={{
                      p: '4px',
                      mr: '4px',
                      color: '#CBD5E1',
                      '&.Mui-checked': {
                        color: '#644EE5'
                      }
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#0F172A'
                    }}
                  >
                    Department-wise
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>
          </Box>

          {/* 3. Announcement Content */}
          <Box sx={{ mb: 3.5 }}>
            <FormLabel
              sx={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#0F172A',
                mb: 1
              }}
            >
              Announcement Content <span style={{ color: '#644EE5' }}>*</span>
            </FormLabel>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Type or paste your announcement content here. You can format the message to convey important notices."
              required
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  bgcolor: '#ffffff',
                  fontSize: '14px',
                  lineHeight: '22px',
                  fontFamily: 'Inter, sans-serif',
                  p: '12px 14px',
                  '& fieldset': { borderColor: '#E2E8F0', borderRadius: '6px' },
                  '&:hover fieldset': { borderColor: '#94A3B8' },
                  '&.Mui-focused fieldset': { borderColor: '#644EE5', borderWidth: '1.5px' }
                }
              }}
            />
          </Box>

          {/* 4. Expiry Date */}
          <Box sx={{ mb: 1 }}>
            <FormLabel
              sx={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#0F172A',
                mb: 1
              }}
            >
              Expiry Date
            </FormLabel>
            <Box sx={{ position: 'relative', width: { xs: '100%', sm: '240px' } }}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (expiryDateInputRef.current) {
                    if (typeof expiryDateInputRef.current.showPicker === 'function') {
                      expiryDateInputRef.current.showPicker();
                    } else {
                      expiryDateInputRef.current.click();
                    }
                  }
                }}
                endIcon={<IconCalendar size={18} stroke={1.75} color="#64748B" />}
                sx={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '6px !important',
                  border: '1px solid #E2E8F0',
                  bgcolor: '#ffffff',
                  color: formData.expiryDate ? '#0F172A' : '#94A3B8',
                  fontSize: '13px',
                  fontWeight: 400,
                  fontFamily: 'Inter, sans-serif',
                  textTransform: 'none',
                  px: '14px',
                  py: '8px',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                  '&:hover': {
                    borderColor: '#94A3B8',
                    bgcolor: '#ffffff'
                  }
                }}
              >
                {formattedDisplayExpiryDate}
              </Button>
              <input
                type="date"
                ref={expiryDateInputRef}
                value={formData.expiryDate}
                onChange={handleExpiryDateChange}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                  pointerEvents: 'none'
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Bottom Action: Publish Announcement Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            sx={{
              width: '191px',
              height: '38px',
              borderRadius: '6px',
              bgcolor: '#644EE5',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '24px',
              textTransform: 'none',
              boxShadow: 'none',
              px: '16px',
              py: '6px',
              '&:hover': {
                bgcolor: '#523BCB',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Publish Announcement'}
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate('/supermostadmin/hrms/announcements')}
            disabled={loading}
            sx={{
              height: '38px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              color: '#475569',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              px: '18px',
              py: '6px',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#CBD5E1'
              }
            }}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateAnnouncement;
