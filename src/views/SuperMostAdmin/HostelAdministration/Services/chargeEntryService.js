import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Initial mock data for Charge Entry (Room Rent, Maintenance, Accommodation)
const INITIAL_CHARGE_ENTRIES = [
  {
    id: 'CHG-001',
    roomNo: 'Room 101',
    employeeId: 'PMCH-2041',
    employeeName: 'Amit Sharma',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '3,000',
    accommodationCharges: '3,000',
    notes: 'Guest stay - Dr. Sharma family',
    status: 'Active'
  },
  {
    id: 'CHG-002',
    roomNo: 'Room 101',
    employeeId: 'PMCH-2041',
    employeeName: 'Amit Sharma',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '3,000',
    accommodationCharges: '3,000',
    notes: 'Damage recovery',
    status: 'Active'
  },
  {
    id: 'CHG-003',
    roomNo: 'Room 101',
    employeeId: 'PMCH-2041',
    employeeName: 'Amit Sharma',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '3,000',
    accommodationCharges: '3,000',
    notes: '-',
    status: 'Active'
  },
  {
    id: 'CHG-004',
    roomNo: 'Room 101',
    employeeId: 'PMCH-2041',
    employeeName: 'Amit Sharma',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  },
  {
    id: 'CHG-005',
    roomNo: 'Room 101',
    employeeId: 'PMCH-2041',
    employeeName: 'Amit Sharma',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  },
  {
    id: 'CHG-006',
    roomNo: 'Room 101',
    employeeId: 'PMCH-2041',
    employeeName: 'Amit Sharma',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  },
  {
    id: 'CHG-007',
    roomNo: 'Room 101',
    employeeId: 'PMCH-2041',
    employeeName: 'Amit Sharma',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  },
  {
    id: 'CHG-008',
    roomNo: 'Room 101',
    employeeId: 'PMCH-2041',
    employeeName: 'Amit Sharma',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  },
  {
    id: 'CHG-009',
    roomNo: 'Room 101',
    employeeId: 'PMCH-2041',
    employeeName: 'Amit Sharma',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  },
  {
    id: 'CHG-010',
    roomNo: 'Room 101',
    employeeId: 'PMCH-2041',
    employeeName: 'Amit Sharma',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  },
  {
    id: 'CHG-011',
    roomNo: 'Room 102',
    employeeId: 'PMCH-2042',
    employeeName: 'Rohan Verma',
    accommodationType: '2BHK',
    rentAmount: '4,500',
    maintenanceAmount: '900',
    accommodationCharges: '2,000',
    status: 'Active'
  },
  {
    id: 'CHG-012',
    roomNo: 'Room 103',
    employeeId: 'PMCH-2043',
    employeeName: 'Priya Patel',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  },
  {
    id: 'CHG-013',
    roomNo: 'Room 104',
    employeeId: 'PMCH-2044',
    employeeName: 'Deepak Kumar',
    accommodationType: 'Single Room',
    rentAmount: '2,200',
    maintenanceAmount: '500',
    accommodationCharges: '1,000',
    status: 'Active'
  },
  {
    id: 'CHG-014',
    roomNo: 'Room 105',
    employeeId: 'PMCH-2045',
    employeeName: 'Ananya Singh',
    accommodationType: '2BHK',
    rentAmount: '4,500',
    maintenanceAmount: '900',
    accommodationCharges: '2,000',
    status: 'Active'
  },
  {
    id: 'CHG-015',
    roomNo: 'Room 106',
    employeeId: 'PMCH-2046',
    employeeName: 'Vikram Joshi',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  },
  {
    id: 'CHG-016',
    roomNo: 'Room 107',
    employeeId: 'PMCH-2047',
    employeeName: 'Sneha Roy',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  },
  {
    id: 'CHG-017',
    roomNo: 'Room 108',
    employeeId: 'PMCH-2048',
    employeeName: 'Manoj Tiwari',
    accommodationType: 'Single Room',
    rentAmount: '2,200',
    maintenanceAmount: '500',
    accommodationCharges: '1,000',
    status: 'Active'
  },
  {
    id: 'CHG-018',
    roomNo: 'Room 109',
    employeeId: 'PMCH-2049',
    employeeName: 'Kavita Gupta',
    accommodationType: '2BHK',
    rentAmount: '4,500',
    maintenanceAmount: '900',
    accommodationCharges: '2,000',
    status: 'Active'
  },
  {
    id: 'CHG-019',
    roomNo: 'Room 110',
    employeeId: 'PMCH-2050',
    employeeName: 'Suresh Menon',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  },
  {
    id: 'CHG-020',
    roomNo: 'Room 111',
    employeeId: 'PMCH-2051',
    employeeName: 'Pooja Nair',
    accommodationType: '1BHK',
    rentAmount: '3,000',
    maintenanceAmount: '750',
    accommodationCharges: '1,500',
    status: 'Active'
  }
];

const STORAGE_KEY = 'MMCH_HOSTEL_CHARGE_ENTRIES_DATA';

const loadChargesFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading charge entries from storage:', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CHARGE_ENTRIES));
  return [...INITIAL_CHARGE_ENTRIES];
};

const saveChargesToStorage = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving charge entries to storage:', err);
  }
};

/**
 * Fetch Charge Entries List
 * Endpoint: GET /hostel-admin/charges
 * @param {string} tab - 'room_rent' | 'maintenance' | 'accommodation'
 * @param {string} search - Search query for employee name, ID, or room no.
 */
export const getChargeEntries = async ({ tab = 'room_rent', search = '' } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const response = await axios.get(`${BASE_URL}/hostel-admin/charges`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          type: tab,
          search
        },
        timeout: 4000
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || response.data.result || [],
          total: response.data.total || (response.data.data ? response.data.data.length : 0)
        };
      }
    } catch (err) {
      console.info('Hostel Charges API connecting, falling back to local dataset:', err?.message);
    }
  }

  // Local fallback
  await new Promise((resolve) => setTimeout(resolve, 80));
  let items = loadChargesFromStorage();

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
        (item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
        (item.roomNo && item.roomNo.toLowerCase().includes(q)) ||
        (item.accommodationType && item.accommodationType.toLowerCase().includes(q))
    );
  }

  return {
    success: true,
    data: items,
    total: items.length
  };
};

/**
 * Create or Update a Charge Entry
 * Endpoint: POST /hostel-admin/charges
 */
export const saveChargeEntry = async (chargeData) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const response = await axios.post(`${BASE_URL}/hostel-admin/charges`, chargeData, {
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
          message: response.data.message || 'Charge entry saved successfully'
        };
      }
    } catch (err) {
      console.info('Hostel Charges save API connecting, falling back to local storage:', err?.message);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  const items = loadChargesFromStorage();
  const index = items.findIndex((item) => item.id === chargeData.id);

  if (index !== -1) {
    items[index] = { ...items[index], ...chargeData };
  } else {
    const newEntry = {
      id: `CHG-${String(items.length + 1).padStart(3, '0')}`,
      roomNo: chargeData.roomNo || 'Room 101',
      employeeId: chargeData.employeeId || 'PMCH-2041',
      employeeName: chargeData.employeeName || 'Dr.Shreya Krishnan',
      accommodationType: chargeData.accommodationType || '1BHK',
      rentAmount: chargeData.rentAmount || '3,000',
      maintenanceAmount: chargeData.maintenanceAmount || '4,304',
      accommodationCharges: chargeData.accommodationCharges || '4,304',
      duration: chargeData.duration || '12 Months',
      notes: chargeData.notes || '-',
      status: 'Active',
      ...chargeData
    };
    items.unshift(newEntry);
  }

  saveChargesToStorage(items);

  return {
    success: true,
    message: chargeData.type === 'accommodation' ? 'Accommodation charges added successfully' : 'Maintenance charges added successfully'
  };
};
