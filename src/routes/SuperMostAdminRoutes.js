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
const HrmsRegularisations = Loadable(lazy(() => import('views/SuperMostAdmin/HRMS/Regularisations')));

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
        }
      ]
    }
  ]
};

export default SuperMostAdminRoutes;
