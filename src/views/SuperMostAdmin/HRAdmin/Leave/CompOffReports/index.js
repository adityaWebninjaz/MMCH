/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import {
  IconCalendar,
  IconDownload,
  IconSearch,
  IconX,
  IconEye
} from '@tabler/icons-react';
import CustomSelect from 'ui-component/CustomSelect';
import { getDepartments } from 'views/SuperMostAdmin/HRMS/EmployeeMaster/Services/allEmployeeService';
import { getCompOffApprovals } from '../../Services/hrLeaveApprovalService';
import styles from './CompOffReports.module.css';

// Fallback Initial Mock Data
const INITIAL_COMP_OFF_DATA = [
  {
    id: 1,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    startDuration: 'Half Day',
    reason: 'I am writing to report a malfunctioning X-ray machine in the Radiology department. The machine is producing blurry images, which is impacting our ability to accurately diagnose patients. This has been ongoing for a week. Request immediate attention.'
  },
  {
    id: 2,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    startDuration: 'Full Day',
    reason: 'Compensatory off request against weekend emergency shift duty in cardiology.'
  }
];

const DEFAULT_DEPARTMENTS = ['All Departments', 'Cardiology', 'Radiology', 'Emergency', 'ICU', 'Hostel', 'Admin', 'IT', 'Anatomy', 'Administration'];
const STATUSES = ['All Status', 'Approved', 'Pending', 'Rejected', 'Cancelled'];

// Helper to format ISO date "YYYY-MM-DD" or timestamp to "14 Jul 2026"
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return String(dateStr);
  }
};

// Helper to convert backend status to Title Case
const formatStatusTitle = (status) => {
  if (!status) return 'Pending';
  const upper = String(status).toUpperCase();
  if (upper === 'APPROVED') return 'Approved';
  if (upper === 'REJECTED') return 'Rejected';
  if (upper === 'PENDING') return 'Pending';
  if (upper === 'CANCELLED' || upper === 'CANCELED') return 'Cancelled';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const CompOffReports = () => {
  // Filter States
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const dateInputRef = useRef(null);

  // Data & Loading States
  const [compOffRecords, setCompOffRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Drawer state for Details Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 1. Fetch departments list from API on mount
  useEffect(() => {
    let isMounted = true;
    getDepartments()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const names = data
            .map((d) => (typeof d === 'string' ? d : d.name || d.department_name || d.title || ''))
            .filter(Boolean);
          const uniqueDepts = Array.from(new Set(['All Departments', ...names]));
          setDepartments(uniqueDepts);
        }
      })
      .catch((err) => {
        console.error('Failed to load departments in Comp Off Reports:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Comp-off approvals from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchCompOffData = async () => {
      setLoading(true);
      try {
        const data = await getCompOffApprovals({ status: selectedStatus });
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((item, index) => {
              const durationFormatted =
                item.duration === 'HALF_DAY'
                  ? 'Half Day'
                  : item.duration === 'FULL_DAY'
                    ? 'Full Day'
                    : item.duration || 'Full Day';

              let reviewerName = '-';
              if (item.reviewed_by?.full_name) {
                reviewerName = item.reviewed_by.designation
                  ? `${item.reviewed_by.full_name} (${item.reviewed_by.designation})`
                  : item.reviewed_by.full_name;
              }

              return {
                id: item.id || `compoff-${index + 1}`,
                empId: item.employee?.uid || item.empId || '-',
                empName: item.employee?.full_name || item.empName || 'N/A',
                department: item.employee?.department || item.department || '-',
                designation: item.employee?.designation || item.designation || '-',
                requestedDate: formatDisplayDate(item.applied_at || item.date),
                rawRequestedDate: item.applied_at || '',
                compOffDate: formatDisplayDate(item.date),
                rawCompOffDate: item.date || '',
                actionBy: reviewerName,
                status: formatStatusTitle(item.status),
                rawStatus: item.status,
                startDuration: durationFormatted,
                reason: item.reason || 'No reason provided',
                rejectionRemark: item.rejection_remark || '',
                reviewedBy: reviewerName,
                reviewedAt: formatDisplayDate(item.reviewed_at),
                raw: item
              };
            });
            setCompOffRecords(mapped);
          } else {
            setCompOffRecords(data.length === 0 ? [] : INITIAL_COMP_OFF_DATA);
          }
        }
      } catch (err) {
        console.error('Failed to load comp off approvals:', err);
        if (isMounted) {
          setCompOffRecords(INITIAL_COMP_OFF_DATA);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCompOffData();

    return () => {
      isMounted = false;
    };
  }, [selectedStatus]);

  // Format date display
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return 'All Dates';
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return 'All Dates';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }, [selectedDate]);

  // Filter Data Logic
  const filteredData = useMemo(() => {
    return compOffRecords.filter((row) => {
      // 1. Department match
      const matchesDept =
        selectedDept === 'All Departments' ||
        row.department === selectedDept ||
        row.department?.toLowerCase() === selectedDept?.toLowerCase();

      // 2. Status match
      const matchesStatus =
        selectedStatus === 'All Status' ||
        row.status?.toLowerCase() === selectedStatus?.toLowerCase();

      // 3. Date match (checks both comp off date & requested date)
      const matchesDate =
        !selectedDate ||
        row.rawCompOffDate === selectedDate ||
        (row.rawRequestedDate && row.rawRequestedDate.startsWith(selectedDate));

      // 4. Search Query match
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (row.empId && row.empId.toLowerCase().includes(q)) ||
        (row.empName && row.empName.toLowerCase().includes(q)) ||
        (row.department && row.department.toLowerCase().includes(q)) ||
        (row.designation && row.designation.toLowerCase().includes(q)) ||
        (row.status && row.status.toLowerCase().includes(q));

      return matchesDept && matchesStatus && matchesDate && matchesQuery;
    });
  }, [compOffRecords, selectedDept, selectedStatus, selectedDate, searchQuery]);

  // Paginated Data Logic
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const currentRows = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const displayStart = totalCount === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(startIndex + rowsPerPage, totalCount);

  // Export handlers
  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const headers = ['Emp ID', 'Employee', 'Department', 'Designation', 'Requested Date', 'Comp Off Date', 'Duration', 'Action By', 'Status', 'Reason'];
    const csvRows = [headers.join(',')];
    filteredData.forEach((row) => {
      csvRows.push([
        `"${row.empId}"`,
        `"${row.empName}"`,
        `"${row.department}"`,
        `"${row.designation}"`,
        `"${row.requestedDate}"`,
        `"${row.compOffDate}"`,
        `"${row.startDuration}"`,
        `"${row.actionBy}"`,
        `"${row.status}"`,
        `"${(row.reason || '').replace(/"/g, '""')}"`
      ].join(','));
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `Comp_Off_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Drawer handler
  const handleOpenDrawer = (item) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className={styles.container}>
      {/* Title */}
      <h2 className={styles.pageTitle}>Comp off Report</h2>

      {/* Filter Controls Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.filtersLeft}>
          {/* Date Picker */}
          <div className={styles.filterGroup}>
            <label htmlFor="compOffDateBtn" className={styles.filterLabel}>
              Date
            </label>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <button
                id="compOffDateBtn"
                type="button"
                className={styles.dateButton}
                onClick={() => {
                  if (dateInputRef.current) {
                    if (typeof dateInputRef.current.showPicker === 'function') {
                      dateInputRef.current.showPicker();
                    } else {
                      dateInputRef.current.click();
                    }
                  }
                }}
              >
                <span>{formattedDisplayDate}</span>
                <IconCalendar size={18} stroke={1.75} color="#1E293B" />
              </button>
              {selectedDate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate('');
                    setPage(1);
                  }}
                  style={{
                    position: 'absolute',
                    right: '34px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  title="Clear date"
                >
                  <IconX size={14} />
                </button>
              )}
            </div>
            <input
              type="date"
              ref={dateInputRef}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(1);
              }}
              className={styles.hiddenDateInput}
            />
          </div>

          {/* Department Filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Department</span>
            <CustomSelect
              options={departments}
              value={selectedDept}
              onChange={(val) => {
                setSelectedDept(val);
                setPage(1);
              }}
              width={160}
            />
          </div>

          {/* Status Filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Status</span>
            <CustomSelect
              options={STATUSES}
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
              width={115}
            />
          </div>

          {/* Employee Search */}
          <div className={styles.filterGroup}>
            <label htmlFor="compOffEmpSearch" className={styles.filterLabel}>
              Employee Search
            </label>
            <div className={styles.searchWrapper}>
              <IconSearch className={styles.searchIcon} size={18} />
              <input
                id="compOffEmpSearch"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by ID or name..."
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery('')}
                >
                  <IconX size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Export PDF & Export Excel */}
        <div className={styles.actionsRight}>
          <button type="button" className={styles.exportPdfBtn} onClick={handleExportPDF}>
            <IconDownload size={18} stroke={1.75} />
            <span>Export PDF</span>
          </button>
          <button type="button" className={styles.exportExcelBtn} onClick={handleExportExcel}>
            <IconDownload size={18} stroke={1.75} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Main Comp Off Data Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.th}>Emp ID</th>
              <th className={styles.th}>Employee</th>
              <th className={styles.th}>Department</th>
              <th className={styles.th}>Designation</th>
              <th className={styles.th}>Requested Date</th>
              <th className={styles.th}>Action By</th>
              <th className={styles.thCenter}>Status</th>
              <th className={styles.thCenter} style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                  <CircularProgress size={32} sx={{ color: '#644EE5' }} />
                </td>
              </tr>
            ) : currentRows.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyRow}>
                  No compensatory off records found matching filters.
                </td>
              </tr>
            ) : (
              currentRows.map((row) => {
                const isApproved = row.status === 'Approved';
                const isPending = row.status === 'Pending';
                const isRejected = row.status === 'Rejected';
                const isCancelled = row.status === 'Cancelled';
                const statusClass = isApproved
                  ? styles.statusApproved
                  : isPending
                    ? styles.statusPending
                    : isRejected
                      ? styles.statusRejected
                      : isCancelled
                        ? styles.statusCancelled || ''
                        : '';

                return (
                  <tr key={row.id} className={styles.tr}>
                    <td className={styles.td}>{row.empId}</td>
                    <td className={styles.tdEmpName}>{row.empName}</td>
                    <td className={styles.td}>{row.department}</td>
                    <td className={styles.td}>{row.designation}</td>
                    <td className={styles.td}>{row.requestedDate}</td>
                    <td className={styles.td}>{row.actionBy}</td>
                    <td className={styles.tdCenter}>
                      <span className={`${styles.statusChip} ${statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className={styles.tdCenter}>
                      <button
                        type="button"
                        className={styles.viewActionBtn}
                        onClick={() => handleOpenDrawer(row)}
                        title="View Details"
                      >
                        <IconEye size={18} stroke={1.5} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className={styles.paginationFooter}>
        <p className={styles.showingText}>
          {totalCount > 0 ? `Showing ${displayStart}-${displayEnd} of ${totalCount}` : 'Showing 0-0 of 0'}
        </p>

        <div className={styles.paginationControls}>
          {/* Rows per page */}
          <div className={styles.rowsPerPageSection}>
            <span className={styles.rowsPerPageLabel}>Rows per page</span>
            <CustomSelect
              options={[10, 20, 50, 100]}
              value={rowsPerPage}
              onChange={(val) => {
                setRowsPerPage(Number(val));
                setPage(1);
              }}
              size="small"
              width={78}
            />
          </div>

          {/* Page counter text */}
          <span className={styles.pageCounterText}>
            Page {page} of {totalPages}
          </span>

          {/* Navigation Buttons */}
          <div className={styles.navButtons}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setPage(1)}
              disabled={page === 1}
              title="First Page"
            >
              <FirstPageIcon fontSize="small" />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              title="Previous Page"
            >
              <NavigateBeforeIcon fontSize="small" />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              title="Next Page"
            >
              <NavigateNextIcon fontSize="small" />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              title="Last Page"
            >
              <LastPageIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side Details Drawer (Screenshot 2) */}
      {isDrawerOpen &&
        selectedItem &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={styles.drawerOverlay}
            onClick={handleCloseDrawer}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCloseDrawer();
            }}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <div
              className={styles.drawerContent}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="document"
            >
              {/* Drawer Header */}
              <div className={styles.drawerHeader}>
                <h3 className={styles.drawerTitle}>Comp Off Request Details</h3>
                <div className={styles.drawerHeaderActions}>
                  <span
                    className={`${styles.statusChip} ${
                      selectedItem.status === 'Approved'
                        ? styles.statusApproved
                        : selectedItem.status === 'Pending'
                          ? styles.statusPending
                          : selectedItem.status === 'Rejected'
                            ? styles.statusRejected
                            : ''
                    }`}
                  >
                    {selectedItem.status || 'Pending'}
                  </span>
                  <button
                    type="button"
                    className={styles.closeDrawerBtn}
                    onClick={handleCloseDrawer}
                    title="Close"
                  >
                    <IconX size={18} stroke={2} />
                  </button>
                </div>
              </div>

              {/* Employee Name & Details Subtitle */}
              <div className={styles.drawerEmployeeInfo}>
                <h4 className={styles.drawerEmpName}>
                  {selectedItem.empName || 'Employee Name'}
                </h4>
                <p className={styles.drawerEmpSub}>
                  {selectedItem.empId} · {selectedItem.department} Department
                </p>
              </div>

              {/* Top Lavender Tinted Box */}
              <div className={styles.tintedInfoBox}>
                <div className={styles.infoCol}>
                  <span className={styles.infoColLabel}>Emp ID</span>
                  <span className={styles.infoColValue}>{selectedItem.empId || '-'}</span>
                </div>
                <div className={styles.infoCol}>
                  <span className={styles.infoColLabel}>Requested Date</span>
                  <span className={styles.infoColValue}>{selectedItem.requestedDate || '-'}</span>
                </div>
              </div>

              {/* Bottom White Details Card */}
              <div className={styles.detailsBox}>
                <div className={styles.detailsRow}>
                  <div className={styles.infoCol}>
                    <span className={styles.infoColLabel}>Comp off Date</span>
                    <span className={styles.infoColValue}>{selectedItem.compOffDate || '-'}</span>
                  </div>
                  <div className={styles.infoCol}>
                    <span className={styles.infoColLabel}>Start Duration</span>
                    <span className={styles.infoColValue}>{selectedItem.startDuration || 'Full Day'}</span>
                  </div>
                </div>

                <div className={styles.reasonSection}>
                  <span className={styles.reasonLabel}>Comp Off Reason</span>
                  <p className={styles.reasonValue}>
                    {selectedItem.reason || 'No reason provided'}
                  </p>
                </div>

                {selectedItem.actionBy && selectedItem.actionBy !== '-' && (
                  <div className={styles.reasonSection} style={{ marginTop: '12px' }}>
                    <span className={styles.reasonLabel}>Reviewed By</span>
                    <p className={styles.reasonValue}>
                      {selectedItem.actionBy} {selectedItem.reviewedAt && selectedItem.reviewedAt !== '-' ? `(${selectedItem.reviewedAt})` : ''}
                    </p>
                  </div>
                )}

                {selectedItem.rejectionRemark && (
                  <div className={styles.reasonSection} style={{ marginTop: '12px' }}>
                    <span className={styles.reasonLabel} style={{ color: '#DC2626' }}>Rejection Remark</span>
                    <p className={styles.reasonValue} style={{ color: '#DC2626' }}>
                      {selectedItem.rejectionRemark}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CompOffReports;
