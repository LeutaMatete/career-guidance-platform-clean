import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import '../../Main.css';

const AdmissionsResults = () => {
  const { userProfile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadApplications();
  }, [userProfile]);

  const loadApplications = async () => {
    if (!userProfile?.uid) return;

    try {
      const q = query(
        collection(db, 'applications'),
        where('studentId', '==', userProfile.uid)
      );
      const querySnapshot = await getDocs(q);
      const applicationsList = [];
      querySnapshot.forEach((doc) => {
        applicationsList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by review date (newest first)
      applicationsList.sort((a, b) => new Date(b.reviewedAt || b.appliedAt) - new Date(a.reviewedAt || a.appliedAt));
      setApplications(applicationsList);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '';
      case 'rejected': return '';
      case 'pending': return '';
      default: return '';
    }
  };

  const getStatusMessage = (application) => {
    switch (application.status) {
      case 'approved':
        return `Congratulations! You have been accepted into ${application.courseName}. Please check your email for enrollment instructions.`;
      case 'rejected':
        return `Your application for ${application.courseName} was not successful at this time.`;
      case 'pending':
        return `Your application is under review. You will be notified when a decision is made.`;
      default:
        return 'Application submitted.';
    }
  };

  return (
    <div>
      <div className="table-header">
        <h3>Admissions Results</h3>
        <div className="table-actions">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h4>No applications found</h4>
          <p>You haven't submitted any course applications yet.</p>
        </div>
      ) : (
        <div className="application-cards">
          {filteredApplications.map(application => (
            <div key={application.id} className={`application-card ${application.status}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h4>{application.courseName}</h4>
                <span style={{ fontSize: '1.5rem' }}>
                  {getStatusIcon(application.status)}
                </span>
              </div>
              
              <p><strong>Institution:</strong> {application.institutionName}</p>
              <p><strong>Applied On:</strong> {new Date(application.appliedAt).toLocaleDateString()}</p>
              
              {application.reviewedAt && (
                <p><strong>Decision Date:</strong> {new Date(application.reviewedAt).toLocaleDateString()}</p>
              )}
              
              {application.reviewedBy && (
                <p><strong>Reviewed By:</strong> {application.reviewedBy}</p>
              )}

              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: '#f8f9fa', 
                borderRadius: '6px',
                borderLeft: `4px solid ${
                  application.status === 'approved' ? '#28a745' : 
                  application.status === 'rejected' ? '#dc3545' : '#ffc107'
                }`
              }}>
                <strong>Status: </strong>
                <span className={`application-status status-${application.status}`}>
                  {application.status.toUpperCase()}
                </span>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                  {getStatusMessage(application)}
                </p>
              </div>

              {application.status === 'approved' && (
                <button className="btn btn-success" style={{ marginTop: '1rem', width: '100%' }}>
                  Accept Offer & Enroll
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#e7f3ff', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h4>📋 Application Statistics</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
              {applications.length}
            </div>
            <div>Total Applications</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {applications.filter(app => app.status === 'approved').length}
            </div>
            <div>Approved</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
              {applications.filter(app => app.status === 'rejected').length}
            </div>
            <div>Rejected</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
              {applications.filter(app => app.status === 'pending').length}
            </div>
            <div>Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsResults;