/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  IconPlus,
  IconCalendar,
  IconX
} from '@tabler/icons-react';
import CustomSelect from 'ui-component/CustomSelect';
import { getDepartments } from 'services/allEmployeeService';
import { getHolidaysTable, createHoliday, formatDateDisplay } from '../Services/hrHolidayService';
import styles from './Holidays.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatHolidayType = (typeStr) => {
  if (!typeStr) return '-';
  if (typeStr === 'ALL_DEPARTMENTS') return 'All Departments';
  if (typeStr === 'DEPARTMENT_SPECIFIC') return 'Department Specific';
  return typeStr.replace(/_/g, ' ');
};

const Holidays = () => {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('National Holiday');
  const [description, setDescription] = useState('');
  const [appliesTo, setAppliesTo] = useState('All');
  const [departmentOverride, setDepartmentOverride] = useState(false);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);

  const dateInputRef = useRef(null);

  // Fetch real departments list from GET /departments on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingDepartments(true);
    getDepartments()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const list = data.map((dept) => {
            if (typeof dept === 'string') return { id: dept, name: dept };
            return {
              id: dept.id || dept._id || dept.department_id || dept.name,
              name: dept.name || dept.department_name || dept.title || dept.id
            };
          });
          setDepartmentList(list);
        }
      })
      .catch((err) => {
        console.error('Failed to load departments from /departments API:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingDepartments(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch holidays for selected year
  const fetchHolidays = useCallback(async (yearToFetch) => {
    setLoading(true);
    try {
      const response = await getHolidaysTable(yearToFetch);
      if (response && response.success && Array.isArray(response.data)) {
        setHolidays(response.data);
      } else {
        setHolidays([]);
      }
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
      toast.error('Failed to load holidays for ' + yearToFetch);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays(selectedYear);
  }, [selectedYear, fetchHolidays]);

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

  // Toggle department checkbox by ID
  const handleDepartmentToggle = (deptId) => {
    setSelectedDepartmentIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  // Open Modal and reset form
  const handleOpenModal = (presetDate = '') => {
    setName('');
    setDate(presetDate || `${selectedYear}-01-01`);
    setType('National Holiday');
    setDescription('');
    setAppliesTo('All');
    setDepartmentOverride(false);
    setSelectedDepartmentIds([]);
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  // Switch between All vs Specific
  const handleAppliesToChange = (val) => {
    setAppliesTo(val);
    if (val === 'Specific') {
      setDepartmentOverride(true);
    } else {
      setDepartmentOverride(false);
      setSelectedDepartmentIds([]);
    }
  };

  // Handle Form Submit (POST /holidays)
  const handleAddHoliday = async (e) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter the holiday name');
      return;
    }

    if (!date) {
      toast.error('Please select a date');
      return;
    }

    const isSpecific = appliesTo === 'Specific' || departmentOverride;

    if (isSpecific && selectedDepartmentIds.length === 0) {
      toast.error('Please select at least one department for department-specific holiday');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        date,
        description: description.trim()
      };

      // Pass department_ids only for department-specific holiday
      if (isSpecific && selectedDepartmentIds.length > 0) {
        payload.department_ids = selectedDepartmentIds;
      }

      const result = await createHoliday(payload);
      toast.success(result?.message || `Holiday "${name.trim()}" added successfully!`);

      const holidayYear = parseInt(date.split('-')[0], 10);
      if (holidayYear && holidayYear !== selectedYear) {
        setSelectedYear(holidayYear);
      } else {
        await fetchHolidays(selectedYear);
      }

      handleCloseModal();
    } catch (err) {
      console.error('Error in handleAddHoliday:', err);
      toast.error(err?.message || 'Failed to add holiday. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Month Calendar Box
  const renderMonthCard = (monthIndex) => {
    const monthName = MONTH_NAMES[monthIndex];
    const monthHolidays = holidaysByMonth[monthIndex] || [];
    const holidayCount = monthHolidays.length;

    const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
    const firstDayIndex = (new Date(selectedYear, monthIndex, 1).getDay() + 6) % 7;

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className={styles.emptyCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isHoliday = monthHolidays.some((h) => h.dayNum === day);
      const matchedHoliday = monthHolidays.find((h) => h.dayNum === day);

      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          className={`${styles.dayCell} ${isHoliday ? styles.holidayCell : ''}`}
          title={matchedHoliday ? `${matchedHoliday.name} (${formatHolidayType(matchedHoliday.type)})` : undefined}
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
                  {h.displayDate || formatDateDisplay(h.date)}{' '}
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
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontWeight: 500 }}>
          Loading holidays for {selectedYear}...
        </div>
      ) : (
        <div className={styles.calendarGrid}>
          {MONTH_NAMES.map((_, idx) => renderMonthCard(idx))}
        </div>
      )}

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
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                  Loading table data...
                </td>
              </tr>
            ) : yearHolidays.length > 0 ? (
              yearHolidays.map((h) => {
                const workingDepts = h.working_departments?.length > 0
                  ? h.working_departments
                  : (h.overrideDepartments?.length > 0 ? h.overrideDepartments : []);

                const appliesToText = h.appliesTo === 'All' || h.type === 'ALL_DEPARTMENTS'
                  ? 'All Department'
                  : Array.isArray(h.applies_to_departments) && h.applies_to_departments.length > 0
                    ? h.applies_to_departments.map((d) => (typeof d === 'object' ? d.name : d)).join(', ')
                    : 'Specific Departments';

                return (
                  <tr key={h.id}>
                    <td className={styles.dateCell}>{h.displayDate || formatDateDisplay(h.date)}</td>
                    <td className={styles.nameCell}>{h.name}</td>
                    <td className={styles.typeCell}>{formatHolidayType(h.type)}</td>
                    <td>{appliesToText}</td>
                    <td>
                      {workingDepts.length > 0 ? (
                        <span className={styles.workingDaysBadge}>
                          {workingDepts.map((d) => (typeof d === 'object' ? d.name : d)).join(', ')}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })
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
                disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>

              {/* Type */}
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>
                  Type <span className={styles.requiredStar}>*</span>
                </span>
                <CustomSelect
                  options={[
                    'National Holiday',
                    'Restricted Holiday',
                    'State Holiday',
                    'Institution Specific Holiday',
                    'Optional Holiday',
                    'Female',
                    'Male'
                  ]}
                  value={type}
                  onChange={(val) => setType(val)}
                  width="100%"
                  buttonClassName={styles.customTypeSelectBtn}
                  menuClassName={styles.typeSelectMenuUp}
                  disabled={isSubmitting}
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
                      onChange={() => handleAppliesToChange('All')}
                      className={styles.hiddenRadio}
                      disabled={isSubmitting}
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
                      onChange={() => handleAppliesToChange('Specific')}
                      className={styles.hiddenRadio}
                      disabled={isSubmitting}
                    />
                    <span className={`${styles.customRadio} ${appliesTo === 'Specific' ? styles.customRadioChecked : ''}`}>
                      {appliesTo === 'Specific' && <span className={styles.radioDot} />}
                    </span>
                    <span>Specific</span>
                  </label>
                </div>
              </div>

              {/* Department Override Card (Rendered when Specific or override checked) */}
              {(appliesTo === 'Specific' || departmentOverride) && (
                <div className={styles.overrideCard}>
                  <label className={styles.overrideHeaderCheck}>
                    <input
                      type="checkbox"
                      checked={departmentOverride}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDepartmentOverride(checked);
                        if (!checked && appliesTo === 'Specific') {
                          setAppliesTo('All');
                          setSelectedDepartmentIds([]);
                        }
                      }}
                      className={styles.hiddenRadio}
                      disabled={isSubmitting}
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
                      {loadingDepartments ? (
                        <span style={{ color: '#64748B', fontSize: '13px', gridColumn: 'span 2' }}>
                          Loading departments...
                        </span>
                      ) : departmentList.length > 0 ? (
                        departmentList.map((dept) => {
                          const isChecked = selectedDepartmentIds.includes(dept.id);
                          return (
                            <label key={dept.id} className={styles.deptLabel}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleDepartmentToggle(dept.id)}
                                className={styles.hiddenRadio}
                                disabled={isSubmitting}
                              />
                              <span className={`${styles.childCheckbox} ${isChecked ? styles.childCheckboxChecked : ''}`}>
                                {isChecked && (
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </span>
                              <span>{dept.name}</span>
                            </label>
                          );
                        })
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '13px', gridColumn: 'span 2' }}>
                          No departments found.
                        </span>
                      )}
                    </div>
                  )}

                  <p className={styles.overrideNote}>
                    e.g. Emergency / ICU staff work through general holidays. Selected departments will see this date as &quot;Working day&quot; instead of &quot;Holiday&quot;.
                  </p>
                </div>
              )}

              {/* Modal Footer */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Holiday'}
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
