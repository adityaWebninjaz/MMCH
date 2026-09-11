/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon
} from '@mui/icons-material';
import {
  IconCalendar,
  IconDownload,
  IconSearch,
  IconX,
  IconEye
} from '@tabler/icons-react';
import CustomSelect from 'ui-component/CustomSelect';
import styles from './OvertimeReports.module.css';

// Mock data matching Screenshot 2 & Screenshot 3
const INITIAL_OVERTIME_DATA = [
  {
    id: 1,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr.Shreya Krishnan',
    drawerEmpId: 'CMP1234',
    overtimeDate: '07 Aug 2025',
    overtimeDuration: '02:30 Hrs',
    reason: 'I am writing to report a malfunctioning X-ray machine in the Radiology department. The machine is producing blurry images, which is impacting our ability to accurately diagnose patients. This has been ongoing for a week. Request immediate attention.'
  },
  {
    id: 2,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Radiology',
    designation: 'Radiologist',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1235',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '03:00 Hrs',
    reason: 'Emergency radiology shifts coverage due to staff shortage and unexpected critical patient intake.'
  },
  {
    id: 3,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1236',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '02:00 Hrs',
    reason: 'Critical care monitoring for post-operative bypass surgery patients overnight.'
  },
  {
    id: 4,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1237',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '02:30 Hrs',
    reason: 'Assisting in urgent cardiology consults during peak admission hours.'
  },
  {
    id: 5,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1238',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '01:30 Hrs',
    reason: 'Conducting evening review rounds for intensive cardiac care unit.'
  },
  {
    id: 6,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1239',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '02:00 Hrs',
    reason: 'Emergency cath lab procedures and post-angioplasty patient stabilization.'
  },
  {
    id: 7,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1240',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '03:15 Hrs',
    reason: 'Covering senior consultant duties on call during weekend schedule.'
  },
  {
    id: 8,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1241',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '02:30 Hrs',
    reason: 'Departmental quality assurance review and complex case discussions.'
  },
  {
    id: 9,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1242',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '02:00 Hrs',
    reason: 'Special cardiac clinic for high-risk elderly patients.'
  },
  {
    id: 10,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1243',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '02:30 Hrs',
    reason: 'Supervising resident doctors and managing ICU admissions.'
  },
  {
    id: 11,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1244',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '02:00 Hrs',
    reason: 'Cardiac emergency response and defibrillator maintenance verification.'
  },
  {
    id: 12,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1245',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '01:45 Hrs',
    reason: 'Late evening echo-cardiogram reviews for admitted cardiology cases.'
  },
  {
    id: 13,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1246',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '02:30 Hrs',
    reason: 'Managing acute coronary syndrome patient protocol and medications.'
  },
  {
    id: 14,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1247',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '02:15 Hrs',
    reason: 'Extended emergency department consultations.'
  },
  {
    id: 15,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1248',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '03:00 Hrs',
    reason: 'Assisting surgical team during prolonged open heart surgery.'
  },
  {
    id: 16,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Admin',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1249',
    overtimeDate: '14 Jul 2026',
    overtimeDuration: '02:00 Hrs',
    reason: 'Patient counseling and emergency discharge reviews.'
  }
];

const DEPARTMENTS = ['All Departments', 'Cardiology', 'Radiology', 'Emergency', 'ICU', 'Hostel', 'Admin'];
const STATUSES = ['All Status', 'Approved', 'Pending', 'Rejected'];

const OvertimeReports = () => {
  // Filter states
  const [selectedDate, setSelectedDate] = useState('2025-07-12');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const dateInputRef = useRef(null);

  // Drawer state for Screenshot 3
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Format date display
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '12 July 2025';
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return '12 July 2025';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [selectedDate]);

  // Filtered data logic
  const filteredData = useMemo(() => {
    return INITIAL_OVERTIME_DATA.filter((row) => {
      const matchDept = selectedDept === 'All Departments' || row.department === selectedDept;
      const matchStatus = selectedStatus === 'All Status' || row.status === selectedStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        row.empId.toLowerCase().includes(q) ||
        row.empName.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        row.designation.toLowerCase().includes(q);

      return matchDept && matchStatus && matchSearch;
    });
  }, [selectedDept, selectedStatus, searchQuery]);

  // Paginated records
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const currentRows = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const displayStart = totalCount === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(startIndex + rowsPerPage, totalCount);

  // Handle Export PDF & Excel
  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const headers = ['Emp ID', 'Employee', 'Department', 'Designation', 'Requested Date', 'Action By', 'Status'];
    const csvRows = [headers.join(',')];
    filteredData.forEach((row) => {
      csvRows.push([
        `"${row.empId}"`,
        `"${row.empName}"`,
        `"${row.department}"`,
        `"${row.designation}"`,
        `"${row.requestedDate}"`,
        `"${row.actionBy}"`,
        `"${row.status}"`
      ].join(','));
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `Overtime_Report_${new Date().toISOString().slice(0, 10)}.csv`;
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
      <h2 className={styles.pageTitle}>Overtime Report</h2>

      {/* Filter Controls Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.filtersLeft}>
          {/* Date Picker */}
          <div className={styles.filterGroup}>
            <label htmlFor="otDateBtn" className={styles.filterLabel}>
              Date
            </label>
            <button
              id="otDateBtn"
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
            <input
              type="date"
              ref={dateInputRef}
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }
              }}
              className={styles.hiddenDateInput}
            />
          </div>

          {/* Department Filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Department</span>
            <CustomSelect
              options={DEPARTMENTS}
              value={selectedDept}
              onChange={(val) => {
                setSelectedDept(val);
                setPage(1);
              }}
              width={148}
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
            <label htmlFor="otEmpSearch" className={styles.filterLabel}>
              Employee Search
            </label>
            <div className={styles.searchWrapper}>
              <IconSearch className={styles.searchIcon} size={18} />
              <input
                id="otEmpSearch"
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

      {/* Main Overtime Data Table */}
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
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyRow}>
                  No overtime records found matching filters.
                </td>
              </tr>
            ) : (
              currentRows.map((row) => {
                const isApproved = row.status === 'Approved';
                const isPending = row.status === 'Pending';
                const isRejected = row.status === 'Rejected';
                const statusClass = isApproved
                  ? styles.statusApproved
                  : isPending
                  ? styles.statusPending
                  : isRejected
                  ? styles.statusRejected
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
              width={65}
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

      {/* Right Side Details Drawer (Screenshot 3) */}
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
                <h3 className={styles.drawerTitle}>Overtime Request Details</h3>
                <div className={styles.drawerHeaderActions}>
                  <span className={`${styles.statusChip} ${styles.statusApproved}`}>
                    {selectedItem.status || 'Approved'}
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
                  {selectedItem.drawerEmpName || selectedItem.empName || 'Dr.Shreya Krishnan'}
                </h4>
                <p className={styles.drawerEmpSub}>
                  {selectedItem.empId} · {selectedItem.department} Department
                </p>
              </div>

              {/* Top Lavender Tinted Box */}
              <div className={styles.tintedInfoBox}>
                <div className={styles.infoCol}>
                  <span className={styles.infoColLabel}>Emp ID</span>
                  <span className={styles.infoColValue}>{selectedItem.drawerEmpId || 'CMP1234'}</span>
                </div>
                <div className={styles.infoCol}>
                  <span className={styles.infoColLabel}>Requested Date</span>
                  <span className={styles.infoColValue}>{selectedItem.requestedDate || '07 Aug 2025'}</span>
                </div>
              </div>

              {/* Bottom White Details Card */}
              <div className={styles.detailsBox}>
                <div className={styles.detailsRow}>
                  <div className={styles.infoCol}>
                    <span className={styles.infoColLabel}>Overtime Date</span>
                    <span className={styles.infoColValue}>{selectedItem.overtimeDate || '07 Aug 2025'}</span>
                  </div>
                  <div className={styles.infoCol}>
                    <span className={styles.infoColLabel}>Overtime Duration</span>
                    <span className={styles.infoColValue}>{selectedItem.overtimeDuration || '02:30 Hrs'}</span>
                  </div>
                </div>

                <div className={styles.reasonSection}>
                  <span className={styles.reasonLabel}>Overtime Reason</span>
                  <p className={styles.reasonValue}>
                    {selectedItem.reason ||
                      'I am writing to report a malfunctioning X-ray machine in the Radiology department. The machine is producing blurry images, which is impacting our ability to accurately diagnose patients. This has been ongoing for a week. Request immediate attention.'}
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default OvertimeReports;

