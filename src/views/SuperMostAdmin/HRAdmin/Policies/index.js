import React, { useState, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import { IconSearch, IconCalendar } from '@tabler/icons-react';
import styles from './Policies.module.css';

const DEFAULT_OT_CONFIG = {
  rateMultiplier: '1.5',
  weekendMultiplier: '2.0',
  monthlyOtCap: '50'
};

const MOCK_EMPLOYEES = [
  { id: 'SUR-1004', name: 'Vinod Reddy', department: 'Surgery', balance: '3.5 days' },
  { id: 'EMP235469', name: 'Dr. Ravi Mehta', department: 'Cardiology', balance: '4.0 days' },
  { id: 'CMP1234', name: 'Dr. Shreya Krishnan', department: 'Radiology', balance: '2.5 days' },
  { id: 'EMP3021', name: 'Dr. Arvind Swamy', department: 'Emergency', balance: '5.0 days' },
  { id: 'EMP1092', name: 'Priya Sharma', department: 'Admin', balance: '1.0 day' }
];

const Policies = () => {
  const [activeTab, setActiveTab] = useState('overtime');

  // Overtime Policy States
  const [rateMultiplier, setRateMultiplier] = useState(DEFAULT_OT_CONFIG.rateMultiplier);
  const [weekendMultiplier, setWeekendMultiplier] = useState(DEFAULT_OT_CONFIG.weekendMultiplier);
  const [monthlyOtCap, setMonthlyOtCap] = useState(DEFAULT_OT_CONFIG.monthlyOtCap);
  const [savedOtConfig, setSavedOtConfig] = useState(DEFAULT_OT_CONFIG);
  const [isUpdatingOt, setIsUpdatingOt] = useState(false);

  // Compensatory Off Policy States
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(MOCK_EMPLOYEES[0]);

  // Adjustment Form States
  const [adjustmentDays, setAdjustmentDays] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [reason, setReason] = useState('');
  const [isApplyingAdjustment, setIsApplyingAdjustment] = useState(false);
  const dateInputRef = useRef(null);

  // Expiry Window States
  const [expiryDays, setExpiryDays] = useState('60');
  const [savedExpiryDays, setSavedExpiryDays] = useState('60');
  const [isSavingExpiry, setIsSavingExpiry] = useState(false);

  // Filter employees for search dropdown
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MOCK_EMPLOYEES;
    return MOCK_EMPLOYEES.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Format date for button display
  const formattedDisplayDate = useMemo(() => {
    if (!expiryDate) return 'dd/mm/yyyy';
    const d = new Date(expiryDate);
    if (isNaN(d.getTime())) return expiryDate;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [expiryDate]);

  // Handle Overtime Cancel
  const handleCancelOt = () => {
    setRateMultiplier(savedOtConfig.rateMultiplier);
    setWeekendMultiplier(savedOtConfig.weekendMultiplier);
    setMonthlyOtCap(savedOtConfig.monthlyOtCap);
    toast.info('Changes reverted to saved configuration');
  };

  // Handle Overtime Update
  const handleUpdateOt = () => {
    const rate = parseFloat(rateMultiplier);
    const weekend = parseFloat(weekendMultiplier);
    const cap = parseInt(monthlyOtCap, 10);

    if (isNaN(rate) || rate <= 0) {
      toast.error('Please enter a valid rate multiplier');
      return;
    }

    if (isNaN(weekend) || weekend <= 0) {
      toast.error('Please enter a valid holiday / weekend multiplier');
      return;
    }

    if (isNaN(cap) || cap <= 0) {
      toast.error('Please enter a valid monthly OT cap');
      return;
    }

    setIsUpdatingOt(true);
    setTimeout(() => {
      const newConfig = {
        rateMultiplier: String(rate),
        weekendMultiplier: String(weekend),
        monthlyOtCap: String(cap)
      };
      setSavedOtConfig(newConfig);
      setIsUpdatingOt(false);
      toast.success('Overtime policy updated successfully');
    }, 300);
  };

  // Handle Select Employee from search dropdown
  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Handle Apply Compensatory Off Adjustment
  const handleApplyAdjustment = (e) => {
    if (e) e.preventDefault();

    if (!adjustmentDays.trim()) {
      toast.error('Please specify the adjustment (+/- days)');
      return;
    }

    if (!expiryDate.trim()) {
      toast.error('Please enter the expiry date');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the adjustment');
      return;
    }

    setIsApplyingAdjustment(true);
    setTimeout(() => {
      setIsApplyingAdjustment(false);
      toast.success(`Compensatory off adjustment applied for ${selectedEmployee.name}`);
      setAdjustmentDays('');
      setExpiryDate('');
      setReason('');
    }, 400);
  };

  // Handle Cancel Adjustment Form
  const handleCancelAdjustment = () => {
    setAdjustmentDays('');
    setExpiryDate('');
    setReason('');
    toast.info('Adjustment form cleared');
  };

  // Handle Cancel Expiry Window
  const handleCancelExpiryWindow = () => {
    setExpiryDays(savedExpiryDays);
    toast.info('Expiry window reverted to saved value');
  };

  // Handle Save Expiry Window
  const handleSaveExpiryWindow = () => {
    const daysNum = parseInt(expiryDays, 10);
    if (isNaN(daysNum) || daysNum <= 0) {
      toast.error('Please enter a valid number of days');
      return;
    }

    setIsSavingExpiry(true);
    setTimeout(() => {
      setSavedExpiryDays(String(daysNum));
      setIsSavingExpiry(false);
      toast.success('Compensatory off expiry window updated successfully');
    }, 300);
  };

  return (
    <div className={styles.container}>
      {/* Page Title */}
      <h2 className={styles.pageTitle}>Policies</h2>

      {/* Tabs Switcher */}
      <div className={styles.tabsWrapper}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'overtime' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('overtime')}
        >
          Overtime
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'compensatory_off' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('compensatory_off')}
        >
          Compensatory Off
        </button>
      </div>

      {/* Overtime Policy View (Screenshot 1) */}
      {activeTab === 'overtime' && (
        <div className={styles.contentGrid}>
          {/* Left Form Card */}
          <div className={styles.formCard}>
            <div className={styles.configGroup}>
              <label htmlFor="rateMultiplier" className={styles.configLabel}>
                Rate Multiplier
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="rateMultiplier"
                  type="number"
                  step="0.1"
                  className={styles.inputNumber}
                  value={rateMultiplier}
                  onChange={(e) => setRateMultiplier(e.target.value)}
                />
                <span className={styles.inputSuffix}>× base</span>
              </div>
            </div>

            <div className={styles.configGroup}>
              <label htmlFor="weekendMultiplier" className={styles.configLabel}>
                Holiday / Weekend Multiplier
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="weekendMultiplier"
                  type="number"
                  step="0.1"
                  className={styles.inputNumber}
                  value={weekendMultiplier}
                  onChange={(e) => setWeekendMultiplier(e.target.value)}
                />
                <span className={styles.inputSuffix}>× base</span>
              </div>
            </div>

            <div className={styles.configGroup}>
              <label htmlFor="monthlyOtCap" className={styles.configLabel}>
                Monthly OT Cap
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="monthlyOtCap"
                  type="number"
                  className={styles.inputNumber}
                  value={monthlyOtCap}
                  onChange={(e) => setMonthlyOtCap(e.target.value)}
                />
                <span className={styles.inputSuffix}>hours</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className={styles.cardFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancelOt}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleUpdateOt}
                disabled={isUpdatingOt}
              >
                {isUpdatingOt ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Right Shared Config Card */}
          <div className={styles.helperCard}>
            <h3 className={styles.helperCardTitle}>Shared config</h3>

            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                <span className={styles.bulletDot}>•</span>
                <span>
                  HOD screen · <strong>OT Recommendation Detail</strong>
                </span>
              </li>
              <li className={styles.bulletItem}>
                <span className={styles.bulletDot}>•</span>
                <span>
                  Management screen · <strong>OT Final Approval Detail</strong>
                </span>
              </li>
              <li className={styles.bulletItem}>
                <span className={styles.bulletDot}>•</span>
                <span>
                  Payroll cycle · <strong>Pre-processing calculation</strong>
                </span>
              </li>
            </ul>

            <div className={styles.noteBox}>
              <p className={styles.noteText}>
                Changing the Monthly OT Cap updates the &quot;X/cap hrs used&quot; indicator shown to all HODs and Management immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compensatory Off Policy View (Screenshot 2) */}
      {activeTab === 'compensatory_off' && (
        <div className={styles.contentGrid}>
          {/* Left Section: Search + Employee Card + Adjustment Form */}
          <div className={styles.compoffLeftSection}>
            {/* Search Input with Dropdown */}
            <div className={styles.searchWrapper}>
              <IconSearch className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search by ID or name..."
                className={styles.searchInput}
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
                        className={styles.dropdownItemBtn}
                        onClick={() => handleSelectEmployee(emp)}
                      >
                        <span className={styles.dropdownItemName}>{emp.name}</span>
                        <span className={styles.dropdownItemMeta}>
                          {emp.id} · {emp.department} · Balance: {emp.balance}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Selected Employee Info Box */}
            <div className={styles.empCard}>
              <div className={styles.empDetails}>
                <h4 className={styles.empName}>{selectedEmployee.name}</h4>
                <p className={styles.empMeta}>
                  {selectedEmployee.id} · {selectedEmployee.department}
                </p>
              </div>
              <div className={styles.empBalance}>
                <span className={styles.balanceLabel}>CURRENT BALANCE</span>
                <span className={styles.balanceValue}>
                  {(() => {
                    const parts = String(selectedEmployee?.balance || '').split(' ');
                    const num = parts[0] || '0';
                    const unit = parts.slice(1).join(' ') || 'days';
                    return (
                      <>
                        {num} <span className={styles.balanceUnit}>{unit}</span>
                      </>
                    );
                  })()}
                </span>
              </div>
            </div>

            {/* Adjustment Form Card */}
            <form onSubmit={handleApplyAdjustment} className={styles.compoffFormCard}>
              <div className={styles.formFieldsRow}>
                {/* Adjustment Days */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="adjDaysInput" className={styles.fieldLabel}>
                    ADJUSTMENT (+/- DAYS) <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    id="adjDaysInput"
                    type="text"
                    className={styles.fieldInput}
                    placeholder="e.g. +1.0 or -0.5"
                    value={adjustmentDays}
                    onChange={(e) => setAdjustmentDays(e.target.value)}
                  />
                </div>

                {/* Expiry Date */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="expiryDateBtn" className={styles.fieldLabel}>
                    EXPIRY DATE <span className={styles.requiredStar}>*</span>
                  </label>
                  <button
                    id="expiryDateBtn"
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
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className={styles.hiddenDateInput}
                  />
                </div>
              </div>

              {/* Reason */}
              <div className={styles.fieldGroup}>
                <label htmlFor="adjReason" className={styles.reasonLabel}>
                  Reason (Audit Logged) <span className={styles.requiredStar}>*</span>
                </label>
                <textarea
                  id="adjReason"
                  className={styles.fieldTextarea}
                  placeholder="Provide justification"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {/* Form Action Buttons */}
              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCancelAdjustment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isApplyingAdjustment}
                >
                  {isApplyingAdjustment ? 'Applying...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Expiry Window Card */}
          <div className={styles.helperCard}>
            <h3 className={styles.helperCardTitle}>Expiry Window</h3>

            <div className={styles.inputWrapper}>
              <input
                type="number"
                className={styles.inputNumber}
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
              />
              <span className={styles.inputSuffix}>days</span>
            </div>

            <div className={styles.noteBox}>
              <p className={styles.noteBulletHeader}>
                • Applies only to credits issued after this change.
              </p>
              <p className={styles.noteText}>
                Already-issued credits keep their original expiry date. To retroactively change existing credits, use the manual adjustment console.
              </p>
            </div>

            {/* Expiry Window Footer */}
            <div className={styles.cardFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancelExpiryWindow}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSaveExpiryWindow}
                disabled={isSavingExpiry}
              >
                {isSavingExpiry ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
