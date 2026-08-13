import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Button,
  FormLabel
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import styles from '../devices.module.css';

const AddDeviceModal = ({ open, onClose, onAddDevice, nextDeviceIndex }) => {
  const [formData, setFormData] = useState({
    id: '',
    location: '',
    usersAssigned: '',
    status: 'Online'
  });

  useEffect(() => {
    if (open) {
      const formattedId = `DEV-${String(nextDeviceIndex || 1).padStart(3, '0')}`;
      setFormData({
        id: formattedId,
        location: '',
        usersAssigned: '',
        status: 'Online'
      });
    }
  }, [open, nextDeviceIndex]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddDevice(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '12px', maxWidth: '520px' }
      }}
    >
      <DialogTitle className={styles.modalTitle}>
        Add New Device
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className={styles.modalContent} dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormLabel htmlFor="device-id-input" className={styles.formLabel}>
                Device ID <span style={{ color: 'red' }}>*</span>
              </FormLabel>
              <TextField
                id="device-id-input"
                name="deviceId"
                fullWidth
                size="small"
                placeholder="e.g. DEV-009"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                required
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
                placeholder="e.g. Laboratory, Blood Bank"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <FormLabel htmlFor="device-users-input" className={styles.formLabel}>
                Users Assigned
              </FormLabel>
              <TextField
                id="device-users-input"
                name="usersAssigned"
                fullWidth
                size="small"
                type="number"
                placeholder="e.g. 10"
                value={formData.usersAssigned}
                onChange={(e) => handleInputChange('usersAssigned', e.target.value)}
              />
            </Grid> */}
            {/* <Grid item xs={12} sm={6}>
              <FormLabel htmlFor="device-status-select" className={styles.formLabel}>
                Status
              </FormLabel>
              <FormControl fullWidth size="small">
                <Select
                  id="device-status-select"
                  name="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}
          </Grid>
        </DialogContent>
        <DialogActions className={styles.modalActions}>
          <Button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" className={styles.saveBtn}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddDeviceModal;
