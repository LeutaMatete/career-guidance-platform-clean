import React, { useState, useEffect } from 'react';
import { getCourses } from '../../services/coursesService';
import { getAdmissions, createAdmission, updateAdmissionStatus, subscribeToAdmissions } from '../../services/admissionsService';

const AdmissionsManager = () => {
  const [courses, setCourses] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    intakeYear: new Date().getFullYear(),
    deadline: '',
    requirements: '',
    seats: 0,
    status: 'open'
  });

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAdmissions((updatedAdmissions) => {
      setAdmissions(updatedAdmissions);
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [coursesData, admissionsData] = await Promise.all([
        getCourses(),
        getAdmissions()
      ]);
      setCourses(coursesData);
      setAdmissions(admissionsData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAdmission = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await createAdmission(formData);
      console.log('Admission published:', formData);

      setShowForm(false);
      setEditingAdmission(null);
      setFormData({
        courseId: '',
        intakeYear: new Date().getFullYear(),
        deadline: '',
        requirements: '',
        seats: 0,
        status: 'open'
      });
    } catch (err) {
      setError('Failed to publish admission');
      console.error('Error publishing admission:', err);
    }
  };

  const handleCloseAdmission = async (id) => {
    try {
      setError('');
      await updateAdmissionStatus(id, 'closed');
      console.log('Admission closed:', id);
    } catch (err) {
      setError('Failed to close admission');
      console.error('Error closing admission:', err);
    }
  };

  const handleEditAdmission = (admission) => {
    setEditingAdmission(admission);
    setFormData(admission);
    setShowForm(true);
  };

  if (loading) {
    return <div className="loading">Loading admissions...</div>;
  }

  return (
    <div>
      {error && <div className="error-message">{error}</div>}

      <div className="table-header">
        <h3>Manage Admissions</h3>
        <div className="table-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Publish Admission
          </button>
        </div>
      </div>

      {/* Admission Form */}
      {showForm && (
        <div className="admin-form">
          <h4>{editingAdmission ? 'Edit Admission' : 'Publish New Admission'}</h4>
          <form onSubmit={handlePublishAdmission}>
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
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Intake Year</label>
              <input
                type="number"
                value={formData.intakeYear}
                onChange={(e) => setFormData({...formData, intakeYear: parseInt(e.target.value)})}
                min="2024"
                max="2030"
                required
              />
            </div>

            <div className="form-group">
              <label>Application Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Requirements</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                rows="3"
                placeholder="Admission requirements"
                required
              />
            </div>

            <div className="form-group">
              <label>Available Seats</label>
              <input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({...formData, seats: parseInt(e.target.value)})}
                min="1"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingAdmission ? 'Update Admission' : 'Publish Admission'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingAdmission(null);
                  setFormData({
                    courseId: '',
                    intakeYear: new Date().getFullYear(),
                    deadline: '',
                    requirements: '',
                    seats: 0,
                    status: 'open'
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Intake Year</th>
              <th>Deadline</th>
              <th>Applications</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admissions.map(admission => {
              const course = courses.find(c => c.id === admission.courseId);
              return (
                <tr key={admission.id}>
                  <td>{course?.name}</td>
                  <td>{admission.intakeYear}</td>
                  <td>{new Date(admission.deadline).toLocaleDateString()}</td>
                  <td>{admission.applications || 0}</td>
                  <td>
                    <span className={`status-badge status-${admission.status}`}>
                      {admission.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {admission.status === 'open' && (
                        <button
                          className="action-btn btn-danger"
                          onClick={() => handleCloseAdmission(admission.id)}
                        >
                          Close
                        </button>
                      )}
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditAdmission(admission)}
                      >
                        Edit
                      </button>
                      <button className="action-btn view-btn">View Applications</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdmissionsManager;