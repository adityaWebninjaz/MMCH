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
  IconClock,
  IconSpeakerphone,
  IconSmartHome,
  IconList,
  IconBolt,
  IconReportMoney,
  IconFileText
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
  IconClock,
  IconSpeakerphone,
  IconSmartHome,
  IconList,
  IconBolt,
  IconReportMoney,
  IconFileText
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
        },
        {
          id: 'hrms-overtime-report',
          title: 'Overtime Report',
          type: 'item',
          url: '/supermostadmin/hrms/overtime-report',
          icon: icons.IconClock,
          breadcrumbs: false
        },
        {
          id: 'hrms-compensatory-off-report',
          title: 'Compensatory Off Report',
          type: 'item',
          url: '/supermostadmin/hrms/compensatory-off-report',
          icon: icons.IconNotebook,
          breadcrumbs: false
        },
        {
          id: 'hrms-deduction-summary-report',
          title: 'Deduction Summary Report',
          type: 'item',
          url: '/supermostadmin/hrms/deduction-summary-report',
          icon: icons.IconFileInvoice,
          breadcrumbs: false
        },
        {
          id: 'hrms-electricity-report',
          title: 'Electricity Report',
          type: 'item',
          url: '/supermostadmin/hrms/electricity-report',
          icon: icons.IconBuildingCommunity,
          breadcrumbs: false
        },
        {
          id: 'hrms-pre-processing-report',
          title: 'Pre Processing Report',
          type: 'item',
          url: '/supermostadmin/hrms/pre-processing-report',
          icon: icons.IconCheckbox,
          breadcrumbs: false
        },
        {
          id: 'hrms-saral-report',
          title: 'Saral Report',
          type: 'item',
          url: '/supermostadmin/hrms/saral-report',
          icon: icons.IconReportAnalytics,
          breadcrumbs: false
        },
        {
          id: 'hrms-attendance-exception-report',
          title: 'Attendance Exception Report',
          type: 'item',
          url: '/supermostadmin/hrms/attendance-exception-report',
          icon: icons.IconClipboardList,
          breadcrumbs: false
        },
        // {
        //   id: 'hrms-approval-tat-report',
        //   title: 'Approval TAT Report',
        //   type: 'item',
        //   url: '/supermostadmin/hrms/approval-tat-report',
        //   icon: icons.IconClock,
        //   breadcrumbs: false
        // }
      ]
    },
    {
      id: 'hrms-regularisations',
      title: 'Regularisations',
      type: 'item',
      url: '/supermostadmin/hrms/regularisations',
      icon: icons.IconCheckbox,
      breadcrumbs: false
    },
    {
      id: 'hrms-announcements',
      title: 'Announcement',
      type: 'item',
      url: '/supermostadmin/hrms/announcements',
      icon: icons.IconSpeakerphone,
      breadcrumbs: false
    },
    {
      id: 'hostel-administration',
      title: 'Hostel Administration',
      type: 'collapse',
      icon: icons.IconBuildingCommunity,
      breadcrumbs: false,
      children: [
        {
          id: 'hostel-dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/supermostadmin/hostel/dashboard',
          icon: icons.IconSmartHome,
          breadcrumbs: false
        },
        {
          id: 'hostel-charge-entry',
          title: 'Charge Entry',
          type: 'item',
          url: '/supermostadmin/hostel/charge-entry',
          icon: icons.IconList,
          breadcrumbs: false
        },
        {
          id: 'hostel-meter-reading-entry',
          title: 'Meter Reading Entry',
          type: 'item',
          url: '/supermostadmin/hostel/meter-reading-entry',
          icon: icons.IconList,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'electricity-department',
      title: 'Electricity Department',
      type: 'collapse',
      icon: icons.IconBolt,
      breadcrumbs: false,
      children: [
        {
          id: 'electricity-dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/supermostadmin/electricity/dashboard',
          icon: icons.IconSmartHome,
          breadcrumbs: false
        },
        {
          id: 'electricity-meter-reading-entry',
          title: 'Meter Reading Entry',
          type: 'item',
          url: '/supermostadmin/electricity/meter-reading-entry',
          icon: icons.IconList,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'accounts-department',
      title: 'Accounts Department',
      type: 'collapse',
      icon: icons.IconReportMoney,
      breadcrumbs: false,
      children: [
        {
          id: 'accounts-dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/supermostadmin/accounts/dashboard',
          icon: icons.IconSmartHome,
          breadcrumbs: false
        },
        {
          id: 'accounts-deduction-summaries',
          title: 'Deduction Summaries',
          type: 'item',
          url: '/supermostadmin/accounts/deduction-summaries',
          icon: icons.IconList,
          breadcrumbs: false
        },
        {
          id: 'accounts-statutory-compliance',
          title: 'Statutory Compliance',
          type: 'item',
          url: '/supermostadmin/accounts/statutory-compliance',
          icon: icons.IconFileText,
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default superMostAdmin;
