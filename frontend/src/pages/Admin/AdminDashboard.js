import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import InstitutionsManager from './InstitutionsManager';
import FacultiesManager from './FacultiesManager';
import AdmissionsManager from './AdmissionsManager';
import CompaniesManager from './CompaniesManager';
import UsersManager from './UsersManager';
import ReportsManager from './ReportsManager';
import '../../Main.css';

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'institutions', name: 'Institutions' },
    { id: 'faculties', name: 'Faculties & Courses' },
    { id: 'admissions', name: 'Admissions' },
    { id: 'companies', name: 'Companies' },
    { id: 'users', name: 'Users' },
    { id: 'reports', name: 'Reports' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'institutions':
        return <InstitutionsManager />;
      case 'faculties':
        return <FacultiesManager />;
      case 'admissions':
        return <AdmissionsManager />;
      case 'companies':
        return <CompaniesManager />;
      case 'users':
        return <UsersManager />;
      case 'reports':
        return <ReportsManager />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {userProfile?.name}</p>
      </div>

      <div className="admin-layout">
        <div className="admin-sidebar">
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

        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const OverviewTab = () => (
  <div className="tab-content">
    <h2>System Overview</h2>
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Institutions</h3>
        <div className="stat-value">15</div>
        <p>Higher learning institutions</p>
      </div>
      <div className="stat-card">
        <h3>Active Admissions</h3>
        <div className="stat-value">8</div>
        <p>Open for applications</p>
      </div>
      <div className="stat-card">
        <h3>Registered Companies</h3>
        <div className="stat-value">23</div>
        <p>Approved employers</p>
      </div>
      <div className="stat-card">
        <h3>Total Users</h3>
        <div className="stat-value">1,247</div>
        <p>Registered users</p>
      </div>
    </div>

    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        <div className="activity-item">
          <strong>New Institution Registered:</strong> National University of Lesotho
        </div>
        <div className="activity-item">
          <strong>Admission Published:</strong> Computer Science 2024
        </div>
        <div className="activity-item">
          <strong>Company Approved:</strong> Tech Solutions Ltd
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;