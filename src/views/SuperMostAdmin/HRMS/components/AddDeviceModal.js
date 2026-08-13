import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  Button,
  FormLabel,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import styles from '../devices.module.css';

const AddDeviceModal = ({ open, onClose, onAddDevice, submitting }) => {
  const [formData, setFormData] = useState({
    device_code: '',
    location: ''
  });

  useEffect(() => {
    if (open) {
      setFormData({
        device_code: '',
        location: ''
      });
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddDevice({
      device_code: formData.device_code.trim(),
      location: formData.location.trim()
    });
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '12px', maxWidth: '520px' }
      }}
    >
      <DialogTitle className={styles.modalTitle}>
        Add New Device
        <IconButton onClick={onClose} size="small" aria-label="close" disabled={submitting}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className={styles.modalContent} dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormLabel htmlFor="device-code-input" className={styles.formLabel}>
                Device Code <span style={{ color: 'red' }}>*</span>
              </FormLabel>
              <TextField
                id="device-code-input"
                name="device_code"
                fullWidth
                size="small"
                placeholder="e.g. Test133, BIO-GATE-01"
                value={formData.device_code}
                onChange={(e) => handleInputChange('device_code', e.target.value)}
                required
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12}>
              <FormLabel htmlFor="device-location-input" className={styles.formLabel}>
                Location <span style={{ color: 'red' }}>*</span>
              </FormLabel>
              <TextField
                id="device-location-input"
                name="location"
                fullWidth
                size="small"
                placeholder="e.g. Main Building, Admin Block"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
                disabled={submitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className={styles.modalActions}>
          <Button onClick={onClose} className={styles.cancelBtn} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" className={styles.saveBtn} disabled={submitting}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddDeviceModal;
