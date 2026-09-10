import React, { useState } from 'react';
import { Box } from '@mui/material';
import { IconSearch, IconDownload, IconFileSpreadsheet, IconChevronDown, IconChevronRight, IconArrowDown } from '@tabler/icons-react';
import styles from './DeductionSummaries.module.css';

const tableData = [
  {
    id: 1,
    group: 'Hostel Administration (July 2025)',
    employeeCount: 4,
    subtotal: '₹12,400',
    subtotalChange: '5%',
    rows: [
      { id: 11, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Hostel Admin', type: 'Hostel Rent (Room 36)', amount: '₹4,500', submittedBy: 'Hostel Warden', status: 'Submitted' },
      { id: 12, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Hostel Admin', type: 'Hostel Rent (Room 36)', amount: '₹4,500', submittedBy: 'Hostel Warden', status: 'Submitted' },
      { id: 13, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Hostel Admin', type: 'Hostel Rent (Room 36)', amount: '₹4,500', submittedBy: 'Hostel Warden', status: 'Submitted' },
      { id: 14, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Hostel Admin', type: 'Hostel Rent (Room 36)', amount: '₹4,500', submittedBy: 'Hostel Warden', status: 'Submitted' },
      { id: 15, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Hostel Admin', type: 'Hostel Rent (Room 36)', amount: '₹4,500', submittedBy: 'Hostel Warden', status: 'Submitted' },
    ]
  },
  {
    id: 2,
    group: 'Electricity Department (July 2025)',
    employeeCount: 4,
    subtotal: '₹12,400',
    subtotalChange: '5%',
    rows: [
      { id: 21, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Electricity Admin', type: 'Electricity Bill (Unit 36)', amount: '₹4,500', submittedBy: 'Electricity Officer', status: 'Submitted' },
      { id: 22, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Electricity Admin', type: 'Electricity Bill (Unit 36)', amount: '₹4,500', submittedBy: 'Electricity Officer', status: 'Locked' },
      { id: 23, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Electricity Admin', type: 'Electricity Bill (Unit 36)', amount: '₹4,500', submittedBy: 'Electricity Officer', status: 'Locked' },
      { id: 24, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Hostel Admin', type: 'Hostel Rent (Room 36)', amount: '₹4,500', submittedBy: 'Hostel Warden', status: 'Submitted' },
      { id: 25, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Hostel Admin', type: 'Hostel Rent (Room 36)', amount: '₹4,500', submittedBy: 'Hostel Warden', status: 'Submitted' },
      { id: 26, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Hostel Admin', type: 'Hostel Rent (Room 36)', amount: '₹4,500', submittedBy: 'Hostel Warden', status: 'Submitted' },
    ]
  },
  {
    id: 3,
    group: 'Office Desk (July 2025)',
    employeeCount: 4,
    subtotal: '₹12,400',
    subtotalChange: '5%',
    rows: [
      { id: 31, employee: 'Ajay Devgan (Ajay101)', empId: 'EMP235469', dept: 'Front Office', type: 'Late Arrival Surcharge', amount: '₹4,500', submittedBy: 'FO Manager', status: 'Submitted' },
      { id: 32, employee: 'Ajay Devgan (Ajay101)', empId: 'EMP235469', dept: 'Front Office', type: 'Uniform Adjustment', amount: '₹4,500', submittedBy: 'FO Manager', status: 'Submitted' },
      { id: 33, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Hostel Admin', type: 'Hostel Rent (Room 36)', amount: '₹4,500', submittedBy: 'Hostel Warden', status: 'Submitted' },
      { id: 34, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Hostel Admin', type: 'Hostel Rent (Room 36)', amount: '₹4,500', submittedBy: 'Hostel Warden', status: 'Submitted' },
      { id: 35, employee: 'Ayush Kumar (Ayush1204)', empId: 'EMP235469', dept: 'Hostel Admin', type: 'Hostel Rent (Room 36)', amount: '₹4,500', submittedBy: 'Hostel Warden', status: 'Submitted' },
    ]
  }
];

const DeductionSummaries = () => {
  const [expandedGroups, setExpandedGroups] = useState({
    1: true,
    2: true,
    3: true
  });

  const toggleGroup = (id) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box className={styles.container}>
      <div className={styles.filtersRow}>
        <div className={styles.filtersLeft}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Month</span>
            <select className={styles.selectInput} defaultValue="July 2025">
              <option value="July 2025">July 2025</option>
              <option value="June 2025">June 2025</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Department</span>
            <select className={styles.selectInput} defaultValue="All Departments">
              <option value="All Departments">All Departments</option>
              <option value="Hostel Admin">Hostel Admin</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Employee Search</span>
            <div className={styles.searchInputWrapper}>
              <IconSearch className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search by ID or name..." 
                className={`${styles.searchInput} ${styles.searchInputWithIcon}`}
              />
            </div>
          </div>
        </div>
        <div className={styles.filtersRight}>
          <button className={styles.btnExportPdf}>
            <IconDownload size={18} /> Export PDF
          </button>
          <button className={styles.btnExportExcel}>
            <IconDownload size={18} /> Export Excel
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Employee</th>
              <th className={styles.th}>Employee ID</th>
              <th className={styles.th}>Department</th>
              <th className={styles.th}>Deduction Type</th>
              <th className={styles.th}>Amount</th>
              <th className={styles.th}>Submitted By</th>
              <th className={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((group) => (
              <React.Fragment key={group.id}>
                {/* Group Header Row */}
                <tr className={styles.groupRow} onClick={() => toggleGroup(group.id)}>
                  <td colSpan={7}>
                    <div className={styles.groupCell}>
                      {expandedGroups[group.id] ? (
                        <IconChevronDown className={styles.chevronIcon} />
                      ) : (
                        <IconChevronRight className={styles.chevronIcon} />
                      )}
                      <span>{group.group}</span>
                      <span className={styles.badge}>{group.employeeCount} Employees</span>
                    </div>
                  </td>
                </tr>

                {/* Data Rows */}
                {expandedGroups[group.id] && group.rows.map((row) => (
                  <tr key={row.id}>
                    <td className={styles.tdEmployee}>{row.employee}</td>
                    <td className={styles.td}>{row.empId}</td>
                    <td className={styles.td}>{row.dept}</td>
                    <td className={styles.td}>{row.type}</td>
                    <td className={styles.tdAmount}>{row.amount}</td>
                    <td className={styles.td} style={{color: '#64748B'}}>{row.submittedBy}</td>
                    <td className={styles.tdStatus}>
                      <span className={`${styles.statusBadge} ${row.status === 'Submitted' ? styles.statusSubmitted : styles.statusLocked}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Subtotal Row */}
                {expandedGroups[group.id] && (
                  <tr className={styles.subtotalRow}>
                    <td colSpan={4} className={styles.subtotalLabelCell}>
                      {group.group.split(' (')[0]} Subtotal
                    </td>
                    <td colSpan={1} className={styles.subtotalAmountCell}>
                      <span className={styles.subtotalAmountText}>{group.subtotal}</span>{' '}
                      <span className={styles.increaseBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <IconArrowDown size={10} stroke={3} /> {group.subtotalChange}
                      </span>
                    </td>
                    <td colSpan={2} className={styles.subtotalEmptyCell}></td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
};

export default DeductionSummaries;
