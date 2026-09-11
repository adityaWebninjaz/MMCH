import React, { useState, useMemo, useRef } from 'react';
import {
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon
} from '@mui/icons-material';
import { IconCalendar, IconDownload, IconSearch, IconX } from '@tabler/icons-react';
import CustomSelect from 'ui-component/CustomSelect';
import styles from './LeaveReports.module.css';

// Initial Mock Data matching Screenshot 1
const INITIAL_LEAVE_DATA = [
  { id: 1, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Approved' },
  { id: 2, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Pending' },
  { id: 3, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Rejected' },
  { id: 4, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Pending' },
  { id: 5, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Pending' },
  { id: 6, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Rejected' },
  { id: 7, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Pending' },
  { id: 8, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Rejected' },
  { id: 9, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Approved' },
  { id: 10, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Rejected' },
  { id: 11, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Approved' },
  { id: 12, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Approved' },
  { id: 13, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Approved' },
  { id: 14, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Rejected' },
  { id: 15, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Approved' },
  { id: 16, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Approved' },
  { id: 17, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Approved' },
  { id: 18, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Approved' },
  { id: 19, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Pending' },
  { id: 20, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Approved' }
];

const DEPARTMENTS = ['All Departments', 'Hostel', 'Cardiology', 'Radiology', 'Emergency', 'ICU', 'Admin'];
const STATUSES = ['All Status', 'Approved', 'Pending', 'Rejected'];

const LeaveReports = () => {
  // Filter States
  const [selectedDate, setSelectedDate] = useState('2025-07-12');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const dateInputRef = useRef(null);

  // Pagination States
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
    return INITIAL_LEAVE_DATA.filter((row) => {
      const matchesDept = selectedDept === 'All Departments' || row.department === selectedDept;
      const matchesStatus = selectedStatus === 'All Status' || row.status === selectedStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        row.empId.toLowerCase().includes(q) ||
        row.empName.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q);

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
    const headers = ['Emp ID', 'Employee', 'Department', 'Type', 'From', 'To', 'Days', 'Status'];
    const csvRows = [headers.join(',')];
    filteredData.forEach((row) => {
      csvRows.push([
        `"${row.empId}"`,
        `"${row.empName}"`,
        `"${row.department}"`,
        `"${row.type}"`,
        `"${row.from}"`,
        `"${row.to}"`,
        row.days,
        `"${row.status}"`
      ].join(','));
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `Leave_Reports_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      {/* Page Title */}
      <h2 className={styles.pageTitle}>Leave Reports</h2>

      {/* Filters Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.filtersLeft}>
          {/* Date Picker */}
          <div className={styles.filterGroup}>
            <label htmlFor="leaveDateBtn" className={styles.filterLabel}>
              Date
            </label>
            <button
              id="leaveDateBtn"
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
            <label htmlFor="leaveEmpSearch" className={styles.filterLabel}>
              Employee Search
            </label>
            <div className={styles.searchWrapper}>
              <IconSearch className={styles.searchIcon} size={18} />
              <input
                id="leaveEmpSearch"
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
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
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

      {/* Main Leave Data Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.th}>Emp ID</th>
              <th className={styles.th}>Employee</th>
              <th className={styles.th}>Department</th>
              <th className={styles.th}>Type</th>
              <th className={styles.th}>From</th>
              <th className={styles.th}>To</th>
              <th className={styles.thCenter}>Days</th>
              <th className={styles.thCenter}>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyRow}>
                  No leave records found matching filters.
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
                    <td className={styles.tdEmpId}>{row.empId}</td>
                    <td className={styles.td}>{row.empName}</td>
                    <td className={styles.td}>{row.department}</td>
                    <td className={styles.td}>{row.type}</td>
                    <td className={styles.td}>{row.from}</td>
                    <td className={styles.td}>{row.to}</td>
                    <td className={styles.tdCenter}>{row.days}</td>
                    <td className={styles.tdCenter}>
                      <span className={`${styles.statusChip} ${statusClass}`}>
                        {row.status}
                      </span>
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
    </div>
  );
};

export default LeaveReports;
