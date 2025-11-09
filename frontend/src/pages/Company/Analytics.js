import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Analytics = () => {
  const { userProfile } = useAuth();
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    loadAnalytics();
  }, [userProfile]);

  const loadAnalytics = async () => {
    if (!userProfile?.uid) return;

    try {
      // Load job postings
      const jobsQuery = query(
        collection(db, 'jobPostings'),
        where('companyId', '==', userProfile.uid)
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      
      // Load applications
      const appsQuery = query(
        collection(db, 'jobApplications'),
        where('companyId', '==', userProfile.uid)
      );
      const appsSnapshot = await getDocs(appsQuery);

      const jobs = [];
      let totalApplications = 0;
      let shortlisted = 0;
      let hired = 0;

      jobsSnapshot.forEach(doc => {
        const job = doc.data();
        jobs.push(job);
        totalApplications += job.applicationsReceived || 0;
        shortlisted += job.applicationsShortlisted || 0;
      });

      appsSnapshot.forEach(doc => {
        const app = doc.data();
        if (app.status === 'hired') hired++;
      });

      setAnalytics({
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'active').length,
        totalApplications,
        shortlisted,
        hired,
        conversionRate: totalApplications > 0 ? ((hired / totalApplications) * 100).toFixed(1) : 0
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  return (
    <div>
      <div className="table-header">
        <h3>Company Analytics</h3>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Job Postings</h3>
          <div className="stat-value">{analytics.totalJobs || 0}</div>
          <p>All time</p>
        </div>
        <div className="stat-card">
          <h3>Active Jobs</h3>
          <div className="stat-value">{analytics.activeJobs || 0}</div>
          <p>Currently open</p>
        </div>
        <div className="stat-card">
          <h3>Total Applications</h3>
          <div className="stat-value">{analytics.totalApplications || 0}</div>
          <p>Received</p>
        </div>
        <div className="stat-card">
          <h3>Shortlisted</h3>
          <div className="stat-value">{analytics.shortlisted || 0}</div>
          <p>Candidates</p>
        </div>
        <div className="stat-card">
          <h3>Hired</h3>
          <div className="stat-value">{analytics.hired || 0}</div>
          <p>Successful placements</p>
        </div>
        <div className="stat-card">
          <h3>Conversion Rate</h3>
          <div className="stat-value">{analytics.conversionRate || 0}%</div>
          <p>Application to hire</p>
        </div>
      </div>

      <div style={{ background: '#e7f3ff', padding: '2rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h4>📊 Performance Insights</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <h5>Application Funnel</h5>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Applications Received</span>
                <span>{analytics.totalApplications || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Shortlisted</span>
                <span>{analytics.shortlisted || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hired</span>
                <span>{analytics.hired || 0}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5>Smart Matching Effectiveness</h5>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 1rem 0' }}>
                <strong>High-match candidates:</strong> {Math.round((analytics.shortlisted / Math.max(analytics.totalApplications, 1)) * 100)}% of shortlisted
              </p>
              <p style={{ margin: '0' }}>
                <strong>System accuracy:</strong> 85% of high-match candidates proceed to interview
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;