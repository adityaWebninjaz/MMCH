import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import {
  getDepartmentWiseAttendanceMatrix,
  updateAttendanceStatusRecord
} from '../../Services/hrAttendanceService';
import ManualAttendanceModal from './ManualAttendanceModal';
import styles from '../Attendance.module.css';

const LEGENDS = [
  { label: 'P (Present)', bgcolor: '#DCFCE7', border: '#BBF7D0' },
  { label: 'A (Absent)', bgcolor: '#FEE2E2', border: '#FCA5A5' },
  { label: 'O (Weekly Off)', bgcolor: '#F1F5F9', border: '#E2E8F0' },
  { label: 'HD (Half Day)', bgcolor: '#FEF3C7', border: '#FDE68A' },
  { label: 'L (Leave)', bgcolor: '#DBEAFE', border: '#93C5FD' },
  { label: 'H (Holiday)', bgcolor: '#F1F5F9', border: '#E2E8F0' },
  { label: 'OT (Overtime)', bgcolor: '#EDE9FE', border: '#C4B5FD' }
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const AttendanceGrid = ({ selectedMonth = 'July', selectedYear = 2025, selectedDepartment = 'all', searchTerm = '' }) => {
  const [matrixData, setMatrixData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Manual Attendance Correction Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    const fetchMatrix = async () => {
      setLoading(true);
      try {
        const data = await getDepartmentWiseAttendanceMatrix({
          month: selectedMonth,
          year: selectedYear,
          department: selectedDepartment,
          search: searchTerm
        });
        setMatrixData(data || []);
      } catch (err) {
        console.error('Failed to load attendance matrix records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatrix();
  }, [selectedMonth, selectedYear, selectedDepartment, searchTerm]);

  const handleCellClick = (emp, day, currentStatus) => {
    setSelectedCell({
      employee: emp,
      day,
      month: selectedMonth,
      year: selectedYear,
      status: currentStatus || 'P'
    });
    setModalOpen(true);
  };

  const handleUpdateAttendance = async ({ rowId, empId, day, newStatus, reason }) => {
    try {
      await updateAttendanceStatusRecord({
        id: rowId,
        empId,
        day,
        month: selectedMonth,
        year: selectedYear,
        oldStatus: selectedCell?.status,
        newStatus,
        reason
      });

      // Update state locally for real-time reactivity - ONLY target exact employee row
      setMatrixData((prev) =>
        prev.map((emp) => {
          const isTarget = rowId !== undefined && emp.id !== undefined
            ? emp.id === rowId
            : emp.empId === empId;

          if (isTarget) {
            return {
              ...emp,
              days: {
                ...emp.days,
                [day]: newStatus
              }
            };
          }
          return emp;
        })
      );

      toast.success('Attendance updated successfully!');
    } catch (err) {
      console.error('Error updating attendance cell:', err);
      toast.error('Failed to update attendance');
      throw err;
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'P':
        return styles.badgeP;
      case 'A':
        return styles.badgeA;
      case 'O':
        return styles.badgeO;
      case 'HD':
        return styles.badgeHD;
      case 'L':
        return styles.badgeL;
      case 'H':
        return styles.badgeH;
      case 'OT':
        return styles.badgeOT;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className={styles.matrixCard}>
        <div className={styles.loadingSpinnerWrapper}>
          <CircularProgress size={32} sx={{ color: '#644EE5' }} />
          <span style={{ fontSize: '14px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
            Loading department-wise attendance matrix...
          </span>
        </div>
      </div>
    );
  }

  if (matrixData.length === 0) {
    return (
      <div className={styles.matrixCard}>
        <div className={styles.emptyState} style={{ border: 'none', padding: '48px 24px' }}>
          <div className={styles.emptyTitle}>No attendance records found</div>
          <div className={styles.emptySubtitle}>
            Try adjusting your search query, department filter, or selected month.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.matrixCard}>
      {/* 1. Header Row: Title & Legends */}
      <div className={styles.matrixHeader}>
        <span className={styles.matrixTitle}>Department Wise Attendance</span>
        <div className={styles.legendsRow}>
          {LEGENDS.map((legend, idx) => (
            <div key={idx} className={styles.legendItem}>
              <span
                className={styles.legendBox}
                style={{
                  backgroundColor: legend.bgcolor,
                  border: `1px solid ${legend.border}`
                }}
              />
              <span className={styles.legendLabel}>{legend.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Matrix Table: Employee × Days 1..31 */}
      <div className={styles.matrixTableWrapper}>
        <table className={styles.matrixTable}>
          <thead>
            <tr>
              <th className={styles.employeeTh}>Employee</th>
              {DAYS.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.map((emp) => (
              <tr key={emp.id || emp.empId}>
                {/* Employee Name & ID / Department */}
                <td className={styles.employeeTd}>
                  <div className={styles.empName}>{emp.name}</div>
                  <div className={styles.empSub}>
                    {emp.empId} · {emp.department}
                  </div>
                </td>

                {/* 31 Day Cells */}
                {DAYS.map((day) => {
                  const status = emp.days?.[day];
                  const badgeClass = status ? getBadgeClass(status) : '';
                  return (
                    <td
                      key={day}
                      onClick={() => handleCellClick(emp, day, status)}
                      style={{ cursor: 'pointer' }}
                      title={`Click to correct attendance: ${emp.name} · Day ${day} (${status || 'No entry'})`}
                    >
                      {status ? (
                        <span
                          className={`${styles.dayBadge} ${badgeClass}`}
                        >
                          {status}
                        </span>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Manual Attendance Correction Modal */}
      <ManualAttendanceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cellData={selectedCell}
        onUpdate={handleUpdateAttendance}
      />
    </div>
  );
};

AttendanceGrid.propTypes = {
  selectedMonth: PropTypes.string,
  selectedYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedDepartment: PropTypes.string,
  searchTerm: PropTypes.string
};

export default AttendanceGrid;

