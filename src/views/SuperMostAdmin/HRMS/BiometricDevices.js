import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import AddDeviceModal from './components/AddDeviceModal';
import styles from './devices.module.css';

const initialDevices = [
  { id: 'DEV-001', location: 'Main Entrance', usersAssigned: '12 Employees', status: 'Online' },
  { id: 'DEV-002', location: 'ICU Ward', usersAssigned: '8 Employees', status: 'Online' },
  { id: 'DEV-003', location: 'Emergency Block', usersAssigned: '15 Employees', status: 'Online' },
  { id: 'DEV-004', location: 'Pharmacy', usersAssigned: '4 Employees', status: 'Offline' },
  { id: 'DEV-005', location: 'Admin Office', usersAssigned: '6 Employees', status: 'Online' },
  { id: 'DEV-006', location: 'Cafeteria', usersAssigned: '3 Employees', status: 'Offline' },
  { id: 'DEV-007', location: 'Radiology', usersAssigned: '5 Employees', status: 'Online' },
  { id: 'DEV-008', location: 'OPD Wing', usersAssigned: '10 Employees', status: 'Online' }
];

const BiometricDevices = () => {
  const [devices, setDevices] = useState(initialDevices);
  const [openAddModal, setOpenAddModal] = useState(false);

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleAddDevice = (formData) => {
    if (!formData.id?.trim() || !formData.location?.trim()) {
      toast.error('Device ID and Location are required');
      return;
    }

    const assignedText = formData.usersAssigned
      ? `${formData.usersAssigned} Employees`
      : '0 Employees';

    const newDevice = {
      id: formData.id.trim(),
      location: formData.location.trim(),
      usersAssigned: assignedText,
      status: formData.status || 'Online'
    };

    setDevices((prev) => [...prev, newDevice]);
    toast.success(`Device ${newDevice.id} added successfully`);
    handleCloseAddModal();
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
              {devices.map((device) => (
                <TableRow key={device.id} className={styles.tableRow}>
                  <TableCell className={`${styles.tableCell} ${styles.tableCellFirst}`}>
                    <span className={styles.deviceIdText}>{device.id}</span>
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <span className={styles.locationText}>{device.location}</span>
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <span className={styles.userAssignedText}>{device.usersAssigned}</span>
                  </TableCell>
                  <TableCell className={`${styles.tableCell} ${styles.tableCellLast}`}>
                    <span
                      className={`${styles.statusBadge} ${
                        device.status.toLowerCase() === 'online'
                          ? styles.statusOnline
                          : styles.statusOffline
                      }`}
                    >
                      {device.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add Device Modal */}
      <AddDeviceModal
        open={openAddModal}
        onClose={handleCloseAddModal}
        onAddDevice={handleAddDevice}
        nextDeviceIndex={devices.length + 1}
      />
    </Box>
  );
};

export default BiometricDevices;
