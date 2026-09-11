import React, { useState, useEffect, useMemo } from 'react';
import { IconCalendar, IconChevronDown, IconDownload, IconSearch } from '@tabler/icons-react';
import { CircularProgress, Select, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';
import {
  getDepartmentAttendanceSummary,
  getDepartmentWiseAttendanceMatrix,
  exportAttendanceToPDF,
  exportAttendanceToExcel,
  exportGridMatrixToPDF,
  exportGridMatrixToExcel
} from '../Services/hrAttendanceService';
import AttendanceGrid from './Components/Grid';
import styles from './Attendance.module.css';

// Department filter options
const DEPARTMENT_OPTIONS = [
  { id: 'all', name: 'All Departments' },
  { id: 'Emergency', name: 'Emergency' },
  { id: 'ICU', name: 'ICU' },
  { id: 'General Medicine', name: 'General Medicine' },
  { id: 'Surgery', name: 'Surgery' },
  { id: 'Paediatrics', name: 'Paediatrics' },
  { id: 'Radiology', name: 'Radiology' },
  { id: 'Pharmacy', name: 'Pharmacy' },
  { id: 'Administration', name: 'Administration' },
  { id: 'Hostel', name: 'Hostel' }
];

const MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

// Helper to format ISO date "YYYY-MM-DD" to "12 July 2025"
const formatDateToDisplay = (isoDateStr) => {
  if (!isoDateStr) return '12 July 2025';
  try {
    const [year, month, day] = isoDateStr.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    if (isNaN(dateObj.getTime())) return isoDateStr;
    return dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return isoDateStr;
  }
};

const Attendance = () => {
  // Navigation tab: 'dashboard' | 'grid'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filter state
  const [selectedDate, setSelectedDate] = useState('2025-07-12');
  const [selectedMonth, setSelectedMonth] = useState('July');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Summary dataset for Dashboard view
  const [summaryData, setSummaryData] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Load department attendance stats for Dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      const loadSummary = async () => {
        setLoadingSummary(true);
        try {
          const data = await getDepartmentAttendanceSummary(selectedDate, selectedDepartment);
          setSummaryData(data || []);
        } catch (err) {
          console.error('Failed to load attendance summary:', err);
          toast.error('Failed to load attendance summary data');
        } finally {
          setLoadingSummary(false);
        }
      };

      loadSummary();
    }
  }, [selectedDate, selectedDepartment, activeTab]);

  // Formatted date string for UI display and export
  const formattedDisplayDate = useMemo(() => {
    return formatDateToDisplay(selectedDate);
  }, [selectedDate]);

  // Department name string for export
  const selectedDepartmentName = useMemo(() => {
    const found = DEPARTMENT_OPTIONS.find((d) => d.id === selectedDepartment);
    return found ? found.name : 'All Departments';
  }, [selectedDepartment]);

  // Export PDF Handler (handles both Dashboard summary and Grid matrix)
  const handleExportPDF = async () => {
    try {
      if (activeTab === 'dashboard') {
        exportAttendanceToPDF({
          dateFormatted: formattedDisplayDate,
          departmentName: selectedDepartmentName,
          summaryData
        });
      } else {
        const matrixData = await getDepartmentWiseAttendanceMatrix({
          month: selectedMonth,
          year: selectedYear,
          department: selectedDepartment,
          search: searchTerm
        });
        exportGridMatrixToPDF({
          month: selectedMonth,
          year: selectedYear,
          departmentName: selectedDepartmentName,
          matrixData
        });
      }
      toast.success('Attendance PDF exported successfully!');
    } catch (err) {
      toast.error('Failed to export PDF');
    }
  };

  // Export Excel Handler (handles both Dashboard summary and Grid matrix)
  const handleExportExcel = async () => {
    try {
      if (activeTab === 'dashboard') {
        exportAttendanceToExcel({
          dateFormatted: formattedDisplayDate,
          departmentName: selectedDepartmentName,
          summaryData
        });
      } else {
        const matrixData = await getDepartmentWiseAttendanceMatrix({
          month: selectedMonth,
          year: selectedYear,
          department: selectedDepartment,
          search: searchTerm
        });
        exportGridMatrixToExcel({
          month: selectedMonth,
          year: selectedYear,
          departmentName: selectedDepartmentName,
          matrixData
        });
      }
      toast.success('Attendance Excel report exported successfully!');
    } catch (err) {
      toast.error('Failed to export Excel');
    }
  };

  return (
    <div className={styles.attendancePage}>
      {/* 1. Top Tab Navigation Switcher */}
      <div className={styles.tabsContainer}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'grid' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('grid')}
        >
          Grid
        </button>
      </div>

      {/* 2. Filter & Action Controls Bar */}
      <div className={styles.controlsRow}>
        <div className={styles.filtersGroup}>
          {/* If Dashboard View: Date Picker */}
          {activeTab === 'dashboard' ? (
            <div className={styles.filterItem}>
              <label htmlFor="attendance-date-picker" className={styles.filterLabel}>
                Date
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.dateInputCustom}>
                  <span>{formattedDisplayDate}</span>
                  <IconCalendar size={18} color="#64748B" />
                </div>
                <input
                  id="attendance-date-picker"
                  type="date"
                  className={styles.dateNativeInput}
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            /* If Grid View: Month Selector */
            <div className={styles.filterItem}>
              <label htmlFor="attendance-month-select" className={styles.filterLabel}>
                Month
              </label>
              <Select
                id="attendance-month-select"
                size="small"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                IconComponent={() => (
                  <IconCalendar size={18} stroke={1.75} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
                )}
                sx={{
                  height: '32px',
                  width: '180px',
                  bgcolor: '#FFFFFF',
                  borderRadius: '6px !important',
                  fontFamily: "'Inter', sans-serif !important",
                  '& .MuiOutlinedInput-notchedOutline, & fieldset': {
                    borderColor: '#E2E8F0',
                    borderRadius: '6px !important'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline, &:hover fieldset': {
                    borderColor: '#CBD5E1'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused fieldset': {
                    borderColor: '#644EE5',
                    borderWidth: '1.5px'
                  },
                  '& .MuiSelect-select': {
                    py: 0,
                    pl: '12px !important',
                    pr: '32px !important',
                    display: 'flex',
                    alignItems: 'center',
                    height: '32px',
                    fontSize: '13px !important',
                    fontWeight: '400 !important',
                    color: '#1E293B !important',
                    fontFamily: "'Inter', sans-serif !important",
                    boxSizing: 'border-box',
                    borderRadius: '6px !important'
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#FFFFFF',
                      borderRadius: '6px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid #E2E8F0',
                      mt: 0.5,
                      maxHeight: '260px'
                    }
                  }
                }}
              >
                {MONTH_OPTIONS.map((m) => (
                  <MenuItem
                    key={m}
                    value={m}
                    sx={{
                      fontSize: '13px !important',
                      fontWeight: '400 !important',
                      fontFamily: "'Inter', sans-serif !important",
                      color: '#1E293B !important',
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '&.Mui-selected': { bgcolor: '#EEF2FF', color: '#644EE5 !important', fontWeight: '500 !important' }
                    }}
                  >
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}

          {/* Department Select Dropdown (shared) */}
          <div className={styles.filterItem}>
            <label htmlFor="attendance-dept-select" className={styles.filterLabel}>
              Department
            </label>
            <Select
              id="attendance-dept-select"
              size="small"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              IconComponent={() => (
                <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
              )}
              sx={{
                height: '32px',
                width: '180px',
                bgcolor: '#FFFFFF',
                borderRadius: '6px !important',
                fontFamily: "'Inter', sans-serif !important",
                '& .MuiOutlinedInput-notchedOutline, & fieldset': {
                  borderColor: '#E2E8F0',
                  borderRadius: '6px !important'
                },
                '&:hover .MuiOutlinedInput-notchedOutline, &:hover fieldset': {
                  borderColor: '#CBD5E1'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused fieldset': {
                  borderColor: '#644EE5',
                  borderWidth: '1.5px'
                },
                '& .MuiSelect-select': {
                  py: 0,
                  pl: '12px !important',
                  pr: '32px !important',
                  display: 'flex',
                  alignItems: 'center',
                  height: '32px',
                  fontSize: '13px !important',
                  fontWeight: '400 !important',
                  color: '#1E293B !important',
                  fontFamily: "'Inter', sans-serif !important",
                  boxSizing: 'border-box',
                  borderRadius: '6px !important'
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#FFFFFF',
                    borderRadius: '6px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #E2E8F0',
                    mt: 0.5
                  }
                }
              }}
            >
              {DEPARTMENT_OPTIONS.map((dept) => (
                <MenuItem
                  key={dept.id}
                  value={dept.id}
                  sx={{
                    fontSize: '13px !important',
                    fontWeight: '400 !important',
                    fontFamily: "'Inter', sans-serif !important",
                    color: '#1E293B !important',
                    '&:hover': { bgcolor: '#F8FAFC' },
                    '&.Mui-selected': { bgcolor: '#EEF2FF', color: '#644EE5 !important', fontWeight: '500 !important' }
                  }}
                >
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </div>

          {/* If Grid View: Employee Search Input */}
          {activeTab === 'grid' && (
            <div className={styles.filterItem}>
              <label htmlFor="attendance-emp-search" className={styles.filterLabel}>
                Employee Search
              </label>
              <div className={styles.searchWrapper}>
                <span className={styles.searchIconField}>
                  <IconSearch size={16} stroke={2} />
                </span>
                <input
                  id="attendance-emp-search"
                  type="text"
                  className={styles.searchField}
                  placeholder="Search by ID or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Export PDF and Export Excel */}
        <div className={styles.actionsGroup}>
          <button type="button" className={styles.btnExportPdf} onClick={handleExportPDF}>
            <IconDownload size={18} />
            Export PDF
          </button>
          <button type="button" className={styles.btnExportExcel} onClick={handleExportExcel}>
            <IconDownload size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* 3. Main Content: Dashboard Cards OR Detailed Grid View */}
      {activeTab === 'dashboard' ? (
        loadingSummary ? (
          <div className={styles.loadingSpinnerWrapper}>
            <CircularProgress size={32} sx={{ color: '#644EE5' }} />
            <span style={{ fontSize: '14px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
              Loading department attendance...
            </span>
          </div>
        ) : summaryData.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>No attendance data available</div>
            <div className={styles.emptySubtitle}>Please select a different date or department filter.</div>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {summaryData.map((item) => (
              <div key={item.id || item.department} className={styles.attendanceCard}>
                {/* Card Header: Department Name + Divider + Total Staff */}
                <div className={styles.cardHeader}>
                  <span className={styles.deptTitle}>{item.department}</span>
                  <span className={styles.headerDivider}></span>
                  <span className={styles.staffCount}>Total {item.totalStaff} staff</span>
                </div>

                {/* Card Body: 4 KPI Metrics */}
                <div className={styles.statsRow}>
                  {/* Present */}
                  <div className={styles.statItem}>
                    <span className={`${styles.statValue} ${styles.statValuePresent}`}>{item.present}</span>
                    <span className={styles.statLabel}>Present</span>
                  </div>

                  {/* Absent */}
                  <div className={styles.statItem}>
                    <span className={`${styles.statValue} ${styles.statValueAbsent}`}>{item.absent}</span>
                    <span className={styles.statLabel}>Absent</span>
                  </div>

                  {/* Holiday */}
                  <div className={styles.statItem}>
                    <span className={`${styles.statValue} ${styles.statValueHoliday}`}>{item.holiday}</span>
                    <span className={styles.statLabel}>Holiday</span>
                  </div>

                  {/* Leave */}
                  <div className={styles.statItem}>
                    <span className={`${styles.statValue} ${styles.statValueLeave}`}>{item.leave}</span>
                    <span className={styles.statLabel}>Leave</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <AttendanceGrid
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedDepartment={selectedDepartment}
          searchTerm={searchTerm}
        />
      )}
    </div>
  );
};

export default Attendance;
