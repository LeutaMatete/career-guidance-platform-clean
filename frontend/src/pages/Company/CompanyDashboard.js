import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import CompanyProfile from './CompanyProfile';
import JobPostings from './JobPostings';
import Applicants from './Applicants';
import Interviews from './Interviews';
import Analytics from './Analytics';
import '../../Main.css';

const CompanyDashboard = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'profile', name: 'Company Profile' },
    { id: 'jobs', name: 'Job Postings' },
    { id: 'applicants', name: 'Applicants' },
    { id: 'interviews', name: 'Interviews' },
    { id: 'analytics', name: 'Analytics' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'profile':
        return <CompanyProfile />;
      case 'jobs':
        return <JobPostings />;
      case 'applicants':
        return <Applicants />;
      case 'interviews':
        return <Interviews />;
      case 'analytics':
        return <Analytics />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="company-dashboard">
      <div className="company-header">
        <h1>Company Dashboard</h1>
        <p>Welcome, {userProfile?.companyName || userProfile?.name}</p>
        <div className="company-status">
          <span className={`status-badge status-${userProfile?.status || 'pending'}`}>
            {userProfile?.status || 'pending'}
          </span>
        </div>
      </div>

      <div className="company-layout">
        <div className="company-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="company-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const OverviewTab = () => (
  <div className="tab-content">
    <h2>Company Overview</h2>
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Active Job Postings</h3>
        <div className="stat-value">3</div>
        <p>Currently open positions</p>
      </div>
      <div className="stat-card">
        <h3>Total Applicants</h3>
        <div className="stat-value">45</div>
        <p>This month</p>
      </div>
      <div className="stat-card">
        <h3>Interview Scheduled</h3>
        <div className="stat-value">12</div>
        <p>Upcoming interviews</p>
      </div>
      <div className="stat-card">
        <h3>Hired Candidates</h3>
        <div className="stat-value">5</div>
        <p>Successful placements</p>
      </div>
    </div>

    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        <div className="activity-item success">
          <strong>New Job Posted:</strong> Senior Software Engineer
        </div>
        <div className="activity-item info">
          <strong>New Applicant:</strong> John Doe for Data Analyst position
        </div>
        <div className="activity-item warning">
          <strong>Interview Scheduled:</strong> Jane Smith - Tomorrow 2:00 PM
        </div>
      </div>
    </div>
  </div>
);

export default CompanyDashboard;