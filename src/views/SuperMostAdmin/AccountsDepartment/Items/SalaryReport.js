import React, { useState } from 'react';
import { Box } from '@mui/material';
import {
  IconDownload,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from '@tabler/icons-react';
import styles from './SalaryReport.module.css';

const initialMockRows = [
  { id: 1, month: 'July 2025', department: 'Hostel Administration', employee: 15, grossSalary: '₹ 3,000', totalDeduction: '₹ 3,000', netPayable: '₹ 3,000' },
  { id: 2, month: 'July 2025', department: 'Electricity Department', employee: 15, grossSalary: '₹ 3,000', totalDeduction: '₹ 3,000', netPayable: '₹ 3,000' },
  { id: 3, month: 'July 2025', department: 'Front Office', employee: 15, grossSalary: '₹ 3,000', totalDeduction: '₹ 3,000', netPayable: '₹ 3,000' },
  { id: 4, month: 'July 2025', department: 'Transport Division', employee: 15, grossSalary: '₹ 3,000', totalDeduction: '₹ 3,000', netPayable: '₹ 3,000' },
  { id: 5, month: 'July 2025', department: 'Hostel Administration', employee: 15, grossSalary: '₹ 3,000', totalDeduction: '₹ 3,000', netPayable: '₹ 3,000' },
  { id: 6, month: 'July 2025', department: 'Hostel Administration', employee: 15, grossSalary: '₹ 3,000', totalDeduction: '₹ 3,000', netPayable: '₹ 3,000' },
];

const totalRow = {
  month: 'July Total',
  department: '',
  employee: 45,
  grossSalary: '₹ 23,000',
  totalDeduction: '₹ 23,000',
  netPayable: '₹ 23,000',
};

const SalaryReport = () => {
  const [department, setDepartment] = useState('All Departments');
  const [month, setMonth] = useState('July 2025');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = initialMockRows.filter(row => {
    const matchDept = department === 'All Departments' || row.department === department;
    const matchMonth = month === 'All' || row.month === month;
    return matchDept && matchMonth;
  });

  const totalRows = 20; // Indicative mock total for pagination view
  const totalPages = 10;

  const handleExportPdf = () => {
    alert('Exporting Salary Report to PDF...');
  };

  const handleExportExcel = () => {
    alert('Exporting Salary Report to Excel...');
  };

  return (
    <Box className={styles.container}>
      <h1 className={styles.title}>Salary Reports</h1>

      {/* Filters and Actions */}
      <div className={styles.filtersRow}>
        <div className={styles.filtersLeft}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Department</span>
            <select
              className={styles.selectInput}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="All Departments">All Departments</option>
              <option value="Hostel Administration">Hostel Administration</option>
              <option value="Electricity Department">Electricity Department</option>
              <option value="Front Office">Front Office</option>
              <option value="Transport Division">Transport Division</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Month</span>
            <select
              className={styles.selectInput}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="July 2025">July 2025</option>
              <option value="August 2025">August 2025</option>
              <option value="September 2025">September 2025</option>
              <option value="All">All</option>
            </select>
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
              <th className={styles.th}>Month</th>
              <th className={styles.th}>Department</th>
              <th className={styles.th}>Employee</th>
              <th className={styles.th}>Gross Salary</th>
              <th className={styles.th}>Total Deduction</th>
              <th className={styles.th}>Net Payable</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(row => (
              <tr key={row.id} className={styles.tr}>
                <td className={styles.tdBold}>{row.month}</td>
                <td className={styles.td}>{row.department}</td>
                <td className={styles.td}>{row.employee}</td>
                <td className={styles.tdBold}>{row.grossSalary}</td>
                <td className={styles.tdBold}>{row.totalDeduction}</td>
                <td className={styles.tdBold}>{row.netPayable}</td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className={styles.trTotal}>
              <td className={styles.tdTotal}>{totalRow.month}</td>
              <td className={styles.tdTotal}>{totalRow.department}</td>
              <td className={styles.tdTotal}>{totalRow.employee}</td>
              <td className={styles.tdTotal}>{totalRow.grossSalary}</td>
              <td className={styles.tdTotal}>{totalRow.totalDeduction}</td>
              <td className={styles.tdTotal}>{totalRow.netPayable}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className={styles.paginationRow}>
        <div className={styles.showingText}>
          Showing 1-10 of {totalRows}
        </div>
        <div className={styles.paginationControls}>
          <div className={styles.rowsPerPage}>
            <span>Rows per page</span>
            <select
              className={styles.rowsPerPageSelect}
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
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
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <IconChevronsLeft size={14} />
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <IconChevronLeft size={14} />
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              <IconChevronRight size={14} />
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              <IconChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default SalaryReport;
