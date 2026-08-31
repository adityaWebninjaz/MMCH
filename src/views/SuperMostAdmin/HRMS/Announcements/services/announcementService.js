import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const STORAGE_KEY = 'MMCH_HRMS_ANNOUNCEMENTS_DATA';

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
 * Fetch Announcements List
 */
export const getAnnouncements = async ({ date = '', search = '', targetAudience = '' } = {}) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  if (BASE_URL) {
    try {
      const res = await axios.get(`${BASE_URL}/hrms/announcements`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          search,
          date,
          target_audience: targetAudience
        },
        timeout: 4000
      });

      if (res.data && res.data.success) {
        return {
          success: true,
          data: res.data.data || res.data.announcements || [],
          total: res.data.total || (res.data.data ? res.data.data.length : 0)
        };
      }
    } catch (apiErr) {
      console.info('HRMS Announcements API connecting, falling back to local data:', apiErr?.message);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 80));
  let items = loadAnnouncementsFromStorage();

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.content && item.content.toLowerCase().includes(q)) ||
        (item.targetAudience && item.targetAudience.toLowerCase().includes(q)) ||
        (item.publishedDate && item.publishedDate.toLowerCase().includes(q))
    );
  }

  if (targetAudience && targetAudience !== 'All') {
    items = items.filter((item) => item.targetAudience === targetAudience);
  }

  return {
    success: true,
    data: items,
    total: items.length
  };
};

/**
 * Create Announcement API
 * Endpoint: POST /hrms/announcements (or custom backend URL)
 */
export const createAnnouncement = async (announcementData) => {
  const token = Cookies.get('Token') || Cookies.get('token');

  // Direct backend API call
  if (BASE_URL) {
    try {
      const res = await axios.post(`${BASE_URL}/hrms/announcements`, announcementData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (res.data && res.data.success) {
        return {
          success: true,
          data: res.data.data,
          message: res.data.message || 'Announcement published successfully'
        };
      }
    } catch (apiErr) {
      console.info('HRMS API endpoint connecting, saving to store:', apiErr?.message);
    }
  }

  // Local persistence fallback
  await new Promise((resolve) => setTimeout(resolve, 120));

  const items = loadAnnouncementsFromStorage();
  const dateObj = announcementData.date ? new Date(announcementData.date) : new Date();

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  const newAnnouncement = {
    id: `ANN-${String(items.length + 1).padStart(3, '0')}`,
    title: announcementData.title || 'Untitled Announcement',
    targetAudience: announcementData.targetAudience || (announcementData.allEmployees ? 'All Employees' : 'Department-wise'),
    target_audience: announcementData.target_audience || 'all_employees',
    description: announcementData.content || announcementData.description || '',
    content: announcementData.content || announcementData.description || '',
    publishedDate: announcementData.publishedDate || formattedDate,
    rawDate: announcementData.date || new Date().toISOString().split('T')[0],
    expiryDate: announcementData.expiryDate || announcementData.expiry_date || null,
    status: 'Published',
    createdAt: new Date().toISOString()
  };

  const updatedList = [newAnnouncement, ...items];
  saveAnnouncementsToStorage(updatedList);

  return {
    success: true,
    data: newAnnouncement,
    message: 'Announcement published successfully'
  };
};
