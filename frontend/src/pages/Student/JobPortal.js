import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import '../../Main.css';

const JobPortal = () => {
  const { userProfile } = useAuth();
  const [jobPostings, setJobPostings] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadJobPostings();
    loadMyApplications();
  }, [userProfile]);

  const loadJobPostings = async () => {
    try {
      const q = query(
        collection(db, 'jobPostings'),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      const jobsList = [];
      querySnapshot.forEach((doc) => {
        jobsList.push({ id: doc.id, ...doc.data() });
      });
      setJobPostings(jobsList);
    } catch (error) {
      console.error('Error loading job postings:', error);
    }
  };

  const loadMyApplications = async () => {
    if (!userProfile?.uid) return;

    try {
      const q = query(
        collection(db, 'jobApplications'),
        where('studentId', '==', userProfile.uid)
      );
      const querySnapshot = await getDocs(q);
      const applicationsList = [];
      querySnapshot.forEach((doc) => {
        applicationsList.push({ id: doc.id, ...doc.data() });
      });
      setMyApplications(applicationsList);
    } catch (error) {
      console.error('Error loading job applications:', error);
    }
  };

  const handleApply = async (job) => {
    if (!userProfile) return;

    try {
      const application = {
        studentId: userProfile.uid,
        studentName: userProfile.name,
        studentEmail: userProfile.email,
        studentPhone: userProfile.phone,
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        appliedAt: new Date().toISOString(),
        status: 'pending',
        coverLetter: `I am interested in the ${job.title} position at ${job.companyName}. My skills and experience align well with your requirements.`,
        applicationNumber: `JOB-APP-${Date.now()}`
      };

      await addDoc(collection(db, 'jobApplications'), application);
      loadMyApplications();
      alert('Job application submitted successfully!');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Error submitting application. Please try again.');
    }
  };

  const hasApplied = (jobId) => {
    return myApplications.some(app => app.jobId === jobId);
  };

  const filteredJobs = jobPostings.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'notApplied') return !hasApplied(job.id);
    if (filter === 'applied') return hasApplied(job.id);
    return true;
  });

  const getJobTypeColor = (type) => {
    switch (type) {
      case 'full-time': return '#28a745';
      case 'part-time': return '#007bff';
      case 'internship': return '#ffc107';
      case 'contract': return '#6c757d';
      default: return '#999';
    }
  };

  return (
    <div>
      <div className="table-header">
        <h3>Job Portal</h3>
        <div className="table-actions">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="all">All Jobs</option>
            <option value="notApplied">Not Applied</option>
            <option value="applied">Applied</option>
          </select>
        </div>
      </div>

      <div className="application-cards">
        {filteredJobs.map(job => {
          const applied = hasApplied(job.id);
          
          return (
            <div key={job.id} className="application-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h4>{job.title}</h4>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>
                    {job.companyName}
                  </p>
                </div>
                <span 
                  style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '15px', 
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    background: getJobTypeColor(job.type),
                    color: 'white'
                  }}
                >
                  {job.type}
                </span>
              </div>

              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Salary:</strong> {job.salary || 'Negotiable'}</p>
              <p><strong>Posted:</strong> {new Date(job.postedAt).toLocaleDateString()}</p>
              <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>

              <div style={{ margin: '1rem 0' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Requirements:</p>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                  {job.requirements}
                </p>
              </div>

              {applied ? (
                <div className="application-status status-pending">
                  Application Submitted
                </div>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={() => handleApply(job)}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  Apply Now
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h4>No job postings found</h4>
          <p>There are currently no job opportunities matching your criteria.</p>
        </div>
      )}

      <div style={{ background: '#e7f3ff', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h4>Job Application Statistics</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
              {myApplications.length}
            </div>
            <div>Total Applications</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {myApplications.filter(app => app.status === 'approved').length}
            </div>
            <div>Approved</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
              {myApplications.filter(app => app.status === 'rejected').length}
            </div>
            <div>Rejected</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
              {myApplications.filter(app => app.status === 'pending').length}
            </div>
            <div>Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPortal;