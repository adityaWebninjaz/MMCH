import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

const HrmsAllEmployees = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/AllEmployees')));
const HrmsApprovals = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/Approvals')));
const HrmsBiometricDevices = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/BiometricDevices')));
const HrmsShiftDetails = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/ShiftDetails')));
const HrmsAssignShift = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/AssignShift')));
const HrmsAttendanceReport = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/AttendanceReport')));
const HrmsLeaveReport = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/LeaveReport')));
const HrmsOvertimeReport = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/Reports/OvertimeReport')));
const HrmsCompensatoryOffReport = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/Reports/CompensatoryOffReport')));
const HrmsDeductionSummaryReport = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/Reports/DeductionSummaryReport')));
const HrmsElectricityReport = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/Reports/ElectricityReport')));
const HrmsPreProcessingReport = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/Reports/PreProcessingReport')));
const HrmsSaralReport = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/Reports/SaralReport')));
const HrmsAttendanceExceptionReport = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/Reports/AttendanceExceptionReport')));
const HrmsRegularisations = Loadable(lazy(() => import('@/views/SuperMostAdmin/HRMS/Regularisations/Regularisations')));
const HrmsAnnouncements = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/Announcements')));
const HrmsCreateAnnouncement = Loadable(lazy(() => import('@/views/SuperMostAdmin/HRMS/Announcements/components/CreateAnnouncement')));
const HostelDashboard = Loadable(lazy(() => import('views/SuperMostAdmin/HostelAdministration/Dashboard')));
const HostelChargeEntry = Loadable(lazy(() => import('views/SuperMostAdmin/HostelAdministration/ChargeEntry')));
const HostelMeterReadingEntry = Loadable(lazy(() => import('views/SuperMostAdmin/HostelAdministration/MeterReadingEntry')));
const ElectricityDashboard = Loadable(lazy(() => import('views/SuperMostAdmin/ElectricityDepartment/Dashboard')));
const ElectricityMeterReadingEntry = Loadable(lazy(() => import('views/SuperMostAdmin/ElectricityDepartment/MeterReadingEntry')));
const AccountsDashboard = Loadable(lazy(() => import('@/views/SuperMostAdmin/AccountsDepartment')));
const AccountsDeductionSummaries = Loadable(lazy(() => import('@/views/SuperMostAdmin/AccountsDepartment/Items/DeductionSummaries')));
const AccountsStatutoryCompliance = Loadable(lazy(() => import('@/views/SuperMostAdmin/AccountsDepartment/Items/StatutoryCompliance')));
const HRAdminDashboard = Loadable(lazy(() => import('views/SuperMostAdmin/HRAdmin/Dashboard')));
const HREmployee = Loadable(lazy(() => import('views/SuperMostAdmin/HRAdmin/Employee')));

const SuperMostAdminRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <Navigate to="/supermostadmin/hrms/all-employees" replace />
    },
    {
      path: 'supermostadmin',
      children: [
        {
          path: '',
          element: <Navigate to="/supermostadmin/hrms/all-employees" replace />
        },
        {
          path: 'default',
          element: <Navigate to="/supermostadmin/hrms/all-employees" replace />
        },
        {
          path: 'hrms/all-employees',
          element: <HrmsAllEmployees />
        },
        {
          path: 'hrms/approvals',
          element: <HrmsApprovals />
        },
        {
          path: 'hrms/biometric-devices',
          element: <HrmsBiometricDevices />
        },
        {
          path: 'hrms/devices',
          element: <HrmsBiometricDevices />
        },
        {
          path: 'hrms/shift-details',
          element: <HrmsShiftDetails />
        },
        {
          path: 'hrms/assign-shift',
          element: <HrmsAssignShift />
        },
        {
          path: 'hrms/attendance-report',
          element: <HrmsAttendanceReport />
        },
        {
          path: 'hrms/leave-report',
          element: <HrmsLeaveReport />
        },
        {
          path: 'hrms/overtime-report',
          element: <HrmsOvertimeReport />
        },
        {
          path: 'hrms/compensatory-off-report',
          element: <HrmsCompensatoryOffReport />
        },
        {
          path: 'hrms/deduction-summary-report',
          element: <HrmsDeductionSummaryReport />
        },
        {
          path: 'hrms/electricity-report',
          element: <HrmsElectricityReport />
        },
        {
          path: 'hrms/pre-processing-report',
          element: <HrmsPreProcessingReport />
        },
        {
          path: 'hrms/saral-report',
          element: <HrmsSaralReport />
        },
        {
          path: 'hrms/attendance-exception-report',
          element: <HrmsAttendanceExceptionReport />
        },
        {
          path: 'hrms/regularisations',
          element: <HrmsRegularisations />
        },
        {
          path: 'hrms/announcements',
          element: <HrmsAnnouncements />
        },
        {
          path: 'hrms/announcements/create',
          element: <HrmsCreateAnnouncement />
        },
        {
          path: 'hostel/dashboard',
          element: <HostelDashboard />
        },
        {
          path: 'hostel/charge-entry',
          element: <HostelChargeEntry />
        },
        {
          path: 'hostel/meter-reading-entry',
          element: <HostelMeterReadingEntry />
        },
        {
          path: 'electricity/dashboard',
          element: <ElectricityDashboard />
        },
        {
          path: 'electricity/meter-reading-entry',
          element: <ElectricityMeterReadingEntry />
        },
        {
          path: 'accounts/dashboard',
          element: <AccountsDashboard />
        },
        {
          path: 'accounts/deduction-summaries',
          element: <AccountsDeductionSummaries />
        },
        {
          path: 'accounts/statutory-compliance',
          element: <AccountsStatutoryCompliance />
        },
        {
          path: 'hr-admin/dashboard',
          element: <HRAdminDashboard />
        },
        {
          path: 'hr-admin/employee',
          element: <HREmployee />
        }

      ]
    }
  ]
};

export default SuperMostAdminRoutes;
