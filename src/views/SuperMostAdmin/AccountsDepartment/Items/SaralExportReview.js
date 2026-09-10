import React, { useState } from 'react';
import { Box } from '@mui/material';
import {
  IconSearch,
  IconDownload,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from '@tabler/icons-react';
import styles from './SaralExportReview.module.css';

const initialMockRows = Array(20).fill().map((_, i) => ({
  id: `saral_${i + 1}`,
  employeeId: 'EMP3021',
  employeeName: 'Dr. Arvind Swamy',
  uan: '100987453210',
  pfEmployee: '₹ 1800',
  pfEmployer: '₹ 1800',
  esiEmployee: '₹ 320',
  esiEmployer: '₹ 320',
  pt: '₹ 200',
  tds: '₹ 1500',
  basicSalary: '₹ 49,440',
  totalPayable: '₹ 49,440',
}));

const SaralExportReview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter rows by search term
  const filteredRows = initialMockRows.filter(row =>
    row.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.uan.includes(searchTerm)
  );

  // Pagination calculation
  const totalRows = filteredRows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleExportPdf = () => {
    alert('Exporting SARAL report to PDF...');
  };

  const handleExportExcel = () => {
    alert('Exporting SARAL report to Excel...');
  };

  return (
    <Box className={styles.container}>
      {/* Title */}
      <h1 className={styles.title}>SARAL Export</h1>

      {/* Top Search and Export Actions */}
      <div className={styles.actionsRow}>
        <div className={styles.searchGroup}>
          <span className={styles.searchLabel}>Employee Search</span>
          <div className={styles.searchInputWrapper}>
            <IconSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by ID or name..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className={styles.btnGroup}>
          <button
            type="button"
            className={styles.btnExportPdf}
            onClick={handleExportPdf}
          >
            Export PDF
          </button>
          <button
            type="button"
            className={styles.btnExportExcel}
            onClick={handleExportExcel}
          >
            <IconDownload className={styles.downloadIcon} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Employee Id</th>
              <th className={styles.th}>Employee Name</th>
              <th className={styles.th}>UAN</th>
              <th className={styles.th}>PF(Employee)</th>
              <th className={styles.th}>PF(Employer)</th>
              <th className={styles.th}>ESI(Employee)</th>
              <th className={styles.th}>ESI(Employer)</th>
              <th className={styles.th}>PT</th>
              <th className={styles.th}>TDS</th>
              <th className={styles.th}>Basic Salary</th>
              <th className={styles.th}>Total Payable</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map(row => (
              <tr key={row.id} className={styles.tr}>
                <td className={styles.tdBold}>{row.employeeId}</td>
                <td className={styles.td}>{row.employeeName}</td>
                <td className={styles.td}>{row.uan}</td>
                <td className={styles.tdBold}>{row.pfEmployee}</td>
                <td className={styles.tdBold}>{row.pfEmployer}</td>
                <td className={styles.tdBold}>{row.esiEmployee}</td>
                <td className={styles.tdBold}>{row.esiEmployer}</td>
                <td className={styles.tdBold}>{row.pt}</td>
                <td className={styles.tdBold}>{row.tds}</td>
                <td className={styles.tdBold}>{row.basicSalary}</td>
                <td className={styles.tdBold}>{row.totalPayable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className={styles.paginationRow}>
        <div className={styles.showingText}>
          Showing {totalRows > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + rowsPerPage, totalRows)} of {totalRows}
        </div>
        <div className={styles.paginationControls}>
          <div className={styles.rowsPerPage}>
            <span>Rows per page</span>
            <select
              className={styles.rowsPerPageSelect}
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
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

      {/* Bottom Footer Note */}
      <div className={styles.footerNote}>
        Read-only spreadsheet view. Submit corrections back to HR Administrator to adjust values.
      </div>
    </Box>
  );
};

export default SaralExportReview;
