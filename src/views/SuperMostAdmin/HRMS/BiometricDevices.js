import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import AddDeviceModal from './components/AddDeviceModal';
import styles from './devices.module.css';
import { getDevices, createDevice } from '../../../services/deviceServices';

const BiometricDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const data = await getDevices();
        setDevices(data || []);
      } catch (err) {
        console.error('Failed to load devices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    if (!submitting) {
      setOpenAddModal(false);
    }
  };

  const handleAddDevice = async (formData) => {
    const deviceCode = formData.device_code?.trim() || formData.deviceCode?.trim() || formData.id?.trim();
    const location = formData.location?.trim();

    if (!deviceCode || !location) {
      toast.error('Device Code and Location are required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createDevice({
        device_code: deviceCode,
        location: location
      });

      if (response && response.success) {
        toast.success(response.message || `Device ${deviceCode} added successfully`);
        // Refresh device list from server so that the new device is visible in the table instant 
        const updated = await getDevices();
        setDevices(updated || []);
        setOpenAddModal(false);
      } else {
        toast.error(response?.message || 'Failed to add device');
      }
    } catch (err) {
      toast.error(err?.message || 'An error occurred while adding device');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className={styles.pageContainer}>
      {/* Top Header */}
      <Box className={styles.headerSection}>
        <Box className={styles.titleArea}>
          <Typography component="h1" className={styles.pageTitle}>
            Devices
          </Typography>
          <Typography className={styles.pageSubtitle}>
            Monitor and manage biometric smart terminals across PMCH departments.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className={styles.addDeviceButton}
          onClick={handleOpenAddModal}
        >
          Add Device
        </Button>
      </Box>

      {/* Table Card */}
      <Box className={styles.tableCard}>
        <TableContainer className={styles.tableContainer}>
          <Table className={styles.table}>
            <TableHead className={styles.tableHead}>
              <TableRow>
                <TableCell className={`${styles.tableHeadCell} ${styles.colDeviceId}`}>
                  Device ID
                </TableCell>
                <TableCell className={`${styles.tableHeadCell} ${styles.colLocation}`}>
                  Location
                </TableCell>
                <TableCell className={`${styles.tableHeadCell} ${styles.colUserAssigned}`}>
                  User Assigned
                </TableCell>
                <TableCell className={`${styles.tableHeadCell} ${styles.colStatus}`}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" style={{ padding: '32px' }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" style={{ padding: '32px' }}>
                    No devices found.
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id} className={styles.tableRow}>
                    <TableCell className={`${styles.tableCell} ${styles.tableCellFirst}`}>
                      <span className={styles.deviceIdText}>{device.deviceCode || device.id}</span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.locationText}>{device.location}</span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.userAssignedText}>
                        {device.usersAssigned || `${device.users_assigned_count || 0} Employees`}
                      </span>
                    </TableCell>
                    <TableCell className={`${styles.tableCell} ${styles.tableCellLast}`}>
                      <span
                        className={`${styles.statusBadge} ${
                          (device.status || (device.isActive ? 'Online' : 'Offline')).toLowerCase() === 'online'
                            ? styles.statusOnline
                            : styles.statusOffline
                        }`}
                      >
                        {device.status || (device.isActive ? 'Online' : 'Offline')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add Device Modal */}
      <AddDeviceModal
        open={openAddModal}
        onClose={handleCloseAddModal}
        onAddDevice={handleAddDevice}
        submitting={submitting}
      />
    </Box>
  );
};

export default BiometricDevices;
