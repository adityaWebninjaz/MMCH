import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IconSearch, IconCalendar } from '@tabler/icons-react';
import './CompensatoryOff.css';

const DEFAULT_EMPLOYEE = {
  name: 'Vinod Reddy',
  department: 'SUR-1004 · Surgery',
  balance: '3.5 days'
};

const CompensatoryOff = () => {
  const navigate = useNavigate();

  // Active Tab state
  const [activeTab, setActiveTab] = useState('compensatory_off');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(DEFAULT_EMPLOYEE);

  // Adjustment form states
  const [adjustmentDays, setAdjustmentDays] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [reason, setReason] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Expiry Window states
  const [expiryDays, setExpiryDays] = useState('60');
  const [savedExpiryDays, setSavedExpiryDays] = useState('60');
  const [isSavingExpiry, setIsSavingExpiry] = useState(false);

  // Switch tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overtime') {
      navigate('/supermostadmin/policies/overtime');
    }
  };

  // Reset Adjustment Form
  const handleCancelAdjustment = () => {
    setAdjustmentDays('');
    setExpiryDate('');
    setReason('');
    toast.info('Adjustment form cleared');
  };

  // Submit Manual Adjustment
  const handleApplyAdjustment = (e) => {
    if (e) e.preventDefault();

    if (!adjustmentDays.trim()) {
      toast.error('Please specify the adjustment (+/- days)');
      return;
    }

    if (!expiryDate.trim()) {
      toast.error('Please enter the expiry date');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the adjustment');
      return;
    }

    setIsApplying(true);

    setTimeout(() => {
      setIsApplying(false);
      toast.success(`Compensatory off adjustment applied for ${selectedEmployee.name}`);
      setAdjustmentDays('');
      setExpiryDate('');
      setReason('');
    }, 400);
  };

  // Reset Expiry Window
  const handleCancelExpiryWindow = () => {
    setExpiryDays(savedExpiryDays);
    toast.info('Expiry window reverted to saved value');
  };

  // Save Expiry Window
  const handleSaveExpiryWindow = () => {
    const daysNum = parseInt(expiryDays, 10);
    if (isNaN(daysNum) || daysNum <= 0) {
      toast.error('Please enter a valid number of days');
      return;
    }

    setIsSavingExpiry(true);

    setTimeout(() => {
      setSavedExpiryDays(String(daysNum));
      setIsSavingExpiry(false);
      toast.success('Compensatory off expiry window updated successfully');
    }, 300);
  };

  return (
    <div className="compoff-page-container">
      <div className="compoff-main-wrapper">
        {/* Header Section */}
        <div className="compoff-header-row">
          <h1 className="compoff-page-title">Policies</h1>

          {/* Navigation Tabs */}
          <div className="compoff-tabs-wrapper">
            <button
              type="button"
              className={`compoff-tab-btn ${activeTab === 'overtime' ? 'active' : ''}`}
              onClick={() => handleTabChange('overtime')}
            >
              Overtime
            </button>
            <button
              type="button"
              className={`compoff-tab-btn ${activeTab === 'compensatory_off' ? 'active' : ''}`}
              onClick={() => handleTabChange('compensatory_off')}
            >
              Compensatory Off
            </button>
          </div>
        </div>

        {/* Main Content Container Frame */}
        <div className="compoff-content-container">
          {/* Main Content Grid */}
          <div className="compoff-content-grid">
            {/* Left Side: Manual Adjustment Form */}
            <div className="compoff-form-card">
              {/* Frame 38: Search + Employee Card Container */}
              <div className="compoff-search-employee-container">
                {/* Search Bar */}
                <div className="compoff-search-wrap">
                  <span className="compoff-search-icon">
                    <IconSearch size={16} />
                  </span>
                  <input
                    type="text"
                    className="compoff-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID or name..."
                  />
                </div>

                {/* Selected Employee Summary Card */}
                {selectedEmployee && (
                  <div className="compoff-employee-card">
                    <div className="compoff-employee-details">
                      <h3 className="compoff-emp-name">{selectedEmployee.name}</h3>
                      <p className="compoff-emp-sub">{selectedEmployee.department}</p>
                    </div>
                    <div className="compoff-emp-balance-col">
                      <span className="compoff-balance-label">CURRENT BALANCE</span>
                      <span className="compoff-balance-val">{selectedEmployee.balance}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Frame 39: Adjustment Inputs Row Container */}
              <div className="compoff-form-row-container">
                <div className="compoff-form-row">
                  {/* Adjustment (+/- Days) */}
                  <div className="compoff-field-col">
                    <label className="compoff-field-label" htmlFor="adjustment-days-input">
                      ADJUSTMENT (+/- DAYS) <span className="compoff-required-star">*</span>
                    </label>
                    <div className="compoff-input-wrap">
                      <input
                        id="adjustment-days-input"
                        type="text"
                        className="compoff-input-field"
                        value={adjustmentDays}
                        onChange={(e) => setAdjustmentDays(e.target.value)}
                        placeholder="e.g. +1.0 or -0.5"
                      />
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="compoff-field-col">
                    <label className="compoff-field-label" htmlFor="expiry-date-input">
                      EXPIRY DATE <span className="compoff-required-star">*</span>
                    </label>
                    <div className="compoff-input-wrap">
                      <input
                        id="expiry-date-input"
                        type="text"
                        className="compoff-input-field"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="dd/mm/yyyy"
                      />
                      <IconCalendar size={18} className="compoff-calendar-icon" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Frame 40: Reason (Audit Logged) Container */}
              <div className="compoff-reason-container">
                <div className="compoff-textarea-col">
                  <label className="compoff-textarea-label" htmlFor="reason-textarea">
                    Reason (Audit Logged) <span className="compoff-required-star">*</span>
                  </label>
                  <textarea
                    id="reason-textarea"
                    className="compoff-textarea-field"
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide justification"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="compoff-action-footer">
                <button
                  type="button"
                  className="compoff-btn-cancel"
                  onClick={handleCancelAdjustment}
                  disabled={isApplying}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="compoff-btn-apply"
                  onClick={handleApplyAdjustment}
                  disabled={isApplying}
                >
                  {isApplying ? 'Applying...' : 'Apply Adjustment'}
                </button>
              </div>
            </div>

            {/* Right Side: Expiry Window Card */}
            <div className="compoff-expiry-card">
              <h2 className="compoff-expiry-title">Expiry Window</h2>

              {/* Days Input Row */}
              <div className="compoff-expiry-input-row">
                <input
                  type="text"
                  className="compoff-expiry-input-box"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  placeholder="60"
                />
                <span className="compoff-expiry-suffix">days</span>
              </div>

              {/* Alert Callout Box */}
              <div className="compoff-alert-box">
                <p className="compoff-alert-headline">
                  • Applies only to credits issued after this change.
                </p>
                <p className="compoff-alert-desc">
                  Already-issued credits keep their original expiry date. To retroactively change existing credits, use the manual adjustment console.
                </p>
              </div>

              {/* Expiry Action Footer */}
              <div className="compoff-expiry-action-footer">
                <button
                  type="button"
                  className="compoff-btn-cancel"
                  onClick={handleCancelExpiryWindow}
                  disabled={isSavingExpiry}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="compoff-btn-save"
                  onClick={handleSaveExpiryWindow}
                  disabled={isSavingExpiry}
                >
                  {isSavingExpiry ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompensatoryOff;
