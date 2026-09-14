import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Select, MenuItem, FormControl, CircularProgress, Snackbar, Alert } from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material';
import { IconSearch, IconDownload } from '@tabler/icons-react';
import styles from './AuditLogs.module.css';
import { getAuditLogs, exportAuditLogsToExcel, exportAuditLogsToPDF } from './Services/auditLogService';

const MODULES = [
  'All Module',
  'Attendance',
  'Biometric Devices',
  'Leave',
  'Authentication',
  'Role & Access Control',
  'Payroll',
  'Deductions',
  'Gate Pass'
];

const ROLES = ['All Role', 'HR Admin', 'Accounts', 'Employee', 'Front Office', 'Super Admin', 'System'];

const STATUSES = ['All Status', 'Success', 'Failed'];

const DropdownIcon = (props) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', right: 12, top: 'calc(50% - 7px)', pointerEvents: 'none' }}
    {...props}
  >
    <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const selectMenuProps = {
  PaperProps: {
    sx: {
      maxHeight: 280,
      borderRadius: '8px',
      boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.08)',
      mt: '4px',
      border: '1px solid #E2E8F0'
    }
  }
};

const selectSx = {
  width: '180px',
  height: '32px',
  borderRadius: '6px',
  bgcolor: '#FFFFFF',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: '100%',
  letterSpacing: '0%',
  color: '#1E293B',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E2E8F0',
    borderWidth: '1px',
    borderRadius: '6px'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#CBD5E1'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#644EE5',
    borderWidth: '1px'
  },
  '& .MuiSelect-select': {
    paddingLeft: '12px !important',
    paddingRight: '36px !important',
    paddingTop: '8px !important',
    paddingBottom: '8px !important',
    display: 'flex',
    alignItems: 'center',
    height: '32px',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '100%',
    letterSpacing: '0%',
    color: '#1E293B'
  }
};

const menuItemSx = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: '100%',
  letterSpacing: '0%',
  color: '#1E293B',
  py: '8px',
  px: '12px'
};

const AuditLogs = () => {
  const [selectedModule, setSelectedModule] = useState('All Module');
  const [selectedRole, setSelectedRole] = useState('All Role');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        page,
        limit: rowsPerPage,
        module: selectedModule,
        role: selectedRole,
        status: selectedStatus,
        search: debouncedSearch
      });

      if (res && res.success) {
        setLogs(res.data || []);
        setTotalRecords(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setToast({ open: true, message: 'Failed to load audit logs', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedModule, selectedRole, selectedStatus, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filter change handlers reset page to 1
  const handleModuleChange = (val) => {
    setSelectedModule(val);
    setPage(1);
  };

  const handleRoleChange = (val) => {
    setSelectedRole(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    setPage(1);
  };

  const handleRowsPerPageChange = (val) => {
    setRowsPerPage(Number(val));
    setPage(1);
  };

  // Export handlers
  const handleExportPDF = () => {
    if (!logs || logs.length === 0) {
      setToast({ open: true, message: 'No logs available to export', severity: 'warning' });
      return;
    }
    const success = exportAuditLogsToPDF(logs, 'Audit Logs Trail');
    if (success) {
      setToast({ open: true, message: 'Audit logs exported to PDF successfully', severity: 'success' });
    } else {
      setToast({ open: true, message: 'Failed to export to PDF', severity: 'error' });
    }
  };

  const handleExportExcel = () => {
    if (!logs || logs.length === 0) {
      setToast({ open: true, message: 'No logs available to export', severity: 'warning' });
      return;
    }
    const success = exportAuditLogsToExcel(logs, `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    if (success) {
      setToast({ open: true, message: 'Audit logs exported to Excel/CSV successfully', severity: 'success' });
    } else {
      setToast({ open: true, message: 'Failed to export to Excel', severity: 'error' });
    }
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startItem = totalRecords === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endItem = Math.min(page * rowsPerPage, totalRecords);

  return (
    <Box className={styles.container}>
      {/* Top Filter & Action Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filtersGroup}>
          {/* Module Filter */}
          <div className={styles.filterItem}>
            <span className={styles.filterLabel}>Module</span>
            <FormControl size="small">
              <Select
                value={selectedModule}
                onChange={(e) => handleModuleChange(e.target.value)}
                IconComponent={DropdownIcon}
                MenuProps={selectMenuProps}
                sx={selectSx}
              >
                {MODULES.map((mod) => (
                  <MenuItem key={mod} value={mod} sx={menuItemSx}>
                    {mod}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Role Filter */}
          <div className={styles.filterItem}>
            <span className={styles.filterLabel}>Role</span>
            <FormControl size="small">
              <Select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                IconComponent={DropdownIcon}
                MenuProps={selectMenuProps}
                sx={selectSx}
              >
                {ROLES.map((role) => (
                  <MenuItem key={role} value={role} sx={menuItemSx}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Status Filter */}
          <div className={styles.filterItem}>
            <span className={styles.filterLabel}>Status</span>
            <FormControl size="small">
              <Select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                IconComponent={DropdownIcon}
                MenuProps={selectMenuProps}
                sx={selectSx}
              >
                {STATUSES.map((st) => (
                  <MenuItem key={st} value={st} sx={menuItemSx}>
                    {st}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* User Search Input */}
          <div className={styles.filterItem} style={{ flex: 1, minWidth: '240px' }}>
            <span className={styles.filterLabel}>User Search</span>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>
                <IconSearch size={16} />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionsGroup}>
          <button type="button" className={styles.btnExportPdf} onClick={handleExportPDF}>
            <IconDownload size={16} />
            Export PDF
          </button>
          <button type="button" className={styles.btnExportExcel} onClick={handleExportExcel}>
            <IconDownload size={16} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.headerCell}>Audit ID</th>
                <th className={styles.headerCell}>User</th>
                <th className={styles.headerCell}>Role</th>
                <th className={styles.headerCell}>Time Stamp</th>
                <th className={styles.headerCell}>Module</th>
                <th className={styles.headerCell}>Action</th>
                <th className={styles.headerCell}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>
                    <CircularProgress size={32} sx={{ color: '#644EE5' }} />
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((row) => (
                  <tr key={row.id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.auditIdCell}`}>{row.id}</td>
                    <td className={`${styles.tableCell} ${styles.userCell}`}>{row.user}</td>
                    <td className={`${styles.tableCell} ${styles.roleCell}`}>{row.role}</td>
                    <td className={`${styles.tableCell} ${styles.moduleCell}`}>{row.module}</td>
                    <td className={`${styles.tableCell} ${styles.actionCell}`}>{row.action}</td>
                    <td className={`${styles.tableCell} ${styles.timestampCell}`}>{row.timestamp}</td>
                    <td className={styles.tableCell}>
                      <span className={row.status?.toLowerCase() === 'failed' ? styles.badgeFailed : styles.badgeSuccess}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>
                    <div className={styles.emptyTitle}>No audit logs found</div>
                    <div className={styles.emptySubtitle}>Try adjusting your filters or search query.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          pt: 2.5,
          pb: 0.5
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: '#64748B', fontSize: '14px', fontWeight: '400', lineHeight: '20px', fontFamily: "'Inter', sans-serif" }}
        >
          {totalRecords > 0 ? `Showing ${startItem}-${endItem} of ${totalRecords}` : 'Showing 0-0 of 0'}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 1.5, sm: 3 } }}>
          {/* Rows per page */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Inter', sans-serif",
                color: '#1E293B',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '20px',
                letterSpacing: '0%'
              }}
            >
              Rows per page
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(e.target.value)}
              size="small"
              IconComponent={UnfoldMoreIcon}
              sx={{
                height: '36px',
                borderRadius: '6px',
                bgcolor: '#FFFFFF',
                color: '#1E293B',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 400,
                minWidth: '78px',
                overflow: 'hidden',
                lineHeight: '20px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0',
                  borderRadius: '6px',
                  borderWidth: '1px',
                  top: 0,
                  '& legend': {
                    display: 'none'
                  }
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#94A3B8'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#644EE5'
                },
                '& .MuiSelect-select': {
                  py: '8px',
                  pl: '14px',
                  pr: '34px !important',
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  color: '#1E293B'
                },
                '& .MuiSelect-icon': {
                  color: '#1E293B',
                  fontSize: '18px',
                  right: '8px'
                }
              }}
            >
              {[10, 20, 50, 100].map((num) => (
                <MenuItem
                  key={num}
                  value={num}
                  sx={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 400, color: '#1E293B' }}
                >
                  {num}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Page counter text */}
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Inter', sans-serif",
              color: '#1E293B',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '20px',
              letterSpacing: '0%'
            }}
          >
            Page {page} of {Math.max(1, totalPages)}
          </Typography>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setPage(1)}
              disabled={page === 1 || loading}
              sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                p: '4px',
                color: '#475569',
                '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' }
              }}
            >
              <FirstPageIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                p: '4px',
                color: '#475569',
                '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' }
              }}
            >
              <NavigateBeforeIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || loading}
              sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                p: '4px',
                color: '#475569',
                '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' }
              }}
            >
              <NavigateNextIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages || loading}
              sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                p: '4px',
                color: '#475569',
                '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' }
              }}
            >
              <LastPageIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Feedback Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: '100%', fontFamily: "'Inter', sans-serif" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditLogs;
