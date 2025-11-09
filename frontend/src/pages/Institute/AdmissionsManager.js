import React, { useState, useEffect } from 'react';
import '../../Main.css';

const AdmissionsManager = () => {
  // Mock data for demo purposes
  const [admissions, setAdmissions] = useState([
    {
      id: '1',
      courseId: '1',
      courseName: 'Bachelor of Computer Science',
      intakeYear: 2024,
      intakeSemester: 'fall',
      applicationDeadline: '2024-08-31',
      classesStart: '2024-09-15',
      requirements: 'Mathematics and English proficiency required',
      seatsAvailable: 120,
      applicationFee: 500,
      status: 'open',
      applicationsReceived: 45,
      applicationsApproved: 32,
      applicationsRejected: 8,
      publishedAt: '2024-06-01T10:00:00Z'
    },
    {
      id: '2',
      courseId: '2',
      courseName: 'Master of Business Administration',
      intakeYear: 2024,
      intakeSemester: 'spring',
      applicationDeadline: '2024-12-15',
      classesStart: '2025-01-15',
      requirements: 'Bachelor\'s degree and 2 years work experience',
      seatsAvailable: 60,
      applicationFee: 750,
      status: 'open',
      applicationsReceived: 28,
      applicationsApproved: 18,
      applicationsRejected: 5,
      publishedAt: '2024-06-15T10:00:00Z'
    },
    {
      id: '3',
      courseId: '3',
      courseName: 'Bachelor of Engineering',
      intakeYear: 2024,
      intakeSemester: 'fall',
      applicationDeadline: '2024-08-31',
      classesStart: '2024-09-15',
      requirements: 'Mathematics, Physics, and English',
      seatsAvailable: 100,
      applicationFee: 600,
      status: 'closed',
      applicationsReceived: 95,
      applicationsApproved: 85,
      applicationsRejected: 10,
      publishedAt: '2024-06-01T10:00:00Z',
      closedAt: '2024-08-31T23:59:59Z'
    }
  ]);

  const [courses, setCourses] = useState([
    {
      id: '1',
      name: 'Bachelor of Computer Science',
      code: 'BCS101'
    },
    {
      id: '2',
      name: 'Master of Business Administration',
      code: 'MBA201'
    },
    {
      id: '3',
      name: 'Bachelor of Engineering',
      code: 'BENG301'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    intakeYear: new Date().getFullYear(),
    intakeSemester: 'fall',
    applicationDeadline: '',
    classesStart: '',
    requirements: '',
    seatsAvailable: '',
    applicationFee: ''
  });

  useEffect(() => {
    console.log('Admissions and courses loaded');
  }, []);

  const handlePublishAdmission = (e) => {
    e.preventDefault();
    const selectedCourse = courses.find(c => c.id === formData.courseId);

    const admissionData = {
      ...formData,
      courseName: selectedCourse?.name,
      publishedAt: new Date().toISOString(),
      status: 'open',
      applicationsReceived: 0,
      applicationsApproved: 0,
      applicationsRejected: 0
    };

    const newAdmission = {
      id: Date.now().toString(),
      ...admissionData
    };
    setAdmissions([...admissions, newAdmission]);
    console.log('Admission published:', admissionData);

    setShowForm(false);
    setFormData({
      courseId: '', intakeYear: new Date().getFullYear(), intakeSemester: 'fall',
      applicationDeadline: '', classesStart: '', requirements: '', seatsAvailable: '', applicationFee: ''
    });
  };

  const handleCloseAdmission = (admissionId) => {
    const updatedAdmissions = admissions.map(admission =>
      admission.id === admissionId
        ? { ...admission, status: 'closed', closedAt: new Date().toISOString() }
        : admission
    );
    setAdmissions(updatedAdmissions);
    console.log('Admission closed:', admissionId);
  };

  const handleReopenAdmission = (admissionId) => {
    const updatedAdmissions = admissions.map(admission =>
      admission.id === admissionId
        ? { ...admission, status: 'open', reopenedAt: new Date().toISOString() }
        : admission
    );
    setAdmissions(updatedAdmissions);
    console.log('Admission reopened:', admissionId);
  };

  const getApplicationStats = (admission) => {
    const total = admission.applicationsReceived || 0;
    const approved = admission.applicationsApproved || 0;
    const rejected = admission.applicationsRejected || 0;
    const pending = total - approved - rejected;
    
    return { total, approved, rejected, pending };
  };

  return (
    <div>
      <div className="table-header">
        <h3>Manage Admissions</h3>
        <div className="table-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={courses.length === 0}
          >
            Publish Admission
          </button>
        </div>
        {courses.length === 0 && (
          <p style={{ color: '#dc3545', marginTop: '0.5rem' }}>
            Please create at least one course before publishing admissions.
          </p>
        )}
      </div>

      {showForm && (
        <div className="admin-form">
          <h4>Publish New Admission</h4>
          <form onSubmit={handlePublishAdmission}>
            <div className="form-row">
              <div className="form-group">
                <label>Course</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Intake Year</label>
                <input
                  type="number"
                  value={formData.intakeYear}
                  onChange={(e) => setFormData({...formData, intakeYear: e.target.value})}
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 2}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Intake Semester</label>
                <select
                  value={formData.intakeSemester}
                  onChange={(e) => setFormData({...formData, intakeSemester: e.target.value})}
                  required
                >
                  <option value="fall">Fall Semester</option>
                  <option value="spring">Spring Semester</option>
                  <option value="summer">Summer Semester</option>
                  <option value="winter">Winter Semester</option>
                </select>
              </div>

              <div className="form-group">
                <label>Seats Available</label>
                <input
                  type="number"
                  value={formData.seatsAvailable}
                  onChange={(e) => setFormData({...formData, seatsAvailable: e.target.value})}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Application Deadline</label>
                <input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Classes Start Date</label>
                <input
                  type="date"
                  value={formData.classesStart}
                  onChange={(e) => setFormData({...formData, classesStart: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Application Fee (LSL)</label>
              <input
                type="number"
                value={formData.applicationFee}
                onChange={(e) => setFormData({...formData, applicationFee: e.target.value})}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Additional Requirements</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                rows="3"
                placeholder="Any additional application requirements..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Publish Admission
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-table">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Intake</th>
                <th>Deadline</th>
                <th>Applications</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map((admission) => {
                const stats = getApplicationStats(admission);
                return (
                  <tr key={admission.id}>
                    <td>
                      <div><strong>{admission.courseName}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {admission.intakeYear} {admission.intakeSemester}
                      </div>
                    </td>
                    <td>
                      {new Date(admission.classesStart).toLocaleDateString()}
                    </td>
                    <td>
                      {new Date(admission.applicationDeadline).toLocaleDateString()}
                    </td>
                    <td>
                      <div>Total: {stats.total}</div>
                      <div style={{ fontSize: '0.8rem' }}>
                        {stats.approved} {stats.rejected} {stats.pending}
                      </div>
                    </td>
                    <td>{admission.seatsAvailable}</td>
                    <td>
                      <span className={`status-badge status-${admission.status}`}>
                        {admission.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {admission.status === 'open' ? (
                          <button 
                            className="action-btn btn-danger"
                            onClick={() => handleCloseAdmission(admission.id)}
                          >
                            Close
                          </button>
                        ) : (
                          <button 
                            className="action-btn btn-success"
                            onClick={() => handleReopenAdmission(admission.id)}
                          >
                            Reopen
                          </button>
                        )}
                        <button className="action-btn edit-btn">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsManager;