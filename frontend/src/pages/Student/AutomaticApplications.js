import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { evaluateStudentQualifications, submitAutomaticApplications } from '../../utils/qualificationEvaluator';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { addDoc as addDocToCollection } from 'firebase/firestore';

const AutomaticApplications = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [qualifiedAdmissions, setQualifiedAdmissions] = useState([]);
  const [selectedAdmissions, setSelectedAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [academicResults, setAcademicResults] = useState('');

  useEffect(() => {
    // Load existing academic results if any
    if (userProfile?.academicResults) {
      setAcademicResults(userProfile.academicResults);
    }
  }, [userProfile]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type - only PDF allowed
    if (!file.type.includes('pdf')) {
      alert('Please upload only PDF files for academic transcripts.');
      event.target.value = ''; // Reset file input
      return;
    }

    setUploading(true);
    setUploadedFile(file);

    try {
      // Extract academic results from the uploaded file
      // In production, this would use OCR or NLP to parse the transcript
      // For now, we'll simulate parsing with sample data
      const academicResults = await parseTranscriptFile(file);
      setAcademicResults(academicResults);

      // Automatically evaluate qualifications after upload
      await handleEvaluateQualificationsFromFile(academicResults);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing the uploaded file. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const parseTranscriptFile = async (file) => {
    // In production, this would use OCR/NLP to extract academic results
    // For now, return a sample academic results string
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Mathematics - A, English - B, Science - A, Overall - Distinction');
      }, 2000); // Simulate processing time
    });
  };

  const handleEvaluateQualificationsFromFile = async (results) => {
    if (!userProfile || !userProfile.uid) {
      setMessage('Please log in to evaluate qualifications');
      return;
    }

    setEvaluating(true);
    setMessage('');

    try {
      const admissions = await evaluateStudentQualifications(userProfile.uid, results);
      setQualifiedAdmissions(admissions);
      setSelectedAdmissions(admissions.slice(0, 4)); // Auto-select top 4 matches

      if (admissions.length === 0) {
        setMessage('Transcript uploaded successfully! However, no qualified programs were found based on your results.');
      } else {
        setMessage(`Transcript uploaded successfully! Found ${admissions.length} programs you qualify for!`);
      }
    } catch (error) {
      setMessage('Transcript uploaded successfully! However, there was an error evaluating your qualifications.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleEvaluateQualifications = async () => {
    if (!academicResults.trim()) {
      setMessage('Please enter your academic results');
      return;
    }

    if (!userProfile || !userProfile.uid) {
      setMessage('Please log in to evaluate qualifications');
      return;
    }

    setEvaluating(true);
    setMessage('');

    try {
      const admissions = await evaluateStudentQualifications(userProfile.uid, academicResults);
      setQualifiedAdmissions(admissions);
      setSelectedAdmissions(admissions.slice(0, 4)); // Auto-select top 4 matches

      if (admissions.length === 0) {
        setMessage('No qualified programs found based on your academic results.');
      } else {
        setMessage(`Found ${admissions.length} programs you qualify for!`);
      }
    } catch (error) {
      setMessage('Error evaluating qualifications: ' + error.message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleToggleAdmission = (admissionId) => {
    setSelectedAdmissions(prev => {
      const isSelected = prev.find(a => a.id === admissionId);
      if (isSelected) {
        return prev.filter(a => a.id !== admissionId);
      } else {
        const admission = qualifiedAdmissions.find(a => a.id === admissionId);
        return [...prev, admission];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedAdmissions(qualifiedAdmissions);
  };

  const handleDeselectAll = () => {
    setSelectedAdmissions([]);
  };

  const handleSubmitApplications = async () => {
    if (selectedAdmissions.length === 0) {
      setMessage('Please select at least one program to apply for');
      return;
    }

    setSubmitting(true);
    setMessage('');
    
    try {
      const applications = await submitAutomaticApplications(userProfile.uid, selectedAdmissions);
      
      // Save academic results to student profile
      await updateDoc(doc(db, 'users', userProfile.uid), {
        academicResults: academicResults,
        lastQualificationCheck: new Date().toISOString()
      });

      setMessage(`Successfully submitted ${applications.length} applications!`);
      setQualifiedAdmissions([]);
      setSelectedAdmissions([]);
    } catch (error) {
      setMessage('Error submitting applications: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getMatchLevel = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very-high';
    if (score >= 70) return 'high';
    if (score >= 60) return 'good';
    return 'fair';
  };

  const getMatchColor = (score) => {
    if (score >= 90) return '#28a745';
    if (score >= 80) return '#20c997';
    if (score >= 70) return '#007bff';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  // Check if user is logged in and email is verified
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth/login');
    } else if (!currentUser.emailVerified) {
      navigate('/auth/verify-email');
    }
  }, [currentUser, navigate]);

  return (
    <div>
      <div className="table-header">
        <h3>Automatic Course Applications</h3>
        <p>Upload your academic results to discover programs you qualify for</p>
      </div>

      <div className="admin-form">
        <h4>Upload Academic Transcript</h4>
        <div className="form-group">
          <label>Upload PDF Transcript</label>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            accept=".pdf"
            style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', borderRadius: '6px' }}
          />
          <small>
            Upload your academic transcript in PDF format. The system will automatically extract your results and find qualified programs.
          </small>
        </div>

        {uploading && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            Processing transcript...
          </div>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error-message' : 'success-message'}`}>
          {message}
        </div>
      )}

      {qualifiedAdmissions.length > 0 && (
        <div>
          <div className="table-header">
            <h4>Programs You Qualify For</h4>
            <div className="table-actions">
              <button onClick={handleSelectAll} className="btn btn-secondary">
                Select All
              </button>
              <button onClick={handleDeselectAll} className="btn btn-secondary">
                Deselect All
              </button>
              <span>
                Selected: {selectedAdmissions.length} of {qualifiedAdmissions.length}
              </span>
            </div>
          </div>

          <div className="application-cards">
            {qualifiedAdmissions.map(admission => {
              const isSelected = selectedAdmissions.find(a => a.id === admission.id);
              const matchLevel = getMatchLevel(admission.matchScore);
              
              return (
                <div 
                  key={admission.id} 
                  className={`application-card ${isSelected ? 'selected' : ''}`}
                  style={{ 
                    borderLeft: `4px solid ${getMatchColor(admission.matchScore)}`,
                    background: isSelected ? '#f0f8ff' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4>{admission.courseName}</h4>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>
                        {admission.institution?.institutionName}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div 
                        style={{ 
                          padding: '0.5rem 1rem',
                          background: getMatchColor(admission.matchScore),
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {admission.matchScore}% Match
                      </div>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>
                        {matchLevel.replace('-', ' ')}
                      </p>
                    </div>
                  </div>

                  <p><strong>Intake:</strong> {admission.intakeYear} {admission.intakeSemester}</p>
                  <p><strong>Location:</strong> {admission.institution?.location}</p>
                  <p><strong>Application Deadline:</strong> {new Date(admission.applicationDeadline).toLocaleDateString()}</p>

                  {admission.qualificationReasons && admission.qualificationReasons.length > 0 && (
                    <div style={{ margin: '1rem 0' }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Why you qualify:</p>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                        {admission.qualificationReasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleAdmission(admission.id)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Apply to this program
                    </label>
                    
                    <button 
                      className="btn btn-secondary"
                      onClick={() => window.open(admission.institution?.website, '_blank')}
                      style={{ fontSize: '0.8rem' }}
                    >
                      View Institution
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="form-actions" style={{ marginTop: '2rem', justifyContent: 'center' }}>
            <button
              onClick={handleSubmitApplications}
              disabled={submitting || selectedAdmissions.length === 0}
              className="btn btn-primary"
              style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            >
              {submitting ? 'Submitting Applications...' : `Apply to All`}
            </button>
            <button
              onClick={() => {
                setQualifiedAdmissions([]);
                setSelectedAdmissions([]);
                setMessage('');
              }}
              className="btn btn-secondary"
              style={{ padding: '1rem 2rem', fontSize: '1.1rem', marginLeft: '1rem' }}
            >
              Hide Results
            </button>
          </div>

          <div style={{ background: '#e7f3ff', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
            <h5>Application Summary</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                  {qualifiedAdmissions.length}
                </div>
                <div>Programs Found</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                  {selectedAdmissions.length}
                </div>
                <div>Selected</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
                  {Math.round(qualifiedAdmissions.reduce((acc, curr) => acc + curr.matchScore, 0) / qualifiedAdmissions.length)}%
                </div>
                <div>Average Match</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomaticApplications;