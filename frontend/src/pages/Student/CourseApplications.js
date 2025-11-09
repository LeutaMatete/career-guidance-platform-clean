import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const CourseApplications = () => {
  const { userProfile } = useAuth();
  const [admissions, setAdmissions] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [applicationData, setApplicationData] = useState({
    academicGrades: '',
    personalStatement: '',
    references: '',
    additionalInfo: ''
  });

  useEffect(() => {
    loadAdmissions();
    loadMyApplications();
  }, [userProfile]);

  const loadAdmissions = async () => {
    try {
      const q = query(
        collection(db, 'admissions'),
        where('status', '==', 'open')
      );
      const querySnapshot = await getDocs(q);
      const admissionsList = [];
      querySnapshot.forEach((doc) => {
        admissionsList.push({ id: doc.id, ...doc.data() });
      });
      setAdmissions(admissionsList);
    } catch (error) {
      console.error('Error loading admissions:', error);
    }
  };

  const loadMyApplications = async () => {
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
      setMyApplications(applicationsList);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const canApplyToInstitution = (institutionId) => {
    const institutionApplications = myApplications.filter(
      app => app.institutionId === institutionId
    );
    return institutionApplications.length < 2;
  };

  const handleApply = (admission) => {
    if (!canApplyToInstitution(admission.institutionId)) {
      alert('You can only apply to maximum 2 courses per institution.');
      return;
    }

    setSelectedAdmission(admission);
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedAdmission || !userProfile) return;

    try {
      const application = {
        studentId: userProfile.uid,
        studentName: userProfile.name,
        studentEmail: userProfile.email,
        studentPhone: userProfile.phone,
        admissionId: selectedAdmission.id,
        institutionId: selectedAdmission.institutionId,
        institutionName: selectedAdmission.institutionName,
        courseId: selectedAdmission.courseId,
        courseName: selectedAdmission.courseName,
        intakeYear: selectedAdmission.intakeYear,
        intakeSemester: selectedAdmission.intakeSemester,
        ...applicationData,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        applicationNumber: `APP-${Date.now()}`
      };

      await addDoc(collection(db, 'applications'), application);

      // Update admission statistics
      const admissionRef = doc(db, 'admissions', selectedAdmission.id);
      const admissionDoc = await getDoc(admissionRef);
      if (admissionDoc.exists()) {
        const currentData = admissionDoc.data();
        await updateDoc(admissionRef, {
          applicationsReceived: (currentData.applicationsReceived || 0) + 1
        });
      }

      setShowApplicationForm(false);
      setSelectedAdmission(null);
      setApplicationData({
        academicGrades: '',
        personalStatement: '',
        references: '',
        additionalInfo: ''
      });
      loadMyApplications();
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    }
  };

  const getApplicationStatus = (admissionId) => {
    const application = myApplications.find(app => app.admissionId === admissionId);
    return application ? application.status : null;
  };

  return (
    <div>
      <div className="table-header">
        <h3>Course Applications</h3>
        <p>You can apply to maximum 2 courses per institution</p>
      </div>

      {showApplicationForm && selectedAdmission && (
        <div className="admin-form">
          <h4>Apply for {selectedAdmission.courseName}</h4>
          <p><strong>Institution:</strong> {selectedAdmission.institutionName}</p>
          <p><strong>Intake:</strong> {selectedAdmission.intakeYear} {selectedAdmission.intakeSemester}</p>
          
          <form onSubmit={handleSubmitApplication}>
            <div className="form-group">
              <label>Academic Grades/Results</label>
              <textarea
                value={applicationData.academicGrades}
                onChange={(e) => setApplicationData({...applicationData, academicGrades: e.target.value})}
                rows="3"
                placeholder="Enter your academic grades or attach relevant results..."
                required
              />
            </div>

            <div className="form-group">
              <label>Personal Statement</label>
              <textarea
                value={applicationData.personalStatement}
                onChange={(e) => setApplicationData({...applicationData, personalStatement: e.target.value})}
                rows="4"
                placeholder="Why do you want to study this course? What are your career goals?"
                required
              />
            </div>

            <div className="form-group">
              <label>References</label>
              <textarea
                value={applicationData.references}
                onChange={(e) => setApplicationData({...applicationData, references: e.target.value})}
                rows="2"
                placeholder="Names and contact information of references (teachers, employers, etc.)"
              />
            </div>

            <div className="form-group">
              <label>Additional Information</label>
              <textarea
                value={applicationData.additionalInfo}
                onChange={(e) => setApplicationData({...applicationData, additionalInfo: e.target.value})}
                rows="2"
                placeholder="Any additional information you'd like to provide..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Submit Application
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowApplicationForm(false);
                  setSelectedAdmission(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <h4>Available Courses</h4>
      <div className="application-cards">
        {admissions.map(admission => {
          const applicationStatus = getApplicationStatus(admission.id);
          const canApply = canApplyToInstitution(admission.institutionId);
          
          return (
            <div key={admission.id} className="application-card">
              <h4>{admission.courseName}</h4>
              <p><strong>Institution:</strong> {admission.institutionName}</p>
              <p><strong>Intake:</strong> {admission.intakeYear} {admission.intakeSemester}</p>
              <p><strong>Application Deadline:</strong> {new Date(admission.applicationDeadline).toLocaleDateString()}</p>
              <p><strong>Seats Available:</strong> {admission.seatsAvailable}</p>
              
              {applicationStatus ? (
                <div className="application-status status-pending">
                  Already Applied - {applicationStatus}
                </div>
              ) : (
                <button 
                  className={`btn ${canApply ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleApply(admission)}
                  disabled={!canApply}
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  {canApply ? 'Apply Now' : 'Max Applications Reached'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <h4>My Applications</h4>
      {myApplications.length === 0 ? (
        <p>You haven't submitted any applications yet.</p>
      ) : (
        <div className="data-table">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Institution</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Application ID</th>
                </tr>
              </thead>
              <tbody>
                {myApplications.map(application => (
                  <tr key={application.id}>
                    <td>{application.courseName}</td>
                    <td>{application.institutionName}</td>
                    <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`application-status status-${application.status}`}>
                        {application.status}
                      </span>
                    </td>
                    <td>{application.applicationNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseApplications;