import React, { useState } from 'react';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import rajeshAvatar from 'assets/images/users/rajesh_myaccount.png';
import styles from './Profile.module.css';

const Profile = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdatePassword = (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    toast.success('Security credentials updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Box className={styles.container}>
      {/* Card 1: My Account Profile */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>My Account Profile</h3>

        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            <img
              src={rajeshAvatar}
              alt="Rajesh Kumar"
              className={styles.avatarImg}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=644EE5&color=fff&size=128';
              }}
            />
          </div>
          <div className={styles.profileNameDetails}>
            <h2 className={styles.profileName}>Rajesh Kumar</h2>
            <p className={styles.profileRole}>Account Manager</p>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Employee ID</span>
            <span className={styles.detailValue}>EMP-77412</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Department Assignment</span>
            <span className={styles.detailValue}>Account</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Portal Security Role</span>
            <span className={styles.detailValue}>Account Operator</span>
          </div>
        </div>

        <div className={styles.systemNoteBox}>
          <p className={styles.systemNoteText}>
            * System note: General profile configurations and HR details are managed centrally by HRMS and cannot be customized here. Contact administrative desks for revisions.
          </p>
        </div>
      </div>

      {/* Card 2: Change Portal Password */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Change Portal Password</h3>

        <form onSubmit={handleUpdatePassword}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.formLabel}>Current Password</label>
              <div className={styles.inputWrapper}>
                <input
                  id="currentPassword"
                  type="password"
                  className={styles.inputField}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.formLabel}>New Password</label>
              <div className={styles.inputWrapper}>
                <input
                  id="newPassword"
                  type="password"
                  className={styles.inputField}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm New Password</label>
              <div className={styles.inputWrapper}>
                <input
                  id="confirmPassword"
                  type="password"
                  className={styles.inputField}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Update Security Credentials
          </button>
        </form>
      </div>
    </Box>
  );
};

export default Profile;
