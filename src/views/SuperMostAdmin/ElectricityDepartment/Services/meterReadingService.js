import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = (process.env.REACT_APP_BACKEND_URI || process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');

// Initial mock dataset for Metered Buildings matching the UI mockup
export const INITIAL_METERED_DATA = [
  {
    id: 'MTR-REC-001',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    employeeName: 'Amit Sharma',
    employeeId: 'PMCH-2041',
    meterNo: 'MTR-001',
    prevReading: '4,120',
    currentReading: '4,350',
    unitsConsumed: '230',
    ratePerUnit: 11.6,
    charge: '2,668',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-002',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    employeeName: 'Amit Sharma',
    employeeId: 'PMCH-2041',
    meterNo: 'MTR-001',
    prevReading: '4,120',
    currentReading: '4,350',
    unitsConsumed: '230',
    ratePerUnit: 11.6,
    charge: '2,668',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-003',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    employeeName: 'Amit Sharma',
    employeeId: 'PMCH-2041',
    meterNo: 'MTR-001',
    prevReading: '4,120',
    currentReading: '4,350',
    unitsConsumed: '230',
    ratePerUnit: 11.6,
    charge: '2,668',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-004',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    employeeName: 'Amit Sharma',
    employeeId: 'PMCH-2041',
    meterNo: 'MTR-001',
    prevReading: '4,120',
    currentReading: '4,350',
    unitsConsumed: '230',
    ratePerUnit: 11.6,
    charge: '2,668',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-005',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    employeeName: 'Amit Sharma',
    employeeId: 'PMCH-2041',
    meterNo: 'MTR-001',
    prevReading: '4,120',
    currentReading: '4,350',
    unitsConsumed: '230',
    ratePerUnit: 11.6,
    charge: '2,668',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-006',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    employeeName: 'Amit Sharma',
    employeeId: 'PMCH-2041',
    meterNo: 'MTR-001',
    prevReading: '4,120',
    currentReading: '4,350',
    unitsConsumed: '230',
    ratePerUnit: 11.6,
    charge: '2,668',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-007',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    employeeName: 'Amit Sharma',
    employeeId: 'PMCH-2041',
    meterNo: 'MTR-001',
    prevReading: '4,120',
    currentReading: '4,350',
    unitsConsumed: '230',
    ratePerUnit: 11.6,
    charge: '2,668',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-008',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    employeeName: 'Amit Sharma',
    employeeId: 'PMCH-2041',
    meterNo: 'MTR-001',
    prevReading: '4,120',
    currentReading: '4,350',
    unitsConsumed: '230',
    ratePerUnit: 11.6,
    charge: '2,668',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-009',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    employeeName: 'Amit Sharma',
    employeeId: 'PMCH-2041',
    meterNo: 'MTR-001',
    prevReading: '4,120',
    currentReading: '4,350',
    unitsConsumed: '230',
    ratePerUnit: 11.6,
    charge: '2,668',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-010',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '101',
    employeeName: 'Amit Sharma',
    employeeId: 'PMCH-2041',
    meterNo: 'MTR-001',
    prevReading: '4,120',
    currentReading: '4,350',
    unitsConsumed: '230',
    ratePerUnit: 11.6,
    charge: '2,668',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-011',
    buildingName: 'Ward 3B',
    buildingNo: 'Building 2B',
    roomNo: '102',
    employeeName: 'Rohan Verma',
    employeeId: 'PMCH-2042',
    meterNo: 'MTR-002',
    prevReading: '3,850',
    currentReading: '4,020',
    unitsConsumed: '170',
    ratePerUnit: 11.6,
    charge: '1,972',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-012',
    buildingName: 'Ward 4A',
    buildingNo: 'Building 1B',
    roomNo: '103',
    employeeName: 'Priya Patel',
    employeeId: 'PMCH-2043',
    meterNo: 'MTR-003',
    prevReading: '2,400',
    currentReading: '2,650',
    unitsConsumed: '250',
    ratePerUnit: 11.6,
    charge: '2,900',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-013',
    buildingName: 'Ward 2C',
    buildingNo: 'Building 3A',
    roomNo: '104',
    employeeName: 'Deepak Kumar',
    employeeId: 'PMCH-2044',
    meterNo: 'MTR-004',
    prevReading: '1,980',
    currentReading: '2,130',
    unitsConsumed: '150',
    ratePerUnit: 11.6,
    charge: '1,740',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-014',
    buildingName: 'Ward 1A',
    buildingNo: 'Building 2A',
    roomNo: '105',
    employeeName: 'Ananya Singh',
    employeeId: 'PMCH-2045',
    meterNo: 'MTR-005',
    prevReading: '5,100',
    currentReading: '5,380',
    unitsConsumed: '280',
    ratePerUnit: 11.6,
    charge: '3,248',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-015',
    buildingName: 'Ward 6B',
    buildingNo: 'Building 4A',
    roomNo: '106',
    employeeName: 'Vikram Joshi',
    employeeId: 'PMCH-2046',
    meterNo: 'MTR-006',
    prevReading: '3,200',
    currentReading: '3,410',
    unitsConsumed: '210',
    ratePerUnit: 11.6,
    charge: '2,436',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-016',
    buildingName: 'Ward 2A',
    buildingNo: 'Building 1C',
    roomNo: '107',
    employeeName: 'Sneha Roy',
    employeeId: 'PMCH-2047',
    meterNo: 'MTR-007',
    prevReading: '4,500',
    currentReading: '4,690',
    unitsConsumed: '190',
    ratePerUnit: 11.6,
    charge: '2,204',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-017',
    buildingName: 'Ward 3A',
    buildingNo: 'Building 2C',
    roomNo: '108',
    employeeName: 'Manoj Tiwari',
    employeeId: 'PMCH-2048',
    meterNo: 'MTR-008',
    prevReading: '2,100',
    currentReading: '2,240',
    unitsConsumed: '140',
    ratePerUnit: 11.6,
    charge: '1,624',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-018',
    buildingName: 'Ward 5B',
    buildingNo: 'Building 3B',
    roomNo: '109',
    employeeName: 'Kavita Gupta',
    employeeId: 'PMCH-2049',
    meterNo: 'MTR-009',
    prevReading: '3,600',
    currentReading: '3,830',
    unitsConsumed: '230',
    ratePerUnit: 11.6,
    charge: '2,668',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-019',
    buildingName: 'Ward 4B',
    buildingNo: 'Building 1A',
    roomNo: '110',
    employeeName: 'Suresh Menon',
    employeeId: 'PMCH-2050',
    meterNo: 'MTR-010',
    prevReading: '2,900',
    currentReading: '3,110',
    unitsConsumed: '210',
    ratePerUnit: 11.6,
    charge: '2,436',
    status: 'Completed',
    type: 'metered'
  },
  {
    id: 'MTR-REC-020',
    buildingName: 'Ward 5A',
    buildingNo: 'Building 1A',
    roomNo: '111',
    employeeName: 'Pooja Nair',
    employeeId: 'PMCH-2051',
    meterNo: 'MTR-011',
    prevReading: '4,000',
    currentReading: '4,220',
    unitsConsumed: '220',
    ratePerUnit: 11.6,
    charge: '2,552',
    status: 'Completed',
    type: 'metered'
  }
];

// Initial mock dataset for Fixed Buildings (matching the UI mockup: Room No.='Main Block', Building Name='Room 101', Employee Name='Amit Sharma', Charge='750')
export const INITIAL_FIXED_DATA = Array.from({ length: 20 }, (_, idx) => ({
  id: `FIX-REC-${String(idx + 1).padStart(3, '0')}`,
  roomNo: 'Main Block',
  buildingName: 'Room 101',
  employeeName: 'Amit Sharma',
  employeeId: 'PMCH-2041',
  charge: '750',
  status: 'Confirmed',
  type: 'fixed'
}));

const METERED_STORAGE_KEY = 'MMCH_ELECTRICITY_METERED_DATA_V1';
const FIXED_STORAGE_KEY = 'MMCH_ELECTRICITY_FIXED_DATA_V1';

const loadDataFromStorage = (tab) => {
  const isMetered = tab === 'metered';
  const key = isMetered ? METERED_STORAGE_KEY : FIXED_STORAGE_KEY;
  const initial = isMetered ? INITIAL_METERED_DATA : INITIAL_FIXED_DATA;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading electricity meter data from localStorage:', err);
  }

  localStorage.setItem(key, JSON.stringify(initial));
  return [...initial];
};

const saveDataToStorage = (tab, data) => {
  const isMetered = tab === 'metered';
  const key = isMetered ? METERED_STORAGE_KEY : FIXED_STORAGE_KEY;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving electricity meter data to localStorage:', err);
  }
};

/**
 * Fetch Meter Reading Entries
 * @param {string} tab - 'metered' | 'fixed'
 * @param {string} search - Search by Building No., Name, Meter No., Room No.
 * @param {string} roomNo - Filter by specific room number or 'All'
 */
export const getMeterReadings = async ({ tab = 'metered', search = '', roomNo = 'All' } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const response = await axios.get(`${BASE_URL}/electricity-admin/meter-readings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { tab, search, roomNo },
        timeout: 4000
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          total: response.data.total || (response.data.data ? response.data.data.length : 0)
        };
      }
    } catch (err) {
      console.info('Electricity Meter Reading API connecting, using local persistent dataset:', err?.message);
    }
  }

  // Fallback to local storage
  await new Promise((res) => setTimeout(res, 80));
  let list = loadDataFromStorage(tab);

  if (roomNo && roomNo !== 'All') {
    list = list.filter((item) => String(item.roomNo).toLowerCase() === String(roomNo).toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (item) =>
        (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
        (item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
        (item.buildingName && item.buildingName.toLowerCase().includes(q)) ||
        (item.buildingNo && item.buildingNo.toLowerCase().includes(q)) ||
        (item.roomNo && String(item.roomNo).toLowerCase().includes(q)) ||
        (item.meterNo && item.meterNo.toLowerCase().includes(q))
    );
  }

  return {
    success: true,
    data: list,
    total: list.length
  };
};

/**
 * Save / Create new Meter Reading or Fixed Charge entry
 */
export const saveMeterReading = async (readingData) => {
  const tab = readingData.type || 'metered';
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const response = await axios.post(`${BASE_URL}/electricity-admin/meter-readings`, readingData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Meter reading entry added successfully'
        };
      }
    } catch (err) {
      console.info('Electricity meter reading save API connecting, falling back to storage:', err?.message);
    }
  }

  await new Promise((res) => setTimeout(res, 100));
  const list = loadDataFromStorage(tab);

  const prevRaw = Number(String(readingData.prevReading || '0').replace(/[^0-9.]/g, ''));
  const currRaw = Number(String(readingData.currentReading || '0').replace(/[^0-9.]/g, ''));
  const units = Math.max(0, currRaw - prevRaw);
  const rate = Number(readingData.ratePerUnit) || 11.6;
  const chargeVal = tab === 'fixed' ? '750' : Math.round(units * rate).toLocaleString('en-IN');

  const isFixed = tab === 'fixed';
  const newEntry = isFixed
    ? {
        id: `FIX-REC-${String(list.length + 1).padStart(3, '0')}`,
        roomNo: String(readingData.roomNo || 'Main Block'),
        buildingName: readingData.buildingName || 'Room 101',
        employeeName: readingData.employeeName || 'Amit Sharma',
        employeeId: readingData.employeeId || 'PMCH-2041',
        charge: readingData.charge || '750',
        status: 'Confirmed',
        type: 'fixed',
        ...readingData
      }
    : {
        id: `MTR-REC-${String(list.length + 1).padStart(3, '0')}`,
        buildingName: readingData.buildingName || 'Ward 5A',
        buildingNo: readingData.buildingNo || 'Building 1A',
        roomNo: String(readingData.roomNo || '101'),
        employeeName: readingData.employeeName || 'Amit Sharma',
        employeeId: readingData.employeeId || 'PMCH-2041',
        meterNo: readingData.meterNo || 'MTR-001',
        prevReading: prevRaw.toLocaleString('en-IN'),
        currentReading: currRaw.toLocaleString('en-IN'),
        unitsConsumed: String(units),
        ratePerUnit: rate,
        charge: chargeVal,
        status: 'Completed',
        type: 'metered',
        ...readingData
      };

  list.unshift(newEntry);
  saveDataToStorage(tab, list);

  return {
    success: true,
    data: newEntry,
    message: 'Charge entry saved successfully'
  };
};

/**
 * Update Current Reading for a specific record
 */
export const updateMeterReadingValue = async (id, newCurrentReading, tab = 'metered') => {
  const list = loadDataFromStorage(tab);
  const index = list.findIndex((item) => item.id === id);

  if (index !== -1) {
    const item = list[index];
    const prevRaw = Number(String(item.prevReading || '0').replace(/[^0-9.]/g, ''));
    const currRaw = Number(String(newCurrentReading || '0').replace(/[^0-9.]/g, ''));
    const units = Math.max(0, currRaw - prevRaw);
    const rate = Number(item.ratePerUnit) || 11.6;
    const chargeVal = Math.round(units * rate).toLocaleString('en-IN');

    list[index] = {
      ...item,
      currentReading: currRaw.toLocaleString('en-IN'),
      unitsConsumed: String(units),
      charge: chargeVal
    };

    saveDataToStorage(tab, list);
    return {
      success: true,
      data: list[index],
      message: 'Reading updated successfully'
    };
  }

  return { success: false, message: 'Record not found' };
};

/**
 * Export Meter Readings to Excel / CSV format
 */
export const exportMeterReadingsExcel = ({ data = [], tab = 'metered' }) => {
  if (!data || data.length === 0) {
    return { success: false, message: 'No data to export' };
  }

  let headers = [];
  let rows = [];

  if (tab === 'metered') {
    headers = [
      'Building Name',
      'Building No.',
      'Room No.',
      'Employee Name',
      'Meter No.',
      'Prev. Reading',
      'Current Reading',
      'Units Consumed',
      'Charge (INR)'
    ];
    rows = data.map((item) => [
      `"${item.buildingName || ''}"`,
      `"${item.buildingNo || ''}"`,
      `"${item.roomNo || ''}"`,
      `"${item.employeeName || ''}"`,
      `"${item.meterNo || ''}"`,
      `"${item.prevReading || ''}"`,
      `"${item.currentReading || ''}"`,
      `"${item.unitsConsumed || ''} units"`,
      `"INR ${item.charge || ''}"`
    ]);
  } else {
    headers = ['Room No.', 'Building Name', 'Employee Name', 'Charge (INR)'];
    rows = data.map((item) => [
      `"${item.roomNo || 'Main Block'}"`,
      `"${item.buildingName || 'Room 101'}"`,
      `"${item.employeeName || 'Amit Sharma'}"`,
      `"${item.charge || '750'}"`
    ]);
  }

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `PMCH_Electricity_${tab === 'metered' ? 'Metered_Building' : 'Fixed_Building'}_Readings_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return { success: true, message: 'Excel / CSV downloaded successfully' };
};

/**
 * Export Meter Readings to Printable PDF format
 */
export const exportMeterReadingsPDF = ({ data = [], tab = 'metered' }) => {
  if (!data || data.length === 0) {
    return { success: false, message: 'No data to export' };
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    return { success: false, message: 'Please allow popups to export PDF' };
  }

  const title = `PMCH Electricity Portal Dashboard - ${tab === 'metered' ? 'Metered Buildings' : 'Fixed Buildings'}`;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const tableHeadersHtml =
    tab === 'metered'
      ? `<tr>
          <th>Building Name</th>
          <th>Building No.</th>
          <th>Room No.</th>
          <th>Employee Name</th>
          <th>Meter No.</th>
          <th>Prev. Reading</th>
          <th>Current Reading</th>
          <th>Units Consumed</th>
          <th>Charge (₹)</th>
        </tr>`
      : `<tr>
          <th>Room No.</th>
          <th>Building Name</th>
          <th>Employee Name</th>
          <th>Charge (₹)</th>
        </tr>`;

  const tableRowsHtml = data
    .map((item) =>
      tab === 'metered'
        ? `<tr>
            <td>${item.buildingName || '-'}</td>
            <td>${item.buildingNo || '-'}</td>
            <td>${item.roomNo || '-'}</td>
            <td>${item.employeeName || '-'}</td>
            <td>${item.meterNo || '-'}</td>
            <td>${item.prevReading || '-'}</td>
            <td>${item.currentReading || '-'}</td>
            <td style="color: #644EE5; font-weight: 600;">${item.unitsConsumed || 0} units</td>
            <td style="font-weight: 700;">₹ ${item.charge || 0}</td>
          </tr>`
        : `<tr>
            <td>${item.roomNo || 'Main Block'}</td>
            <td style="font-weight: 600;">${item.buildingName || 'Room 101'}</td>
            <td>${item.employeeName || 'Amit Sharma'}</td>
            <td>${item.charge || '750'}</td>
          </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Inter', sans-serif; margin: 24px; color: #0F172A; }
          h2 { color: #644EE5; margin-bottom: 4px; }
          p { color: #64748B; font-size: 13px; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #E2E8F0; padding: 8px 10px; text-align: left; }
          th { background-color: #F8FAFC; color: #0F172A; font-weight: 600; }
          tr:nth-child(even) { background-color: #FAFAFA; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <p>Generated on ${dateStr} • Total Records: ${data.length}</p>
        <table>
          <thead>${tableHeadersHtml}</thead>
          <tbody>${tableRowsHtml}</tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  return { success: true, message: 'PDF print preview generated' };
};
