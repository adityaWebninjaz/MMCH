/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useState, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  IconPlus,
  IconCalendar,
  IconX
} from '@tabler/icons-react';
import CustomSelect from 'ui-component/CustomSelect';
import styles from './Holidays.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEPARTMENTS = [
  'Emergency',
  'ICU',
  'General Medicine',
  'Surgery',
  'Pediatrics',
  'Radiology',
  'Pharmacy',
  'Administration',
  'Hostel',
  'Security'
];

const INITIAL_HOLIDAYS_2026 = [
  {
    id: 1,
    name: 'Republic Day',
    date: '2026-01-26',
    displayDate: '26 Jan 2026',
    type: 'National Holiday',
    appliesTo: 'All',
    departmentOverride: false,
    overrideDepartments: []
  },
  {
    id: 2,
    name: 'Holi',
    date: '2026-03-17',
    displayDate: '17 Mar 2026',
    type: 'Restricted Holiday',
    appliesTo: 'All',
    departmentOverride: false,
    overrideDepartments: []
  },
  {
    id: 3,
    name: 'Ambedkar Jayanti',
    date: '2026-04-14',
    displayDate: '14 Apr 2026',
    type: 'National Holiday',
    appliesTo: 'All',
    departmentOverride: false,
    overrideDepartments: []
  },
  {
    id: 4,
    name: 'Labour Day',
    date: '2026-05-01',
    displayDate: '01 May 2026',
    type: 'State Holiday',
    appliesTo: 'All',
    departmentOverride: true,
    overrideDepartments: ['Emergency', 'ICU']
  },
  {
    id: 5,
    name: 'Independence Day',
    date: '2026-08-15',
    displayDate: '15 Aug 2026',
    type: 'National Holiday',
    appliesTo: 'All',
    departmentOverride: false,
    overrideDepartments: []
  },
  {
    id: 6,
    name: 'Onam',
    date: '2026-09-05',
    displayDate: '05 Sep 2026',
    type: 'State Holiday',
    appliesTo: 'All',
    departmentOverride: false,
    overrideDepartments: []
  },
  {
    id: 7,
    name: 'Gandhi Jayanti',
    date: '2026-10-02',
    displayDate: '02 Oct 2026',
    type: 'National Holiday',
    appliesTo: 'All',
    departmentOverride: false,
    overrideDepartments: []
  },
  {
    id: 8,
    name: 'Diwali',
    date: '2026-11-08',
    displayDate: '08 Nov 2026',
    type: 'National Holiday',
    appliesTo: 'All',
    departmentOverride: false,
    overrideDepartments: []
  },
  {
    id: 9,
    name: 'Foundation Day',
    date: '2026-12-01',
    displayDate: '01 Dec 2026',
    type: 'Institution Specific Holiday',
    appliesTo: 'All',
    departmentOverride: false,
    overrideDepartments: []
  },
  {
    id: 10,
    name: 'Christmas',
    date: '2026-12-25',
    displayDate: '25 Dec 2026',
    type: 'National Holiday',
    appliesTo: 'All',
    departmentOverride: false,
    overrideDepartments: []
  }
];

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(month, 10) - 1;
  return `${day} ${monthNamesShort[monthIdx]} ${year}`;
};

const Holidays = () => {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [holidays, setHolidays] = useState(INITIAL_HOLIDAYS_2026);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('National Holiday');
  const [appliesTo, setAppliesTo] = useState('All');
  const [departmentOverride, setDepartmentOverride] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  const dateInputRef = useRef(null);

  // Filter holidays for selected year
  const yearHolidays = useMemo(() => {
    return holidays.filter((h) => {
      if (!h.date) return false;
      const yr = parseInt(h.date.split('-')[0], 10);
      return yr === selectedYear;
    });
  }, [holidays, selectedYear]);

  // Map month index (0-11) to its holidays
  const holidaysByMonth = useMemo(() => {
    const map = {};
    for (let i = 0; i < 12; i++) {
      map[i] = [];
    }
    yearHolidays.forEach((h) => {
      const monthIdx = parseInt(h.date.split('-')[1], 10) - 1;
      const dayNum = parseInt(h.date.split('-')[2], 10);
      if (map[monthIdx]) {
        map[monthIdx].push({ ...h, dayNum });
      }
    });
    return map;
  }, [yearHolidays]);

  // Toggle department checkbox
  const handleDepartmentToggle = (dept) => {
    setSelectedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  // Open Modal and reset form
  const handleOpenModal = (presetDate = '') => {
    setName('');
    setDate(presetDate || `${selectedYear}-01-01`);
    setType('Female');
    setAppliesTo('Specific');
    setDepartmentOverride(true);
    setSelectedDepartments([]);
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle Form Submit
  const handleAddHoliday = (e) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter the holiday name');
      return;
    }

    if (!date) {
      toast.error('Please select a date');
      return;
    }

    const newHoliday = {
      id: Date.now(),
      name: name.trim(),
      date,
      displayDate: formatDateDisplay(date),
      type,
      appliesTo,
      departmentOverride,
      overrideDepartments: departmentOverride ? selectedDepartments : []
    };

    setHolidays((prev) => [...prev, newHoliday]);
    toast.success(`Holiday "${name.trim()}" added successfully!`);
    handleCloseModal();
  };

  // Render Month Calendar Box
  const renderMonthCard = (monthIndex) => {
    const monthName = MONTH_NAMES[monthIndex];
    const monthHolidays = holidaysByMonth[monthIndex] || [];
    const holidayCount = monthHolidays.length;

    // Calculate days in month and starting day of week
    // JS Date month is 0-indexed. Day 0 of next month is total days in current month.
    const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
    // getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
    // We want Monday = 0, Sunday = 6
    const firstDayIndex = (new Date(selectedYear, monthIndex, 1).getDay() + 6) % 7;

    const cells = [];
    // Leading empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className={styles.emptyCell} />);
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const isHoliday = monthHolidays.some((h) => h.dayNum === day);
      const matchedHoliday = monthHolidays.find((h) => h.dayNum === day);

      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          className={`${styles.dayCell} ${isHoliday ? styles.holidayCell : ''}`}
          title={matchedHoliday ? `${matchedHoliday.name} (${matchedHoliday.type})` : undefined}
          onClick={() => {
            if (!isHoliday) {
              const formattedM = String(monthIndex + 1).padStart(2, '0');
              const formattedD = String(day).padStart(2, '0');
              handleOpenModal(`${selectedYear}-${formattedM}-${formattedD}`);
            }
          }}
        >
          {day}
        </button>
      );
    }

    return (
      <div key={monthIndex} className={styles.monthCard}>
        <div className={styles.monthHeader}>
          <h4 className={styles.monthTitle}>
            {monthName} {selectedYear}
          </h4>
          <span className={styles.holidayBadge}>
            {holidayCount} {holidayCount === 1 ? 'holiday' : 'holidays'}
          </span>
        </div>

        <div className={styles.weekDaysRow}>
          {WEEK_DAYS.map((d, idx) => (
            <span
              key={d}
              className={`${styles.weekDayHeader} ${idx >= 5 ? styles.weekendHeader : ''}`}
            >
              {d}
            </span>
          ))}
        </div>

        <div className={styles.daysMatrix}>{cells}</div>

        <div className={styles.monthFooter}>
          {monthHolidays.length > 0 ? (
            monthHolidays.map((h) => (
              <div key={h.id} className={styles.holidayNotice}>
                <span className={styles.bulletDot}>•</span>
                <span>
                  {h.displayDate}{' '}
                  <strong className={styles.holidayNameHighlight}>{h.name}</strong>
                </span>
              </div>
            ))
          ) : (
            <span className={styles.noHolidayNotice}>No holidays scheduled</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <h2 className={styles.pageTitle}>Holiday Calendar Setup</h2>
        </div>

        <div className={styles.headerRight}>
          <CustomSelect
            options={[2024, 2025, 2026, 2027, 2028, 2029, 2030]}
            value={selectedYear}
            onChange={(val) => setSelectedYear(parseInt(val, 10))}
            width={100}
            buttonClassName={styles.customYearSelectBtn}
          />

          <button
            type="button"
            className={styles.addHolidayBtn}
            onClick={() => handleOpenModal()}
          >
            <IconPlus size={16} stroke={2} />
            <span>Add Holiday</span>
          </button>
        </div>
      </div>

      {/* 12 Months Calendar Grid */}
      <div className={styles.calendarGrid}>
        {MONTH_NAMES.map((_, idx) => renderMonthCard(idx))}
      </div>

      {/* Holidays List Table */}
      <div className={styles.tableContainer}>
        <table className={styles.holidaysTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Type</th>
              <th>Applies to</th>
              <th>Working Days For</th>
            </tr>
          </thead>
          <tbody>
            {yearHolidays.length > 0 ? (
              yearHolidays.map((h) => (
                <tr key={h.id}>
                  <td className={styles.dateCell}>{h.displayDate}</td>
                  <td className={styles.nameCell}>{h.name}</td>
                  <td className={styles.typeCell}>{h.type}</td>
                  <td>{h.appliesTo === 'All' ? 'All Department' : 'Specific Departments'}</td>
                  <td>
                    {h.departmentOverride && h.overrideDepartments?.length > 0 ? (
                      <span className={styles.workingDaysBadge}>
                        {h.overrideDepartments.join(' : ')}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
                  No holidays configured for {selectedYear}. Click &quot;Add Holiday&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Holiday Modal */}
      {isModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={handleCloseModal}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCloseModal();
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="document"
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Holiday</h3>
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className={styles.modalForm}>
              {/* Name */}
              <div className={styles.fieldGroup}>
                <label htmlFor="holidayNameInput" className={styles.fieldLabel}>
                  Name <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="holidayNameInput"
                  type="text"
                  className={styles.textInput}
                  placeholder="e.g. Republic Day"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Date */}
              <div className={styles.fieldGroup}>
                <label htmlFor="holidayHiddenDate" className={styles.fieldLabel}>
                  Date <span className={styles.requiredStar}>*</span>
                </label>
                <button
                  type="button"
                  className={styles.datePickerBtn}
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
                  <span className={date ? '' : styles.datePlaceholder}>
                    {date ? formatDateDisplay(date) : 'dd/mm/yyyy'}
                  </span>
                  <IconCalendar size={18} stroke={1.75} color="#1E293B" />
                </button>
                <input
                  id="holidayHiddenDate"
                  type="date"
                  ref={dateInputRef}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={styles.hiddenDateInput}
                />
              </div>

              {/* Type */}
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>
                  Type <span className={styles.requiredStar}>*</span>
                </span>
                <CustomSelect
                  options={[
                    'Female',
                    'Male',
                    'National Holiday',
                    'Restricted Holiday',
                    'State Holiday',
                    'Institution Specific Holiday',
                    'Optional Holiday'
                  ]}
                  value={type}
                  onChange={(val) => setType(val)}
                  width="100%"
                  buttonClassName={styles.customTypeSelectBtn}
                />
              </div>

              {/* Applies to (Radio) */}
              <div className={styles.fieldGroup}>
                <div className={styles.radioRow}>
                  <label className={`${styles.radioLabel} ${appliesTo === 'All' ? styles.radioActive : styles.radioInactive}`}>
                    <input
                      type="radio"
                      name="appliesTo"
                      value="All"
                      checked={appliesTo === 'All'}
                      onChange={() => setAppliesTo('All')}
                      className={styles.hiddenRadio}
                    />
                    <span className={`${styles.customRadio} ${appliesTo === 'All' ? styles.customRadioChecked : ''}`}>
                      {appliesTo === 'All' && <span className={styles.radioDot} />}
                    </span>
                    <span>All</span>
                  </label>

                  <label className={`${styles.radioLabel} ${appliesTo === 'Specific' ? styles.radioActive : styles.radioInactive}`}>
                    <input
                      type="radio"
                      name="appliesTo"
                      value="Specific"
                      checked={appliesTo === 'Specific'}
                      onChange={() => setAppliesTo('Specific')}
                      className={styles.hiddenRadio}
                    />
                    <span className={`${styles.customRadio} ${appliesTo === 'Specific' ? styles.customRadioChecked : ''}`}>
                      {appliesTo === 'Specific' && <span className={styles.radioDot} />}
                    </span>
                    <span>Specific</span>
                  </label>
                </div>
              </div>

              {/* Department Override Card */}
              <div className={styles.overrideCard}>
                <label className={styles.overrideHeaderCheck}>
                  <input
                    type="checkbox"
                    checked={departmentOverride}
                    onChange={(e) => setDepartmentOverride(e.target.checked)}
                    className={styles.hiddenRadio}
                  />
                  <span className={`${styles.customCheckbox} ${departmentOverride ? styles.customCheckboxChecked : ''}`}>
                    {departmentOverride && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className={styles.overrideTitle}>
                    Department override — mark this as a working day for specific departments
                  </span>
                </label>

                {departmentOverride && (
                  <div className={styles.deptGrid}>
                    {DEPARTMENTS.map((dept) => {
                      const isChecked = selectedDepartments.includes(dept);
                      return (
                        <label key={dept} className={styles.deptLabel}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleDepartmentToggle(dept)}
                            className={styles.hiddenRadio}
                          />
                          <span className={`${styles.childCheckbox} ${isChecked ? styles.childCheckboxChecked : ''}`}>
                            {isChecked && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>
                          <span>{dept}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                <p className={styles.overrideNote}>
                  e.g. Emergency / ICU staff work through general holidays. Selected departments will see this date as &quot;Working day&quot; instead of &quot;Holiday&quot;.
                </p>
              </div>

              {/* Modal Footer */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;
