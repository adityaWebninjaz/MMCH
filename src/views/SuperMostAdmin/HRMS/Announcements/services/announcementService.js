import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const STORAGE_KEY = 'MMCH_HRMS_ANNOUNCEMENTS_DATA';

/**
 * Returns authorization headers with the current auth token
 */
const getAuthHeaders = () => {
  const token = Cookies.get('Token') || Cookies.get('token') || localStorage.getItem('token') || '';
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
};

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ANN-001',
    title: 'Updated Leave Policy 2026',
    targetAudience: 'All Employees',
    description: 'We are excited to announce an important update to our Leave Policy, effective from January 1, 2026.',
    publishedDate: 'Jan 15, 2026',
    rawDate: '2026-01-15'
  },
  {
    id: 'ANN-002',
    title: 'Updated Leave Policy 2026',
    targetAudience: 'Department-Wise',
    description: 'We are excited to announce an important update to our Leave Policy, effective from January 1, 2026.',
    publishedDate: 'Jan 15, 2026',
    rawDate: '2026-01-15'
  },
  {
    id: 'ANN-003',
    title: 'Updated Leave Policy 2026',
    targetAudience: 'Department-Wise',
    description: 'We are excited to announce an important update to our Leave Policy, effective from January 1, 2026.',
    publishedDate: 'Jan 15, 2026',
    rawDate: '2026-01-15'
  },
  {
    id: 'ANN-004',
    title: 'Updated Leave Policy 2026',
    targetAudience: 'All Employees',
    description: 'We are excited to announce an important update to our Leave Policy, effective from January 1, 2026.',
    publishedDate: 'Jan 15, 2026',
    rawDate: '2026-01-15'
  },
  {
    id: 'ANN-005',
    title: 'Updated Leave Policy 2026',
    targetAudience: 'All Employees',
    description: 'We are excited to announce an important update to our Leave Policy, effective from January 1, 2026.',
    publishedDate: 'Jan 15, 2026',
    rawDate: '2026-01-15'
  },
  {
    id: 'ANN-006',
    title: 'Updated Leave Policy 2026',
    targetAudience: 'Department-Wise',
    description: 'We are excited to announce an important update to our Leave Policy, effective from January 1, 2026.',
    publishedDate: 'Jan 15, 2026',
    rawDate: '2026-01-15'
  },
  {
    id: 'ANN-007',
    title: 'Updated Leave Policy 2026',
    targetAudience: 'All Employees',
    description: 'We are excited to announce an important update to our Leave Policy, effective from January 1, 2026.',
    publishedDate: 'Jan 15, 2026',
    rawDate: '2026-01-15'
  },
  {
    id: 'ANN-008',
    title: 'Updated Leave Policy 2026',
    targetAudience: 'All Employees',
    description: 'We are excited to announce an important update to our Leave Policy, effective from January 1, 2026.',
    publishedDate: 'Jan 15, 2026',
    rawDate: '2026-01-15'
  },
  {
    id: 'ANN-009',
    title: 'Hospital Accreditation Audit Schedule',
    targetAudience: 'All Employees',
    description: 'NABH annual surveillance audit is scheduled from next Monday. All department heads are requested to ensure compliance logs are updated.',
    publishedDate: 'Jan 14, 2026',
    rawDate: '2026-01-14'
  },
  {
    id: 'ANN-010',
    title: 'Biometric System Server Maintenance',
    targetAudience: 'All Employees',
    description: 'Biometric terminals will undergo scheduled firmware updates between 01:00 AM and 04:00 AM on Sunday. Manual registers will be placed at all entry points.',
    publishedDate: 'Jan 14, 2026',
    rawDate: '2026-01-14'
  }
];

const loadAnnouncementsFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading announcements from storage:', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  return [...INITIAL_ANNOUNCEMENTS];
};

const saveAnnouncementsToStorage = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving announcements to storage:', err);
  }
};

/**
 * Fetch Departments List
 * GET /departments
 */
export const getDepartments = async () => {
  if (BASE_URL) {
    try {
      const res = await axios.get(`${BASE_URL}/departments`, {
        headers: getAuthHeaders(),
        timeout: 10000
      });

      if (res.data && (res.data.success || res.data.statusCode === 200 || Array.isArray(res.data.data) || Array.isArray(res.data))) {
        const rawList = Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        return rawList.map((dept) => ({
          id: dept.id || dept.department_id || dept._id || dept.name,
          name: dept.name || dept.department_name || dept.title || 'Unnamed Department'
        }));
      }
    } catch (apiErr) {
      console.error('Error fetching departments API:', apiErr);
    }
  }

  return [
    { id: 'DEPT-001', name: 'Emergency' },
    { id: 'DEPT-002', name: 'ICU' },
    { id: 'DEPT-003', name: 'Surgery' },
    { id: 'DEPT-004', name: 'Pediatrics' },
    { id: 'DEPT-005', name: 'Administration' }
  ];
};

/**
 * Normalize raw backend data object to uniform frontend format
 */
export const normalizeAnnouncement = (item) => {
  if (!item) return null;

  let targetAudience = 'All Employees';
  if (item.targetAudience) {
    targetAudience = item.targetAudience;
  } else if (item.audience === 'ALL') {
    targetAudience = 'All Employees';
  } else if (item.audience === 'DEPARTMENTS' || (Array.isArray(item.departments) && item.departments.length > 0)) {
    if (Array.isArray(item.departments) && item.departments.length > 0) {
      targetAudience = item.departments.map((d) => (typeof d === 'string' ? d : d.name)).filter(Boolean).join(', ');
    } else {
      targetAudience = 'Department-Wise';
    }
  }

  const rawDateStr = item.created_at || item.rawDate || item.date || item.publishedDate || '';
  let publishedDate = item.publishedDate || '';
  if (!publishedDate && rawDateStr) {
    const d = new Date(rawDateStr);
    if (!isNaN(d.getTime())) {
      publishedDate = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }
  }

  let rawDateFormatted = '';
  if (rawDateStr) {
    const d = new Date(rawDateStr);
    if (!isNaN(d.getTime())) {
      rawDateFormatted = d.toISOString().split('T')[0];
    } else if (typeof rawDateStr === 'string' && rawDateStr.length >= 10) {
      rawDateFormatted = rawDateStr.slice(0, 10);
    }
  }

  const desc = item.message || item.description || item.content || '';

  return {
    id: item.id || `ANN-${Math.random().toString(36).substring(2, 8)}`,
    title: item.title || 'Untitled Announcement',
    message: desc,
    description: desc,
    audience: item.audience || 'ALL',
    targetAudience: targetAudience || 'All Employees',
    departments: item.departments || [],
    expiry_date: item.expiry_date || item.expiryDate || null,
    status: item.status || 'ACTIVE',
    created_by: item.created_by || null,
    created_at: item.created_at || '',
    publishedDate: publishedDate || 'N/A',
    rawDate: rawDateFormatted
  };
};

/**
 * Fetch Announcements List
 * GET /announcements
 */
export const getAnnouncements = async () => {
  if (BASE_URL) {
    try {
      const res = await axios.get(`${BASE_URL}/announcements`, {
        headers: getAuthHeaders(),
        timeout: 10000
      });

      if (res.data && (res.data.success || res.data.statusCode === 200 || Array.isArray(res.data.data) || Array.isArray(res.data))) {
        const rawList = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        const normalized = rawList.map(normalizeAnnouncement).filter(Boolean);
        return {
          success: true,
          data: normalized,
          total: normalized.length
        };
      }
    } catch (apiErr) {
      console.error('Error fetching announcements from API:', apiErr);
      const errorMessage =
        apiErr?.response?.data?.message ||
        apiErr?.response?.data?.error ||
        apiErr?.message ||
        'Failed to fetch announcements from server';

      const localItems = loadAnnouncementsFromStorage().map(normalizeAnnouncement).filter(Boolean);
      return {
        success: false,
        message: errorMessage,
        data: localItems,
        total: localItems.length,
        error: apiErr
      };
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 80));
  const items = loadAnnouncementsFromStorage().map(normalizeAnnouncement).filter(Boolean);
  return {
    success: true,
    data: items,
    total: items.length
  };
};

/**
 * Create Announcement API
 * POST /announcements
 */
export const createAnnouncement = async (announcementData) => {
  const payload = {
    title: announcementData.title,
    message: announcementData.message || announcementData.content || announcementData.description || '',
    audience: announcementData.audience || (announcementData.departmentWise || announcementData.department_wise ? 'DEPARTMENTS' : 'ALL')
  };

  if (payload.audience === 'DEPARTMENTS' || announcementData.department_ids?.length > 0) {
    payload.department_ids = announcementData.department_ids || announcementData.departmentIds || [];
  }

  if (announcementData.expiry_date || announcementData.expiryDate) {
    payload.expiry_date = announcementData.expiry_date || announcementData.expiryDate;
  }

  if (BASE_URL) {
    try {
      const res = await axios.post(`${BASE_URL}/announcements`, payload, {
        headers: getAuthHeaders(),
        timeout: 10000
      });

      if (res.data && (res.data.success || res.status === 200 || res.status === 201)) {
        return {
          success: true,
          data: res.data.data || res.data,
          message: res.data.message || 'Announcement published successfully'
        };
      }
    } catch (apiErr) {
      console.error('Error creating announcement:', apiErr);
      const errData = apiErr?.response?.data;
      let errorMessage = errData?.message;
      if (Array.isArray(errData?.errors) && errData.errors.length > 0) {
        const details = errData.errors
          .map((e) => (typeof e === 'object' ? `${e.path || 'field'}: ${e.message || 'required'}` : String(e)))
          .join(', ');
        errorMessage = errorMessage ? `${errorMessage} (${details})` : details;
      }
      if (!errorMessage) {
        errorMessage = apiErr?.message || 'Failed to publish announcement';
      }
      throw new Error(errorMessage);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 120));

  const items = loadAnnouncementsFromStorage();
  const dateObj = payload.expiry_date ? new Date(payload.expiry_date) : new Date();

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  const newAnnouncement = {
    id: `ANN-${String(items.length + 1).padStart(3, '0')}`,
    title: payload.title || 'Untitled Announcement',
    targetAudience: payload.audience === 'ALL' ? 'All Employees' : 'Department-Wise',
    audience: payload.audience,
    description: payload.message,
    message: payload.message,
    publishedDate: formattedDate,
    rawDate: new Date().toISOString().split('T')[0],
    expiry_date: payload.expiry_date || null,
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  };

  const updatedList = [newAnnouncement, ...items];
  saveAnnouncementsToStorage(updatedList);

  return {
    success: true,
    data: normalizeAnnouncement(newAnnouncement),
    message: 'Announcement published successfully'
  };
};


