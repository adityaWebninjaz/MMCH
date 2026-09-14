/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  IconSearch,
  IconCheck,
  IconDownload,
  IconEye,
  IconX,
  IconFileText,
  IconUsers,
  IconSchool,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from '@tabler/icons-react';
import CustomSelect from 'ui-component/CustomSelect';
import styles from './GatePassManagement.module.css';

const INITIAL_REQUESTS = [
  {
    id: 'GP0001',
    studentName: 'Ayush Kumar',
    uid: 'ST001',
    category: 'UG',
    requestType: 'Late Entry',
    startDate: '15-01-2025',
    endDate: '15-01-2025',
    timeRange: '22:00 - 23:00',
    reason: 'Family emergency',
    status: 'Pending',
    submittedDate: '07 Aug 2025',
    room: 'Room 204, Block A',
    phone: '+91 9876543210'
  },
  {
    id: 'GP0002',
    studentName: 'Karan Mehta',
    uid: 'ST001',
    category: 'PG',
    requestType: 'Leave',
    startDate: '15-01-2025',
    endDate: '18-01-2025',
    timeRange: 'to 18-01-2025',
    reason: 'Medical appointment',
    status: 'Rejected',
    submittedDate: '07 Aug 2025',
    room: 'Room 312, Block B',
    phone: '+91 9876543211'
  },
  {
    id: 'GP0003',
    studentName: 'Neha Singh',
    uid: 'ST001',
    category: 'UG',
    requestType: 'Late Entry',
    startDate: '15-01-2025',
    endDate: '15-01-2025',
    timeRange: '22:00 - 23:00',
    reason: 'Home visit',
    status: 'Rejected',
    submittedDate: '07 Aug 2025',
    room: 'Room 105, Girls Hostel',
    phone: '+91 9876543212'
  },
  {
    id: 'GP0004',
    studentName: 'Vikram Joshi',
    uid: 'ST001',
    category: 'PG',
    requestType: 'Leave',
    startDate: '15-01-2025',
    endDate: '18-01-2025',
    timeRange: 'to 18-01-2025',
    reason: 'Urgent personal matters',
    status: 'Pending',
    submittedDate: '07 Aug 2025',
    room: 'Room 401, Block C',
    phone: '+91 9876543213'
  },
  {
    id: 'GP0005',
    studentName: 'Sita Verma',
    uid: 'ST001',
    category: 'PG',
    requestType: 'Leave',
    startDate: '15-01-2025',
    endDate: '18-01-2025',
    timeRange: 'to 18-01-2025',
    reason: 'Conference attendance',
    status: 'Pending',
    submittedDate: '07 Aug 2025',
    room: 'Room 202, Girls Hostel',
    phone: '+91 9876543214'
  },
  {
    id: 'GP0006',
    studentName: 'Anita Rao',
    uid: 'ST001',
    category: 'UG',
    requestType: 'Late Entry',
    startDate: '15-01-2025',
    endDate: '15-01-2025',
    timeRange: '22:00 - 23:00',
    reason: 'Unexpected situation',
    status: 'Pending',
    submittedDate: '07 Aug 2025',
    room: 'Room 110, Girls Hostel',
    phone: '+91 9876543215'
  },
  {
    id: 'GP0007',
    studentName: 'Ravi Sharma',
    uid: 'ST001',
    category: 'UG',
    requestType: 'Leave',
    startDate: '15-01-2025',
    endDate: '18-01-2025',
    timeRange: 'to 18-01-2025',
    reason: 'Health issues',
    status: 'Approved',
    submittedDate: '07 Aug 2025',
    room: 'Room 502, Block A',
    phone: '+91 9876543216'
  },
  {
    id: 'GP0008',
    studentName: 'Pooja Hegde',
    uid: 'ST002',
    category: 'UG',
    requestType: 'Leave',
    startDate: '16-01-2025',
    endDate: '18-01-2025',
    timeRange: 'to 18-01-2025',
    reason: 'Project meeting with team',
    status: 'Approved',
    submittedDate: '08 Aug 2025',
    room: 'Room 304, Girls Hostel',
    phone: '+91 9876543217'
  },
  {
    id: 'GP0009',
    studentName: 'Rahul Dravid',
    uid: 'ST003',
    category: 'PG',
    requestType: 'Late Entry',
    startDate: '16-01-2025',
    endDate: '16-01-2025',
    timeRange: '22:30 - 23:30',
    reason: 'Library study session',
    status: 'Approved',
    submittedDate: '08 Aug 2025',
    room: 'Room 102, Block B',
    phone: '+91 9876543218'
  },
  {
    id: 'GP0010',
    studentName: 'Sanjay Patel',
    uid: 'ST004',
    category: 'UG',
    requestType: 'Leave',
    startDate: '17-01-2025',
    endDate: '20-01-2025',
    timeRange: 'to 20-01-2025',
    reason: 'Sister marriage ceremony',
    status: 'Pending',
    submittedDate: '09 Aug 2025',
    room: 'Room 214, Block C',
    phone: '+91 9876543219'
  }
];

const REQUEST_TYPE_OPTIONS = ['Select', 'Late Entry', 'Leave'];
const CATEGORY_OPTIONS = ['Select', 'UG', 'PG'];

const GatePassManagement = () => {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Select');
  const [selectedCategory, setSelectedCategory] = useState('Select');
  const [statusFilters, setStatusFilters] = useState({
    Pending: false,
    Approved: false,
    Rejected: false
  });

  // Applied Filters State
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    type: 'Select',
    category: 'Select',
    statuses: []
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Selected Detail Modal
  const [detailModalItem, setDetailModalItem] = useState(null);

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'Pending').length;
    const approved = requests.filter((r) => r.status === 'Approved').length;
    const rejected = requests.filter((r) => r.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // Handle Status Checkbox Toggle
  const handleStatusCheckboxChange = (status) => {
    setStatusFilters((prev) => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  // Handle Apply Filter
  const handleApplyFilter = () => {
    const activeStatuses = Object.keys(statusFilters).filter((k) => statusFilters[k]);
    setAppliedFilters({
      search: searchQuery.trim().toLowerCase(),
      type: selectedType,
      category: selectedCategory,
      statuses: activeStatuses
    });
    setCurrentPage(1);
    toast.info('Filters applied');
  };

  // Handle Reset Filter
  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedType('Select');
    setSelectedCategory('Select');
    setStatusFilters({
      Pending: false,
      Approved: false,
      Rejected: false
    });
    setAppliedFilters({
      search: '',
      type: 'Select',
      category: 'Select',
      statuses: []
    });
    setCurrentPage(1);
    toast.info('Filters reset');
  };

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Search
      if (appliedFilters.search) {
        const query = appliedFilters.search;
        const matchesName = req.studentName.toLowerCase().includes(query);
        const matchesUid = req.uid.toLowerCase().includes(query);
        const matchesId = req.id.toLowerCase().includes(query);
        if (!matchesName && !matchesUid && !matchesId) return false;
      }

      // Type
      if (appliedFilters.type !== 'Select' && req.requestType !== appliedFilters.type) {
        return false;
      }

      // Category
      if (appliedFilters.category !== 'Select' && req.category !== appliedFilters.category) {
        return false;
      }

      // Status
      if (appliedFilters.statuses.length > 0 && !appliedFilters.statuses.includes(req.status)) {
        return false;
      }

      return true;
    });
  }, [requests, appliedFilters]);

  // Paginated Requests
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage) || 1;
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRequests.slice(start, start + rowsPerPage);
  }, [filteredRequests, currentPage, rowsPerPage]);

  // Handle Quick Approve
  const handleApprove = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    if (detailModalItem && detailModalItem.id === id) {
      setDetailModalItem((prev) => ({ ...prev, status: 'Approved' }));
    }
    toast.success(`Gate pass ${id} approved successfully!`);
  };

  // Handle Quick Reject
  const handleReject = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    if (detailModalItem && detailModalItem.id === id) {
      setDetailModalItem((prev) => ({ ...prev, status: 'Rejected' }));
    }
    toast.error(`Gate pass ${id} marked as rejected!`);
  };

  // Export CSV
  const handleExport = () => {
    const headers = ['Request ID', 'Student Name', 'UID', 'Category', 'Request Type', 'Start Date', 'End Date', 'Duration', 'Reason', 'Status', 'Submitted Date'];
    const rows = filteredRequests.map((r) => [
      r.id,
      `"${r.studentName}"`,
      r.uid,
      r.category,
      r.requestType,
      r.startDate,
      r.endDate,
      `"${r.timeRange}"`,
      `"${r.reason}"`,
      r.status,
      r.submittedDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gate_pass_requests_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Gate pass requests exported to CSV!');
  };

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>Gate Pass Management</h2>
        <p className={styles.pageSubtitle}>View gate pass requests</p>
      </div>

      {/* Top 4 Metrics Grid */}
      <div className={styles.statsGrid}>
        {/* Total Requests */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Total Requests</p>
            <h3 className={styles.statValue}>{metrics.total}</h3>
          </div>
          <div className={`${styles.statIconWrapper} ${styles.iconTotal}`}>
            <IconUsers size={22} stroke={1.75} />
          </div>
        </div>

        {/* Pending */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Pending</p>
            <h3 className={styles.statValue}>{metrics.pending}</h3>
          </div>
          <div className={`${styles.statIconWrapper} ${styles.iconPending}`}>
            <IconSchool size={22} stroke={1.75} />
          </div>
        </div>

        {/* Approved */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Approved</p>
            <h3 className={styles.statValue}>{metrics.approved}</h3>
          </div>
          <div className={`${styles.statIconWrapper} ${styles.iconApproved}`}>
            <IconUsers size={22} stroke={1.75} />
          </div>
        </div>

        {/* Rejected */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Rejected</p>
            <h3 className={styles.statValue}>{metrics.rejected}</h3>
          </div>
          <div className={`${styles.statIconWrapper} ${styles.iconRejected}`}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersHeader}>
          <h4 className={styles.filtersTitle}>Filters</h4>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0F172A"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Top row */}
            <path d="M3 5h8" />
            <path d="M16 2v6" />
            <path d="M16 5h5" />

            {/* Middle row */}
            <path d="M3 12h5" />
            <path d="M8 9v6" />
            <path d="M13 12h8" />

            {/* Bottom row */}
            <path d="M3 19h9" />
            <path d="M17 16v6" />
            <path d="M17 19h4" />
          </svg>
        </div>

        {/* Filter Inputs */}
        <div className={styles.filterInputsRow}>
          {/* Search */}
          <div className={styles.filterField}>
            <span className={styles.fieldLabel}>Search</span>
            <div className={styles.searchInputWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by name or UID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilter();
                }}
              />
              <IconSearch size={18} className={styles.searchIcon} />
            </div>
          </div>

          {/* Request Type */}
          <div className={styles.filterField}>
            <span className={styles.fieldLabel}>Request Type</span>
            <CustomSelect
              options={REQUEST_TYPE_OPTIONS}
              value={selectedType}
              onChange={(val) => setSelectedType(val)}
              width="100%"
            />
          </div>

          {/* Student Category */}
          <div className={styles.filterField}>
            <span className={styles.fieldLabel}>Student</span>
            <CustomSelect
              options={CATEGORY_OPTIONS}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              width="100%"
            />
          </div>
        </div>

        {/* Status Checkboxes and Action Buttons */}
        <div className={styles.filterStatusRow}>
          <div className={styles.statusCheckboxes}>
            <span className={styles.statusGroupLabel}>Status</span>
            {['Pending', 'Approved', 'Rejected'].map((st) => (
              <label key={st} className={styles.statusCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={statusFilters[st]}
                  onChange={() => handleStatusCheckboxChange(st)}
                  className={styles.checkboxInput}
                />
                <span>{st}</span>
              </label>
            ))}
          </div>

          <div className={styles.filterActions}>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleResetFilter}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4" />
                <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
              </svg>
              <span>Reset</span>
            </button>
            <button
              type="button"
              className={styles.applyBtn}
              onClick={handleApplyFilter}
            >
              <IconCheck size={16} />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>
            Gate Pass Request ({filteredRequests.length})
          </h3>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleExport}
          >
            <IconDownload size={16} />
            <span>Export</span>
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student Name</th>
                <th>UID</th>
                <th>Category</th>
                <th>Request Type</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((req) => (
                  <tr key={req.id}>
                    <td className={styles.requestId}>{req.id}</td>
                    <td className={styles.studentName}>{req.studentName}</td>
                    <td className={styles.uid}>{req.uid}</td>
                    <td className={styles.categoryBadge}>
                      <strong>{req.category}</strong>
                    </td>
                    <td>
                      {req.requestType === 'Late Entry' && (
                        <span className={styles.typeLateEntry}>Late Entry</span>
                      )}
                      {req.requestType === 'Leave' && (
                        <span className={styles.typeLeave}>Leave</span>
                      )}
                      {req.requestType === 'Outing' && (
                        <span className={styles.typeOuting}>Outing</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.durationCell}>
                        <span className={styles.durationDate}>{req.startDate}</span>
                        <span className={styles.durationTime}>{req.timeRange}</span>
                      </div>
                    </td>
                    <td className={styles.reasonCell} title={req.reason}>
                      {req.reason}
                    </td>
                    <td>
                      {req.status === 'Pending' && (
                        <span className={styles.statusPending}>Pending</span>
                      )}
                      {req.status === 'Approved' && (
                        <span className={styles.statusApproved}>Approved</span>
                      )}
                      {req.status === 'Rejected' && (
                        <span className={styles.statusRejected}>Rejected</span>
                      )}
                    </td>
                    <td className={styles.submittedDate}>{req.submittedDate}</td>
                    <td>
                      <div className={styles.actionBtns}>
                        {/* View Detail */}
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title="View Details"
                          onClick={() => setDetailModalItem(req)}
                        >
                          <IconEye size={16} />
                        </button>

                        {/* Approve */}
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.iconBtnApprove}`}
                          title="Approve Request"
                          onClick={() => handleApprove(req.id)}
                          disabled={req.status === 'Approved'}
                        >
                          <IconCheck size={16} />
                        </button>

                        {/* Reject */}
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.iconBtnReject}`}
                          title="Reject Request"
                          onClick={() => handleReject(req.id)}
                          disabled={req.status === 'Rejected'}
                        >
                          <IconX size={16} />
                        </button>

                        {/* Logs */}
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title="View Audit Log"
                          onClick={() => toast.info(`Audit log viewed for ${req.id}`)}
                        >
                          <IconFileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
                    No gate pass requests found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className={styles.paginationRow}>
          <span className={styles.showingText}>
            Showing {filteredRequests.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-
            {Math.min(currentPage * rowsPerPage, filteredRequests.length)} of {filteredRequests.length}
          </span>

          <div className={styles.paginationControls}>
            <div className={styles.rowsPerPage}>
              <span>Rows per page</span>
              <CustomSelect
                options={[10, 20, 50]}
                value={rowsPerPage}
                onChange={(val) => {
                  setRowsPerPage(parseInt(val, 10));
                  setCurrentPage(1);
                }}
                width={72}
                size="small"
              />
            </div>

            <span className={styles.pageIndicator}>
              Page {currentPage} of {totalPages}
            </span>

            <div className={styles.pageNavBtns}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="First Page"
              >
                <IconChevronsLeft size={16} />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                title="Previous Page"
              >
                <IconChevronLeft size={16} />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                title="Next Page"
              >
                <IconChevronRight size={16} />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Last Page"
              >
                <IconChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {detailModalItem && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setDetailModalItem(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setDetailModalItem(null);
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Gate Pass Request Detail — {detailModalItem.id}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setDetailModalItem(null)}
              >
                <IconX size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Student Name</span>
                <span className={styles.detailValue}>{detailModalItem.studentName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>UID</span>
                <span className={styles.detailValue}>{detailModalItem.uid}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Category</span>
                <span className={styles.detailValue}>{detailModalItem.category}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Room / Hostel</span>
                <span className={styles.detailValue}>{detailModalItem.room}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Contact</span>
                <span className={styles.detailValue}>{detailModalItem.phone}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Request Type</span>
                <span className={styles.detailValue}>{detailModalItem.requestType}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Duration</span>
                <span className={styles.detailValue}>
                  {detailModalItem.startDate} ({detailModalItem.timeRange})
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Current Status</span>
                <span className={styles.detailValue}>
                  {detailModalItem.status === 'Pending' && (
                    <span className={styles.statusPending}>Pending</span>
                  )}
                  {detailModalItem.status === 'Approved' && (
                    <span className={styles.statusApproved}>Approved</span>
                  )}
                  {detailModalItem.status === 'Rejected' && (
                    <span className={styles.statusRejected}>Rejected</span>
                  )}
                </span>
              </div>

              <div>
                <span className={styles.detailLabel}>Reason / Justification:</span>
                <div className={styles.reasonBox}>{detailModalItem.reason}</div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              {detailModalItem.status !== 'Rejected' && (
                <button
                  type="button"
                  className={styles.rejectModalBtn}
                  onClick={() => handleReject(detailModalItem.id)}
                >
                  <IconX size={16} />
                  <span>Reject</span>
                </button>
              )}
              {detailModalItem.status !== 'Approved' && (
                <button
                  type="button"
                  className={styles.approveModalBtn}
                  onClick={() => handleApprove(detailModalItem.id)}
                >
                  <IconCheck size={16} />
                  <span>Approve</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatePassManagement;
