import React, { useState, useEffect, useCallback } from 'react';
import { Box, Skeleton, Snackbar, Alert } from '@mui/material';
import styles from './DeductionControlCenter.module.css';
import DepartmentDetailsModal from './Components/DepartmentDetailsModal';
import {
  getDeductionControlCenterData,
  updateDepartmentDeductionStatus,
  MOCK_DEDUCTION_CONTROL_CENTER_DATA
} from './Services/deductionControlCenterService';

const DeductionControlCenter = () => {
  const [data, setData] = useState(MOCK_DEDUCTION_CONTROL_CENTER_DATA);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  // Centralized data fetcher accepting filter/query params
  const loadDeductionMatrix = useCallback(async (params = {}) => {
    setLoading(true);

    try {
      const response = await getDeductionControlCenterData(params);
      if (response && response.success && Array.isArray(response.data)) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Failed to load Deduction Control Center data:', err);
      setToast({
        open: true,
        message: 'Could not fetch live deduction matrix. Displaying cached records.',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeductionMatrix();
  }, [loadDeductionMatrix]);

  const handleOpenDetails = (deptItem) => {
    setSelectedDept(deptItem);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDept(null);
  };

  const handleLockDepartment = async (dept) => {
    if (!dept) return;
    try {
      await updateDepartmentDeductionStatus(dept.id, 'Locked');
      setData((prev) => prev.map((item) => (item.id === dept.id ? { ...item, status: 'Locked' } : item)));
      setToast({
        open: true,
        message: `${dept.department || 'Department'} deductions locked successfully.`,
        severity: 'success'
      });
      setSelectedDept((prev) => (prev ? { ...prev, status: 'Locked' } : null));
    } catch (err) {
      setToast({
        open: true,
        message: 'Failed to lock department deductions.',
        severity: 'error'
      });
    }
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return styles.statusSubmitted;
      case 'open':
        return styles.statusOpen;
      case 'locked':
        return styles.statusLocked;
      case 'close':
      case 'closed':
        return styles.statusClosed;
      default:
        return '';
    }
  };

  return (
    <Box className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Deduction Control Center</h1>
        <div className={styles.headerActions}>
          {/* <button
            type="button"
            className={styles.btnRefresh}
            onClick={handleRefresh}
            disabled={loading || refreshing}
            title="Refresh latest status from departments"
          >
            <IconRefresh size={16} className={refreshing ? 'rotating-icon' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button> */}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.headerCell}>Department</th>
                <th className={styles.headerCell}>Status</th>
                <th className={styles.headerCell}>Submmitted Value</th>
                <th className={styles.headerCell}>Submmitted At</th>
                <th className={styles.headerCell}>Window</th>
                <th className={styles.headerCell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton loading rows for seamless UX
                [1, 2, 3, 4, 5].map((sKey) => (
                  <tr key={sKey} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <Skeleton variant="text" width={180} height={24} />
                    </td>
                    <td className={styles.tableCell}>
                      <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '20px' }} />
                    </td>
                    <td className={styles.tableCell}>
                      <Skeleton variant="text" width={90} height={24} />
                    </td>
                    <td className={styles.tableCell}>
                      <Skeleton variant="text" width={90} height={24} />
                    </td>
                    <td className={styles.tableCell}>
                      <Skeleton variant="text" width={110} height={24} />
                    </td>
                    <td className={styles.tableCell}>
                      <Skeleton variant="rounded" width={100} height={28} sx={{ borderRadius: '16px' }} />
                    </td>
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((row) => {
                  const hasAction = row.status?.toLowerCase() === 'submitted' || row.status?.toLowerCase() === 'locked';

                  return (
                    <tr key={row.id} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.deptName}`}>{row.department}</td>

                      <td className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(row.status)}`}>{row.status}</span>
                      </td>

                      <td className={`${styles.tableCell} ${styles.valueText}`}>
                        {row.submittedValue === '-' ? <span className={styles.dashText}>-</span> : row.submittedValue}
                      </td>

                      <td className={`${styles.tableCell} ${styles.dateText}`}>
                        {row.submittedAt === '-' ? <span className={styles.dashText}>-</span> : row.submittedAt}
                      </td>

                      <td className={`${styles.tableCell} ${styles.windowText}`}>
                        {row.window === '-' ? <span className={styles.dashText}>-</span> : row.window}
                      </td>

                      <td className={styles.tableCell}>
                        {hasAction ? (
                          <button type="button" className={styles.btnViewDetails} onClick={() => handleOpenDetails(row)}>
                            View Details
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    <div className={styles.emptyTitle}>No deduction control records found</div>
                    <div className={styles.emptySubtitle}>All departments are synced or no cycle active.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Itemized details slide-out drawer */}
      <DepartmentDetailsModal open={modalOpen} onClose={handleCloseModal} departmentData={selectedDept} onLock={handleLockDepartment} />

      {/* Toast Feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeductionControlCenter;
