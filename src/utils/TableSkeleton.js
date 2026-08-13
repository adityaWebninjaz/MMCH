import React from 'react';
import styles from './tableSkeleton.module.css';

function TableSkeleton({ rows = 10, columns = 10 }) {
  // Generate array of skeleton rows (max 10)
  const skeletonRows = Array.from({ length: Math.min(rows, 10) }, (_, index) => index);
  const skeletonColumns = Array.from({ length: columns }, (_, index) => index);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        {/* Table Header Skeleton */}
        <thead className={styles.tableHead}>
          <tr>
            {skeletonColumns.map((colIndex) => (
              <th key={colIndex} className={styles.tableHeaderCell}>
                <div className={styles.skeletonBar}></div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body Skeleton */}
        <tbody className={styles.tableBody}>
          {skeletonRows.map((rowIndex) => (
            <tr key={rowIndex} className={styles.tableRow}>
              {skeletonColumns.map((colIndex) => (
                <td key={colIndex} className={styles.tableCell}>
                  <div className={styles.skeletonBar}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableSkeleton;