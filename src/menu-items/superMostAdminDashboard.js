// assets
import {
  IconCalendarEvent,
  IconUsers,
  IconNotebook,
  IconBuildingCommunity,
  IconFileInvoice,
  IconClipboardList,
  IconReportAnalytics,
  IconCheckbox,
  IconUser,
  IconClock
} from '@tabler/icons-react';

// constant
const icons = {
  IconCalendarEvent,
  IconUsers,
  IconNotebook,
  IconBuildingCommunity,
  IconFileInvoice,
  IconClipboardList,
  IconReportAnalytics,
  IconCheckbox,
  IconUser,
  IconClock
};

// ==============================|| SUPER MOST ADMIN MENU ITEMS ||============================== //

const superMostAdmin = {
  type: 'SuperMostAdmin',
  children: [
    {
      id: 'hrms-employee-master',
      title: 'Employee Master',
      type: 'collapse',
      icon: icons.IconUser,
      breadcrumbs: false,
      children: [
        {
          id: 'hrms-all-employees',
          title: 'All Employees',
          type: 'item',
          url: '/supermostadmin/hrms/all-employees',
          icon: icons.IconUsers,
          breadcrumbs: false
        },
        {
          id: 'hrms-approvals',
          title: 'Approvals',
          type: 'item',
          url: '/supermostadmin/hrms/approvals',
          icon: icons.IconCheckbox,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'hrms-biometric-devices',
      title: 'Biometric Devices',
      type: 'item',
      url: '/supermostadmin/hrms/biometric-devices',
      icon: icons.IconFileInvoice,
      breadcrumbs: false
    },
    {
      id: 'hrms-shift-management',
      title: 'Shift Management',
      type: 'collapse',
      icon: icons.IconClock,
      breadcrumbs: false,
      children: [
        {
          id: 'hrms-shift-details',
          title: 'Shift Details',
          type: 'item',
          url: '/supermostadmin/hrms/shift-details',
          icon: icons.IconNotebook,
          breadcrumbs: false
        },
        {
          id: 'hrms-assign-shift',
          title: 'Assign Shift',
          type: 'item',
          url: '/supermostadmin/hrms/assign-shift',
          icon: icons.IconCalendarEvent,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'hrms-reports',
      title: 'Reports',
      type: 'collapse',
      icon: icons.IconFileInvoice,
      breadcrumbs: false,
      children: [
        {
          id: 'hrms-attendance-report',
          title: 'Attendance Report',
          type: 'item',
          url: '/supermostadmin/hrms/attendance-report',
          icon: icons.IconClipboardList,
          breadcrumbs: false
        },
        {
          id: 'hrms-leave-report',
          title: 'Leave Report',
          type: 'item',
          url: '/supermostadmin/hrms/leave-report',
          icon: icons.IconReportAnalytics,
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default superMostAdmin;
