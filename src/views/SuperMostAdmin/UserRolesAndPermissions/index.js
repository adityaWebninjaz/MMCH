/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/label-has-associated-control */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import CustomSelect from 'ui-component/CustomSelect';
import { getDepartments } from 'views/SuperMostAdmin/HRMS/EmployeeMaster/Services/allEmployeeService';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  formatDate,
  formatRoleName,
  getApiErrorMessage
} from './Services/userRolesService';
import styles from './UserRolesAndPermissions.module.css';

const DEPARTMENT_OPTIONS = [
  { value: 'All Departments', label: 'All Departments' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'General Medicine', label: 'General Medicine' },
  { value: 'Accounts', label: 'Accounts' },
  { value: 'HR', label: 'HR' }
];

const MONTH_OPTIONS = [
  { value: 'January', label: 'January' },
  { value: 'February', label: 'February' },
  { value: 'March', label: 'March' },
  { value: 'April', label: 'April' },
  { value: 'May', label: 'May' },
  { value: 'June', label: 'June' },
  { value: 'July', label: 'July' },
  { value: 'August', label: 'August' },
  { value: 'September', label: 'September' },
  { value: 'October', label: 'October' },
  { value: 'November', label: 'November' },
  { value: 'December', label: 'December' }
];

const DEFAULT_MODULE_PERMISSIONS = [
  { id: 'dashboard', name: 'Dashboard', view: true, create: true, edit: true, delete: true },
  { id: 'emp_mgmt', name: 'Employee Management', view: true, create: true, edit: true, delete: true },
  { id: 'attendance', name: 'Attendance', view: true, create: false, edit: false, delete: false },
  { id: 'leave_mgmt', name: 'Leave Management', view: true, create: false, edit: false, delete: false },
  { id: 'att_reg', name: 'Attendance Regularisation', view: true, create: false, edit: false, delete: false },
  { id: 'ot_mgmt', name: 'Overtime Management', view: true, create: false, edit: false, delete: false },
  { id: 'compoff_mgmt', name: 'Comp-Off Management', view: true, create: false, edit: false, delete: false },
  { id: 'holiday_cal', name: 'Holiday Calendar', view: true, create: false, edit: false, delete: false },
  { id: 'deduction_ctrl', name: 'Deduction Control Center', view: true, create: false, edit: false, delete: false },
  { id: 'payroll_cycle', name: 'Payroll Cycle', view: true, create: true, edit: false, delete: true },
  { id: 'report_hub', name: 'Report Hub', view: true, create: true, edit: true, delete: true },
  { id: 'notifications', name: 'Notifications', view: true, create: true, edit: false, delete: false },
  { id: 'audit_logs', name: 'Audit Logs', view: true, create: true, edit: false, delete: true },
  { id: 'role_mgmt', name: 'Role Management', view: true, create: false, edit: true, delete: true },
  { id: 'system_settings', name: 'System Settings', view: true, create: false, edit: true, delete: true }
];

const INITIAL_ROLES = [
  {
    id: 'role_1',
    roleName: 'Super Admin',
    description: 'Full system access with all permissions',
    createdDate: '15 Jun 2026',
    numberOfUsers: 1,
    departmentScope: 'All Departments',
    isActive: true,
    permissions: DEFAULT_MODULE_PERMISSIONS.map((m) => ({
      ...m,
      view: true,
      create: true,
      edit: true,
      delete: true
    }))
  },
  {
    id: 'role_2',
    roleName: 'HR Admin',
    description: 'Full HR operations access',
    createdDate: '15 Jun 2026',
    numberOfUsers: 1,
    departmentScope: 'All Departments',
    isActive: true,
    permissions: DEFAULT_MODULE_PERMISSIONS
  },
  {
    id: 'role_3',
    roleName: 'Accounts Admin',
    description: 'Finance and payroll oversight',
    createdDate: '15 Jun 2026',
    numberOfUsers: 1,
    departmentScope: 'All Departments',
    isActive: true,
    permissions: DEFAULT_MODULE_PERMISSIONS
  },
  {
    id: 'role_4',
    roleName: 'HOD',
    description: 'Department head access',
    createdDate: '15 Jun 2026',
    numberOfUsers: 1,
    departmentScope: 'All Departments',
    isActive: true,
    permissions: DEFAULT_MODULE_PERMISSIONS
  },
  {
    id: 'role_5',
    roleName: 'Payroll Executive',
    description: 'Salary processing access',
    createdDate: '15 Jun 2026',
    numberOfUsers: 1,
    departmentScope: 'All Departments',
    isActive: true,
    permissions: DEFAULT_MODULE_PERMISSIONS
  },
  {
    id: 'role_6',
    roleName: 'Attendance Manager',
    description: 'Attendance module control',
    createdDate: '15 Jun 2026',
    numberOfUsers: 1,
    departmentScope: 'All Departments',
    isActive: true,
    permissions: DEFAULT_MODULE_PERMISSIONS
  },
  {
    id: 'role_7',
    roleName: 'Reports Viewer',
    description: 'Read-only report access',
    createdDate: '15 Jun 2026',
    numberOfUsers: 1,
    departmentScope: 'All Departments',
    isActive: true,
    permissions: DEFAULT_MODULE_PERMISSIONS.map((m) => ({
      ...m,
      view: true,
      create: false,
      edit: false,
      delete: false
    }))
  }
];

const INITIAL_USERS = [
  {
    id: 'user_1',
    userName: 'John Smith',
    email: 'Johnsmit@pmch.com',
    role: 'Super Admin',
    status: 'Active',
    createdDate: '2024-01-01',
    lastLogin: '2024-12-28 14:30:00',
    rolePermission: 'General administrative access'
  },
  {
    id: 'user_2',
    userName: 'Diana Miller',
    email: 'Dianamiller@dorm.com',
    role: 'Admin',
    status: 'Active',
    createdDate: '2024-03-10',
    lastLogin: '2024-12-27 10:15:00',
    rolePermission: 'General administrative access'
  },
  {
    id: 'user_3',
    userName: 'Alice Johnson',
    email: 'Alicejohnson@dorm.com',
    role: 'HOD',
    status: 'Inactive',
    createdDate: '2024-02-15',
    lastLogin: '2024-11-20 09:45:00',
    rolePermission: 'Department head access'
  },
  {
    id: 'user_4',
    userName: 'Charlie Brown',
    email: 'Charliebrown@dorm.com',
    role: 'Warden',
    status: 'Inactive',
    createdDate: '2024-05-30',
    lastLogin: '2024-12-01 16:20:00',
    rolePermission: 'Hostel and facility oversight'
  },
  {
    id: 'user_5',
    userName: 'Bob Williams',
    email: 'Bobwilliams@dorm.com',
    role: 'Admin 2',
    status: 'Active',
    createdDate: '2024-04-25',
    lastLogin: '2024-12-26 11:10:00',
    rolePermission: 'Secondary administrative management'
  }
];

const UserRolesAndPermissions = () => {
  // Tabs: 'roles_and_permission' | 'user_management'
  const [activeTab, setActiveTab] = useState('roles_and_permission');

  // Filter States for Roles & Permissions Tab
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [departmentsList, setDepartmentsList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('June');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch departments list from API on mount
  useEffect(() => {
    let isMounted = true;
    getDepartments()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const list = data.map((dept) => {
            if (typeof dept === 'string') return { value: dept, label: dept };
            const name = dept.name || dept.department_name || dept.title || dept.id;
            return { value: name, label: name };
          });
          setDepartmentsList(list);
        }
      })
      .catch((err) => {
        console.error('Failed to load departments in UserRolesAndPermissions:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamic department options with 'All Departments'
  const departmentOptions = useMemo(() => {
    if (departmentsList.length > 0) {
      return [{ value: 'All Departments', label: 'All Departments' }, ...departmentsList];
    }
    return DEPARTMENT_OPTIONS;
  }, [departmentsList]);

  // Search State for User Management Tab
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Table Data State
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [users, setUsers] = useState(INITIAL_USERS);

  // Fetch roles from GET /roles API on mount
  const fetchRolesData = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const res = await getRoles();
      const rawList = res?.data || (Array.isArray(res) ? res : []);

      if (rawList.length > 0) {
        const mappedRoles = rawList.map((item) => {
          const roleName = item.roleName || item.role_name || item.name || '';
          return {
            id: item.id || item._id,
            roleName,
            displayName: formatRoleName(roleName),
            description: item.description || item.desc || '-',
            createdDate: formatDate(item.createdAt || item.created_at || item.createdDate),
            numberOfUsers: item.numberOfUsers ?? item.user_count ?? item.users_count ?? item.numberOfUser ?? 0,
            departmentScope: item.departmentScope || item.department_scope || item.department || 'All Departments',
            isActive: (item.status || (item.isActive !== undefined ? (item.isActive ? 'active' : 'inactive') : 'active')).toLowerCase() === 'active',
            rawStatus: item.status || 'active',
            permissions:
              item.permissions ||
              DEFAULT_MODULE_PERMISSIONS.map((m) => ({
                ...m,
                view: true,
                create: roleName.toLowerCase().includes('admin') || roleName.toLowerCase().includes('super'),
                edit: roleName.toLowerCase().includes('admin') || roleName.toLowerCase().includes('super'),
                delete: roleName.toLowerCase().includes('super')
              }))
          };
        });
        setRoles(mappedRoles);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to fetch roles from server'));
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  useEffect(() => {
    fetchRolesData();
  }, [fetchRolesData]);

  // Modal States for Roles
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('edit'); // 'view' | 'edit'
  const [currentRoleData, setCurrentRoleData] = useState(null);

  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    roleName: '',
    description: '',
    departmentScope: '',
    cloneRoleId: ''
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Modal States for User Management
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    role: ''
  });

  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    fullName: '',
    email: '',
    role: ''
  });

  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [changePasswordUser, setChangePasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const name = (r.displayName || r.roleName || '').toLowerCase();
      const rawName = (r.roleName || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      const q = searchQuery.trim().toLowerCase();

      const matchesSearch = !q || name.includes(q) || rawName.includes(q) || desc.includes(q);
      const matchesDept = selectedDepartment === 'All Departments' || r.departmentScope === selectedDepartment;
      return matchesSearch && matchesDept;
    });
  }, [roles, searchQuery, selectedDepartment]);

  // Filtered Users for User Management Tab
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users;
    const q = userSearchQuery.toLowerCase();
    return users.filter(
      (u) => u.userName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    );
  }, [users, userSearchQuery]);

  // Role options for Assign Roles dropdown
  const userAssignRoleOptions = useMemo(() => {
    const list = [{ value: '', label: 'Select Roles' }];
    roles.forEach((r) => {
      const val = r.displayName || r.roleName;
      list.push({ value: val, label: val });
    });
    return list;
  }, [roles]);

  // Clone options for Add Role modal
  const cloneRoleOptions = useMemo(() => {
    return [
      { value: '', label: 'Select role to clone permissions from' },
      ...roles.map((r) => ({ value: r.id, label: r.displayName || r.roleName }))
    ];
  }, [roles]);

  const addRoleDepartmentOptions = useMemo(() => {
    return [{ value: '', label: 'Select department scope' }, ...departmentOptions];
  }, [departmentOptions]);

  // ================= HANDLERS: ROLES & PERMISSIONS =================
  const handleOpenViewModal = (role) => {
    setModalMode('view');
    setCurrentRoleData(JSON.parse(JSON.stringify(role)));
    setIsPermissionsModalOpen(true);
  };

  const handleOpenEditModal = (role) => {
    setModalMode('edit');
    setCurrentRoleData(JSON.parse(JSON.stringify(role)));
    setIsPermissionsModalOpen(true);
  };

  const handleClosePermissionsModal = () => {
    setIsPermissionsModalOpen(false);
    setCurrentRoleData(null);
  };

  const handleToggleModulePermission = (moduleId, field) => {
    if (modalMode === 'view') return;
    setCurrentRoleData((prev) => ({
      ...prev,
      permissions: prev.permissions.map((p) => (p.id === moduleId ? { ...p, [field]: !p[field] } : p))
    }));
  };

  const handleSavePermissions = async () => {
    if (!currentRoleData.roleName.trim()) {
      toast.error('Role name cannot be empty.');
      return;
    }

    try {
      if (currentRoleData.id && !String(currentRoleData.id).startsWith('role_')) {
        await updateRole(currentRoleData.id, currentRoleData);
      }
      setRoles((prev) => prev.map((r) => (r.id === currentRoleData.id ? currentRoleData : r)));
      toast.success('Permissions updated successfully!');
      setIsPermissionsModalOpen(false);
      setCurrentRoleData(null);
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, 'Failed to update role permissions.');
      console.error('Error updating role:', err);
      toast.error(errorMsg);
    }
  };

  const handleOpenAddRoleModal = () => {
    setNewRoleForm({
      roleName: '',
      description: '',
      departmentScope: '',
      cloneRoleId: ''
    });
    setIsAddRoleModalOpen(true);
  };

  const handleCloseAddRoleModal = () => {
    setIsAddRoleModalOpen(false);
    setNewRoleForm({
      roleName: '',
      description: '',
      departmentScope: '',
      cloneRoleId: ''
    });
  };

  const handleCreateRole = async () => {
    if (!newRoleForm.roleName.trim()) {
      toast.error('Please enter a role name.');
      return;
    }

    let permissionsToAssign = DEFAULT_MODULE_PERMISSIONS;
    if (newRoleForm.cloneRoleId) {
      const clonedRole = roles.find((r) => r.id === newRoleForm.cloneRoleId);
      if (clonedRole && clonedRole.permissions) {
        permissionsToAssign = clonedRole.permissions;
      }
    }

    const payload = {
      roleName: newRoleForm.roleName.trim(),
      description: newRoleForm.description.trim() || 'Role responsibilities defined',
      departmentScope: newRoleForm.departmentScope || 'All Departments',
      permissions: permissionsToAssign
    };

    try {
      const response = await createRole(payload);
      const createdItem = response?.data || response;
      const newRole = {
        id: createdItem?.id || createdItem?._id || `role_${Date.now()}`,
        roleName: createdItem?.roleName || payload.roleName,
        displayName: formatRoleName(createdItem?.roleName || payload.roleName),
        description: createdItem?.description || payload.description,
        createdDate: formatDate(createdItem?.createdAt || new Date()),
        numberOfUsers: createdItem?.numberOfUsers || 0,
        departmentScope: createdItem?.departmentScope || payload.departmentScope,
        isActive: true,
        permissions: createdItem?.permissions || permissionsToAssign
      };

      setRoles((prev) => [...prev, newRole]);
      toast.success(`Role '${newRole.roleName}' created successfully!`);
      setIsAddRoleModalOpen(false);
      setNewRoleForm({
        roleName: '',
        description: '',
        departmentScope: '',
        cloneRoleId: ''
      });
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, 'Failed to create role.');
      console.error('Error creating role:', err);
      toast.error(errorMsg);
    }
  };

  const handleOpenDeleteModal = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  const handleConfirmDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      if (roleToDelete.id && !String(roleToDelete.id).startsWith('role_')) {
        await deleteRole(roleToDelete.id);
      }
      setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
      toast.success(`Role '${roleToDelete.roleName}' deleted successfully!`);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, 'Failed to delete role.');
      console.error('Error deleting role:', err);
      toast.error(errorMsg);
    }
  };

  // ================= HANDLERS: USER MANAGEMENT =================

  // 1. Create User
  const handleOpenCreateUserModal = () => {
    setNewUserForm({
      fullName: '',
      email: '',
      role: ''
    });
    setIsCreateUserModalOpen(true);
  };

  const handleCloseCreateUserModal = () => {
    setIsCreateUserModalOpen(false);
    setNewUserForm({
      fullName: '',
      email: '',
      role: ''
    });
  };

  const handleCreateUser = () => {
    if (!newUserForm.fullName.trim()) {
      toast.error('Please enter Full Name.');
      return;
    }
    if (!newUserForm.email.trim()) {
      toast.error('Please enter Email Address.');
      return;
    }
    if (!newUserForm.role) {
      toast.error('Please select a Role.');
      return;
    }

    const newUser = {
      id: `user_${Date.now()}`,
      userName: newUserForm.fullName.trim(),
      email: newUserForm.email.trim(),
      role: newUserForm.role,
      status: 'Active',
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never logged in',
      rolePermission: 'General administrative access'
    };

    setUsers((prev) => [newUser, ...prev]);
    toast.success(`User '${newUser.userName}' created successfully!`);
    setIsCreateUserModalOpen(false);
    setNewUserForm({ fullName: '', email: '', role: '' });
  };

  // 2. View User Details
  const handleOpenViewUserModal = (user) => {
    setSelectedUser(user);
    setIsViewUserModalOpen(true);
  };

  const handleCloseViewUserModal = () => {
    setIsViewUserModalOpen(false);
    setSelectedUser(null);
  };

  // Transition from View Details to Edit Details Modal
  const handleTransitionViewToEdit = () => {
    if (!selectedUser) return;
    setEditUserForm({
      fullName: selectedUser.userName,
      email: selectedUser.email,
      role: selectedUser.role
    });
    setIsViewUserModalOpen(false);
    setIsEditUserModalOpen(true);
  };

  // 3. Edit User Details
  const handleOpenEditUserModal = (user) => {
    setSelectedUser(user);
    setEditUserForm({
      fullName: user.userName,
      email: user.email,
      role: user.role
    });
    setIsEditUserModalOpen(true);
  };

  const handleCloseEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setSelectedUser(null);
    setEditUserForm({ fullName: '', email: '', role: '' });
  };

  const handleUpdateUser = () => {
    if (!editUserForm.fullName.trim()) {
      toast.error('Full Name cannot be empty.');
      return;
    }
    if (!editUserForm.email.trim()) {
      toast.error('Email cannot be empty.');
      return;
    }
    if (!editUserForm.role) {
      toast.error('Please select a Role.');
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              userName: editUserForm.fullName.trim(),
              email: editUserForm.email.trim(),
              role: editUserForm.role
            }
          : u
      )
    );

    toast.success(`User '${editUserForm.fullName}' updated successfully!`);
    setIsEditUserModalOpen(false);
    setSelectedUser(null);
    setEditUserForm({ fullName: '', email: '', role: '' });
  };

  // 4. Delete User
  const handleOpenDeleteUserModal = (user) => {
    setUserToDelete(user);
    setIsDeleteUserModalOpen(true);
  };

  const handleCloseDeleteUserModal = () => {
    setIsDeleteUserModalOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    toast.success(`User '${userToDelete.userName}' deleted successfully!`);
    setIsDeleteUserModalOpen(false);
    setUserToDelete(null);
  };

  // 5. Change Password (Lock Icon)
  const handleOpenChangePasswordModal = (user) => {
    setChangePasswordUser(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    setChangePasswordUser(null);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
  };

  const handleChangePasswordSubmit = () => {
    if (!passwordForm.newPassword.trim()) {
      toast.error('Please enter a new password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    toast.success(`Password changed successfully for ${changePasswordUser?.userName || 'user'}!`);
    setIsChangePasswordModalOpen(false);
    setChangePasswordUser(null);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
  };

  return (
    <div className={styles.container}>
      {/* Title */}
      <h1 className={styles.pageTitle}>User Roles & Permissions</h1>

      {/* Tabs */}
      <div className={styles.tabsBar}>
        <button
          type="button"
          className={`${styles.tabItem} ${activeTab === 'roles_and_permission' ? styles.tabItemActive : ''}`}
          onClick={() => setActiveTab('roles_and_permission')}
        >
          <span>Roles and Permissions</span>
          <span className={styles.tabBadge}>{roles.length}</span>
        </button>
        <button
          type="button"
          className={`${styles.tabItem} ${activeTab === 'user_management' ? styles.tabItemActive : ''}`}
          onClick={() => setActiveTab('user_management')}
        >
          <span>User Management</span>
          <span className={styles.tabBadge}>{users.length}</span>
        </button>
      </div>

      {/* ================= VIEW 1: ROLES AND PERMISSIONS TAB ================= */}
      {activeTab === 'roles_and_permission' && (
        <>
          {/* Filter Row & Action */}
          <div className={styles.filterRow}>
            <div className={styles.filterControls}>
              {/* Department */}
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Department</span>
                <CustomSelect
                  options={departmentOptions}
                  value={selectedDepartment}
                  onChange={(val) => setSelectedDepartment(val)}
                  width="180px"
                />
              </div>

              {/* Month */}
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Month</span>
                <CustomSelect options={MONTH_OPTIONS} value={selectedMonth} onChange={(val) => setSelectedMonth(val)} width="150px" />
              </div>

              {/* Employee Search */}
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Employee Search</span>
                <div className={styles.searchInputWrapper}>
                  <span className={styles.searchIcon}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by ID or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* + Add Role Button */}
            <div>
              <button type="button" className={styles.addRoleBtn} onClick={handleOpenAddRoleModal}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Role</span>
              </button>
            </div>
          </div>

          {/* Roles Table */}
          <div className={styles.tableContainer}>
            <table className={styles.rolesTable}>
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Created Date</th>
                  <th>Number of User</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingRoles ? (
                  <tr>
                    <td colSpan="5" className={styles.loadingCell}>
                      <CircularProgress size={24} sx={{ color: '#644EE5' }} />
                    </td>
                  </tr>
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={styles.noDataCell}>
                      No roles found
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role) => (
                    <tr key={role.id}>
                      <td className={styles.roleNameCell}>{role.displayName || role.roleName}</td>
                      <td className={styles.roleDescCell}>{role.description}</td>
                      <td>{role.createdDate}</td>
                      <td>{role.numberOfUsers}</td>
                      <td>
                        <div className={styles.actionsCell}>
                          {/* View Action (Eye) */}
                          <button
                            type="button"
                            className={styles.actionBtn}
                            title="View Permissions"
                            onClick={() => handleOpenViewModal(role)}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1E293B"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M2.5 12c0-3.8 4.2-6.5 9.5-6.5s9.5 2.7 9.5 6.5-4.2 6.5-9.5 6.5-9.5-2.7-9.5-6.5z" />
                              <circle cx="12" cy="12" r="2.8" />
                            </svg>
                          </button>

                          {/* Delete Action (Trash) */}
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            title="Delete Role"
                            onClick={() => handleOpenDeleteModal(role)}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1E293B"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 5V3.8a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2V5" />
                              <line x1="4" y1="5" x2="20" y2="5" />
                              <path d="M6 5l.8 13.5a2 2 0 0 0 2 1.8h6.4a2 2 0 0 0 2-1.8L18 5" />
                              <line x1="10" y1="9" x2="10" y2="15.5" />
                              <line x1="14" y1="9" x2="14" y2="15.5" />
                            </svg>
                          </button>

                          {/* Edit Action (Pencil) */}
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                            title="Edit Permissions"
                            onClick={() => handleOpenEditModal(role)}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1E293B"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M16 4.2a1.5 1.5 0 0 1 2.1 2.1L8.5 15.8l-3.5 1 1-3.5L16 4.2z" />
                              <path d="M14.2 6l2.1 2.1" />
                              <line x1="4.5" y1="20" x2="19.5" y2="20" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ================= VIEW 2: USER MANAGEMENT TAB ================= */}
      {activeTab === 'user_management' && (
        <>
          {/* User Management Top Bar (Screenshot 1) */}
          <div className={styles.userFilterRow}>
            {/* Search User Input */}
            <div className={styles.userSearchInputWrapper}>
              <input
                type="text"
                className={styles.userSearchInput}
                placeholder="Search user"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>

            {/* + Create User Button */}
            <div>
              <button type="button" className={styles.createUserBtn} onClick={handleOpenCreateUserModal}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Create User</span>
              </button>
            </div>
          </div>

          {/* User Management Table */}
          <div className={styles.tableContainer}>
            <table className={styles.rolesTable}>
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.userName}</td>
                    <td>{user.email}</td>
                    <td className={styles.userRoleText}>{user.role}</td>
                    <td className={styles.userStatusText}>{user.status}</td>
                    <td>{user.createdDate}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        {/* 1. View Action (Eye) - Opens Screenshot 3 Modal */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          title="View Details"
                          onClick={() => handleOpenViewUserModal(user)}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1E293B"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2.5 12c0-3.8 4.2-6.5 9.5-6.5s9.5 2.7 9.5 6.5-4.2 6.5-9.5 6.5-9.5-2.7-9.5-6.5z" />
                            <circle cx="12" cy="12" r="2.8" />
                          </svg>
                        </button>

                        {/* 2. Delete Action (Trash) - Opens Screenshot 5 Modal */}
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                          title="Delete User"
                          onClick={() => handleOpenDeleteUserModal(user)}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1E293B"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 5V3.8a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2V5" />
                            <line x1="4" y1="5" x2="20" y2="5" />
                            <path d="M6 5l.8 13.5a2 2 0 0 0 2 1.8h6.4a2 2 0 0 0 2-1.8L18 5" />
                            <line x1="10" y1="9" x2="10" y2="15.5" />
                            <line x1="14" y1="9" x2="14" y2="15.5" />
                          </svg>
                        </button>

                        {/* 3. Edit Action (Pencil) - Opens Screenshot 4 Modal */}
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                          title="Edit User"
                          onClick={() => handleOpenEditUserModal(user)}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1E293B"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 4.2a1.5 1.5 0 0 1 2.1 2.1L8.5 15.8l-3.5 1 1-3.5L16 4.2z" />
                            <path d="M14.2 6l2.1 2.1" />
                            <line x1="4.5" y1="20" x2="19.5" y2="20" />
                          </svg>
                        </button>

                        {/* 4. Change Password (Lock Icon) - Opens Change Password Modal */}
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnLock}`}
                          title="Change Password"
                          onClick={() => handleOpenChangePasswordModal(user)}
                        >
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1E293B"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination Footer */}
      <div className={styles.paginationRow}>
        <span className={styles.showingText}>Showing 1-10 of 20</span>

        <div className={styles.paginationControls}>
          <div className={styles.rowsPerPage}>
            <span>Rows per page</span>
            <select className={styles.rowsSelect} value={10} disabled>
              <option value={10}>10</option>
            </select>
          </div>

          <span className={styles.pageIndicator}>Page 1 of 10</span>

          <div className={styles.pageNavBtns}>
            <button type="button" className={styles.navBtn} disabled>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
            <button type="button" className={styles.navBtn} disabled>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button type="button" className={styles.navBtn}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button type="button" className={styles.navBtn}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ================= ROLES & PERMISSIONS MODALS ================= */}

      {/* 1. Edit / View Permissions Modal */}
      {isPermissionsModalOpen && currentRoleData && (
        <div className={styles.modalOverlay} onClick={handleClosePermissionsModal}>
          <div className={styles.permissionsModalCard} onClick={(e) => e.stopPropagation()} role="document">
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Permissions</h3>
              <button type="button" className={styles.closeModalBtn} onClick={handleClosePermissionsModal}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBodyScrollable}>
              {/* Form Info */}
              <div className={styles.roleFormGrid}>
                {/* Role Name */}
                <div className={styles.formField}>
                  <span className={styles.formLabel}>Role Name</span>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={currentRoleData.roleName}
                    readOnly={modalMode === 'view'}
                    onChange={(e) =>
                      setCurrentRoleData({
                        ...currentRoleData,
                        roleName: e.target.value
                      })
                    }
                  />
                </div>

                {/* Department Scope */}
                <div className={styles.formField}>
                  <span className={styles.formLabel}>Department Scope</span>
                  <CustomSelect
                    options={departmentOptions}
                    value={currentRoleData.departmentScope || 'All Departments'}
                    onChange={(val) => {
                      if (modalMode === 'view') return;
                      setCurrentRoleData({
                        ...currentRoleData,
                        departmentScope: val
                      });
                    }}
                    disabled={modalMode === 'view'}
                    width="100%"
                  />
                </div>

                {/* Description & Status */}
                <div className={styles.formFieldFull}>
                  <div className={styles.formField} style={{ flex: 1 }}>
                    <span className={styles.formLabel}>Description</span>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={currentRoleData.description}
                      readOnly={modalMode === 'view'}
                      onChange={(e) =>
                        setCurrentRoleData({
                          ...currentRoleData,
                          description: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className={styles.statusWrapper}>
                    <span className={styles.formLabel}>Status</span>
                    <div className={styles.statusToggleRow}>
                      <label className={styles.toggleSwitch}>
                        <input
                          type="checkbox"
                          checked={currentRoleData.isActive}
                          onChange={(e) => {
                            if (modalMode === 'view') return;
                            setCurrentRoleData({
                              ...currentRoleData,
                              isActive: e.target.checked
                            });
                          }}
                        />
                        <span className={styles.slider} />
                      </label>
                      <span className={styles.statusLabelText}>{currentRoleData.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Permissions */}
              <div className={styles.modulePermissionsSection}>
                <h4 className={styles.sectionHeading}>Module Permissions</h4>
                <table className={styles.permissionsTable}>
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>View</th>
                      <th>Create</th>
                      <th>Edit</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRoleData.permissions.map((module) => (
                      <tr key={module.id}>
                        <td>{module.name}</td>

                        {/* View Toggle */}
                        <td>
                          <label className={styles.toggleSwitch}>
                            <input type="checkbox" checked={module.view} onChange={() => handleToggleModulePermission(module.id, 'view')} />
                            <span className={styles.slider} />
                          </label>
                        </td>

                        {/* Create Toggle */}
                        <td>
                          <label className={styles.toggleSwitch}>
                            <input
                              type="checkbox"
                              checked={module.create}
                              onChange={() => handleToggleModulePermission(module.id, 'create')}
                            />
                            <span className={styles.slider} />
                          </label>
                        </td>

                        {/* Edit Toggle */}
                        <td>
                          <label className={styles.toggleSwitch}>
                            <input type="checkbox" checked={module.edit} onChange={() => handleToggleModulePermission(module.id, 'edit')} />
                            <span className={styles.slider} />
                          </label>
                        </td>

                        {/* Delete Toggle */}
                        <td>
                          <label className={styles.toggleSwitch}>
                            <input
                              type="checkbox"
                              checked={module.delete}
                              onChange={() => handleToggleModulePermission(module.id, 'delete')}
                            />
                            <span className={styles.slider} />
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer (Hidden in View Mode) */}
            {modalMode === 'edit' && (
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelModalBtn} onClick={handleClosePermissionsModal}>
                  Cancel
                </button>
                <button type="button" className={styles.saveModalBtn} onClick={handleSavePermissions}>
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Add New Role Modal */}
      {isAddRoleModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseAddRoleModal}>
          <div className={styles.addRoleModalCard} onClick={(e) => e.stopPropagation()} role="document">
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add New Role</h3>
              <button type="button" className={styles.closeModalBtn} onClick={handleCloseAddRoleModal}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.addRoleBody}>
              {/* Role Name */}
              <div className={styles.formField}>
                <span className={styles.formLabel}>Role Name</span>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter role name"
                  value={newRoleForm.roleName}
                  onChange={(e) =>
                    setNewRoleForm({
                      ...newRoleForm,
                      roleName: e.target.value
                    })
                  }
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className={styles.formField}>
                <span className={styles.formLabel}>Description</span>
                <textarea
                  className={styles.formTextarea}
                  placeholder="Describe role responsibilities"
                  value={newRoleForm.description}
                  onChange={(e) =>
                    setNewRoleForm({
                      ...newRoleForm,
                      description: e.target.value
                    })
                  }
                  rows={3}
                />
              </div>

              {/* Department Scope */}
              <div className={styles.formField}>
                <span className={styles.formLabel}>Department Scope</span>
                <CustomSelect
                  options={addRoleDepartmentOptions}
                  value={newRoleForm.departmentScope}
                  onChange={(val) =>
                    setNewRoleForm({
                      ...newRoleForm,
                      departmentScope: val
                    })
                  }
                  placeholder="Select department scope"
                  menuClassName={styles.addRoleDropdownMenu}
                  width="100%"
                />
              </div>

              {/* Clone Existing Role (Optional) */}
              <div className={styles.formField}>
                <span className={styles.formLabel}>Clone Existing Role (Optional)</span>
                <CustomSelect
                  options={cloneRoleOptions}
                  value={newRoleForm.cloneRoleId}
                  onChange={(val) =>
                    setNewRoleForm({
                      ...newRoleForm,
                      cloneRoleId: val
                    })
                  }
                  placeholder="Select role to clone permissions from"
                  menuClassName={styles.addRoleDropdownMenu}
                  width="100%"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelModalBtn} onClick={handleCloseAddRoleModal}>
                Cancel
              </button>
              <button type="button" className={styles.saveModalBtn} onClick={handleCreateRole}>
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Role Confirmation Modal */}
      {isDeleteModalOpen && roleToDelete && (
        <div className={styles.modalOverlay} onClick={handleCloseDeleteModal}>
          <div className={styles.deleteModalCard} onClick={(e) => e.stopPropagation()} role="document">
            <div className={styles.deleteIconCircle}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3 className={styles.deleteModalTitle}>Delete Role</h3>
            <p className={styles.deleteModalText}>
              Are you sure you want to delete the role &apos;<strong>{roleToDelete.roleName}</strong>&apos;? This action cannot be undone.
            </p>

            <div className={styles.deleteModalActions}>
              <button type="button" className={styles.deleteCancelBtn} onClick={handleCloseDeleteModal}>
                Cancel
              </button>
              <button type="button" className={styles.deleteConfirmBtn} onClick={handleConfirmDeleteRole}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= USER MANAGEMENT MODALS ================= */}

      {/* 1. Create New User Modal (Screenshot 2) */}
      {isCreateUserModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseCreateUserModal}>
          <div className={styles.userModalCard} onClick={(e) => e.stopPropagation()} role="document">
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Create New User</h3>
              <button type="button" className={styles.closeModalBtn} onClick={handleCloseCreateUserModal}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.userModalBody}>
              {/* Full Name & Email Row */}
              <div className={styles.userFormGrid}>
                <div className={styles.formField}>
                  <span className={styles.formLabel}>Full Name</span>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter Full Name"
                    value={newUserForm.fullName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className={styles.formField}>
                  <span className={styles.formLabel}>Email</span>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder="Enter Email Address"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Assign Roles Dropdown */}
              <div className={styles.formField}>
                <span className={styles.formLabel}>Assign Roles</span>
                <CustomSelect
                  options={userAssignRoleOptions}
                  value={newUserForm.role}
                  onChange={(val) => setNewUserForm({ ...newUserForm, role: val })}
                  placeholder="Select Roles"
                  className={styles.createUserRoleSelectWrapper}
                  buttonClassName={styles.createUserRoleSelectButton}
                  menuClassName={styles.createUserRoleDropdownMenu}
                  width="100%"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelModalBtn} onClick={handleCloseCreateUserModal}>
                Cancel
              </button>
              <button type="button" className={styles.saveModalBtn} onClick={handleCreateUser}>
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. View User Details Modal (Screenshot 3) */}
      {isViewUserModalOpen && selectedUser && (
        <div className={styles.modalOverlay} onClick={handleCloseViewUserModal}>
          <div className={styles.userModalCard} onClick={(e) => e.stopPropagation()} role="document">
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>User Details</h3>
              <button type="button" className={styles.closeModalBtn} onClick={handleCloseViewUserModal}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.userModalBody}>
              <div className={styles.userDetailsViewGrid}>
                {/* Row 1: Full Name & Email */}
                <div className={styles.detailsRow2Col}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailItemLabel}>Full Name</span>
                    <span className={styles.detailItemValue}>{selectedUser.userName}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailItemLabel}>Email</span>
                    <span className={styles.detailItemValue}>{selectedUser.email}</span>
                  </div>
                </div>

                {/* Row 2: Role & Last Login */}
                <div className={styles.detailsRow2Col}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailItemLabel}>Role</span>
                    <span className={styles.detailItemValueRole}>{selectedUser.role}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailItemLabel}>Last login</span>
                    <span className={styles.detailItemValue}>{selectedUser.lastLogin}</span>
                  </div>
                </div>

                {/* Row 3: Role Permission */}
                <div className={styles.detailItem}>
                  <span className={styles.detailItemLabel}>Role Permission</span>
                  <span className={styles.detailItemValue}>{selectedUser.rolePermission}</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelModalBtn} onClick={handleCloseViewUserModal}>
                Cancel
              </button>
              <button type="button" className={styles.saveModalBtn} onClick={handleTransitionViewToEdit}>
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Edit User Details Modal (Screenshot 4) */}
      {isEditUserModalOpen && selectedUser && (
        <div className={styles.modalOverlay} onClick={handleCloseEditUserModal}>
          <div className={styles.userModalCard} onClick={(e) => e.stopPropagation()} role="document">
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit User Details</h3>
              <button type="button" className={styles.closeModalBtn} onClick={handleCloseEditUserModal}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.userModalBody}>
              {/* Full Name & Email Row */}
              <div className={styles.userFormGrid}>
                <div className={styles.formField}>
                  <span className={styles.formLabel}>Full Name</span>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={editUserForm.fullName}
                    onChange={(e) => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className={styles.formField}>
                  <span className={styles.formLabel}>Email</span>
                  <input
                    type="email"
                    className={styles.formInput}
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Role Dropdown */}
              <div className={styles.formField}>
                <span className={styles.formLabel}>Role</span>
                <CustomSelect
                  options={userAssignRoleOptions}
                  value={editUserForm.role}
                  onChange={(val) => setEditUserForm({ ...editUserForm, role: val })}
                  placeholder="Select Role"
                  className={styles.editUserRoleSelectWrapper}
                  buttonClassName={styles.editUserRoleSelectButton}
                  menuClassName={styles.editUserRoleDropdownMenu}
                  width="100%"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelModalBtn} onClick={handleCloseEditUserModal}>
                Cancel
              </button>
              <button type="button" className={styles.saveModalBtn} onClick={handleUpdateUser}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete User Confirmation Modal (Screenshot 5) */}
      {isDeleteUserModalOpen && userToDelete && (
        <div className={styles.modalOverlay} onClick={handleCloseDeleteUserModal}>
          <div className={styles.deleteUserModalCard} onClick={(e) => e.stopPropagation()} role="document">
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Delete User</h3>
              <button type="button" className={styles.closeModalBtn} onClick={handleCloseDeleteUserModal}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.deleteUserModalBody}>
              <h4 className={styles.deleteUserHeading}>Are you sure you want to delete &quot;{userToDelete.userName}&quot;?</h4>
              <p className={styles.deleteUserSubtext}>This action cannot be undone and will permanently remove the user account.</p>
            </div>

            <div className={styles.deleteUserFooter}>
              <button type="button" className={styles.cancelModalBtn} onClick={handleCloseDeleteUserModal}>
                Cancel
              </button>
              <button type="button" className={styles.deleteUserBtn} onClick={handleConfirmDeleteUser}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Change Password Modal (Screenshot 6) */}
      {isChangePasswordModalOpen && changePasswordUser && (
        <div className={styles.modalOverlay} onClick={handleCloseChangePasswordModal}>
          <div className={styles.userModalCard} onClick={(e) => e.stopPropagation()} role="document">
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Change Password</h3>
              <button type="button" className={styles.closeModalBtn} onClick={handleCloseChangePasswordModal}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.userModalBody}>
              {/* Enter New Password */}
              <div className={styles.formField}>
                <span className={styles.formLabel}>Enter New Password</span>
                <input
                  type="password"
                  className={styles.formInput}
                  placeholder="Enter New Password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  autoFocus
                />
              </div>

              {/* Confirm New Password */}
              <div className={styles.formField}>
                <span className={styles.formLabel}>Confirm New Password</span>
                <input
                  type="password"
                  className={styles.formInput}
                  placeholder="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelModalBtn} onClick={handleCloseChangePasswordModal}>
                Cancel
              </button>
              <button type="button" className={styles.saveModalBtn} onClick={handleChangePasswordSubmit}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRolesAndPermissions;
