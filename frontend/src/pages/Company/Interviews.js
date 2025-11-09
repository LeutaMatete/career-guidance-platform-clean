import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Interviews = () => {
  const { userProfile } = useAuth();
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    loadInterviews();
  }, [userProfile]);

  const loadInterviews = async () => {
    if (!userProfile?.uid) return;

    try {
      const q = query(
        collection(db, 'interviews'),
        where('companyId', '==', userProfile.uid)
      );
      const querySnapshot = await getDocs(q);
      const interviewsList = [];
      querySnapshot.forEach((doc) => {
        interviewsList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by interview date
      interviewsList.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
      setInterviews(interviewsList);
    } catch (error) {
      console.error('Error loading interviews:', error);
    }
  };

  const updateInterviewStatus = async (interviewId, status, feedback = '') => {
    try {
      await updateDoc(doc(db, 'interviews', interviewId), {
        status,
        feedback,
        updatedAt: new Date().toISOString()
      });
      loadInterviews();
    } catch (error) {
      console.error('Error updating interview:', error);
    }
  };

  const getInterviewStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'no-show': return '#6c757d';
      default: return '#ffc107';
    }
  };

  return (
    <div>
      <div className="table-header">
        <h3>Interview Management</h3>
      </div>

      <div className="applicant-cards">
        {interviews.map(interview => (
          <div key={interview.id} className="applicant-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h4>{interview.studentName}</h4>
                <p style={{ margin: 0, color: '#666' }}>
                  {interview.jobTitle} • {interview.interviewType}
                </p>
              </div>
              <span 
                className="status-badge"
                style={{ background: getInterviewStatusColor(interview.status) }}
              >
                {interview.status}
              </span>
            </div>

            <p><strong>Date & Time:</strong> {new Date(interview.scheduledDate).toLocaleString()}</p>
            <p><strong>Duration:</strong> {interview.duration} minutes</p>
            <p><strong>Interviewer:</strong> {interview.interviewer}</p>
            <p><strong>Location/Platform:</strong> {interview.location}</p>

            {interview.notes && (
              <p><strong>Notes:</strong> {interview.notes}</p>
            )}

            {interview.feedback && (
              <div style={{ margin: '1rem 0', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
                <strong>Feedback:</strong> {interview.feedback}
              </div>
            )}

            <div className="form-actions" style={{ marginTop: '1rem' }}>
              {interview.status === 'scheduled' && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => updateInterviewStatus(interview.id, 'completed', 'Interview completed successfully')}
                  >
                    Mark Completed
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => updateInterviewStatus(interview.id, 'cancelled', 'Interview cancelled')}
                  >
                    Cancel
                  </button>
                </>
              )}
              <button className="btn btn-secondary">
                Reschedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {interviews.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h4>No interviews scheduled</h4>
          <p>Interviews will appear here once scheduled with shortlisted candidates.</p>
        </div>
      )}
    </div>
  );
};

export default Interviews;