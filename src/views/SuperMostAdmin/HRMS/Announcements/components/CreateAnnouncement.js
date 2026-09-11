import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  FormControl,
  FormLabel,
  OutlinedInput,
  TextField,
  Paper,
  CircularProgress,
  IconButton,
  Chip,
  Autocomplete,
  Checkbox,
  FormHelperText
} from '@mui/material';
import { IconCalendar, IconArrowLeft } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { createAnnouncement, getDepartments } from '../services/announcementService';

const ALL_EMPLOYEES_OPTION = { id: 'ALL', name: 'All Employees' };

const CreateAnnouncement = () => {
  const navigate = useNavigate();
  const expiryDateInputRef = useRef(null);
  const todayString = new Date().toISOString().split('T')[0];

  // Departments State
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedAudience, setSelectedAudience] = useState([ALL_EMPLOYEES_OPTION]);
  const [content, setContent] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartmentsList();
  }, []);

  const fetchDepartmentsList = async () => {
    setLoadingDepartments(true);
    try {
      const list = await getDepartments();
      setDepartments(list || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
      toast.error('Failed to load departments');
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Combine "All Employees" option with fetched department options from API
  const audienceOptions = useMemo(() => {
    return [ALL_EMPLOYEES_OPTION, ...departments];
  }, [departments]);

  const handleAudienceChange = (event, newValue) => {
    // If empty, default back to ALL_EMPLOYEES
    if (!newValue || newValue.length === 0) {
      setSelectedAudience([ALL_EMPLOYEES_OPTION]);
      return;
    }

    const lastSelected = newValue[newValue.length - 1];

    // If "All Employees" was just selected, reset selection to only ALL_EMPLOYEES
    if (lastSelected.id === 'ALL') {
      setSelectedAudience([ALL_EMPLOYEES_OPTION]);
      return;
    }

    // Otherwise filter out ALL_EMPLOYEES so only specific department options remain
    const specificDepartments = newValue.filter((item) => item.id !== 'ALL');
    if (specificDepartments.length === 0) {
      setSelectedAudience([ALL_EMPLOYEES_OPTION]);
    } else {
      setSelectedAudience(specificDepartments);
    }
  };

  const formattedDisplayExpiryDate = expiryDate
    ? new Date(expiryDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'Select Expiry Date';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Announcement Title is required');
      return;
    }

    if (!selectedAudience || selectedAudience.length === 0) {
      toast.error('Target Audience is required');
      return;
    }

    if (!content.trim()) {
      toast.error('Announcement Content is required');
      return;
    }

    if (!expiryDate) {
      toast.error('Expiry Date is required');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (expiryDate < todayStr) {
      toast.error('Expiry Date must be today or a future date');
      return;
    }

    const isAllEmployees = selectedAudience.some((item) => item.id === 'ALL') || selectedAudience.length === 0;
    const departmentIds = isAllEmployees ? [] : selectedAudience.map((item) => item.id);

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        message: content.trim(),
        content: content.trim(),
        audience: isAllEmployees ? 'ALL' : 'DEPARTMENTS',
        department_ids: departmentIds,
        expiry_date: expiryDate
      };

      const response = await createAnnouncement(payload);
      if (response && response.success) {
        toast.success(response.message || 'Announcement published successfully');
        navigate('/supermostadmin/hrms/announcements');
      } else {
        toast.error(response?.message || 'Failed to publish announcement');
      }
    } catch (err) {
      console.error('Error publishing announcement:', err);
      toast.error(err?.message || 'An error occurred while publishing announcement');
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

      <form onSubmit={handleSubmit} noValidate>
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, descriptive title"
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

          {/* 2. Target Audience Multi-Select Dropdown */}
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
              Target Audience <span style={{ color: '#644EE5' }}>*</span>
            </FormLabel>

            <FormControl fullWidth size="small" sx={{ maxWidth: { xs: '100%', md: '750px' } }}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                id="target-audience-multiselect"
                componentsProps={{
                  paper: {
                    sx: {
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.08)',
                      mt: '4px',
                      overflow: 'hidden'
                    }
                  }
                }}
                ListboxProps={{
                  sx: {
                    maxHeight: '320px',
                    overflowY: 'auto',
                    p: '6px',
                    '& .MuiAutocomplete-option': {
                      borderRadius: '6px',
                      py: '6px',
                      px: '10px',
                      mb: '2px',
                      '&[aria-selected="true"]': {
                        bgcolor: '#F1F5F9'
                      },
                      '&:hover': {
                        bgcolor: '#F8FAFC'
                      }
                    }
                  }
                }}
                options={audienceOptions}
                loading={loadingDepartments}
                value={selectedAudience}
                onChange={handleAudienceChange}
                getOptionLabel={(option) => option.name || ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option.id}>
                    <Checkbox
                      size="small"
                      checked={selected}
                      sx={{
                        mr: 1,
                        p: '2px',
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#644EE5' }
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontFamily: 'Inter, sans-serif',
                        color: option.id === 'ALL' ? '#644EE5' : '#0F172A',
                        fontWeight: option.id === 'ALL' ? 600 : 400
                      }}
                    >
                      {option.name}
                    </Typography>
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name}
                      size="small"
                      sx={{
                        height: '26px',
                        fontSize: '12px',
                        bgcolor: option.id === 'ALL' ? '#F1F5F9' : '#EEF2FF',
                        color: option.id === 'ALL' ? '#475569' : '#4F46E5',
                        fontWeight: 500,
                        borderRadius: '4px',
                        border: option.id === 'ALL' ? '1px solid #E2E8F0' : '1px solid #C7D2FE'
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={
                      loadingDepartments
                        ? 'Loading departments...'
                        : selectedAudience.length === 0
                        ? 'Select audience or search departments...'
                        : ''
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '6px',
                        bgcolor: '#ffffff',
                        fontSize: '14px',
                        minHeight: '42px',
                        p: '4px 8px !important',
                        '& fieldset': { borderColor: '#E2E8F0', borderRadius: '6px' },
                        '&:hover fieldset': { borderColor: '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: '#644EE5', borderWidth: '1.5px' }
                      }
                    }}
                  />
                )}
              />
              <FormHelperText sx={{ mx: 0, mt: 0.5, color: '#64748B', fontSize: '12px' }}>
                Select &apos;All Employees&apos; or search and choose specific departments ({departments.length} departments loaded from API)
              </FormHelperText>
            </FormControl>
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type or paste your announcement content here. You can format the message to convey important notices."
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
              Expiry Date <span style={{ color: '#644EE5' }}>*</span>
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
                  color: expiryDate ? '#0F172A' : '#94A3B8',
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
                value={expiryDate}
                min={todayString}
                onChange={(e) => setExpiryDate(e.target.value)}
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



