import React, { useState } from 'react';
import { Box, Dialog } from '@mui/material';
import {
  IconAlertTriangle,
  IconFlag,
  IconLock,
  IconArrowsSort,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from '@tabler/icons-react';
import CustomSelect from 'ui-component/CustomSelect';
import styles from './PreProcessingReview.module.css';

const initialMockRows = Array(20).fill().map((_, i) => ({
  id: `row_${i + 1}`,
  empId: 'EMP3021',
  empName: 'Ananya Roy',
  department: 'Cardiology',
  designation: 'Surgeon',
  workingDays: 12,
  presentDays: 12,
  halfDays: 12,
  leaveDays: 12,
  absentDays: 12,
  payableDays: 12,
  approveOtHrs: '10 Hrs 48 min',
  otAmount: '₹ 93,000',
  totalDeductions: '₹ 93,000',
  isFlagged: i === 1 // 2nd row is flagged initially matching the screenshot
}));

const PreProcessingReview = () => {
  const [rows, setRows] = useState(initialMockRows);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toggle flag on click
  const handleToggleFlag = (id) => {
    setRows(prev =>
      prev.map(row => (row.id === id ? { ...row, isFlagged: !row.isFlagged } : row))
    );
  };

  const flaggedRowsCount = rows.filter(r => r.isFlagged).length;

  // Pagination calculation
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = rows.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Box className={styles.container}>
      {/* Re-review Context Warning Banner */}
      {flaggedRowsCount > 0 && (
        <div className={styles.topBannerRow}>
          <div className={styles.reReviewContextBox}>
            <IconAlertTriangle className={styles.warningIcon} />
            <span>Re-review Context: flagged {flaggedRowsCount} row{flaggedRowsCount > 1 ? 's' : ''}</span>
          </div>
          <div className={styles.flagsRaisedBox}>
            Flags raised: {flaggedRowsCount}
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>
                <div className={styles.thSortable}>
                  <span>Emp ID</span>
                  <IconArrowsSort className={styles.sortIcon} />
                </div>
              </th>
              <th className={styles.th}>Emp Name</th>
              <th className={styles.th}>Department</th>
              <th className={styles.th}>Designation</th>
              <th className={styles.th}>Working Days</th>
              <th className={styles.th}>Present Days</th>
              <th className={styles.th}>Half Days</th>
              <th className={styles.th}>Leave Days</th>
              <th className={styles.th}>Absent Days</th>
              <th className={styles.th}>Payable Days</th>
              <th className={styles.th}>Approve OT Hrs</th>
              <th className={styles.th}>OT Amount</th>
              <th className={styles.th}>Total Deductions</th>
              <th className={styles.th} style={{ textAlign: 'center' }}>Flag</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map(row => (
              <tr
                key={row.id}
                className={`${styles.tr} ${row.isFlagged ? styles.trFlagged : ''}`}
              >
                <td className={styles.tdBold}>{row.empId}</td>
                <td className={styles.tdBold}>{row.empName}</td>
                <td className={styles.td}>{row.department}</td>
                <td className={styles.td}>{row.designation}</td>
                <td className={styles.td}>{row.workingDays}</td>
                <td className={styles.td}>{row.presentDays}</td>
                <td className={styles.td}>{row.halfDays}</td>
                <td className={styles.td}>{row.leaveDays}</td>
                <td className={styles.td}>{row.absentDays}</td>
                <td className={styles.td}>{row.payableDays}</td>
                <td className={styles.td}>{row.approveOtHrs}</td>
                <td className={styles.td}>{row.otAmount}</td>
                <td className={styles.td}>{row.totalDeductions}</td>
                <td className={styles.td} style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className={styles.flagBtn}
                    onClick={() => handleToggleFlag(row.id)}
                    title={row.isFlagged ? 'Unflag row' : 'Flag row'}
                  >
                    {row.isFlagged ? (
                      <span className={styles.flagIconFlaggedWrapper}>
                        <IconFlag className={styles.flagIconFlagged} />
                      </span>
                    ) : (
                      <IconFlag className={styles.flagIconUnflagged} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className={styles.paginationRow}>
        <div className={styles.showingText}>
          Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalRows)} of {totalRows}
        </div>
        <div className={styles.paginationControls}>
          <div className={styles.rowsPerPage}>
            <span>Rows per page</span>
            <CustomSelect
              options={[10, 20, 50]}
              value={rowsPerPage}
              onChange={(val) => {
                setRowsPerPage(Number(val));
                setCurrentPage(1);
              }}
              size="small"
              width={65}
            />
          </div>
          <div>Page {currentPage} of {totalPages}</div>
          <div className={styles.pageNavigation}>
            <button
              className={styles.pageBtn}
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <IconChevronsLeft size={14} />
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <IconChevronLeft size={14} />
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              <IconChevronRight size={14} />
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              <IconChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer Action Bar */}
      <div className={styles.footerRow}>
        <div className={styles.footerLeft}>
          <IconLock className={styles.lockIcon} />
          <span>Read-only spreadsheet view. Submit corrections back to HR Administrator to adjust values.</span>
        </div>
        <div className={styles.footerRight}>
          <button
            type="button"
            className={styles.btnSendBack}
            onClick={() => setIsModalOpen(true)}
          >
            Send Back to HR Admin
          </button>
          <button
            type="button"
            className={styles.btnValidate}
            disabled
          >
            Validate & Approve
          </button>
        </div>
      </div>

      {/* Send Back for Review Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        PaperProps={{
          style: {
            borderRadius: 12,
            padding: '32px 28px 24px 28px',
            maxWidth: 440,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <div className={styles.modalIconCircle}>
          <IconAlertTriangle className={styles.modalIcon} />
        </div>
        <h2 className={styles.modalTitle}>Send Back for Review</h2>
        <p className={styles.modalDescription}>
          This action will reject the current preprocessing record and route it back to the HR Administrator for adjustments. They will receive your feedback and notes.
        </p>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.modalBtnCancel}
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.modalBtnSubmit}
            onClick={() => {
              setIsModalOpen(false);
              alert('Record successfully sent back to HR Administrator for adjustments.');
            }}
          >
            Submit
          </button>
        </div>
      </Dialog>
    </Box>
  );
};

export default PreProcessingReview;
