import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './OverTime.css';

const DEFAULT_CONFIG = {
  rateMultiplier: '1.5',
  weekendMultiplier: '2.0',
  monthlyOtCap: '50'
};

const OverTime = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overtime');
  const [rateMultiplier, setRateMultiplier] = useState(DEFAULT_CONFIG.rateMultiplier);
  const [weekendMultiplier, setWeekendMultiplier] = useState(DEFAULT_CONFIG.weekendMultiplier);
  const [monthlyOtCap, setMonthlyOtCap] = useState(DEFAULT_CONFIG.monthlyOtCap);
  const [savedConfig, setSavedConfig] = useState(DEFAULT_CONFIG);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'compensatory_off') {
      navigate('/supermostadmin/policies/compensatory-off');
    }
  };

  // Revert changes back to last saved configuration
  const handleCancel = () => {
    setRateMultiplier(savedConfig.rateMultiplier);
    setWeekendMultiplier(savedConfig.weekendMultiplier);
    setMonthlyOtCap(savedConfig.monthlyOtCap);
    toast.info('Changes reverted to saved configuration');
  };

  // Save / Update changes
  const handleUpdate = () => {
    // Validate inputs
    const rate = parseFloat(rateMultiplier);
    const weekend = parseFloat(weekendMultiplier);
    const cap = parseInt(monthlyOtCap, 10);

    if (isNaN(rate) || rate <= 0) {
      toast.error('Please enter a valid rate multiplier');
      return;
    }

    if (isNaN(weekend) || weekend <= 0) {
      toast.error('Please enter a valid holiday / weekend multiplier');
      return;
    }

    if (isNaN(cap) || cap <= 0) {
      toast.error('Please enter a valid monthly OT cap');
      return;
    }

    setIsUpdating(true);

    try {
      const newConfig = {
        rateMultiplier: String(rate),
        weekendMultiplier: String(weekend),
        monthlyOtCap: String(cap)
      };

      setSavedConfig(newConfig);
      localStorage.setItem('overtime_policy_config', JSON.stringify(newConfig));

      setTimeout(() => {
        setIsUpdating(false);
        toast.success('Overtime policy updated successfully');
      }, 300);
    } catch (err) {
      console.error('Error saving overtime policy:', err);
      setIsUpdating(false);
      toast.error('Failed to update overtime policy');
    }
  };

  return (
    <div className="overtime-page-container">
      <div className="overtime-main-wrapper">
        {/* Header Section */}
        <div className="overtime-header-row">
          <h1 className="overtime-page-title">Policies</h1>

          {/* Navigation Tabs */}
          <div className="overtime-tabs-wrapper">
            <button
              type="button"
              className={`overtime-tab-btn ${activeTab === 'overtime' ? 'active' : ''}`}
              onClick={() => handleTabChange('overtime')}
            >
              Overtime
            </button>
            <button
              type="button"
              className={`overtime-tab-btn ${activeTab === 'compensatory_off' ? 'active' : ''}`}
              onClick={() => handleTabChange('compensatory_off')}
            >
              Compensatory Off
            </button>
          </div>
        </div>

        {/* Main Content Container Frame */}
        <div className="overtime-content-container">
          {/* Main Content Grid */}
          <div className="overtime-content-grid">
            {/* Left Side: Settings Form Card */}
            <div className="overtime-form-card">
              {/* 1. Rate Multiplier */}
              <div className="overtime-config-group">
                <label className="overtime-group-title" htmlFor="rate-multiplier-input">
                  Rate Multiplier
                </label>
                <div className="overtime-input-row">
                  <input
                    id="rate-multiplier-input"
                    type="text"
                    className="overtime-input-box"
                    value={rateMultiplier}
                    onChange={(e) => setRateMultiplier(e.target.value)}
                    placeholder="1.5"
                  />
                  <span className="overtime-input-suffix">× base</span>
                </div>
              </div>

              {/* 2. Holiday / Weekend Multiplier */}
              <div className="overtime-config-group">
                <label className="overtime-group-title" htmlFor="weekend-multiplier-input">
                  Holiday / Weekend Multiplier
                </label>
                <div className="overtime-input-row">
                  <input
                    id="weekend-multiplier-input"
                    type="text"
                    className="overtime-input-box"
                    value={weekendMultiplier}
                    onChange={(e) => setWeekendMultiplier(e.target.value)}
                    placeholder="2.0"
                  />
                  <span className="overtime-input-suffix">× base</span>
                </div>
              </div>

              {/* 3. Monthly OT Cap */}
              <div className="overtime-config-group">
                <label className="overtime-group-title" htmlFor="monthly-ot-cap-input">
                  Monthly OT Cap
                </label>
                <div className="overtime-input-row">
                  <input
                    id="monthly-ot-cap-input"
                    type="text"
                    className="overtime-input-box"
                    value={monthlyOtCap}
                    onChange={(e) => setMonthlyOtCap(e.target.value)}
                    placeholder="50"
                  />
                  <span className="overtime-input-suffix">hours</span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="overtime-action-footer">
                <button
                  type="button"
                  className="overtime-btn-cancel"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="overtime-btn-update"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>

            {/* Right Side: Shared Config Card */}
            <div className="overtime-shared-card">
              <h2 className="overtime-shared-title">Shared config</h2>

              <ul className="overtime-usage-list">
                <li className="overtime-usage-item">
                  <span className="overtime-bullet-dot">•</span>
                  <p className="overtime-usage-text">
                    HOD screen · <strong>OT Recommendation Detail</strong>
                  </p>
                </li>
                <li className="overtime-usage-item">
                  <span className="overtime-bullet-dot">•</span>
                  <p className="overtime-usage-text">
                    Management screen · <strong>OT Final Approval Detail</strong>
                  </p>
                </li>
                <li className="overtime-usage-item">
                  <span className="overtime-bullet-dot">•</span>
                  <p className="overtime-usage-text">
                    Payroll cycle · <strong>Pre-processing calculation</strong>
                  </p>
                </li>
              </ul>

              <div className="overtime-alert-callout">
                <p className="overtime-alert-text">
                  Changing the Monthly OT Cap updates the &quot;X/cap hrs used&quot; indicator shown to all HODs and Management immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverTime;
