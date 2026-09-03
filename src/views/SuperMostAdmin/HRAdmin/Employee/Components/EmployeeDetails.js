import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Button, Tabs, Tab } from '@mui/material';
import { IconPencil, IconArrowLeft } from '@tabler/icons-react';
import AddEditEmployee from './AddEditEmployee';
import OverviewTab from './OverviewTab';
import AttendanceTab from './AttendanceTab';
import LeaveTab from './LeaveTab';
import DocumentsTab from './DocumentsTab';
import { getEmployeeAttendance, getEmployeeById } from '../../Services/hrEmployeeService';

const EmployeeDetails = ({ employee, onBack, onUpdateEmployee }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [detailedEmployee, setDetailedEmployee] = useState(null);
  const [leaveDate, setLeaveDate] = useState('15 March 2025');
  const [leaveMonth, setLeaveMonth] = useState('June');
  const [attendanceYear] = useState(2026);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Fetch full employee details from API
  const fetchDetailedEmployee = (empId) => {
    if (!empId) return;
    getEmployeeById(empId).then((res) => {
      if (res?.success && res.data) {
        setDetailedEmployee(res.data);
      }
    });
  };

  useEffect(() => {
    if (employee?.id) {
      fetchDetailedEmployee(employee.id);
    }
  }, [employee?.id]);

  const targetUserId = employee?.id || employee?.userId || employee?.employeeId || employee?.empId;

  // Fetch Attendance API on tab switch or employee change
  useEffect(() => {
    if (activeTab === 1 && targetUserId) {
      let isMounted = true;
      setLoadingAttendance(true);
      getEmployeeAttendance(targetUserId, attendanceYear).then((res) => {
        if (isMounted) {
          if (res.success && res.data) {
            setAttendanceData(res.data);
          }
          setLoadingAttendance(false);
        }
      });

      return () => {
        isMounted = false;
      };
    }
  }, [activeTab, targetUserId, attendanceYear]);

  // Filter Select style matching Employee list page
  const filterSelectSx = {
    height: '32px',
    width: '180px',
    bgcolor: '#FFFFFF',
    borderRadius: '6px !important',
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
    fontWeight: 400,
    color: '#0F172A',
    '& .MuiOutlinedInput-notchedOutline, & fieldset': {
      borderColor: '#E2E8F0',
      borderRadius: '6px !important'
    },
    '&:hover .MuiOutlinedInput-notchedOutline, &:hover fieldset': {
      borderColor: '#94A3B8'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused fieldset': {
      borderColor: '#644EE5',
      borderWidth: '1.5px'
    },
    '& .MuiSelect-select': {
      py: 0,
      px: '14px',
      display: 'flex',
      alignItems: 'center',
      height: '32px',
      boxSizing: 'border-box'
    }
  };

  const getDepartmentName = (dept) => {
    if (!dept) return '-';
    if (typeof dept === 'object' && dept.name) return dept.name;
    return dept;
  };

  const getDesignationName = (desig) => {
    if (!desig) return '-';
    if (typeof desig === 'object' && desig.name) return desig.name;
    return desig;
  };

  // Pre-calculate full merged employee data object for both display and editing
  const empData = {
    id: detailedEmployee?.id || employee?.id,
    userId: detailedEmployee?.id || employee?.id || employee?.userId,
    employeeId: detailedEmployee?.uid || detailedEmployee?.employeeId || employee?.employeeId || employee?.empId || employee?.uid,
    name:
      detailedEmployee?.personal?.full_name ||
      detailedEmployee?.personal?.first_name ||
      detailedEmployee?.name ||
      employee?.name ||
      employee?.full_name,
    avatar: detailedEmployee?.employee_image || employee?.avatar,
    department:
      getDepartmentName(detailedEmployee?.employment?.department) !== '-'
        ? getDepartmentName(detailedEmployee?.employment?.department)
        : getDepartmentName(detailedEmployee?.department) !== '-'
        ? getDepartmentName(detailedEmployee?.department)
        : getDepartmentName(employee?.department),
    departmentId:
      detailedEmployee?.employment?.department_id || detailedEmployee?.department_id || employee?.departmentId || employee?.department_id,
    designation:
      getDesignationName(detailedEmployee?.employment?.designation) !== '-'
        ? getDesignationName(detailedEmployee?.employment?.designation)
        : getDesignationName(detailedEmployee?.designation) !== '-'
        ? getDesignationName(detailedEmployee?.designation)
        : getDesignationName(employee?.designation),
    designationId:
      detailedEmployee?.employment?.designation_id ||
      detailedEmployee?.designation_id ||
      employee?.designationId ||
      employee?.designation_id,
    category:
      detailedEmployee?.category ||
      (detailedEmployee?.profile_status ? detailedEmployee.profile_status.replace(/_/g, ' ') : null) ||
      employee?.category ||
      'Staff',
    status: detailedEmployee?.status
      ? detailedEmployee.status.charAt(0).toUpperCase() + detailedEmployee.status.slice(1).toLowerCase()
      : employee?.status || 'Active',
    phone:
      detailedEmployee?.personal?.mobile_number ||
      detailedEmployee?.personal?.phone_number ||
      detailedEmployee?.mobile_number ||
      detailedEmployee?.phone_number ||
      detailedEmployee?.phone ||
      employee?.phone ||
      employee?.mobile,
    email: detailedEmployee?.personal?.email || detailedEmployee?.email || employee?.email,
    dob:
      detailedEmployee?.personal?.date_of_birth ||
      detailedEmployee?.personal?.dob ||
      detailedEmployee?.date_of_birth ||
      detailedEmployee?.dob ||
      employee?.dob ||
      employee?.date_of_birth,
    gender: detailedEmployee?.personal?.gender || detailedEmployee?.gender || employee?.gender,
    fatherName:
      detailedEmployee?.personal?.father_name ||
      detailedEmployee?.father_name ||
      detailedEmployee?.fatherName ||
      employee?.fatherName ||
      employee?.father_name,
    emergencyContactName:
      detailedEmployee?.personal?.emergency_contact_name ||
      detailedEmployee?.emergency_contact_name ||
      detailedEmployee?.emergencyContactName ||
      employee?.emergencyContactName ||
      employee?.emergency_contact_name,
    emergencyContactNumber:
      detailedEmployee?.personal?.emergency_contact_number ||
      detailedEmployee?.emergency_contact_number ||
      detailedEmployee?.emergencyContactNumber ||
      employee?.emergencyContactNumber ||
      employee?.emergency_contact_number,
    salaryGrade:
      detailedEmployee?.employment?.salary_grade ||
      detailedEmployee?.salary_grade ||
      detailedEmployee?.salaryGrade ||
      employee?.salaryGrade ||
      employee?.salary_grade,
    hodAssigned:
      detailedEmployee?.employment?.reporting_manager ||
      detailedEmployee?.reporting_manager ||
      detailedEmployee?.hodAssigned ||
      detailedEmployee?.hod ||
      employee?.hodAssigned ||
      employee?.hod,
    reportingManagerId:
      detailedEmployee?.employment?.reporting_manager_id ||
      detailedEmployee?.reporting_manager_id ||
      employee?.reportingManagerId ||
      employee?.reporting_manager_id,
    bankName:
      detailedEmployee?.bank_details?.bank_name ||
      detailedEmployee?.bank_details?.bank ||
      detailedEmployee?.bank_name ||
      detailedEmployee?.bankName ||
      employee?.bankName ||
      employee?.bank_name,
    accountNumber:
      detailedEmployee?.bank_details?.account_number ||
      detailedEmployee?.account_number ||
      detailedEmployee?.accountNumber ||
      employee?.accountNumber ||
      employee?.account_number,
    pfNumber:
      detailedEmployee?.bank_details?.pf_number ||
      detailedEmployee?.pf_number ||
      detailedEmployee?.pfNumber ||
      employee?.pfNumber ||
      employee?.pf_number,
    ifsc:
      detailedEmployee?.bank_details?.ifsc_code ||
      detailedEmployee?.bank_details?.ifsc ||
      detailedEmployee?.ifsc_code ||
      detailedEmployee?.ifsc ||
      employee?.ifsc ||
      employee?.ifsc_code,
    pan:
      detailedEmployee?.bank_details?.pan_number ||
      detailedEmployee?.bank_details?.pan ||
      detailedEmployee?.pan_number ||
      detailedEmployee?.pan ||
      employee?.pan ||
      employee?.pan_number,
    aadhaar:
      detailedEmployee?.bank_details?.aadhaar_number ||
      detailedEmployee?.bank_details?.aadhaar ||
      detailedEmployee?.aadhaar_number ||
      detailedEmployee?.aadhaar ||
      employee?.aadhaar ||
      employee?.aadhaar_number,
    alternatePhone:
      detailedEmployee?.address?.alternate_phone_number ||
      detailedEmployee?.address?.alternate_phone ||
      detailedEmployee?.alternate_phone_number ||
      detailedEmployee?.alternatePhone ||
      employee?.alternatePhone ||
      employee?.alternate_phone ||
      employee?.alternate_phone_number,
    address:
      (typeof detailedEmployee?.address === 'object'
        ? detailedEmployee?.address?.address || detailedEmployee?.address?.address_line
        : detailedEmployee?.address) ||
      (typeof employee?.address === 'object' ? employee?.address?.address || employee?.address?.address_line : employee?.address),
    pinCode:
      detailedEmployee?.address?.pin_code ||
      detailedEmployee?.address?.pincode ||
      detailedEmployee?.pin_code ||
      employee?.pinCode ||
      employee?.pin_code
  };

  if (isEditing) {
    return (
      <AddEditEmployee
        initialData={empData}
        mode="edit"
        onSave={(updated) => {
          if (onUpdateEmployee) {
            onUpdateEmployee(updated);
          }
          if (employee?.id) {
            fetchDetailedEmployee(employee.id);
          } else if (updated) {
            setDetailedEmployee((prev) => ({ ...prev, ...updated }));
          }
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderVal = (v) => {
    if (v === null || v === undefined || v === '') return '-';
    return v;
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '#FFFFFF',
        p: { xs: 2, sm: 2.5, md: 3 },
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* Back to list navigation */}
      <Box sx={{ mb: 2 }}>
        <Button
          onClick={onBack}
          startIcon={<IconArrowLeft size={18} />}
          sx={{
            color: '#64748B',
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 600,
            p: 0,
            '&:hover': { bgcolor: 'transparent', color: '#0F172A' }
          }}
        >
          Back to Employees
        </Button>
      </Box>

      {/* 1. Header Section */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: '20px'
        }}
      >
        {/* Left: Name + Status Badge + Subtitle */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: '22px', sm: '24px' },
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.02em'
              }}
            >
              {empData.name || '-'}
            </Typography>

            {/* Active / Status Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: '10px',
                py: '4px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 600,
                bgcolor: empData.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                color: empData.status === 'Active' ? '#15803D' : '#B91C1C'
              }}
            >
              {empData.status || 'Active'}
            </Box>
          </Box>

          {/* Subtitle / Employee ID & Designation */}
          <Typography
            sx={{
              fontSize: '14px',
              color: '#64748B',
              fontWeight: 400,
              mt: 1,
              lineHeight: '100%'
            }}
          >
            {empData.employeeId || '-'}
            {empData.designation && empData.designation !== '-' ? ` · ${empData.designation}` : ''}
          </Typography>
        </Box>

        {/* Right: Edit Details Button */}
        <Button
          variant="contained"
          onClick={() => setIsEditing(true)}
          startIcon={<IconPencil size={18} stroke={2} />}
          sx={{
            width: '140px',
            height: '36px',
            gap: '8px',
            pt: '6px',
            pb: '6px',
            px: '16px',
            borderRadius: '6px',
            bgcolor: '#644EE5',
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '24px',
            letterSpacing: '0%',
            textTransform: 'none',
            boxShadow: 'none',
            '& .MuiButton-startIcon': {
              mr: 0,
              ml: 0
            },
            '&:hover': {
              bgcolor: '#533DC7',
              boxShadow: 'none'
            }
          }}
        >
          Edit Details
        </Button>
      </Box>

      {/* 2. Main Content Card Container (Wrapping Tabs + Tab Contents) */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          bgcolor: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        {/* Horizontal Tabs Bar */}
        <Box sx={{ borderBottom: '1px solid #E2E8F0', px: { xs: 1.5, sm: 2.5 } }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: '44px',
              '& .MuiTabs-indicator': {
                bgcolor: '#644EE5',
                height: '2px'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#64748B',
                lineHeight: '20px',
                minWidth: 'auto',
                px: 3,
                py: '10px',
                '&.Mui-selected': {
                  color: '#644EE5'
                }
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label="Attendance" />
            <Tab label="Leave" />
            <Tab label="Documents" />
          </Tabs>
        </Box>

        {/* Tab Contents Area */}
        <Box sx={{ p: '20px' }}>
          {activeTab === 0 && <OverviewTab empData={empData} renderVal={renderVal} />}

          {activeTab === 1 && (
            <AttendanceTab attendanceData={attendanceData} attendanceYear={attendanceYear} loadingAttendance={loadingAttendance} />
          )}

          {activeTab === 2 && (
            <LeaveTab
              leaveDate={leaveDate}
              setLeaveDate={setLeaveDate}
              leaveMonth={leaveMonth}
              setLeaveMonth={setLeaveMonth}
              filterSelectSx={filterSelectSx}
            />
          )}

          {activeTab === 3 && <DocumentsTab documents={empData?.documents} />}
        </Box>
      </Paper>
    </Box>
  );
};

EmployeeDetails.propTypes = {
  employee: PropTypes.object,
  onBack: PropTypes.func,
  onUpdateEmployee: PropTypes.func
};

export default EmployeeDetails;
