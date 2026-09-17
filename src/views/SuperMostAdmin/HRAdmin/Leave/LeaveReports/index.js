import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FirstPage as FirstPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LastPage as LastPageIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { IconCalendar, IconDownload, IconSearch, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import CustomSelect from 'ui-component/CustomSelect';
import { getLeaveApprovals } from '../../Services/hrLeaveApprovalService';
import { getDepartments } from 'views/SuperMostAdmin/HRMS/EmployeeMaster/Services/allEmployeeService';
import styles from './LeaveReports.module.css';

// Fallback Initial Mock Data
const INITIAL_LEAVE_DATA = [
  { id: 1, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Approved' },
  { id: 2, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Pending' },
  { id: 3, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Rejected' },
  { id: 4, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Pending' },
  { id: 5, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Pending' },
  { id: 6, empId: 'EMP235469', empName: 'Dr. Ravi Mehta', department: 'Hostel', type: 'Casual Leave', from: '14 Jul 2026', to: '14 Jul 2026', days: 1, status: 'Rejected' }
];

const DEFAULT_DEPARTMENTS = ['All Departments', 'Hostel', 'Cardiology', 'Radiology', 'Emergency', 'ICU', 'Admin', 'IT'];
const STATUSES = ['All Status', 'Approved', 'Pending', 'Rejected', 'Cancelled'];

// Helper to format ISO date "YYYY-MM-DD" or timestamp to "14 Jul 2026"
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
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

const LeaveReports = () => {
  // Filter States
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const dateInputRef = useRef(null);

  // Departments List
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);

  // Data States
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination States
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 1. Fetch Departments from API on mount
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
        console.error('Failed to load departments in Leave Reports:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Leave Approvals from API
  useEffect(() => {
    let isMounted = true;
    const fetchLeaves = async () => {
      setLoading(true);
      try {
        const data = await getLeaveApprovals({ status: selectedStatus });
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            // Map API response to UI table fields
            const mapped = data.map((item) => ({
              id: item.id,
              empId: item.employee?.uid || item.empId || item.id || '-',
              empName: item.employee?.full_name || item.empName || item.employee_name || 'N/A',
              department: item.employee?.department || item.department || '-',
              type: item.category || item.type || 'Leave',
              from: formatDisplayDate(item.start_date),
              to: formatDisplayDate(item.end_date),
              rawStartDate: item.start_date,
              rawEndDate: item.end_date,
              days: item.number_of_days ?? 1,
              status: formatStatusTitle(item.status),
              rawStatus: item.status,
              reason: item.reason,
              rejectionRemark: item.rejection_remark
            }));
            setLeaveRecords(mapped);
          } else {
            setLeaveRecords(data.length === 0 ? [] : INITIAL_LEAVE_DATA);
          }
        }
      } catch (err) {
        console.error('Failed to load leave approvals:', err);
        if (isMounted) {
          // Fallback to initial mock if API fails
          setLeaveRecords(INITIAL_LEAVE_DATA);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLeaves();

    return () => {
      isMounted = false;
    };
  }, [selectedStatus]);

  // Format date display for input button
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return 'Select Date';
    return formatDisplayDate(selectedDate);
  }, [selectedDate]);

  // Client-side Filtering Logic (Department, Search, Date)
  const filteredData = useMemo(() => {
    return leaveRecords.filter((row) => {
      // Department filter
      const matchesDept =
        selectedDept === 'All Departments' ||
        row.department?.toLowerCase() === selectedDept?.toLowerCase();

      // Status filter (if already handled by API or client fallback)
      const matchesStatus =
        selectedStatus === 'All Status' ||
        row.status?.toLowerCase() === selectedStatus?.toLowerCase();

      // Date filter (if selected)
      let matchesDate = true;
      if (selectedDate) {
        if (row.rawStartDate && row.rawEndDate) {
          matchesDate = selectedDate >= row.rawStartDate && selectedDate <= row.rawEndDate;
        } else if (row.from) {
          matchesDate = row.from.toLowerCase().includes(formattedDisplayDate.toLowerCase());
        }
      }

      // Search Query filter
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        row.empId?.toString().toLowerCase().includes(q) ||
        row.empName?.toLowerCase().includes(q) ||
        row.department?.toLowerCase().includes(q) ||
        row.type?.toLowerCase().includes(q);

      return matchesDept && matchesStatus && matchesDate && matchesQuery;
    });
  }, [leaveRecords, selectedDept, selectedStatus, selectedDate, formattedDisplayDate, searchQuery]);

  // Paginated Data Logic
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const currentRows = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const displayStart = totalCount === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(startIndex + rowsPerPage, totalCount);

  // Export PDF Handler
  const handleExportPDF = () => {
    window.print();
  };

  // Export Excel Handler
  const handleExportExcel = () => {
    try {
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
      toast.success('Leave report exported successfully!');
    } catch (e) {
      toast.error('Failed to export Excel report');
    }
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate('');
                    setPage(1);
                  }}
                  title="Clear Date Filter"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <IconX size={16} />
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
              width={135}
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
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
            <CircularProgress size={32} sx={{ color: '#644EE5' }} />
            <span style={{ fontSize: '14px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
              Loading leave approval records...
            </span>
          </div>
        ) : (
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
                  const isCancelled = row.status === 'Cancelled';
                  const statusClass = isApproved
                    ? styles.statusApproved
                    : isPending
                      ? styles.statusPending
                      : isRejected
                        ? styles.statusRejected
                        : isCancelled
                          ? styles.statusCancelled
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
        )}
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
    </div>
  );
};

export default LeaveReports;
