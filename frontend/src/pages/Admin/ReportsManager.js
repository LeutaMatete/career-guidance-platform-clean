import React from 'react';

const ReportsManager = () => {
  return (
    <div>
      <div className="table-header">
        <h3>System Reports</h3>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>User Registrations</h3>
          <div className="stat-value">1,247</div>
          <p>Total registered users</p>
        </div>
        <div className="stat-card">
          <h3>Active Admissions</h3>
          <div className="stat-value">8</div>
          <p>Currently open</p>
        </div>
        <div className="stat-card">
          <h3>Company Applications</h3>
          <div className="stat-value">45</div>
          <p>This month</p>
        </div>
        <div className="stat-card">
          <h3>Course Applications</h3>
          <div className="stat-value">289</div>
          <p>Total applications</p>
        </div>
      </div>

      <div className="admin-form">
        <h4>Generate Custom Report</h4>
        <div className="form-group">
          <label>Report Type</label>
          <select>
            <option>User Registration Report</option>
            <option>Admission Statistics</option>
            <option>Company Applications</option>
            <option>Course Popularity</option>
          </select>
        </div>
        <div className="form-group">
          <label>Date Range</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="date" />
            <span>to</span>
            <input type="date" />
          </div>
        </div>
        <button className="btn btn-primary">Generate Report</button>
      </div>
    </div>
  );
};

export default ReportsManager;