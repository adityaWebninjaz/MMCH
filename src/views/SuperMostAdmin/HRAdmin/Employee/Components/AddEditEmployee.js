import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { IconCalendar, IconChevronDown, IconUpload, IconCheck, IconX } from '@tabler/icons-react';
import {
  getDepartments,
  getDesignations,
  getHODs,
  createEmployeeUser,
  updateEmployeeUser,
  uploadEmployeeDocument
} from '../../Services/hrEmployeeService';

// ============================================================================
// CONSTANTS & STATIC DEFINITIONS
// ============================================================================

const DOCUMENT_SLOTS = [
  { key: 'APPOINTMENT_LETTER', title: 'Appointment Letter', subtitle: 'Max file size 10 MB · PDF/JPG/PNG format' },
  { key: 'ID_PROOF', title: 'ID Proof (Aadhaar / PAN)', subtitle: 'Max file size 10 MB · PDF, JPG, or PNG' },
  { key: 'PASSPORT', title: 'Passport-size Photograph', subtitle: 'Max file size 10 MB · JPG/PNG (150×200px)' },
  { key: 'MARKSHEET_10TH', title: 'Xth Marksheet', subtitle: 'Max file size 10 MB · PDF/JPG/PNG format' },
  { key: 'MARKSHEET_12TH', title: 'XIIth Marksheet', subtitle: 'Max file size 10 MB · PDF, JPG, or PNG' },
  { key: 'PASSBOOK', title: 'Passbook', subtitle: 'Max file size 10 MB · JPG/PNG (150×200px)' },
  { key: 'CANCELLED_CHEQUE', title: 'Cancelled Cheque', subtitle: 'Max file size 10 MB · PDF/JPG/PNG format' }
];

const SALARY_GRADE_OPTIONS = ['G1', 'G2', 'G3', 'G4', 'G5'];

const BANK_OPTIONS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Punjab National Bank',
  'Canara Bank',
  'Union Bank of India',
  'Kotak Mahindra Bank',
  'Bank of Baroda'
];

const DEFAULT_DEPARTMENTS = ['Radiology', 'Surgery', 'Pediatrics', 'ICU', 'Emergency', 'Pathology', 'Pharmacy', 'Hostel', 'Administration'];

const DEFAULT_DESIGNATIONS = [
  'Executive Grade 1',
  'Cardiovascular Specialist',
  'Cardiology Consultant',
  'Heart Disease Specialist',
  'Interventional Cardiologist',
  'Pediatric Cardiologist',
  'Electrophysiologist',
  'Cardiac Surgeon',
  'Heart Failure Specialist',
  'Emergency Physician',
  'Senior Pathologist',
  'Chief Surgeon',
  'Senior Pediatrician',
  'Medical Superintendent',
  'Critical Care Specialist',
  'Clinical Pharmacist',
  'MRI Specialist',
  'Senior Intensivist',
  'Resident Medical Officer',
  'CT Scan Specialist'
];

const DEFAULT_HODS = ['Dr. R. Krishnan', 'Dr. Rajesh Kumar', 'Mr. Ajay Dixit', 'Dr. Priya Patel', 'Dr. Sudhanshu'];

// ============================================================================
// STYLES
// ============================================================================

const labelStyle = {
  fontSize: '11.5px',
  fontWeight: 700,
  color: '#475569',
  mb: '6px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase'
};

const inputSx = (hasError = false) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    height: '40px',
    fontSize: '13.5px',
    bgcolor: '#FFFFFF',
    '&.Mui-disabled': {
      bgcolor: '#F1F5F9',
      color: '#64748B',
      cursor: 'not-allowed',
      '& fieldset': {
        borderColor: '#E2E8F0'
      },
      '& input': {
        WebkitTextFillColor: '#64748B',
        cursor: 'not-allowed'
      }
    },
    '& fieldset': {
      borderColor: hasError ? '#EF4444' : '#E2E8F0'
    },
    '&:hover fieldset': {
      borderColor: hasError ? '#DC2626' : '#CBD5E1'
    },
    '&.Mui-focused fieldset': {
      borderColor: hasError ? '#EF4444' : '#644EE5',
      borderWidth: '1.5px'
    }
  },
  '& .MuiFormHelperText-root': {
    fontSize: '11.5px',
    mt: '3px',
    mx: 0,
    color: '#EF4444'
  }
});

const selectSx = (hasError = false) => ({
  height: '40px',
  borderRadius: '8px',
  bgcolor: '#FFFFFF',
  fontSize: '13.5px',
  color: '#0F172A',
  '&.Mui-disabled': {
    bgcolor: '#F1F5F9',
    color: '#64748B',
    cursor: 'not-allowed',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E2E8F0'
    },
    '& .MuiSelect-select': {
      WebkitTextFillColor: '#64748B',
      cursor: 'not-allowed'
    }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: hasError ? '#EF4444' : '#E2E8F0',
    borderRadius: '8px'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: hasError ? '#DC2626' : '#CBD5E1'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: hasError ? '#EF4444' : '#644EE5',
    borderWidth: '1.5px'
  },
  '& .MuiSelect-select': {
    py: 0,
    px: '14px',
    display: 'flex',
    alignItems: 'center',
    height: '40px',
    boxSizing: 'border-box'
  }
});

// ============================================================================
// DATA MAPPING & VALIDATION HELPERS
// ============================================================================

const mapInitialToFormData = (data) => ({
  employeeId: data?.employeeId || data?.uid || '',
  name: data?.personal?.full_name || data?.name || data?.full_name || '',
  dob: data?.personal?.date_of_birth || data?.personal?.dob || data?.dob || data?.date_of_birth || '',
  gender: data?.personal?.gender || data?.gender || 'Gender',
  phone: data?.personal?.mobile_number || data?.personal?.phone_number || data?.phone || data?.phone_number || data?.mobile_number || '',
  email: data?.personal?.email || data?.email || '',
  fatherName: data?.personal?.father_name || data?.fatherName || data?.father_name || '',
  emergencyContactName: data?.personal?.emergency_contact_name || data?.emergencyContactName || data?.emergency_contact_name || '',
  emergencyContactNumber: data?.personal?.emergency_contact_number || data?.emergencyContactNumber || data?.emergency_contact_number || '',
  department:
    (typeof data?.employment?.department === 'object' ? data?.employment?.department?.name : data?.employment?.department) ||
    (typeof data?.department === 'object' ? data?.department?.name : data?.department) ||
    data?.department_name ||
    '',
  departmentId: data?.employment?.department_id || data?.departmentId || data?.department_id || '',
  designation:
    (typeof data?.employment?.designation === 'object' ? data?.employment?.designation?.name : data?.employment?.designation) ||
    (typeof data?.designation === 'object' ? data?.designation?.name : data?.designation) ||
    data?.designation_name ||
    '',
  designationId: data?.employment?.designation_id || data?.designationId || data?.designation_id || '',
  salaryGrade: data?.employment?.salary_grade || data?.salaryGrade || data?.salary_grade || '',
  hodAssigned: data?.employment?.reporting_manager || data?.hodAssigned || data?.reporting_manager || '',
  reportingManagerId: data?.employment?.reporting_manager_id || data?.reportingManagerId || data?.reporting_manager_id || '',
  category: data?.category || '',
  status: data?.status || 'Active',
  bankName: data?.bank_details?.bank_name || data?.bank_details?.bank || data?.bankName || data?.bank_name || '',
  accountNumber: data?.bank_details?.account_number || data?.accountNumber || data?.account_number || '',
  pfNumber: data?.bank_details?.pf_number || data?.pfNumber || data?.pf_number || '',
  ifsc: data?.bank_details?.ifsc_code || data?.bank_details?.ifsc || data?.ifsc || data?.ifsc_code || '',
  pan: data?.bank_details?.pan_number || data?.bank_details?.pan || data?.pan || data?.pan_number || '',
  aadhaar: data?.bank_details?.aadhaar_number || data?.bank_details?.aadhaar || data?.aadhaar || data?.aadhaar_number || '',
  alternatePhone:
    data?.address?.alternate_phone_number || data?.address?.alternate_phone || data?.alternatePhone || data?.alternate_phone_number || '',
  address: (typeof data?.address === 'object' ? data?.address?.address || data?.address?.address_line : data?.address) || '',
  pinCode: data?.address?.pin_code || data?.pinCode || data?.pin_code || '',
  shift: data?.employment?.current_shift || data?.shift || 'General (09:00 AM - 05:00 PM)',
  joiningDate: data?.employment?.joined_on || data?.joiningDate || data?.joined_on || new Date().toISOString().slice(0, 10)
});

/**
 * Validates a single field according to HRMS and standard constraints
 */
const validateEmployeeField = (field, value, mode = 'create') => {
  const val = typeof value === 'string' ? value.trim() : value;

  switch (field) {
    case 'name': {
      if (!val) return 'Full name is required';
      if (val.length < 2) return 'Full name must be at least 2 characters';
      const parts = val.split(/\s+/).filter(Boolean);
      if (parts.length < 2) {
        return 'Please enter last name';
      }
      return '';
    }

    case 'dob': {
      if (!val) return 'Date of birth is required';
      const birth = new Date(val);
      const today = new Date();
      if (isNaN(birth.getTime())) return 'Invalid date of birth';
      if (birth >= today) return 'Date of birth must be in the past';

      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age < 18) return 'Employee must be at least 18 years old';
      if (age > 100) return 'Please enter a valid date of birth';
      return '';
    }

    case 'gender':
      if (!val || val === 'Gender') return 'Please select a gender';
      return '';

    case 'phone': {
      if (!val) return 'Mobile number is required';
      const cleaned = String(val).replace(/[\s-]/g, '');
      if (!/^[6-9]\d{9}$/.test(cleaned)) {
        return 'Enter a valid 10-digit mobile number (starts with 6-9)';
      }
      return '';
    }

    case 'email':
      if (!val) return 'Email address is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        return 'Enter a valid email address';
      }
      return '';

    case 'fatherName':
      if (!val) return 'Father / Mother / Spouse name is required';
      if (val.length < 2) return 'Name must be at least 2 characters';
      if (!/^[a-zA-Z\s.'-]+$/.test(val)) return 'Name should contain letters only';
      return '';

    case 'emergencyContactName':
      if (!val) return 'Emergency contact name is required';
      if (val.length < 2) return 'Emergency contact name must be at least 2 characters';
      if (!/^[a-zA-Z\s.'-]+$/.test(val)) return 'Emergency contact name should contain letters only';
      return '';

    case 'department':
      if (!val) return 'Please select a department';
      return '';

    case 'designation':
      if (!val) return 'Please select a designation';
      return '';

    case 'hodAssigned':
      if (mode === 'create' && !val) return 'Please select an assigned HoD';
      return '';

    case 'bankName':
      if (!val) return 'Please select or enter bank name';
      return '';

    case 'accountNumber':
      if (!val) return 'Account number is required';
      if (!/^\d{9,18}$/.test(val)) {
        return 'Account number must be 9 to 18 digits';
      }
      return '';

    case 'ifsc': {
      if (!val) return 'IFSC code is required';
      const cleaned = String(val).toUpperCase().replace(/\s+/g, '');
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleaned)) {
        return 'Enter a valid 11-character IFSC code (e.g. SBIN0001423)';
      }
      return '';
    }

    case 'pan': {
      if (!val) return 'PAN number is required';
      const cleaned = String(val).toUpperCase().replace(/\s+/g, '');
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleaned)) {
        return 'Enter a valid 10-character PAN (e.g. ABCDE1234F)';
      }
      return '';
    }

    case 'aadhaar': {
      if (!val) return 'Aadhaar number is required';
      const cleaned = String(val).replace(/[\s-]/g, '');
      if (!/^\d{12}$/.test(cleaned)) {
        return 'Aadhaar number must be exactly 12 digits';
      }
      return '';
    }

    case 'address':
      if (!val) return 'Address is required';
      if (val.length < 5) return 'Address must be at least 5 characters';
      return '';

    case 'pinCode':
      if (!val) return 'PIN code is required';
      if (!/^[1-9][0-9]{5}$/.test(val)) {
        return 'Enter a valid 6-digit PIN code';
      }
      return '';

    default:
      return '';
  }
};

/**
 * Validates all required (*) fields across the form
 */
const validateAllEmployeeFields = (formData, mode = 'create') => {
  const fields = [
    'name',
    'dob',
    'gender',
    'phone',
    'email',
    'fatherName',
    'emergencyContactName',
    'department',
    'designation',
    'bankName',
    'accountNumber',
    'ifsc',
    'pan',
    'aadhaar',
    'address',
    'pinCode'
  ];

  const errors = {};
  fields.forEach((field) => {
    const err = validateEmployeeField(field, formData[field], mode);
    if (err) {
      errors[field] = err;
    }
  });

  return errors;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AddEditEmployee = ({
  initialData = null,
  mode = 'create', // 'create' | 'edit'
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState(() => mapInitialToFormData(initialData));
  const [uploadedDocs, setUploadedDocs] = useState(initialData?.documents || {});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createdEmpId, setCreatedEmpId] = useState(initialData?.id || initialData?.userId || null);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const fileInputRefs = useRef({});

  // Dynamic Options from API
  const [rawDepartments, setRawDepartments] = useState([]);
  const [rawDesignations, setRawDesignations] = useState([]);
  const [rawHods, setRawHods] = useState([]);

  const [departmentOptions, setDepartmentOptions] = useState(DEFAULT_DEPARTMENTS);
  const [designationOptions, setDesignationOptions] = useState(DEFAULT_DESIGNATIONS);
  const [hodOptions, setHodOptions] = useState(DEFAULT_HODS);

  // Synchronize form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(mapInitialToFormData(initialData));
      setUploadedDocs(initialData?.documents || {});
      setErrors({});
    }
  }, [initialData]);

  // Load dropdown options from backend
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [depts, desigs, hods] = await Promise.all([getDepartments(), getDesignations(), getHODs()]);

        if (Array.isArray(depts) && depts.length > 0) {
          setRawDepartments(depts);
          setDepartmentOptions(depts.map((d) => (typeof d === 'string' ? d : d.name)));
        }
        if (Array.isArray(desigs) && desigs.length > 0) {
          setRawDesignations(desigs);
          setDesignationOptions(desigs.map((d) => (typeof d === 'string' ? d : d.name)));
        }
        if (Array.isArray(hods) && hods.length > 0) {
          setRawHods(hods);
          setHodOptions(hods.map((h) => (typeof h === 'string' ? h : h.name)));
        }
      } catch (err) {
        console.info('Failed to load dropdown options from API:', err?.message);
      }
    };

    fetchDropdowns();
  }, []);

  // Merge options with current form values so selected items always render
  const allDepartmentOptions = Array.from(
    new Set([...departmentOptions.map((d) => (typeof d === 'string' ? d : d.name)), ...(formData.department ? [formData.department] : [])])
  ).filter(Boolean);

  const allDesignationOptions = Array.from(
    new Set([
      ...designationOptions.map((d) => (typeof d === 'string' ? d : d.name)),
      ...(formData.designation ? [formData.designation] : [])
    ])
  ).filter(Boolean);

  const allHodOptions = Array.from(
    new Set([...hodOptions.map((h) => (typeof h === 'string' ? h : h.name)), ...(formData.hodAssigned ? [formData.hodAssigned] : [])])
  ).filter(Boolean);

  const allBankOptions = Array.from(new Set([...BANK_OPTIONS, ...(formData.bankName ? [formData.bankName] : [])])).filter(Boolean);

  const allSalaryGradeOptions = Array.from(
    new Set([...SALARY_GRADE_OPTIONS, ...(formData.salaryGrade ? [formData.salaryGrade] : [])])
  ).filter(Boolean);

  // Handlers
  const handleInputChange = (field, value) => {
    let formattedValue = value;
    if (field === 'pan' || field === 'ifsc') {
      formattedValue = typeof value === 'string' ? value.toUpperCase().replace(/\s+/g, '') : value;
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));

    // Real-time validation clearance
    if (errors[field]) {
      const fieldError = validateEmployeeField(field, formattedValue, mode);
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleInputBlur = (field) => {
    const fieldError = validateEmployeeField(field, formData[field], mode);
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  const handleFileUpload = (key, event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDocs((prev) => ({
        ...prev,
        [key]: {
          file,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        }
      }));
    }
  };

  const handleRemoveDoc = (key) => {
    setUploadedDocs((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key].value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Run Complete Form Validation
    const validationErrors = validateAllEmployeeFields(formData, mode);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorMessage('Please fix the highlighted errors before submitting.');
      setSaving(false);
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const trimmedName = (formData.name || '').trim();
      const nameParts = trimmedName ? trimmedName.split(/\s+/) : [];
      const firstName = nameParts[0] || trimmedName;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const selectedDept = rawDepartments.find((d) => d.id === formData.department || d.name === formData.department);
      const selectedDesig = rawDesignations.find((d) => d.id === formData.designation || d.name === formData.designation);
      const selectedHod = rawHods.find((h) => h.id === formData.hodAssigned || h.name === formData.hodAssigned);

      // ================= 1. EDIT MODE: PATCH /users/{id} =================
      if (mode === 'edit') {
        const targetUserId = initialData?.id || initialData?.userId || initialData?.user_id;
        if (!targetUserId) {
          setErrorMessage('User ID not found for updating');
          setSaving(false);
          return;
        }

        const patchPayload = {
          first_name: firstName || '',
          last_name: lastName || '',
          email: formData.email ? formData.email.trim() : null,
          phone_number: formData.phone ? formData.phone.trim() : null,
          gender: formData.gender === 'Gender' ? null : formData.gender || null,
          date_of_birth: formData.dob || null,
          father_name: formData.fatherName ? formData.fatherName.trim() : null,
          emergency_contact_name: formData.emergencyContactName ? formData.emergencyContactName.trim() : null,
          emergency_contact_number: formData.emergencyContactNumber
            ? formData.emergencyContactNumber.trim()
            : formData.phone
            ? formData.phone.trim()
            : null,
          department_id: selectedDept?.id || formData.departmentId || null,
          designation_id: selectedDesig?.id || formData.designationId || null,
          joined_on: formData.joiningDate || null,
          is_active: formData.status ? formData.status.toLowerCase() === 'active' : true,
          bank_name: formData.bankName ? formData.bankName.trim() : null,
          account_number: formData.accountNumber ? formData.accountNumber.trim() : null,
          pf_number: formData.pfNumber ? formData.pfNumber.trim() : null,
          ifsc_code: formData.ifsc ? formData.ifsc.toUpperCase().trim() : null,
          pan_number: formData.pan ? formData.pan.toUpperCase().trim() : null,
          aadhaar_number: formData.aadhaar ? formData.aadhaar.trim() : null,
          alternate_phone_number: formData.alternatePhone ? formData.alternatePhone.trim() : null,
          address: formData.address ? formData.address.trim() : null,
          pin_code: formData.pinCode ? formData.pinCode.trim() : null
        };

        const res = await updateEmployeeUser(targetUserId, patchPayload);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to update employee details');
          setSaving(false);
          return;
        }

        if (onSave) {
          onSave({
            ...initialData,
            ...formData,
            ...res?.data,
            id: targetUserId
          });
        }
        setSaving(false);
        return;
      }

      // ================= 2. CREATE MODE: POST /users =================
      const payload = {
        full_name: formData.name.trim(),
        first_name: firstName,
        last_name: lastName,
        date_of_birth: formData.dob || '1995-01-01',
        gender: formData.gender === 'Gender' ? 'Male' : formData.gender || 'Male',
        phone_number: formData.phone || '',
        email: formData.email || '',
        father_name: formData.fatherName || '',
        emergency_contact_name: formData.emergencyContactName || '',
        emergency_contact_number: formData.emergencyContactNumber || formData.phone || '',
        department_id: selectedDept?.id || formData.departmentId || formData.department,
        designation_id: selectedDesig?.id || formData.designationId || formData.designation,
        joined_on: formData.joiningDate || new Date().toISOString().slice(0, 10),
        bank_name: formData.bankName || '',
        account_number: formData.accountNumber || '',
        pf_number: formData.pfNumber || '',
        ifsc_code: formData.ifsc ? formData.ifsc.toUpperCase().trim() : '',
        pan_number: formData.pan ? formData.pan.toUpperCase().trim() : '',
        aadhaar_number: formData.aadhaar || '',
        alternate_phone_number: formData.alternatePhone || '',
        address: formData.address || '',
        pin_code: formData.pinCode || ''
      };

      // Only pass reporting_manager_id if explicitly selected; otherwise backend defaults to department's HOD
      const hodId = selectedHod?.id || formData.reportingManagerId;
      if (hodId) {
        payload.reporting_manager_id = hodId;
      }

      // Only pass uid if user entered one; otherwise backend auto-generates sequential UID (e.g. PMCH0107)
      if (formData.employeeId && formData.employeeId.trim()) {
        payload.uid = formData.employeeId.trim();
      }

      // Post employee details to /users
      const res = await createEmployeeUser(payload);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create employee');
        setSaving(false);
        return;
      }

      const createdData = res?.data || {};
      const newEmpId =
        createdData?.id ||
        createdData?.employee?.id ||
        createdData?.user_id ||
        createdData?.uid ||
        (mode === 'edit' ? initialData?.id : null);

      const generatedUid = createdData?.uid || createdData?.employee?.uid || createdData?.employeeId || createdData?.employee?.employee_id;

      if (newEmpId) {
        setCreatedEmpId(newEmpId);
      }

      if (generatedUid) {
        setFormData((prev) => ({ ...prev, employeeId: generatedUid }));
      }

      setSuccessMessage(
        generatedUid
          ? `Employee details saved successfully! (Employee ID: ${generatedUid}) You can now upload documents in Section 5 below.`
          : 'Employee details saved successfully! You can now upload documents in Section 5 below.'
      );

      if (onSave) {
        onSave({
          ...formData,
          ...createdData,
          employeeId: generatedUid || formData.employeeId,
          uid: generatedUid || formData.employeeId,
          id: newEmpId || Date.now()
        });
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Dedicated handler for Section 5: Document Upload API
  const handleUploadDocuments = async () => {
    const targetEmpId = createdEmpId || initialData?.id || initialData?.userId || initialData?.employeeId;
    const docEntries = Object.entries(uploadedDocs).filter(([, docItem]) => docItem?.file);

    if (docEntries.length === 0) {
      setErrorMessage('Please select at least one document to upload.');
      return;
    }

    if (!targetEmpId) {
      setErrorMessage('Please click "Save Details" under Section 4 first to save the employee before uploading documents.');
      return;
    }

    setUploadingDocs(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      let uploadedCount = 0;
      let failedCount = 0;
      for (const [docType, docItem] of docEntries) {
        if (docItem?.file) {
          const uploadRes = await uploadEmployeeDocument(targetEmpId, docType, docItem.file);
          if (uploadRes.success) {
            uploadedCount++;
          } else {
            failedCount++;
          }
        }
      }

      if (uploadedCount > 0 && failedCount === 0) {
        setSuccessMessage(`${uploadedCount} document(s) uploaded successfully!`);
      } else if (uploadedCount > 0 && failedCount > 0) {
        setSuccessMessage(`${uploadedCount} document(s) uploaded successfully (${failedCount} failed).`);
      } else {
        setErrorMessage('Failed to upload documents. Please check file format and try again.');
      }
    } catch (err) {
      console.error('Error in handleUploadDocuments:', err);
      setErrorMessage(err?.message || 'Failed to upload documents');
    } finally {
      setUploadingDocs(false);
    }
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
      {/* 1. Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '-0.01em'
          }}
        >
          {mode === 'create' ? 'Add Employee' : 'Edit Employee'}
        </Typography>
      </Box>

      {/* 2. Main Form Card */}
      <Paper
        elevation={0}
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF'
        }}
      >
        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage('')} sx={{ mb: 3, borderRadius: '8px', fontSize: '13px' }}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 3, borderRadius: '8px', fontSize: '13px' }}>
            {successMessage}
          </Alert>
        )}

        {/* ================= SECTION 1: PERSONAL INFORMATION ================= */}
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#1E293B',
            mb: 2
          }}
        >
          Section 1 - Personal Information
        </Typography>

        <Grid container spacing={2.5}>
          {/* Row 1 */}
          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              FULL NAME <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Anjali Pillai"
              value={formData.name}
              error={Boolean(errors.name)}
              helperText={errors.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleInputBlur('name')}
              sx={inputSx(Boolean(errors.name))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              DATE OF BIRTH <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={formData.dob}
              error={Boolean(errors.dob)}
              helperText={errors.dob}
              onChange={(e) => handleInputChange('dob', e.target.value)}
              onBlur={() => handleInputBlur('dob')}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconCalendar size={18} stroke={1.8} style={{ color: '#64748B' }} />
                  </InputAdornment>
                )
              }}
              sx={inputSx(Boolean(errors.dob))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>EMPLOYEE ID {mode === 'edit' ? '(NON-EDITABLE)' : ''}</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Leave blank to auto-generate (e.g. PMCH0107)"
              value={formData.employeeId}
              disabled={mode === 'edit'}
              onChange={(e) => handleInputChange('employeeId', e.target.value)}
              sx={inputSx()}
            />
          </Grid>

          {/* Row 2 */}
          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              GENDER <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <Select
              fullWidth
              size="small"
              displayEmpty
              value={formData.gender || 'Gender'}
              error={Boolean(errors.gender)}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              onBlur={() => handleInputBlur('gender')}
              IconComponent={() => (
                <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
              )}
              sx={selectSx(Boolean(errors.gender))}
              renderValue={(selected) => {
                if (!selected || selected === 'Gender') {
                  return <span style={{ color: '#94A3B8' }}>Select Gender</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="Gender" disabled sx={{ color: '#94A3B8', fontSize: '13px' }}>
                Select Gender
              </MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            {errors.gender && <Typography sx={{ color: '#EF4444', fontSize: '11.5px', mt: '3px' }}>{errors.gender}</Typography>}
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              MOBILE <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="9876543210"
              value={formData.phone}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onBlur={() => handleInputBlur('phone')}
              inputProps={{ maxLength: 10 }}
              sx={inputSx(Boolean(errors.phone))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              EMAIL ADDRESS <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              type="email"
              size="small"
              placeholder="anjali.pillai@pmch.org"
              value={formData.email}
              error={Boolean(errors.email)}
              helperText={errors.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleInputBlur('email')}
              sx={inputSx(Boolean(errors.email))}
            />
          </Grid>

          {/* Row 3 */}
          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              {'FATHER / MOTHER / SPOUSE NAME'} <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="R. Krishnan"
              value={formData.fatherName}
              error={Boolean(errors.fatherName)}
              helperText={errors.fatherName}
              onChange={(e) => handleInputChange('fatherName', e.target.value)}
              onBlur={() => handleInputBlur('fatherName')}
              sx={inputSx(Boolean(errors.fatherName))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              EMERGENCY CONTACT NAME <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Saraswathi Krishnan"
              value={formData.emergencyContactName}
              error={Boolean(errors.emergencyContactName)}
              helperText={errors.emergencyContactName}
              onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              onBlur={() => handleInputBlur('emergencyContactName')}
              sx={inputSx(Boolean(errors.emergencyContactName))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>EMERGENCY CONTACT NUMBER</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="9876543211"
              value={formData.emergencyContactNumber}
              onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
              inputProps={{ maxLength: 10 }}
              sx={inputSx()}
            />
          </Grid>
        </Grid>

        {/* ================= SECTION 2: EMPLOYMENT DETAILS ================= */}
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#1E293B',
            mt: 4,
            mb: 2
          }}
        >
          Section 2 - Employment Details
        </Typography>

        <Grid container spacing={2.5}>
          {/* Row 1 */}
          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              DEPARTMENT <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <Select
              fullWidth
              size="small"
              displayEmpty
              value={formData.department || ''}
              error={Boolean(errors.department)}
              onChange={(e) => handleInputChange('department', e.target.value)}
              onBlur={() => handleInputBlur('department')}
              IconComponent={() => (
                <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
              )}
              sx={selectSx(Boolean(errors.department))}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#94A3B8' }}>Select Department</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="" disabled sx={{ color: '#94A3B8', fontSize: '13px' }}>
                Select Department
              </MenuItem>
              {allDepartmentOptions.map((dept) => {
                const val = typeof dept === 'string' ? dept : dept.name;
                return (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                );
              })}
            </Select>
            {errors.department && <Typography sx={{ color: '#EF4444', fontSize: '11.5px', mt: '3px' }}>{errors.department}</Typography>}
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              DESIGNATION <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <Select
              fullWidth
              size="small"
              displayEmpty
              value={formData.designation || ''}
              error={Boolean(errors.designation)}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              onBlur={() => handleInputBlur('designation')}
              IconComponent={() => (
                <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
              )}
              sx={selectSx(Boolean(errors.designation))}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#94A3B8' }}>Select Designation</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="" disabled sx={{ color: '#94A3B8', fontSize: '13px' }}>
                Select Designation
              </MenuItem>
              {allDesignationOptions.map((desig) => {
                const val = typeof desig === 'string' ? desig : desig.name;
                return (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                );
              })}
            </Select>
            {errors.designation && <Typography sx={{ color: '#EF4444', fontSize: '11.5px', mt: '3px' }}>{errors.designation}</Typography>}
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>SALARY GRADE {mode === 'edit' ? '(NON-EDITABLE)' : ''}</Typography>
            <Select
              fullWidth
              size="small"
              displayEmpty
              disabled={mode === 'edit'}
              value={formData.salaryGrade || ''}
              onChange={(e) => handleInputChange('salaryGrade', e.target.value)}
              IconComponent={() => (
                <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
              )}
              sx={selectSx()}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#94A3B8' }}>Select Salary Grade</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="" disabled sx={{ color: '#94A3B8', fontSize: '13px' }}>
                Select Salary Grade
              </MenuItem>
              {allSalaryGradeOptions.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  {grade}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Row 2 */}
          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>HOD ASSIGNED {mode === 'edit' ? '(NON-EDITABLE)' : ''}</Typography>
            <Select
              fullWidth
              size="small"
              displayEmpty
              disabled={mode === 'edit'}
              value={formData.hodAssigned || ''}
              onChange={(e) => handleInputChange('hodAssigned', e.target.value)}
              IconComponent={() => (
                <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
              )}
              sx={selectSx()}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#94A3B8' }}>Select HoD (Auto-defaults to Dept HOD)</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="" sx={{ color: '#94A3B8', fontSize: '13px' }}>
                Auto-defaults to Department HOD
              </MenuItem>
              {allHodOptions.map((hod) => {
                const val = typeof hod === 'string' ? hod : hod.name;
                return (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                );
              })}
            </Select>
          </Grid>
        </Grid>

        {/* ================= SECTION 3: BANK DETAILS ================= */}
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#1E293B',
            mt: 4,
            mb: 2
          }}
        >
          Section 3 - Bank Details
        </Typography>

        <Grid container spacing={2.5}>
          {/* Row 1 */}
          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              SALARY ACCOUNT BANK <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <Select
              fullWidth
              size="small"
              displayEmpty
              value={formData.bankName || ''}
              error={Boolean(errors.bankName)}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              onBlur={() => handleInputBlur('bankName')}
              IconComponent={() => (
                <IconChevronDown size={18} stroke={2} style={{ color: '#64748B', marginRight: 10, pointerEvents: 'none' }} />
              )}
              sx={selectSx(Boolean(errors.bankName))}
              renderValue={(selected) => {
                if (!selected) {
                  return <span style={{ color: '#94A3B8' }}>Select Bank</span>;
                }
                return selected;
              }}
            >
              <MenuItem value="" disabled sx={{ color: '#94A3B8', fontSize: '13px' }}>
                Select Bank
              </MenuItem>
              {allBankOptions.map((bank) => (
                <MenuItem key={bank} value={bank}>
                  {bank}
                </MenuItem>
              ))}
            </Select>
            {errors.bankName && <Typography sx={{ color: '#EF4444', fontSize: '11.5px', mt: '3px' }}>{errors.bankName}</Typography>}
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              ACCOUNT NUMBER <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="200133931116"
              value={formData.accountNumber}
              error={Boolean(errors.accountNumber)}
              helperText={errors.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              onBlur={() => handleInputBlur('accountNumber')}
              inputProps={{ maxLength: 18 }}
              sx={inputSx(Boolean(errors.accountNumber))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>PF NUMBER</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="PF-99210-CR"
              value={formData.pfNumber}
              onChange={(e) => handleInputChange('pfNumber', e.target.value)}
              sx={inputSx()}
            />
          </Grid>

          {/* Row 2 */}
          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              BRANCH / IFSC <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="SBIN0001423"
              value={formData.ifsc}
              error={Boolean(errors.ifsc)}
              helperText={errors.ifsc}
              onChange={(e) => handleInputChange('ifsc', e.target.value)}
              onBlur={() => handleInputBlur('ifsc')}
              inputProps={{ maxLength: 11, style: { textTransform: 'uppercase' } }}
              sx={inputSx(Boolean(errors.ifsc))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              PAN NUMBER <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="ABCDE1234F"
              value={formData.pan}
              error={Boolean(errors.pan)}
              helperText={errors.pan}
              onChange={(e) => handleInputChange('pan', e.target.value)}
              onBlur={() => handleInputBlur('pan')}
              inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }}
              sx={inputSx(Boolean(errors.pan))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              AADHAAR NUMBER <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="123456789012"
              value={formData.aadhaar}
              error={Boolean(errors.aadhaar)}
              helperText={errors.aadhaar}
              onChange={(e) => handleInputChange('aadhaar', e.target.value)}
              onBlur={() => handleInputBlur('aadhaar')}
              inputProps={{ maxLength: 12 }}
              sx={inputSx(Boolean(errors.aadhaar))}
            />
          </Grid>
        </Grid>

        {/* ================= SECTION 4: ADDRESS ================= */}
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#1E293B',
            mt: 4,
            mb: 2
          }}
        >
          Section 4 - Address
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>ALTERNATE PHONE</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="9447123456"
              value={formData.alternatePhone}
              onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
              inputProps={{ maxLength: 10 }}
              sx={inputSx()}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              ADDRESS <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Obl. No.1 Main Gate, PMCH Campus, Trivandrum"
              value={formData.address}
              error={Boolean(errors.address)}
              helperText={errors.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              onBlur={() => handleInputBlur('address')}
              sx={inputSx(Boolean(errors.address))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>
              PIN CODE <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="695011"
              value={formData.pinCode}
              error={Boolean(errors.pinCode)}
              helperText={errors.pinCode}
              onChange={(e) => handleInputChange('pinCode', e.target.value)}
              onBlur={() => handleInputBlur('pinCode')}
              inputProps={{ maxLength: 6 }}
              sx={inputSx(Boolean(errors.pinCode))}
            />
          </Grid>
        </Grid>

        {/* ================= SECTION 4 ACTION BUTTONS: SAVE DETAILS / CANCEL ================= */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 4,
            pt: 3,
            borderTop: '1px solid #E2E8F0'
          }}
        >
          {/* Cancel Button */}
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={saving || uploadingDocs}
            sx={{
              height: '38px',
              px: 2.5,
              borderColor: '#E2E8F0',
              borderRadius: '8px',
              color: '#475569',
              textTransform: 'none',
              fontSize: '13.5px',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#CBD5E1',
                boxShadow: 'none'
              }
            }}
          >
            Cancel
          </Button>

          {/* Save / Update Details Button */}
          <Button
            type="submit"
            variant="contained"
            disabled={saving || uploadingDocs}
            startIcon={saving ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : null}
            sx={{
              height: '38px',
              px: 3,
              bgcolor: '#644EE5',
              borderRadius: '8px',
              color: '#FFFFFF',
              textTransform: 'none',
              fontSize: '13.5px',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(100, 78, 229, 0.25)',
              '&:hover': {
                bgcolor: '#533DC7',
                boxShadow: '0 4px 10px rgba(100, 78, 229, 0.35)'
              }
            }}
          >
            {saving ? (mode === 'edit' ? 'Updating...' : 'Saving...') : mode === 'edit' ? 'Update Employee' : 'Save Details'}
          </Button>
        </Box>

        {/* ================= SECTION 5: DOCUMENTS UPLOAD (CREATE MODE ONLY) ================= */}
        {mode !== 'edit' && (
          <>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#1E293B',
                mt: 5,
                mb: 2
              }}
            >
              Section 5 - Documents Upload
            </Typography>

            <Grid container spacing={2.5}>
              {DOCUMENT_SLOTS.map((slot) => {
                const isUploaded = !!uploadedDocs[slot.key];
                const fileInfo = uploadedDocs[slot.key];

                return (
                  <Grid item xs={12} sm={6} md={4} key={slot.key}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        bgcolor: isUploaded ? '#F8FAFC' : '#FFFFFF',
                        transition: 'all 0.2s ease',
                        minHeight: '74px',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Left: Icon + Title & Subtitle */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '8px',
                            bgcolor: isUploaded ? '#DCFCE7' : '#F8FAFC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '1px solid',
                            borderColor: isUploaded ? '#86EFAC' : '#E2E8F0'
                          }}
                        >
                          {isUploaded ? (
                            <IconCheck size={18} stroke={2.5} style={{ color: '#16A34A' }} />
                          ) : (
                            <IconUpload size={18} stroke={1.8} style={{ color: '#64748B' }} />
                          )}
                        </Box>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            noWrap
                            sx={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#0F172A',
                              lineHeight: 1.3
                            }}
                          >
                            {slot.title}
                          </Typography>
                          <Typography
                            noWrap
                            sx={{
                              fontSize: '11px',
                              color: isUploaded ? '#16A34A' : '#64748B',
                              lineHeight: 1.3,
                              mt: 0.3
                            }}
                          >
                            {isUploaded ? `${fileInfo.name} (${fileInfo.size})` : slot.subtitle}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right: Upload / Remove Action */}
                      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, ml: 1 }}>
                        <input
                          type="file"
                          ref={(el) => (fileInputRefs.current[slot.key] = el)}
                          style={{ display: 'none' }}
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={(e) => handleFileUpload(slot.key, e)}
                        />

                        {isUploaded ? (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveDoc(slot.key)}
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: '6px',
                              color: '#EF4444',
                              bgcolor: '#FEE2E2',
                              '&:hover': { bgcolor: '#FCA5A5', color: '#B91C1C' }
                            }}
                          >
                            <IconX size={16} stroke={2} />
                          </IconButton>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => fileInputRefs.current[slot.key]?.click()}
                            sx={{
                              minWidth: '68px',
                              height: '32px',
                              fontSize: '12px',
                              fontWeight: 600,
                              textTransform: 'none',
                              color: '#644EE5',
                              borderColor: '#E2E8F0',
                              borderRadius: '6px',
                              px: 1.2,
                              '&:hover': {
                                borderColor: '#644EE5',
                                bgcolor: '#EEF2FF'
                              }
                            }}
                          >
                            Upload
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            {/* ================= SECTION 5 ACTION BUTTON: UPLOAD DOCUMENT ================= */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                mt: 4,
                pt: 3,
                borderTop: '1px solid #E2E8F0',
                gap: 2
              }}
            >
              <Button
                type="button"
                variant="contained"
                onClick={handleUploadDocuments}
                disabled={uploadingDocs || saving}
                startIcon={uploadingDocs ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : null}
                sx={{
                  height: '38px',
                  px: 3,
                  bgcolor: '#644EE5',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  boxShadow: '0 2px 6px rgba(100, 78, 229, 0.25)',
                  '&:hover': {
                    bgcolor: '#533DC7',
                    boxShadow: '0 4px 10px rgba(100, 78, 229, 0.35)'
                  }
                }}
              >
                {uploadingDocs ? 'Uploading...' : 'Upload Document'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

AddEditEmployee.propTypes = {
  initialData: PropTypes.object,
  mode: PropTypes.string,
  onSave: PropTypes.func,
  onCancel: PropTypes.func
};

export default AddEditEmployee;
