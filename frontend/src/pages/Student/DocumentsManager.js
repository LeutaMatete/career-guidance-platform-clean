import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { evaluateStudentQualifications, submitAutomaticApplications } from '../../utils/qualificationEvaluator';

const DocumentsManager = () => {
  const { userProfile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [qualifiedPrograms, setQualifiedPrograms] = useState([]);
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showQualifiedPrograms, setShowQualifiedPrograms] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [userProfile]);

  const loadDocuments = async () => {
    if (!userProfile?.uid) return;

    try {
      const q = query(
        collection(db, 'documents'),
        where('studentId', '==', userProfile.uid)
      );
      const querySnapshot = await getDocs(q);
      const documentsList = [];
      querySnapshot.forEach((doc) => {
        documentsList.push({ id: doc.id, ...doc.data() });
      });
      setDocuments(documentsList);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type for transcripts - only PDF allowed
    if (documentType === 'transcript' && !file.type.includes('pdf')) {
      alert('Please upload only PDF files for academic transcripts.');
      event.target.value = ''; // Reset file input
      return;
    }

    setUploading(true);

    try {
      // In a real application, you would upload the file to cloud storage
      // For now, we'll simulate the upload and store metadata in Firestore

      const documentData = {
        studentId: userProfile.uid,
        studentName: userProfile.name,
        documentType: documentType,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
        // In production, you would store the actual file URL here
        fileUrl: `https://example.com/documents/${userProfile.uid}/${file.name}`
      };

      await addDoc(collection(db, 'documents'), documentData);
      loadDocuments();

      // Trigger automatic qualification evaluation for transcript uploads
      if (documentType === 'transcript') {
        await handleTranscriptUpload(file);
      } else {
        alert('Document uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleTranscriptUpload = async (file) => {
    if (!userProfile || !userProfile.uid) {
      alert('Please log in to evaluate qualifications');
      return;
    }

    setEvaluating(true);

    try {
      // Extract academic results from the uploaded file
      // In production, this would use OCR or NLP to parse the transcript
      // For now, we'll simulate parsing with sample data
      const academicResults = await parseTranscriptFile(file);

      // Evaluate qualifications
      const qualifiedAdmissions = await evaluateStudentQualifications(userProfile.uid, academicResults);

      if (qualifiedAdmissions.length > 0) {
        setQualifiedPrograms(qualifiedAdmissions);
        setShowQualifiedPrograms(true);

        // Save academic results to student profile
        await updateDoc(doc(db, 'users', userProfile.uid), {
          academicResults: academicResults,
          lastQualificationCheck: new Date().toISOString()
        });
      } else {
        alert('Transcript uploaded successfully! However, no qualified programs were found based on your results. You can manually enter your results in the "Auto Apply" tab for more detailed evaluation.');
      }
    } catch (error) {
      console.error('Error evaluating qualifications:', error);
      alert('Transcript uploaded successfully! However, there was an error evaluating your qualifications. Please try the "Auto Apply" tab for manual evaluation.');
    } finally {
      setEvaluating(false);
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

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDoc(doc(db, 'documents', documentId));
        loadDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document. Please try again.');
      }
    }
  };

  const handleAutomaticApplication = async (selectedPrograms) => {
    try {
      await submitAutomaticApplications(userProfile.uid, selectedPrograms);
      alert(`Successfully applied to ${selectedPrograms.length} programs!`);
    } catch (error) {
      console.error('Error submitting applications:', error);
      throw error;
    }
  };

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'transcript': return 'Transcript';
      case 'certificate': return 'Certificate';
      case 'id': return 'ID';
      case 'photo': return 'Photo';
      case 'recommendation': return 'Recommendation';
      default: return 'Document';
    }
  };

  const documentCategories = [
    {
      title: 'Academic Documents',
      type: 'academic',
      documents: [
        { type: 'transcript', name: 'Academic Transcripts', description: 'Upload your high school or previous academic transcripts' },
        { type: 'certificate', name: 'Certificates', description: 'Academic certificates and qualifications' }
      ]
    },
    {
      title: 'Identification',
      type: 'identification',
      documents: [
        { type: 'id', name: 'ID Document', description: 'National ID or passport' },
        { type: 'photo', name: 'Passport Photo', description: 'Recent passport-sized photograph' }
      ]
    },
    {
      title: 'Additional Documents',
      type: 'additional',
      documents: [
        { type: 'recommendation', name: 'Recommendation Letters', description: 'Letters of recommendation from teachers or employers' },
        { type: 'portfolio', name: 'Portfolio', description: 'Work portfolio (if applicable)' }
      ]
    }
  ];

  return (
    <div>
      <div className="table-header">
        <h3>Document Management</h3>
        <p>Upload and manage your academic documents and certificates</p>
      </div>

      {documentCategories.map(category => (
        <div key={category.type} style={{ marginBottom: '2rem' }}>
          <h4>{category.title}</h4>
          <div className="application-cards">
            {category.documents.map(docType => {
              const uploadedDoc = documents.find(d => d.documentType === docType.type);
              
              return (
                <div key={docType.type} className="application-card">
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem', marginRight: '1rem' }}>
                      {getDocumentTypeIcon(docType.type)}
                    </span>
                    <div>
                      <h5 style={{ margin: 0 }}>{docType.name}</h5>
                      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                        {docType.description}
                      </p>
                    </div>
                  </div>

                  {uploadedDoc ? (
                    <div className="document-item">
                      <div className="document-info">
                        <h6 style={{ margin: 0 }}>{uploadedDoc.fileName}</h6>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                          Uploaded: {new Date(uploadedDoc.uploadedAt).toLocaleDateString()} • 
                          Size: {(uploadedDoc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <span className={`application-status status-${uploadedDoc.status}`}>
                          {uploadedDoc.status}
                        </span>
                      </div>
                      <div className="document-actions">
                        <button className="action-btn edit-btn">
                          View
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteDocument(uploadedDoc.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="document-upload">
                      <input
                        type="file"
                        id={`file-${docType.type}`}
                        onChange={(e) => handleFileUpload(e, docType.type)}
                        disabled={uploading}
                        accept={docType.type === 'transcript' ? '.pdf' : '.pdf,.doc,.docx,.jpg,.jpeg,.png'}
                      />
                      <label htmlFor={`file-${docType.type}`} className="upload-label">
                        {uploading ? 'Uploading...' : `Upload ${docType.name}`}
                      </label>
                      <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0 0 0' }}>
                        {docType.type === 'transcript'
                          ? 'Supported format: PDF only (Max: 10MB)'
                          : 'Supported formats: PDF, DOC, JPG, PNG (Max: 10MB)'
                        }
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Qualified Programs Display */}
      {showQualifiedPrograms && qualifiedPrograms.length > 0 && (
        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', padding: '1.5rem', borderRadius: '8px' }}>
            <h4 style={{ color: '#155724', margin: '0 0 1rem 0' }}>🎉 Qualified Programs Found!</h4>
            <p style={{ color: '#155724', margin: '0 0 1.5rem 0' }}>
              Based on your uploaded transcript, we found {qualifiedPrograms.length} programs you qualify for.
              You can apply to these programs automatically.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {qualifiedPrograms.map(program => (
                <div
                  key={program.id}
                  style={{
                    background: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{program.courseName}</h5>
                      <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
                        {program.institution?.institutionName}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                        Intake: {program.intakeYear} {program.intakeSemester}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: program.matchScore >= 90 ? '#28a745' :
                                   program.matchScore >= 80 ? '#20c997' :
                                   program.matchScore >= 70 ? '#007bff' :
                                   program.matchScore >= 60 ? '#ffc107' : '#dc3545',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {program.matchScore}% Match
                    </div>
                  </div>
                  {program.qualificationReasons && program.qualificationReasons.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500', fontSize: '0.8rem' }}>Why you qualify:</p>
                      <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem' }}>
                        {program.qualificationReasons.slice(0, 2).map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                onClick={() => handleAutomaticApplication(qualifiedPrograms)}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                Apply to All Qualified Programs ({qualifiedPrograms.length})
              </button>
              <button
                onClick={() => setShowQualifiedPrograms(false)}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginLeft: '1rem'
                }}
              >
                Hide Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Qualification Modal */}
      {showQualificationModal && (
        <QualificationModal
          qualifiedPrograms={qualifiedPrograms}
          onClose={() => setShowQualificationModal(false)}
          onApply={handleAutomaticApplication}
        />
      )}

      <div style={{ background: '#fff3cd', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h4>Important Notes</h4>
        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
          <li>Keep your documents updated throughout your academic journey</li>
          <li>Upload final transcripts upon completion of studies</li>
          <li>Additional certificates improve your job application profile</li>
          <li>Documents are securely stored and only shared with authorized institutions/employers</li>
          <li><strong>Auto Apply:</strong> Upload your transcript to automatically discover and apply to qualified programs</li>
        </ul>
      </div>
    </div>
  );
};

const QualificationModal = ({ qualifiedPrograms, onClose, onApply }) => {
  const [selectedPrograms, setSelectedPrograms] = useState(qualifiedPrograms.slice(0, 4)); // Auto-select top 4
  const [applying, setApplying] = useState(false);

  const handleToggleProgram = (programId) => {
    setSelectedPrograms(prev => {
      const isSelected = prev.find(p => p.id === programId);
      if (isSelected) {
        return prev.filter(p => p.id !== programId);
      } else {
        const program = qualifiedPrograms.find(p => p.id === programId);
        return [...prev, program];
      }
    });
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApply(selectedPrograms);
      onClose();
    } catch (error) {
      console.error('Error applying:', error);
    } finally {
      setApplying(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 90) return '#28a745';
    if (score >= 80) return '#20c997';
    if (score >= 70) return '#007bff';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Qualified Programs Found!</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Based on your uploaded transcript, we found {qualifiedPrograms.length} programs you qualify for.
          Select the programs you'd like to apply to automatically.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setSelectedPrograms(qualifiedPrograms)}
              style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedPrograms([])}
              style={{ padding: '0.5rem 1rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Deselect All
            </button>
            <span style={{ alignSelf: 'center', color: '#666' }}>
              Selected: {selectedPrograms.length} of {qualifiedPrograms.length}
            </span>
          </div>
        </div>

        <div style={{ maxHeight: '400px', overflow: 'auto', marginBottom: '1.5rem' }}>
          {qualifiedPrograms.map(program => {
            const isSelected = selectedPrograms.find(p => p.id === program.id);
            return (
              <div
                key={program.id}
                style={{
                  border: `2px solid ${isSelected ? '#007bff' : '#ddd'}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  background: isSelected ? '#f0f8ff' : 'white',
                  cursor: 'pointer'
                }}
                onClick={() => handleToggleProgram(program.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{program.courseName}</h4>
                    <p style={{ margin: '0.25rem 0', color: '#666' }}>
                      {program.institution?.institutionName}
                    </p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                      Intake: {program.intakeYear} {program.intakeSemester}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        padding: '0.5rem 1rem',
                        background: getMatchColor(program.matchScore),
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}
                    >
                      {program.matchScore}% Match
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleProgram(program.id)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Apply
                    </div>
                  </div>
                </div>
                {program.qualificationReasons && program.qualificationReasons.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', fontSize: '0.9rem' }}>Why you qualify:</p>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.8rem' }}>
                      {program.qualificationReasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={selectedPrograms.length === 0 || applying}
            style={{
              padding: '0.75rem 1.5rem',
              background: selectedPrograms.length === 0 ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedPrograms.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {applying ? 'Applying...' : `Apply to ${selectedPrograms.length} Programs`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsManager;