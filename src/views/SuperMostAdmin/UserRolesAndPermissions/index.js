/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/label-has-associated-control */
import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import CustomSelect from 'ui-component/CustomSelect';
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

const UserRolesAndPermissions = () => {
  // Tabs: 'roles_and_permission' | 'user_management'
  const [activeTab, setActiveTab] = useState('roles_and_permission');

  // Filter States
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedMonth, setSelectedMonth] = useState('June');
  const [searchQuery, setSearchQuery] = useState('');

  // Table Data State
  const [roles, setRoles] = useState(INITIAL_ROLES);

  // Modal States
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

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchesSearch =
        !searchQuery.trim() ||
        r.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        selectedDepartment === 'All Departments' ||
        r.departmentScope === selectedDepartment;
      return matchesSearch && matchesDept;
    });
  }, [roles, searchQuery, selectedDepartment]);

  // Clone options for Add Role modal
  const cloneRoleOptions = useMemo(() => {
    return [
      { value: '', label: 'Select role to clone permissions from' },
      ...roles.map((r) => ({ value: r.id, label: r.roleName }))
    ];
  }, [roles]);

  const addRoleDepartmentOptions = useMemo(() => {
    return [
      { value: '', label: 'Select department scope' },
      ...DEPARTMENT_OPTIONS
    ];
  }, []);

  // Handlers for View / Edit Permissions Modal
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
      permissions: prev.permissions.map((p) =>
        p.id === moduleId ? { ...p, [field]: !p[field] } : p
      )
    }));
  };

  const handleSavePermissions = () => {
    if (!currentRoleData.roleName.trim()) {
      toast.error('Role name cannot be empty.');
      return;
    }

    setRoles((prev) =>
      prev.map((r) => (r.id === currentRoleData.id ? currentRoleData : r))
    );
    toast.success('Permissions updated successfully!');
    setIsPermissionsModalOpen(false);
    setCurrentRoleData(null);
  };

  // Handlers for Add Role Modal
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

  const handleCreateRole = () => {
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

    const newRole = {
      id: `role_${Date.now()}`,
      roleName: newRoleForm.roleName.trim(),
      description: newRoleForm.description.trim() || 'Role responsibilities defined',
      createdDate: '15 Jun 2026',
      numberOfUsers: 0,
      departmentScope: newRoleForm.departmentScope || 'All Departments',
      isActive: true,
      permissions: permissionsToAssign
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
  };

  // Handlers for Delete Modal
  const handleOpenDeleteModal = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  const handleConfirmDeleteRole = () => {
    if (!roleToDelete) return;
    setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
    toast.success(`Role '${roleToDelete.roleName}' deleted successfully!`);
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  return (
    <div className={styles.container}>
      {/* Title */}
      <h1 className={styles.pageTitle}>User Roles & Permissions</h1>

      {/* Tabs */}
      <div className={styles.tabsBar}>
        <button
          type="button"
          className={`${styles.tabItem} ${
            activeTab === 'roles_and_permission' ? styles.tabItemActive : ''
          }`}
          onClick={() => setActiveTab('roles_and_permission')}
        >
          <span>Roles and Permission</span>
          <span className={styles.tabBadge}>{roles.length > 0 ? 3 : 0}</span>
        </button>
        <button
          type="button"
          className={`${styles.tabItem} ${
            activeTab === 'user_management' ? styles.tabItemActive : ''
          }`}
          onClick={() => {
            setActiveTab('user_management');
            toast.info('User Management tab selected');
          }}
        >
          <span>User Management</span>
          <span className={styles.tabBadge}>4</span>
        </button>
      </div>

      {/* Filter Row & Action */}
      <div className={styles.filterRow}>
        <div className={styles.filterControls}>
          {/* Department */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Department</span>
            <CustomSelect
              options={DEPARTMENT_OPTIONS}
              value={selectedDepartment}
              onChange={(val) => setSelectedDepartment(val)}
              width="180px"
            />
          </div>

          {/* Month */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Month</span>
            <CustomSelect
              options={MONTH_OPTIONS}
              value={selectedMonth}
              onChange={(val) => setSelectedMonth(val)}
              width="150px"
            />
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
          <button
            type="button"
            className={styles.addRoleBtn}
            onClick={handleOpenAddRoleModal}
          >
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

      {/* Main Table */}
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
            {filteredRoles.map((role) => (
              <tr key={role.id}>
                <td className={styles.roleNameCell}>{role.roleName}</td>
                <td>{role.description}</td>
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

                    {/* Edit Action (Pencil with Underline) */}
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
            ))}
          </tbody>
        </table>
      </div>

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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
            <button type="button" className={styles.navBtn} disabled>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button type="button" className={styles.navBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button type="button" className={styles.navBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Edit / View Permissions Modal (Screenshot 2) */}
      {isPermissionsModalOpen && currentRoleData && (
        <div className={styles.modalOverlay} onClick={handleClosePermissionsModal}>
          <div
            className={styles.permissionsModalCard}
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Permissions</h3>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={handleClosePermissionsModal}
              >
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
                    options={DEPARTMENT_OPTIONS}
                    value={currentRoleData.departmentScope || 'All Departments'}
                    onChange={(val) => {
                      if (modalMode === 'view') return;
                      setCurrentRoleData({
                        ...currentRoleData,
                        departmentScope: val
                      });
                    }}
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
                      <span className={styles.statusLabelText}>
                        {currentRoleData.isActive ? 'Active' : 'Inactive'}
                      </span>
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
                            <input
                              type="checkbox"
                              checked={module.view}
                              onChange={() =>
                                handleToggleModulePermission(module.id, 'view')
                              }
                            />
                            <span className={styles.slider} />
                          </label>
                        </td>

                        {/* Create Toggle */}
                        <td>
                          <label className={styles.toggleSwitch}>
                            <input
                              type="checkbox"
                              checked={module.create}
                              onChange={() =>
                                handleToggleModulePermission(module.id, 'create')
                              }
                            />
                            <span className={styles.slider} />
                          </label>
                        </td>

                        {/* Edit Toggle */}
                        <td>
                          <label className={styles.toggleSwitch}>
                            <input
                              type="checkbox"
                              checked={module.edit}
                              onChange={() =>
                                handleToggleModulePermission(module.id, 'edit')
                              }
                            />
                            <span className={styles.slider} />
                          </label>
                        </td>

                        {/* Delete Toggle */}
                        <td>
                          <label className={styles.toggleSwitch}>
                            <input
                              type="checkbox"
                              checked={module.delete}
                              onChange={() =>
                                handleToggleModulePermission(module.id, 'delete')
                              }
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
                <button
                  type="button"
                  className={styles.cancelModalBtn}
                  onClick={handleClosePermissionsModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.saveModalBtn}
                  onClick={handleSavePermissions}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Add New Role Modal (Screenshot 3) */}
      {isAddRoleModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseAddRoleModal}>
          <div
            className={styles.addRoleModalCard}
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add New Role</h3>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={handleCloseAddRoleModal}
              >
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
              <button
                type="button"
                className={styles.cancelModalBtn}
                onClick={handleCloseAddRoleModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.saveModalBtn}
                onClick={handleCreateRole}
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal (Screenshot 4) */}
      {isDeleteModalOpen && roleToDelete && (
        <div className={styles.modalOverlay} onClick={handleCloseDeleteModal}>
          <div
            className={styles.deleteModalCard}
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
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
              <button
                type="button"
                className={styles.deleteCancelBtn}
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={handleConfirmDeleteRole}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRolesAndPermissions;
