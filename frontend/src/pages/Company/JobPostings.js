import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

const JobPostings = () => {
  const { userProfile } = useAuth();
  const [jobPostings, setJobPostings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'full-time',
    department: '',
    location: '',
    salary: '',
    deadline: '',
    description: '',
    requirements: '',
    qualifications: '',
    responsibilities: '',
    benefits: '',
    experienceLevel: 'entry',
    educationLevel: 'bachelors'
  });

  useEffect(() => {
    loadJobPostings();
  }, [userProfile]);

  const loadJobPostings = async () => {
    if (!userProfile?.uid) return;

    try {
      const q = query(
        collection(db, 'jobPostings'),
        where('companyId', '==', userProfile.uid)
      );
      const querySnapshot = await getDocs(q);
      const jobsList = [];
      querySnapshot.forEach((doc) => {
        jobsList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by posting date (newest first)
      jobsList.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
      setJobPostings(jobsList);
    } catch (error) {
      console.error('Error loading job postings:', error);
    }
  };

  const calculateMatchingScore = (job) => {
    // This would calculate based on actual applicant data
    // For now, return a mock score
    return Math.floor(Math.random() * 40) + 60; // 60-100%
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobData = {
        ...formData,
        companyId: userProfile.uid,
        companyName: userProfile.companyName,
        companyIndustry: userProfile.industry,
        postedAt: new Date().toISOString(),
        status: 'active',
        applicationsReceived: 0,
        applicationsShortlisted: 0,
        applicationsRejected: 0
      };

      if (editingJob) {
        await updateDoc(doc(db, 'jobPostings', editingJob.id), jobData);
      } else {
        await addDoc(collection(db, 'jobPostings'), jobData);
      }

      setShowForm(false);
      setEditingJob(null);
      setFormData({
        title: '', type: 'full-time', department: '', location: '', salary: '', deadline: '',
        description: '', requirements: '', qualifications: '', responsibilities: '', benefits: '',
        experienceLevel: 'entry', educationLevel: 'bachelors'
      });
      loadJobPostings();
    } catch (error) {
      console.error('Error saving job posting:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await deleteDoc(doc(db, 'jobPostings', id));
        loadJobPostings();
      } catch (error) {
        console.error('Error deleting job posting:', error);
      }
    }
  };

  const handleCloseJob = async (id) => {
    try {
      await updateDoc(doc(db, 'jobPostings', id), {
        status: 'closed',
        closedAt: new Date().toISOString()
      });
      loadJobPostings();
    } catch (error) {
      console.error('Error closing job posting:', error);
    }
  };

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'temporary'];
  const experienceLevels = ['internship', 'entry', 'mid', 'senior', 'executive'];
  const educationLevels = ['high-school', 'diploma', 'bachelors', 'masters', 'phd'];

  return (
    <div>
      <div className="table-header">
        <h3>Job Postings</h3>
        <div className="table-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Post New Job
          </button>
        </div>
      </div>

      {showForm && (
        <div className="admin-form">
          <h4>{editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div className="form-group">
                <label>Job Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="e.g., Engineering, Marketing"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  placeholder="e.g., Maseru, Lesotho"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Salary Range</label>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  placeholder="e.g., LSL 15,000 - 25,000"
                />
              </div>

              <div className="form-group">
                <label>Application Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                  required
                >
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Education Level</label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({...formData, educationLevel: e.target.value})}
                  required
                >
                  {educationLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Job Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                placeholder="Detailed description of the job role and responsibilities..."
                required
              />
            </div>

            <div className="form-group">
              <label>Requirements</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                rows="3"
                placeholder="Required skills, technologies, and competencies..."
                required
              />
            </div>

            <div className="form-group">
              <label>Qualifications</label>
              <textarea
                value={formData.qualifications}
                onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                rows="2"
                placeholder="Educational and professional qualifications required..."
              />
            </div>

            <div className="form-group">
              <label>Benefits</label>
              <textarea
                value={formData.benefits}
                onChange={(e) => setFormData({...formData, benefits: e.target.value})}
                rows="2"
                placeholder="Company benefits, perks, and opportunities..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingJob ? 'Update Job' : 'Post Job'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingJob(null);
                  setFormData({
                    title: '', type: 'full-time', department: '', location: '', salary: '', deadline: '',
                    description: '', requirements: '', qualifications: '', responsibilities: '', benefits: '',
                    experienceLevel: 'entry', educationLevel: 'bachelors'
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="applicant-cards">
        {jobPostings.map(job => (
          <div key={job.id} className="applicant-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h4>{job.title}</h4>
                <p style={{ margin: 0, color: '#666' }}>
                  {job.department} • {job.location}
                </p>
              </div>
              <span className={`status-badge status-${job.status}`}>
                {job.status}
              </span>
            </div>

            <p><strong>Type:</strong> {job.type}</p>
            <p><strong>Experience:</strong> {job.experienceLevel}</p>
            <p><strong>Education:</strong> {job.educationLevel}</p>
            <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
            <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
            <p><strong>Posted:</strong> {new Date(job.postedAt).toLocaleDateString()}</p>

            <div style={{ margin: '1rem 0' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Applications:</p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                <span>Total: {job.applicationsReceived || 0}</span>
                <span>Shortlisted: {job.applicationsShortlisted || 0}</span>
                <span>Rejected: {job.applicationsRejected || 0}</span>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1rem' }}>
              {job.status === 'active' ? (
                <button 
                  className="btn btn-danger"
                  onClick={() => handleCloseJob(job.id)}
                >
                  Close Job
                </button>
              ) : (
                <button 
                  className="btn btn-success"
                  onClick={() => updateDoc(doc(db, 'jobPostings', job.id), { status: 'active' })}
                >
                  Reopen Job
                </button>
              )}
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setEditingJob(job);
                  setFormData(job);
                  setShowForm(true);
                }}
              >
                Edit
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(job.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {jobPostings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h4>No job postings yet</h4>
          <p>Create your first job posting to start receiving applications from qualified students.</p>
        </div>
      )}
    </div>
  );
};

export default JobPostings;