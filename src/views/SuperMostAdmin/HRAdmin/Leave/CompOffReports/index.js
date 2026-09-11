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
import styles from './CompOffReports.module.css';

// Mock data matching Screenshot 1 & Screenshot 2
const INITIAL_COMP_OFF_DATA = [
  {
    id: 1,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr.Shreya Krishnan',
    drawerEmpId: 'CMP1234',
    drawerRequestedDate: '07 Aug 2025',
    compOffDate: '07 Aug 2025',
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
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1235',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Full Day',
    reason: 'Compensatory off request against weekend emergency shift duty in cardiology.'
  },
  {
    id: 3,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1236',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Full Day',
    reason: 'Overtime compensation for extended night duty.'
  },
  {
    id: 4,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1237',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Half Day',
    reason: 'Compensatory leave after attending emergency cardiac catheterization.'
  },
  {
    id: 5,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1238',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Full Day',
    reason: 'Weekend duty compensation.'
  },
  {
    id: 6,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1239',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Half Day',
    reason: 'Managing emergency admissions on national holiday.'
  },
  {
    id: 7,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1240',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Full Day',
    reason: 'Compensatory off for continuous 24-hour on-call duty.'
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
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Half Day',
    reason: 'Holiday shift coverage in ICU.'
  },
  {
    id: 9,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1242',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Full Day',
    reason: 'Cardiac department annual emergency audit review.'
  },
  {
    id: 10,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1243',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Half Day',
    reason: 'Late night emergency bypass monitoring.'
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
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Full Day',
    reason: 'Sunday ICU emergency on-call cover.'
  },
  {
    id: 12,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1245',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Half Day',
    reason: 'Critical care consultation on off day.'
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
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Full Day',
    reason: 'Managing disaster triage team on scheduled leave day.'
  },
  {
    id: 14,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1247',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Half Day',
    reason: 'Emergency angioplasty support.'
  },
  {
    id: 15,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1248',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Full Day',
    reason: 'Covering senior medical officer leave in emergency ward.'
  },
  {
    id: 16,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1249',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Half Day',
    reason: 'Emergency outpatient clinic extra shift.'
  },
  {
    id: 17,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1250',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Full Day',
    reason: 'Post-operative monitoring on weekend.'
  },
  {
    id: 18,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1251',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Half Day',
    reason: 'Resident training session on Sunday morning.'
  },
  {
    id: 19,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1252',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Full Day',
    reason: 'ICU night shift during public holiday.'
  },
  {
    id: 20,
    empId: 'EMP235469',
    empName: 'Dr. Ravi Mehta',
    department: 'Cardiology',
    designation: 'HOD',
    requestedDate: '14 Jul 2026',
    actionBy: 'Hod',
    status: 'Approved',
    drawerEmpName: 'Dr. Ravi Mehta',
    drawerEmpId: 'CMP1253',
    drawerRequestedDate: '14 Jul 2026',
    compOffDate: '14 Jul 2026',
    startDuration: 'Half Day',
    reason: 'Emergency cardiology on-call support.'
  }
];

const DEPARTMENTS = ['All Departments', 'Cardiology', 'Radiology', 'Emergency', 'ICU', 'Hostel', 'Admin'];
const STATUSES = ['All Status', 'Approved', 'Pending', 'Rejected'];

const CompOffReports = () => {
  // Filter States
  const [selectedDate, setSelectedDate] = useState('2025-07-12');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const dateInputRef = useRef(null);

  // Drawer state for Screenshot 2
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Format date display
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '12 July 2025';
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return '12 July 2025';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [selectedDate]);

  // Filter Data Logic
  const filteredData = useMemo(() => {
    return INITIAL_COMP_OFF_DATA.filter((row) => {
      const matchesDept = selectedDept === 'All Departments' || row.department === selectedDept;
      const matchesStatus = selectedStatus === 'All Status' || row.status === selectedStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        row.empId.toLowerCase().includes(q) ||
        row.empName.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        row.designation.toLowerCase().includes(q);

      return matchesDept && matchesStatus && matchesQuery;
    });
  }, [selectedDept, selectedStatus, searchQuery]);

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
            {currentRows.length === 0 ? (
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
                  <span className={styles.infoColValue}>{selectedItem.drawerRequestedDate || selectedItem.requestedDate || '07 Aug 2025'}</span>
                </div>
              </div>

              {/* Bottom White Details Card */}
              <div className={styles.detailsBox}>
                <div className={styles.detailsRow}>
                  <div className={styles.infoCol}>
                    <span className={styles.infoColLabel}>Comp off Date</span>
                    <span className={styles.infoColValue}>{selectedItem.compOffDate || '07 Aug 2025'}</span>
                  </div>
                  <div className={styles.infoCol}>
                    <span className={styles.infoColLabel}>Start Duration</span>
                    <span className={styles.infoColValue}>{selectedItem.startDuration || 'Half Day'}</span>
                  </div>
                </div>

                <div className={styles.reasonSection}>
                  <span className={styles.reasonLabel}>Comp Off Reason</span>
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

export default CompOffReports;

