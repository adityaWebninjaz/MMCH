/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import styles from './BalanceOverride.module.css';

const EMPLOYEES = [
  {
    id: 'HOS-1001',
    name: 'Shreya Krishnan',
    department: 'Hostel',
    designation: 'Security Officer',
    balances: { cl: '4.8', lwp: '4.8', compOff: '4.8' }
  },
  {
    id: 'EMP-77412',
    name: 'Rajesh Kumar',
    department: 'Account',
    designation: 'Account Manager',
    balances: { cl: '6.0', lwp: '2.5', compOff: '3.0' }
  },
  {
    id: 'EMP-235469',
    name: 'Dr. Arvind Swamy',
    department: 'Cardiology',
    designation: 'Consultant',
    balances: { cl: '8.0', lwp: '0.0', compOff: '5.5' }
  },
  {
    id: 'EMP-235470',
    name: 'Dr. Ananya Roy',
    department: 'ICU',
    designation: 'Senior Resident',
    balances: { cl: '5.2', lwp: '1.0', compOff: '2.0' }
  }
];

const BalanceOverride = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(EMPLOYEES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [newCl, setNewCl] = useState('');
  const [newLwp, setNewLwp] = useState('');
  const [newCompOff, setNewCompOff] = useState('');
  const [reason, setReason] = useState('');
  const searchWrapperRef = useRef(null);

  const filteredEmployees = EMPLOYEES.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setSearchQuery('');
    setShowDropdown(false);
    setNewCl('');
    setNewLwp('');
    setNewCompOff('');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveAndOverride = (e) => {
    e.preventDefault();

    if (!newCl && !newLwp && !newCompOff) {
      toast.info('Please enter at least one new balance value to override');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please specify a reason for the override');
      return;
    }

    // Update balances locally
    setSelectedEmployee((prev) => ({
      ...prev,
      balances: {
        cl: newCl !== '' ? newCl : prev.balances.cl,
        lwp: newLwp !== '' ? newLwp : prev.balances.lwp,
        compOff: newCompOff !== '' ? newCompOff : prev.balances.compOff
      }
    }));

    toast.success(`Leave balance overridden successfully for ${selectedEmployee.name}`);
    setNewCl('');
    setNewLwp('');
    setNewCompOff('');
  };

  const handleCancel = () => {
    setNewCl('');
    setNewLwp('');
    setNewCompOff('');
    setReason('');
    toast.info('Form reset');
  };

  return (
    <Box className={styles.container}>
      <h2 className={styles.pageTitle}>Leave Balance Override</h2>

      {/* Employee Search */}
      <div className={styles.searchSection} ref={searchWrapperRef}>
        <label htmlFor="employeeSearch" className={styles.searchLabel}>
          Employee Search
        </label>
        <div className={styles.searchWrapper}>
          <IconSearch className={styles.searchIcon} size={18} />
          <input
            id="employeeSearch"
            type="text"
            className={styles.searchInput}
            placeholder="Search by ID or name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />

          {showDropdown && filteredEmployees.length > 0 && (
            <ul className={styles.dropdownList}>
              {filteredEmployees.map((emp) => (
                <li key={emp.id}>
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => handleSelectEmployee(emp)}
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span className={styles.dropdownItemName}>{emp.name}</span>
                    <span className={styles.dropdownItemMeta}>
                      {emp.id} · {emp.department} · {emp.designation}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Employee Details & Override Card */}
      <div className={styles.card}>
        <div className={styles.employeeHeader}>
          <h3 className={styles.employeeName}>{selectedEmployee.name}</h3>
          <p className={styles.employeeMeta}>
            {selectedEmployee.id} · {selectedEmployee.department} · {selectedEmployee.designation}
          </p>
        </div>

        <form onSubmit={handleSaveAndOverride}>
          <div className={styles.leavesGrid}>
            <div className={styles.leaveBox}>
              <label htmlFor="clInput" className={styles.leaveTitle}>CASUAL LEAVE (CL)</label>
              <span className={styles.currentBalanceText}>
                Current: <strong className={styles.currentBalanceValue}>{selectedEmployee.balances.cl}</strong>
              </span>
              <input
                id="clInput"
                type="number"
                step="0.1"
                className={styles.leaveInput}
                placeholder="New Value"
                value={newCl}
                onChange={(e) => setNewCl(e.target.value)}
              />
            </div>

            <div className={styles.leaveBox}>
              <label htmlFor="lwpInput" className={styles.leaveTitle}>LEAVE WITHOUT PAY (LWP)</label>
              <span className={styles.currentBalanceText}>
                Current: <strong className={styles.currentBalanceValue}>{selectedEmployee.balances.lwp}</strong>
              </span>
              <input
                id="lwpInput"
                type="number"
                step="0.1"
                className={styles.leaveInput}
                placeholder="New Value"
                value={newLwp}
                onChange={(e) => setNewLwp(e.target.value)}
              />
            </div>

            <div className={styles.leaveBox}>
              <label htmlFor="compOffInput" className={styles.leaveTitle}>COMPENSATORY OFF (COMP OFF)</label>
              <span className={styles.currentBalanceText}>
                Current: <strong className={styles.currentBalanceValue}>{selectedEmployee.balances.compOff}</strong>
              </span>
              <input
                id="compOffInput"
                type="number"
                step="0.1"
                className={styles.leaveInput}
                placeholder="New Value"
                value={newCompOff}
                onChange={(e) => setNewCompOff(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.reasonSection}>
            <label htmlFor="overrideReason" className={styles.reasonLabel}>
              REASON
            </label>
            <textarea
              id="overrideReason"
              className={styles.reasonTextarea}
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className={styles.actionRow}>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn}>
              Save and Override
            </button>
          </div>
        </form>
      </div>
    </Box>
  );
};

export default BalanceOverride;
