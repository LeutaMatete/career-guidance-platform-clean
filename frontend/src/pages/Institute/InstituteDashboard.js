import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import InstituteProfile from './InstituteProfile';
import FacultiesManager from './FacultiesManager';
import CoursesManager from './CoursesManager';
import AdmissionsManager from './AdmissionsManager';
import ApplicationsManager from './ApplicationsManager';
import StudentsManager from './StudentsManager';
import '../../Main.css';

const InstituteDashboard = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'profile', name: 'Institute Profile' },
    { id: 'faculties', name: 'Faculties' },
    { id: 'courses', name: 'Courses' },
    { id: 'admissions', name: 'Admissions' },
    { id: 'applications', name: 'Applications' },
    { id: 'students', name: 'Students' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'profile':
        return <InstituteProfile />;
      case 'faculties':
        return <FacultiesManager />;
      case 'courses':
        return <CoursesManager />;
      case 'admissions':
        return <AdmissionsManager />;
      case 'applications':
        return <ApplicationsManager />;
      case 'students':
        return <StudentsManager />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="institute-dashboard">
      <div className="institute-header">
        <h1>Institute Dashboard</h1>
        <p>Welcome, {userProfile?.institutionName || userProfile?.name}</p>
      </div>

      <div className="institute-layout">
        <div className="institute-sidebar">
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

        <div className="institute-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const OverviewTab = () => (
  <div className="tab-content">
    <h2>Institute Overview</h2>
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Faculties</h3>
        <div className="stat-value">8</div>
        <p>Active departments</p>
      </div>
      <div className="stat-card">
        <h3>Available Courses</h3>
        <div className="stat-value">45</div>
        <p>Programs offered</p>
      </div>
      <div className="stat-card">
        <h3>Active Admissions</h3>
        <div className="stat-value">6</div>
        <p>Open for applications</p>
      </div>
      <div className="stat-card">
        <h3>Pending Applications</h3>
        <div className="stat-value">127</div>
        <p>Require review</p>
      </div>
    </div>

    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        <div className="activity-item">
          <strong>New Application:</strong> Computer Science - John Doe
        </div>
        <div className="activity-item">
          <strong>Admission Published:</strong> Engineering 2024
        </div>
        <div className="activity-item">
          <strong>Course Added:</strong> Data Science Fundamentals
        </div>
      </div>
    </div>
  </div>
);

export default InstituteDashboard;