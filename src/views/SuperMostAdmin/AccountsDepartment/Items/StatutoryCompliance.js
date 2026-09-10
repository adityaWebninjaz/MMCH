import React, { useState } from 'react';
import { Box } from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import styles from './StatutoryCompliance.module.css';

const TABS = ['TDS', 'PT', 'PF', 'ESIC', 'ADVANCE'];

// Dummy data structures
const initialTdsData = Array(8).fill().map((_, i) => ({
  id: `tds_${i}`,
  employeeId: 'EMP235469',
  name: 'Dr. Arvind Swamy',
  dept: 'Cardiology',
  amount: '4,350',
}));

const initialPtData = Array(8).fill().map((_, i) => ({
  id: `pt_${i}`,
  employeeId: 'EMP235469',
  name: 'Dr. Arvind Swamy',
  dept: 'Cardiology',
  amount: i === 2 ? '' : '4,350',
}));

const initialPfData = Array(8).fill().map((_, i) => ({
  id: `pf_${i}`,
  employeeId: 'EMP235469',
  name: 'Dr. Arvind Swamy',
  basicSalary: '₹3,200',
  deduction: i === 0 ? 'Not applicable - above ceiling' : '₹3,200',
  isManualOverride: i === 4,
}));

const initialEsicData = Array(8).fill().map((_, i) => ({
  id: `esic_${i}`,
  employeeId: 'EMP235469',
  name: 'Dr. Arvind Swamy',
  grossSalary: '₹3,200',
  deduction: i === 3 ? 'not applicable above ceiling' : '₹3,200',
  recalculated: (i === 2 || i === 5) ? 'Recalculated: was ₹3,200 now ₹3,800' : null,
}));

const initialAdvanceData = Array(8).fill().map((_, i) => ({
  id: `adv_${i}`,
  employeeId: 'EMP235469',
  name: 'Dr. Arvind Swamy',
  dept: 'Emergency',
  amount: '4,350',
  notes: '-',
}));

const StatutoryCompliance = () => {
  const [activeTab, setActiveTab] = useState('TDS');

  // We could put these in state if we want them to be truly editable,
  // but for the UI layout demo, just mapping over the initial constants is fine.
  // Using useState to show input changes for a couple of tabs
  const [tdsData, setTdsData] = useState(initialTdsData);
  const [ptData, setPtData] = useState(initialPtData);
  const [advanceData, setAdvanceData] = useState(initialAdvanceData);

  const handleTdsChange = (id, val) => {
    setTdsData(prev => prev.map(item => item.id === id ? { ...item, amount: val } : item));
  };
  const handlePtChange = (id, val) => {
    setPtData(prev => prev.map(item => item.id === id ? { ...item, amount: val } : item));
  };
  const handleAdvanceChange = (id, field, val) => {
    setAdvanceData(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const renderFilters = () => (
    <div className={styles.filtersRow}>
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Employee Search</span>
        <div className={styles.searchInputWrapper}>
          <IconSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by ID or name..."
            className={styles.searchInput}
          />
        </div>
      </div>
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Department</span>
        <select className={styles.selectInput} defaultValue="All Departments">
          <option value="All Departments">All Departments</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Emergency">Emergency</option>
        </select>
      </div>
    </div>
  );

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'TDS':
        return (
          <tr>
            <th className={styles.th}>Employee ID</th>
            <th className={styles.th}>Name</th>
            <th className={styles.th}>Department</th>
            <th className={styles.th}>TDS Amount</th>
          </tr>
        );
      case 'PT':
        return (
          <tr>
            <th className={styles.th}>Employee ID</th>
            <th className={styles.th}>Name</th>
            <th className={styles.th}>Department</th>
            <th className={styles.th}>PT Amount</th>
          </tr>
        );
      case 'PF':
        return (
          <tr>
            <th className={styles.th}>Employee ID</th>
            <th className={styles.th}>Name</th>
            <th className={styles.th}>Basic Salary</th>
            <th className={styles.th}>PF Deduction</th>
            <th className={styles.th}>Action</th>
          </tr>
        );
      case 'ESIC':
        return (
          <tr>
            <th className={styles.th}>Employee ID</th>
            <th className={styles.th}>Name</th>
            <th className={styles.th}>Gross Salary</th>
            <th className={styles.th}>ESIC Deduction</th>
            <th className={styles.th}>Action</th>
          </tr>
        );
      case 'ADVANCE':
        return (
          <tr>
            <th className={styles.th}>Employee ID</th>
            <th className={styles.th}>Name</th>
            <th className={styles.th}>Department</th>
            <th className={styles.th}>Advance Amount</th>
            <th className={styles.th}>Notes</th>
          </tr>
        );
      default: return null;
    }
  };

  const renderTableBody = () => {
    if (activeTab === 'TDS') {
      return tdsData.map(row => (
        <tr key={row.id}>
          <td className={styles.tdEmployee}>{row.employeeId}</td>
          <td className={styles.tdName}>{row.name}</td>
          <td className={styles.tdDepartment}>{row.dept}</td>
          <td className={styles.td}>
            <input
              type="text"
              className={styles.amountInput}
              value={row.amount}
              onChange={(e) => handleTdsChange(row.id, e.target.value)}
            />
          </td>
        </tr>
      ));
    }
    if (activeTab === 'PT') {
      return ptData.map(row => (
        <tr key={row.id}>
          <td className={styles.tdEmployee}>{row.employeeId}</td>
          <td className={styles.tdName}>{row.name}</td>
          <td className={styles.tdDepartment}>{row.dept}</td>
          <td className={styles.td}>
            <input
              type="text"
              className={styles.amountInput}
              value={row.amount}
              onChange={(e) => handlePtChange(row.id, e.target.value)}
            />
          </td>
        </tr>
      ));
    }
    if (activeTab === 'PF') {
      return initialPfData.map(row => (
        <tr key={row.id}>
          <td className={styles.tdEmployee}>{row.employeeId}</td>
          <td className={styles.tdName}>{row.name}</td>
          <td className={styles.tdBold}>{row.basicSalary}</td>
          <td className={styles.td}>
            {row.deduction === 'Not applicable - above ceiling' ? (
              <span className={styles.notApplicableText}>{row.deduction}</span>
            ) : (
              <span className={styles.textBold}>{row.deduction}</span>
            )}
            {row.isManualOverride && (
              <span className={`${styles.badgeOverride} ${styles.badgeManualOverride}`}>
                Manual Override
              </span>
            )}
          </td>
          <td className={styles.td}>
            <button className={styles.overrideBtn}>Override</button>
          </td>
        </tr>
      ));
    }
    if (activeTab === 'ESIC') {
      return initialEsicData.map(row => (
        <tr key={row.id}>
          <td className={styles.tdEmployee}>{row.employeeId}</td>
          <td className={styles.tdName}>{row.name}</td>
          <td className={styles.tdBold}>{row.grossSalary}</td>
          <td className={styles.td}>
            {row.recalculated ? (
              <span className={styles.badgeOverride}>{row.recalculated}</span>
            ) : row.deduction === 'not applicable above ceiling' ? (
              <span className={styles.notApplicableText}>{row.deduction}</span>
            ) : (
              <span className={styles.textBold}>{row.deduction}</span>
            )}
          </td>
          <td className={styles.td}>
            <button className={styles.overrideBtn}>Override</button>
          </td>
        </tr>
      ));
    }
    if (activeTab === 'ADVANCE') {
      return advanceData.map(row => (
        <tr key={row.id}>
          <td className={styles.tdEmployee}>{row.employeeId}</td>
          <td className={styles.tdName}>{row.name}</td>
          <td className={styles.tdDepartment}>{row.dept}</td>
          <td className={styles.td}>
            <input
              type="text"
              className={styles.amountInput}
              value={row.amount}
              onChange={(e) => handleAdvanceChange(row.id, 'amount', e.target.value)}
            />
          </td>
          <td className={styles.td}>
            <input
              type="text"
              className={styles.notesInput}
              value={row.notes}
              onChange={(e) => handleAdvanceChange(row.id, 'notes', e.target.value)}
            />
          </td>
        </tr>
      ));
    }
    return null;
  };

  return (
    <Box className={styles.container}>
      {/* Tabs */}
      <div className={styles.tabsRow}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`${styles.tabItem} ${activeTab === tab ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            {renderTableHeaders()}
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className={styles.footerRow}>
        <div className={styles.footerLeft}>
          <span className={styles.totalText}>
            Total {activeTab === 'ADVANCE' ? 'Advance Deduction' : activeTab === 'ESIC' ? 'ESIC Deduction' : activeTab === 'PF' ? 'PF Deduction' : `${activeTab} Entered`}: <span className={styles.totalAmount}>₹ 12,400</span>
          </span>
          {activeTab === 'TDS' && (
            <span className={styles.footerMiddleText}>4 Employee have no TDS</span>
          )}
        </div>
        <div>
          <button className={styles.btnSubmit}>SUBMIT {activeTab}</button>
        </div>
      </div>
    </Box>
  );
};

export default StatutoryCompliance;
