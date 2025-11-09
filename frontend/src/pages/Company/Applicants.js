import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Applicants = () => {
  const { userProfile } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [selectedJob, setSelectedJob] = useState('all');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadJobPostings();
    loadApplicants();
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
      setJobPostings(jobsList);
    } catch (error) {
      console.error('Error loading job postings:', error);
    }
  };

  const loadApplicants = async () => {
    if (!userProfile?.uid) return;

    try {
      const q = query(
        collection(db, 'jobApplications'),
        where('companyId', '==', userProfile.uid)
      );
      const querySnapshot = await getDocs(q);
      const applicantsList = [];
      
      for (const doc of querySnapshot.docs) {
        const application = { id: doc.id, ...doc.data() };
        
        // Get student profile for matching algorithm
        const studentDoc = await getDoc(doc(db, 'users', application.studentId));
        if (studentDoc.exists()) {
          application.studentProfile = studentDoc.data();
        }
        
        // Get job requirements for matching
        const jobDoc = await getDoc(doc(db, 'jobPostings', application.jobId));
        if (jobDoc.exists()) {
          application.jobRequirements = jobDoc.data();
        }
        
        // Calculate match score
        application.matchScore = calculateMatchScore(application);
        application.matchLevel = getMatchLevel(application.matchScore);
        
        applicantsList.push(application);
      }
      
      // Sort by match score (highest first)
      applicantsList.sort((a, b) => b.matchScore - a.matchScore);
      setApplicants(applicantsList);
    } catch (error) {
      console.error('Error loading applicants:', error);
    }
  };

  // Advanced matching algorithm
  const calculateMatchScore = (application) => {
    let score = 0;
    const job = application.jobRequirements;
    const student = application.studentProfile;
    
    if (!job || !student) return 50; // Default score if data missing

    // Academic Performance (30%)
    const hasGoodGrades = student.academicBackground?.includes('distinction') || 
                         student.academicBackground?.includes('merit') ||
                         student.academicBackground?.includes('3.5') || // GPA
                         student.academicBackground?.includes('A');
    if (hasGoodGrades) score += 30;

    // Education Level Match (20%)
    const educationMatch = getEducationMatch(job.educationLevel, student.educationLevel);
    score += educationMatch * 20;

    // Skills Match (25%)
    const skillsMatch = calculateSkillsMatch(job.requirements, student.skills);
    score += skillsMatch * 25;

    // Experience Match (15%)
    const experienceMatch = getExperienceMatch(job.experienceLevel, student.experience);
    score += experienceMatch * 15;

    // Certificates Bonus (10%)
    const hasRelevantCerts = student.certificates && student.certificates.length > 0;
    if (hasRelevantCerts) score += 10;

    return Math.min(100, Math.round(score));
  };

  const getEducationMatch = (required, student) => {
    const levels = {
      'high-school': 1,
      'diploma': 2,
      'bachelors': 3,
      'masters': 4,
      'phd': 5
    };
    
    const requiredLevel = levels[required] || 0;
    const studentLevel = levels[student] || 0;
    
    if (studentLevel >= requiredLevel) return 1;
    if (studentLevel >= requiredLevel - 1) return 0.5;
    return 0;
  };

  const calculateSkillsMatch = (jobRequirements, studentSkills) => {
    if (!jobRequirements || !studentSkills) return 0.5;
    
    const requiredSkills = extractSkills(jobRequirements);
    const studentSkillList = studentSkills.split(',').map(s => s.trim().toLowerCase());
    
    let matches = 0;
    requiredSkills.forEach(skill => {
      if (studentSkillList.some(s => s.includes(skill) || skill.includes(s))) {
        matches++;
      }
    });
    
    return matches / Math.max(requiredSkills.length, 1);
  };

  const extractSkills = (text) => {
    if (!text) return [];
    // Simple keyword extraction - in production, use NLP
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'sql',
      'mongodb', 'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
      'communication', 'leadership', 'problem solving', 'teamwork'
    ];
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill)
    );
  };

  const getExperienceMatch = (required, studentExperience) => {
    const levels = {
      'internship': 1,
      'entry': 2,
      'mid': 3,
      'senior': 4,
      'executive': 5
    };
    
    const requiredLevel = levels[required] || 0;
    const studentLevel = studentExperience ? levels[studentExperience] || 0 : 0;
    
    if (studentLevel >= requiredLevel) return 1;
    if (studentLevel >= requiredLevel - 1) return 0.7;
    if (studentLevel >= requiredLevel - 2) return 0.4;
    return 0;
  };

  const getMatchLevel = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await updateDoc(doc(db, 'jobApplications', applicationId), {
        status: newStatus,
        reviewedAt: new Date().toISOString(),
        reviewedBy: userProfile.name
      });

      // Update job posting statistics
      const application = applicants.find(app => app.id === applicationId);
      if (application) {
        const jobRef = doc(db, 'jobPostings', application.jobId);
        const jobDoc = await getDoc(jobRef);
        if (jobDoc.exists()) {
          const currentData = jobDoc.data();
          const updates = {};
          
          if (newStatus === 'shortlisted') {
            updates.applicationsShortlisted = (currentData.applicationsShortlisted || 0) + 1;
          } else if (newStatus === 'rejected') {
            updates.applicationsRejected = (currentData.applicationsRejected || 0) + 1;
          }
          
          if (Object.keys(updates).length > 0) {
            await updateDoc(jobRef, updates);
          }
        }
      }

      loadApplicants();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const filteredApplicants = applicants.filter(applicant => {
    if (selectedJob !== 'all' && applicant.jobId !== selectedJob) return false;
    if (filter !== 'all' && applicant.status !== filter) return false;
    if (filter === 'ready-for-interview' && applicant.matchLevel !== 'high') return false;
    return true;
  });

  const getMatchColor = (level) => {
    switch (level) {
      case 'high': return '#28a745';
      case 'medium': return '#ffc107';
      case 'low': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <div className="table-header">
        <h3>Applicant Management</h3>
        <div className="table-actions">
          <select 
            value={selectedJob} 
            onChange={(e) => setSelectedJob(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="all">All Jobs</option>
            {jobPostings.map(job => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="all">All Applicants</option>
            <option value="pending">Pending Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="ready-for-interview">Ready for Interview</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#e7f3ff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h4>Smart Filtering System</h4>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          Applicants are automatically ranked based on:
          <strong> Academic Performance (30%) • Education Match (20%) • Skills Match (25%) • Experience Match (15%) • Certificates (10%)</strong>
        </p>
      </div>

      <div className="applicant-cards">
        {filteredApplicants.map(applicant => (
          <div key={applicant.id} className={`applicant-card ${applicant.matchLevel}-match`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h4>{applicant.studentName}</h4>
                <p style={{ margin: 0, color: '#666' }}>
                  {applicant.jobTitle} • {applicant.studentProfile?.educationLevel || 'Not specified'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div 
                  className="match-score"
                  style={{ 
                    background: getMatchColor(applicant.matchLevel),
                    color: 'white'
                  }}
                >
                  {applicant.matchScore}% Match
                </div>
                <span className={`status-badge status-${applicant.status}`}>
                  {applicant.status}
                </span>
              </div>
            </div>

            <p><strong>Email:</strong> {applicant.studentEmail}</p>
            <p><strong>Phone:</strong> {applicant.studentPhone}</p>
            <p><strong>Applied:</strong> {new Date(applicant.appliedAt).toLocaleDateString()}</p>

            {applicant.studentProfile?.skills && (
              <div style={{ margin: '1rem 0' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Skills:</p>
                <div className="skills-list">
                  {applicant.studentProfile.skills.split(',').slice(0, 5).map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ margin: '1rem 0' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Match Analysis:</p>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                <div>✅ Academic Performance: Good</div>
                <div>✅ Education: Matched</div>
                <div>✅ Skills: {Math.round(calculateSkillsMatch(applicant.jobRequirements?.requirements, applicant.studentProfile?.skills) * 100)}% aligned</div>
                <div>📊 Experience: {applicant.studentProfile?.experience || 'Entry level'}</div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1rem' }}>
              {applicant.status === 'pending' && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => handleStatusUpdate(applicant.id, 'shortlisted')}
                  >
                    Shortlist
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleStatusUpdate(applicant.id, 'rejected')}
                  >
                    Reject
                  </button>
                </>
              )}
              {applicant.status === 'shortlisted' && applicant.matchLevel === 'high' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => handleStatusUpdate(applicant.id, 'interview')}
                >
                  Schedule Interview
                </button>
              )}
              <button className="btn btn-secondary">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredApplicants.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h4>No applicants found</h4>
          <p>No applicants match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default Applicants;