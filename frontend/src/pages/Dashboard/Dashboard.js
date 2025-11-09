import React, { useState } from 'react';
import '../../Main.css';

const Dashboard = () => {
  // Mock user profile for demo purposes
  const userProfile = {
    name: 'Demo User',
    role: 'student'
  };

  const [selectedRole, setSelectedRole] = useState('student');

  const getRoleSpecificContent = (role) => {
    switch (role) {
      case 'student':
        return {
          title: 'Student Dashboard',
          features: [
            'Career Assessment Tests',
            'Skill Development Courses',
            'Job Opportunities',
            'Institute Connections',
            'Career Counseling'
          ],
          stats: [
            { label: 'Profile Completion', value: '85%', desc: 'Complete your profile for better opportunities' },
            { label: 'Active Opportunities', value: '12', desc: 'Available jobs, courses, and programs' },
            { label: 'Connections', value: '8', desc: 'Institutes and companies in your network' }
          ]
        };
      case 'institute':
        return {
          title: 'Institute Dashboard',
          features: [
            'Student Management',
            'Course Catalog',
            'Industry Partnerships',
            'Placement Statistics',
            'Career Events'
          ],
          stats: [
            { label: 'Total Students', value: '1,250', desc: 'Enrolled students this year' },
            { label: 'Active Courses', value: '45', desc: 'Courses currently offered' },
            { label: 'Placements', value: '89%', desc: 'Placement success rate' }
          ]
        };
      case 'company':
        return {
          title: 'Company Dashboard',
          features: [
            'Talent Acquisition',
            'Internship Programs',
            'Campus Recruitment',
            'Skill Requirements',
            'Industry Collaboration'
          ],
          stats: [
            { label: 'Open Positions', value: '15', desc: 'Active job postings' },
            { label: 'Applications', value: '234', desc: 'Received this month' },
            { label: 'Campus Drives', value: '8', desc: 'Scheduled recruitment events' }
          ]
        };
      case 'admin':
        return {
          title: 'Admin Dashboard',
          features: [
            'User Management',
            'Platform Analytics',
            'Content Moderation',
            'System Settings',
            'Reports & Insights'
          ],
          stats: [
            { label: 'Total Users', value: '5,678', desc: 'Registered users' },
            { label: 'Active Sessions', value: '1,234', desc: 'Users online now' },
            { label: 'System Health', value: '98%', desc: 'Platform uptime' }
          ]
        };
      default:
        return {
          title: 'Dashboard',
          features: [],
          stats: []
        };
    }
  };

  const content = getRoleSpecificContent(selectedRole);

  const roles = [
    { id: 'student', name: 'Student', icon: '🎓' },
    { id: 'institute', name: 'Institute', icon: '🏫' },
    { id: 'company', name: 'Company', icon: '🏢' },
    { id: 'admin', name: 'Admin', icon: '⚙️' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {userProfile?.name}!</h1>
        <p className="dashboard-subtitle">
          CareerGuide Demo - Explore all dashboard views
        </p>
      </div>

      <div className="role-selector">
        <h3>Select Dashboard View:</h3>
        <div className="role-buttons">
          {roles.map(role => (
            <button
              key={role.id}
              className={`role-btn ${selectedRole === role.id ? 'active' : ''}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <span className="role-icon">{role.icon}</span>
              {role.name}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="current-role-header">
          <h2>{content.title}</h2>
          <p>Your career guidance hub for {selectedRole}s</p>
        </div>

        <div className="stats-grid">
          {content.stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <h3>{stat.label}</h3>
              <div className="stat-value">{stat.value}</div>
              <p>{stat.desc}</p>
            </div>
          ))}
        </div>

        <div className="features-section">
          <h2>Available Features</h2>
          <div className="features-grid">
            {content.features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">
                  {index + 1}
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">
              Update Profile
            </button>
            <button className="action-btn">
              Browse Opportunities
            </button>
            <button className="action-btn">
              View Connections
            </button>
            <button className="action-btn">
              Settings
            </button>
          </div>
        </div>

        <div className="demo-info">
          <h3>🎯 Demo Mode Features</h3>
          <p>This dashboard showcases all user roles in CareerGuide. Switch between different views to see how each user type experiences the platform.</p>
          <div className="demo-features">
            <div className="demo-feature">
              <strong>Student View:</strong> Career guidance, applications, job portal
            </div>
            <div className="demo-feature">
              <strong>Institute View:</strong> Student management, course catalog, placements
            </div>
            <div className="demo-feature">
              <strong>Company View:</strong> Talent acquisition, recruitment, internships
            </div>
            <div className="demo-feature">
              <strong>Admin View:</strong> Platform management, analytics, user oversight
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
