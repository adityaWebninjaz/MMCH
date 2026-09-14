/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useState, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import CustomSelect from 'ui-component/CustomSelect';
import styles from './PayrollCycle.module.css';

const STEPS = [
  { id: 1, label: 'Payroll Cycle' },
  { id: 2, label: 'Verification Checklist' },
  { id: 3, label: 'Pre - Processing' },
  { id: 4, label: 'Saral Export' },
  { id: 5, label: 'Payslip' }
];

const DEPARTMENT_OPTIONS = [
  { value: 'All Departments', label: 'All Departments' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'General Medicine', label: 'General Medicine' }
];

const INITIAL_RECORDS = Array.from({ length: 10 }, (_, index) => ({
  uniqueId: `emp_${index + 1}`,
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
  totalDeductions: '₹ 93,000'
}));

const PayrollCycle = () => {
  const [activeStep, setActiveStep] = useState(1);

  // Step 1 Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auditLogNote, setAuditLogNote] = useState('');

  // Step 3 Filters & Table States
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [selectedDate, setSelectedDate] = useState('12 July 2025');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Step 4 Saral Export States
  const [step4State, setStep4State] = useState('initial'); // 'initial' | 'exported' | 'awaiting_review' | 'locked'
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockAuditNote, setLockAuditNote] = useState('');

  // Step 5 Payslip Distribution States
  const [uploadedSalaryFile, setUploadedSalaryFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Step 1 Handlers
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAuditLogNote('');
  };

  const handleConfirmStartCycle = () => {
    if (!auditLogNote.trim()) {
      toast.error('Please enter a note for the audit log.');
      return;
    }

    toast.success('Payroll cycle started and attendance locked for July 2026!');
    setIsModalOpen(false);
    setAuditLogNote('');
    setActiveStep(2);
  };

  // Step 2 Handlers
  const handleInitiatePreProcessing = () => {
    toast.info('Initiating pre-processing sheet...');
    setActiveStep(3);
  };

  // Step 3 Inline Edit Handlers
  const handleStartEdit = (row) => {
    setEditingRowId(row.uniqueId);
    setEditFormData({
      workingDays: row.workingDays,
      presentDays: row.presentDays,
      halfDays: row.halfDays,
      leaveDays: row.leaveDays,
      absentDays: row.absentDays,
      payableDays: row.payableDays,
      approveOtHrs: row.approveOtHrs,
      otAmount: row.otAmount,
      totalDeductions: row.totalDeductions
    });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditFormData({});
  };

  const handleSaveEdit = (uniqueId) => {
    setRecords((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId ? { ...item, ...editFormData } : item
      )
    );
    setEditingRowId(null);
    setEditFormData({});
    toast.success('Record updated successfully!');
  };

  const handleFieldChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportPDF = () => {
    toast.success('Exporting Pre-processing sheet as PDF...');
  };

  const handleExportExcel = () => {
    toast.success('Exporting Pre-processing sheet as Excel...');
  };

  const handleSendToAccounts = () => {
    toast.success('Pre-processing sheet sent to Accounts successfully!');
    setActiveStep(4);
    setStep4State('initial');
  };

  // Step 4 Handlers
  const handleExportPayrollSheet = () => {
    toast.success('Payroll sheet exported for SARAL successfully!');
    setStep4State('exported');
  };

  const handleSendForAccountReview = () => {
    toast.success('Sent for Account Review successfully!');
    setStep4State('awaiting_review');
  };

  const handleOpenLockModal = () => {
    setIsLockModalOpen(true);
  };

  const handleCloseLockModal = () => {
    setIsLockModalOpen(false);
    setLockAuditNote('');
  };

  const handleConfirmLockExport = () => {
    if (!lockAuditNote.trim()) {
      toast.error('Please enter a reason for locking the export.');
      return;
    }

    toast.success('Export locked successfully!');
    setIsLockModalOpen(false);
    setLockAuditNote('');
    setStep4State('locked');
  };

  const handleProceedToPayslip = () => {
    toast.success('Proceeding to Payslip Generation...');
    setActiveStep(5);
  };

  const handlePreviewExport = () => {
    toast.info('Previewing PMCH_SARAL_Payroll_072026.xlsx...');
  };

  // Step 5 Payslip Distribution Handlers
  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedSalaryFile({
        name: file.name || 'June 2026 Salary',
        details: 'PDF • Uploaded on 15 Jan 2020'
      });
      toast.success('Salary file imported successfully!');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedSalaryFile({
        name: file.name || 'June 2026 Salary',
        details: 'PDF • Uploaded on 15 Jan 2020'
      });
      toast.success('Salary file imported successfully!');
    }
  };

  const handleTriggerBulkWhatsapp = () => {
    toast.success('Bulk dispatch through WhatsApp triggered successfully!');
  };

  const handleGeneratePdfPayslips = () => {
    toast.success('PDF Payslips generated successfully!');
  };

  // Filtered records for search & department
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesDept =
        selectedDepartment === 'All Departments' ||
        rec.department.toLowerCase() === selectedDepartment.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        rec.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.empName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [records, selectedDepartment, searchQuery]);

  return (
    <div className={styles.container}>
      {/* 5-Step Progress Stepper */}
      <div className={styles.stepperContainer}>
        {STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={styles.stepItem}>
              <div
                className={`${styles.stepCircle} ${
                  activeStep === step.id
                    ? styles.stepCircleActive
                    : activeStep > step.id
                    ? styles.stepCircleCompleted
                    : ''
                }`}
              >
                {step.id}
              </div>
              <span
                className={`${styles.stepLabel} ${
                  activeStep === step.id ? styles.stepLabelActive : ''
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`${styles.stepConnector} ${
                  activeStep > step.id ? styles.stepConnectorActive : ''
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Payroll Cycle (Initial) */}
      {activeStep === 1 && (
        <div className={styles.contentCard}>
          <div className={styles.monthHeadingWrapper}>
            <h2 className={styles.monthHeading}>July 2026</h2>
          </div>
          <p className={styles.disclaimerText}>
            Starting the cycle locks attendance for the selected month. This action is irreversible.
          </p>
          <button
            type="button"
            className={styles.startBtn}
            onClick={handleOpenModal}
          >
            Start Payroll Cycle
          </button>
        </div>
      )}

      {/* Step 2: Verification Checklist */}
      {activeStep === 2 && (
        <div className={styles.contentCard}>
          <p className={styles.subHeaderLabel}>Payroll Cycle</p>
          <h2 className={styles.monthHeading}>July 2026</h2>

          <div className={styles.statusRow}>
            <span className={styles.processingBadge}>Processing</span>
            <span className={styles.startedTimestamp}>Started 21 Jul, 09:14</span>
          </div>

          <p className={styles.sectionSubtitle}>Verification Checklist</p>

          <div className={styles.checklistGroup}>
            <div className={styles.checklistItem}>
              <span className={styles.checkIconSuccess}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>Attendance locked</span>
            </div>

            <div className={styles.checklistItem}>
              <span className={styles.checkIconSuccess}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>Deductions window closed</span>
            </div>

            <div className={styles.checklistItem}>
              <span className={styles.checkIconPending}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </span>
              <span>Statutory & Advance Entry finalized</span>
              <span className={styles.pendingBadge}>Accounts : Pending</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.startBtn}
            onClick={handleInitiatePreProcessing}
          >
            Initiate pre processing sheet
          </button>
        </div>
      )}

      {/* Step 3: Pre - Processing */}
      {activeStep === 3 && (
        <div className={styles.step3Container}>
          {/* Filters & Export Row */}
          <div className={styles.filtersRow}>
            <div className={styles.leftFilterControls}>
              {/* Date */}
              <div className={styles.filterField}>
                <span className={styles.filterLabel}>Date</span>
                <div className={styles.dateInputWrapper}>
                  <input
                    type="text"
                    className={styles.dateInput}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={styles.calendarIcon}>
                    <rect x="4" y="5" width="16" height="16" rx="2" />
                    <line x1="16" y1="3" x2="16" y2="7" />
                    <line x1="8" y1="3" x2="8" y2="7" />
                    <line x1="4" y1="11" x2="20" y2="11" />
                    <rect x="8" y="15" width="2" height="2" />
                  </svg>
                </div>
              </div>

              {/* Department */}
              <div className={styles.filterField}>
                <span className={styles.filterLabel}>Department</span>
                <CustomSelect
                  options={DEPARTMENT_OPTIONS}
                  value={selectedDepartment}
                  onChange={(val) => setSelectedDepartment(val)}
                  width="180px"
                />
              </div>

              {/* Employee Search */}
              <div className={styles.filterField}>
                <span className={styles.filterLabel}>Employee Search</span>
                <div className={styles.searchInputWrapper}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by ID or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className={styles.exportBtnGroup}>
              <button
                type="button"
                className={styles.exportPdfBtn}
                onClick={handleExportPDF}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                  <polyline points="7 11 12 16 17 11" />
                  <line x1="12" y1="4" x2="12" y2="16" />
                </svg>
                <span>Export PDF</span>
              </button>
              <button
                type="button"
                className={styles.exportExcelBtn}
                onClick={handleExportExcel}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                  <polyline points="7 11 12 16 17 11" />
                  <line x1="12" y1="4" x2="12" y2="16" />
                </svg>
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th>
                    <span className={styles.sortHeader}>
                      Emp ID
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l4-4l4 4M7 5v14M21 15l-4 4l-4-4M17 19V5" />
                      </svg>
                    </span>
                  </th>
                  <th>Emp Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Working Days</th>
                  <th>Present Days</th>
                  <th>Half Days</th>
                  <th>Leave Days</th>
                  <th>Absent Days</th>
                  <th>Payable Days</th>
                  <th>Approve OT Hrs</th>
                  <th>OT Amount</th>
                  <th>Total Deductions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((row) => {
                  const isEditing = editingRowId === row.uniqueId;
                  return (
                    <tr key={row.uniqueId}>
                      <td>{row.empId}</td>
                      <td className={styles.empName}>{row.empName}</td>
                      <td>{row.department}</td>
                      <td>{row.designation}</td>

                      {/* Working Days */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.editInput}
                            value={editFormData.workingDays}
                            onChange={(e) =>
                              handleFieldChange('workingDays', e.target.value)
                            }
                          />
                        ) : (
                          row.workingDays
                        )}
                      </td>

                      {/* Present Days */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.editInput}
                            value={editFormData.presentDays}
                            onChange={(e) =>
                              handleFieldChange('presentDays', e.target.value)
                            }
                          />
                        ) : (
                          row.presentDays
                        )}
                      </td>

                      {/* Half Days */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.editInput}
                            value={editFormData.halfDays}
                            onChange={(e) =>
                              handleFieldChange('halfDays', e.target.value)
                            }
                          />
                        ) : (
                          row.halfDays
                        )}
                      </td>

                      {/* Leave Days */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.editInput}
                            value={editFormData.leaveDays}
                            onChange={(e) =>
                              handleFieldChange('leaveDays', e.target.value)
                            }
                          />
                        ) : (
                          row.leaveDays
                        )}
                      </td>

                      {/* Absent Days */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.editInput}
                            value={editFormData.absentDays}
                            onChange={(e) =>
                              handleFieldChange('absentDays', e.target.value)
                            }
                          />
                        ) : (
                          row.absentDays
                        )}
                      </td>

                      {/* Payable Days */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.editInput}
                            value={editFormData.payableDays}
                            onChange={(e) =>
                              handleFieldChange('payableDays', e.target.value)
                            }
                          />
                        ) : (
                          row.payableDays
                        )}
                      </td>

                      {/* Approve OT Hrs */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.editInputWide}
                            value={editFormData.approveOtHrs}
                            onChange={(e) =>
                              handleFieldChange('approveOtHrs', e.target.value)
                            }
                          />
                        ) : (
                          row.approveOtHrs
                        )}
                      </td>

                      {/* OT Amount */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.editInputWide}
                            value={editFormData.otAmount}
                            onChange={(e) =>
                              handleFieldChange('otAmount', e.target.value)
                            }
                          />
                        ) : (
                          row.otAmount
                        )}
                      </td>

                      {/* Total Deductions */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.editInputWide}
                            value={editFormData.totalDeductions}
                            onChange={(e) =>
                              handleFieldChange('totalDeductions', e.target.value)
                            }
                          />
                        ) : (
                          row.totalDeductions
                        )}
                      </td>

                      {/* Action column */}
                      <td>
                        {isEditing ? (
                          <div className={styles.editActionGroup}>
                            <button
                              type="button"
                              className={styles.cancelRowBtn}
                              title="Cancel"
                              onClick={handleCancelEdit}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className={styles.saveRowBtn}
                              title="Save"
                              onClick={() => handleSaveEdit(row.uniqueId)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={styles.editRowBtn}
                            title="Edit Record"
                            onClick={() => handleStartEdit(row)}
                          >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                              <path d="M13.5 6.5l4 4" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className={styles.paginationRow}>
            <span className={styles.showingText}>Showing 1-10 of 20</span>

            <div className={styles.paginationControls}>
              <div className={styles.rowsPerPage}>
                <span>Rows per page</span>
                <select
                  value={10}
                  disabled
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '13px',
                    color: '#1E293B',
                    background: '#FFFFFF'
                  }}
                >
                  <option value={10}>10</option>
                </select>
              </div>

              <span className={styles.pageIndicator}>Page 1 of 10</span>

              <div className={styles.pageNavBtns}>
                <button type="button" className={styles.navBtn} disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                  </svg>
                </button>
                <button type="button" className={styles.navBtn} disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button type="button" className={styles.navBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button type="button" className={styles.navBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Send to Accounts Button */}
          <div className={styles.bottomActionRow}>
            <button
              type="button"
              className={styles.sendToAccountsBtn}
              onClick={handleSendToAccounts}
            >
              Send to Accounts
            </button>
          </div>
        </div>
      )}

      {/* Step 4: SARAL Export */}
      {activeStep === 4 && (
        <div className={styles.contentCard}>
          <p className={styles.subHeaderLabel}>SARAL Export</p>
          <h2 className={styles.monthHeading}>Export for external payroll processing</h2>

          {/* Initial State (Screenshot 1) */}
          {step4State === 'initial' && (
            <div className={styles.saralExportCard}>
              <div>
                <button
                  type="button"
                  className={styles.startBtn}
                  onClick={handleExportPayrollSheet}
                >
                  Export Payroll sheet
                </button>
              </div>
            </div>
          )}

          {/* Exported / Draft State (Screenshot 2) */}
          {step4State === 'exported' && (
            <div className={styles.saralExportCard}>
              <div className={styles.saralHeaderRow}>
                <span className={styles.saralDraftBadge}>Draft</span>
                <span className={styles.saralFileName}>
                  PMCH_SARAL_Payroll_072026.xlsx — v2
                </span>
              </div>

              <div className={styles.validationBanner}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>
                  Validation passed — employee count matches, no negative payable days, all fields populated.
                </span>
              </div>

              <div className={styles.saralActionBtns}>
                <button
                  type="button"
                  className={styles.startBtn}
                  onClick={handleSendForAccountReview}
                >
                  Send For Account Review
                </button>
                <button
                  type="button"
                  className={styles.previewExportBtn}
                  onClick={handlePreviewExport}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Preview export</span>
                </button>
              </div>
            </div>
          )}

          {/* Awaiting Review State (Screenshot 3 & 4) */}
          {step4State === 'awaiting_review' && (
            <div className={styles.saralExportCard}>
              <div className={styles.saralHeaderRow}>
                <span className={styles.saralAwaitingBadge}>Sent Awaiting Accounts</span>
                <span className={styles.saralFileName}>
                  PMCH_SARAL_Payroll_072026.xlsx — v2
                </span>
              </div>

              <div className={styles.validationBanner}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>
                  Validation passed — employee count matches, no negative payable days, all fields populated.
                </span>
              </div>

              <div className={styles.saralActionBtns}>
                <button
                  type="button"
                  className={styles.startBtn}
                  onClick={handleOpenLockModal}
                >
                  Lock Payroll Sheet
                </button>
                <button
                  type="button"
                  className={styles.previewExportBtn}
                  onClick={handlePreviewExport}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Preview export</span>
                </button>
              </div>
            </div>
          )}

          {/* Locked State (Screenshot 5) */}
          {step4State === 'locked' && (
            <div className={styles.saralExportCard}>
              <div className={styles.saralHeaderRow}>
                <span className={styles.saralFileName}>
                  PMCH_SARAL_Payroll_072026.xlsx — v2
                </span>
              </div>

              <div className={styles.validationBanner}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>
                  Validation passed — employee count matches, no negative payable days, all fields populated.
                </span>
              </div>

              <div className={styles.saralActionBtns}>
                <button
                  type="button"
                  className={styles.startBtn}
                  onClick={handleProceedToPayslip}
                >
                  Proceed to Payslip Generation
                </button>
                <button
                  type="button"
                  className={styles.previewExportBtn}
                  onClick={handlePreviewExport}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Preview export</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Payslip Distribution */}
      {activeStep === 5 && (
        <div className={styles.contentCard}>
          <p className={styles.subHeaderLabel}>Payslip Distribution</p>
          <h2 className={styles.monthHeading}>Import, dispatch</h2>

          {!uploadedSalaryFile ? (
            /* Screenshot 1: Drag & Drop Dropzone */
            <div
              className={`${styles.dropzoneCard} ${
                isDragging ? styles.dropzoneDragging : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              role="button"
              tabIndex={0}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleFileInputChange}
              />
              <div className={styles.dropzoneCloudIcon}>
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                  <path d="M12 12v9" />
                  <path d="m8 16 4-4 4 4" />
                </svg>
              </div>
              <p className={styles.dropzoneTitle}>
                Drag and drop confirmed Excel here
              </p>
              <p className={styles.dropzoneSubtitle}>
                Supports .xlsx, .csv up to 10MB
              </p>
            </div>
          ) : (
            /* Screenshot 2: Imported Salary Data & Payslip Generation */
            <div className={styles.step5ImportedContainer}>
              {/* Card 1: Import Confirmed Salary Data */}
              <div className={styles.salaryDataCard}>
                <h4 className={styles.salaryDataCardTitle}>
                  Import Confirmed Salary Data
                </h4>
                <div className={styles.salaryFilePreviewBox}>
                  <div className={styles.salaryDocIcon}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#64748B"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div className={styles.salaryFileInfo}>
                    <div className={styles.salaryFileName}>
                      {uploadedSalaryFile.name}
                    </div>
                    <div className={styles.salaryFileSubtext}>
                      {uploadedSalaryFile.details}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rows Imported Success Banner */}
              <div className={styles.importedSuccessRow}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>58 rows imported and mapped successfully.</span>
              </div>

              {/* Trigger Bulk Dispatch WhatsApp Button */}
              <div>
                <button
                  type="button"
                  className={styles.bulkDispatchBtn}
                  onClick={handleTriggerBulkWhatsapp}
                >
                  Trigger Bulk Dispatch Through Whasatsapp
                </button>
              </div>

              {/* Card 2: Generate Payslips */}
              <div className={styles.generatePayslipsCard}>
                <h4 className={styles.salaryDataCardTitle}>
                  Generate Payslips
                </h4>
                <div>
                  <button
                    type="button"
                    className={styles.generatePdfBtn}
                    onClick={handleGeneratePdfPayslips}
                  >
                    Generate PDF Payslips
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal Popup for Step 1 */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <h3 className={styles.modalTitle}>
              Start payroll cycle for July 2026?
            </h3>

            <textarea
              className={styles.auditTextarea}
              placeholder="Required - this will be written to the audit log"
              value={auditLogNote}
              onChange={(e) => setAuditLogNote(e.target.value)}
              rows={4}
              autoFocus
            />

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelModalBtn}
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmModalBtn}
                onClick={handleConfirmStartCycle}
              >
                Start Cycle,Lock Attandance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lock Export Modal Popup for Step 4 (Screenshot 4) */}
      {isLockModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseLockModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <h3 className={styles.modalTitle}>Lock this export?</h3>

            <div>
              <span className={styles.reasonFormLabel}>
                REASON <span className={styles.requiredStar}>*</span>
              </span>
              <textarea
                className={styles.auditTextarea}
                placeholder="Required - this will be written to the audit log"
                value={lockAuditNote}
                onChange={(e) => setLockAuditNote(e.target.value)}
                rows={4}
                autoFocus
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelModalBtn}
                onClick={handleCloseLockModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmModalBtn}
                onClick={handleConfirmLockExport}
              >
                Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollCycle;
