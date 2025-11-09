import React, { useState, useEffect } from 'react';

const ApplicationsManager = () => {
  // Mock data for demo purposes
  const [applications, setApplications] = useState([
    {
      id: '1',
      studentName: 'John Doe',
      studentEmail: 'john.doe@email.com',
      studentPhone: '+266 123 4567',
      courseName: 'Bachelor of Computer Science',
      intakeYear: 2024,
      intakeSemester: 'fall',
      appliedAt: '2024-07-15T10:00:00Z',
      academicGrades: 'A- Average',
      documentsSubmitted: 5,
      status: 'pending'
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      studentEmail: 'jane.smith@email.com',
      studentPhone: '+266 234 5678',
      courseName: 'Master of Business Administration',
      intakeYear: 2024,
      intakeSemester: 'spring',
      appliedAt: '2024-07-10T14:30:00Z',
      academicGrades: 'B+ Average',
      documentsSubmitted: 4,
      status: 'approved'
    },
    {
      id: '3',
      studentName: 'Mike Johnson',
      studentEmail: 'mike.johnson@email.com',
      studentPhone: '+266 345 6789',
      courseName: 'Bachelor of Engineering',
      intakeYear: 2024,
      intakeSemester: 'fall',
      appliedAt: '2024-07-08T09:15:00Z',
      academicGrades: 'A Average',
      documentsSubmitted: 6,
      status: 'rejected'
    },
    {
      id: '4',
      studentName: 'Sarah Wilson',
      studentEmail: 'sarah.wilson@email.com',
      studentPhone: '+266 456 7890',
      courseName: 'Bachelor of Computer Science',
      intakeYear: 2024,
      intakeSemester: 'fall',
      appliedAt: '2024-07-12T16:45:00Z',
      academicGrades: 'B Average',
      documentsSubmitted: 3,
      status: 'pending'
    }
  ]);

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    console.log('Applications loaded');
  }, []);

  const handleStatusUpdate = (applicationId, newStatus) => {
    const updatedApplications = applications.map(app =>
      app.id === applicationId
        ? { ...app, status: newStatus, reviewedAt: new Date().toISOString() }
        : app
    );
    setApplications(updatedApplications);
    console.log(`Application ${applicationId} status updated to ${newStatus}`);
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <div className="table-header">
        <h3>Student Applications</h3>
        <div className="table-actions">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="data-table">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Applied On</th>
                <th>Qualifications</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <div><strong>{application.studentName}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {application.studentEmail}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {application.studentPhone}
                    </div>
                  </td>
                  <td>
                    <div><strong>{application.courseName}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {application.intakeYear} {application.intakeSemester}
                    </div>
                  </td>
                  <td>
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong>Grades:</strong> {application.academicGrades || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong>Documents:</strong> {application.documentsSubmitted || 0}
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ 
                        backgroundColor: getStatusColor(application.status),
                        color: 'white'
                      }}
                    >
                      {application.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {application.status === 'pending' && (
                        <>
                          <button 
                            className="action-btn approve-btn"
                            onClick={() => handleStatusUpdate(application.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button 
                            className="action-btn btn-danger"
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button className="action-btn edit-btn">
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredApplications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No applications found for the selected filter.
        </div>
      )}
    </div>
  );
};

export default ApplicationsManager;