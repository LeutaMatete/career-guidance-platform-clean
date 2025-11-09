import React, { useState, useEffect } from 'react';
import { getInstitutions, subscribeToInstitutions } from '../../services/institutionsService';
import { getFaculties, createFaculty, updateFaculty, deleteFaculty, subscribeToFaculties } from '../../services/facultiesService';
import { getCourses, createCourse, updateCourse, deleteCourse, subscribeToCoursesByFaculty } from '../../services/coursesService';

const FacultiesManager = () => {
  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFacultyForm, setShowFacultyForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    institutionId: '',
    description: ''
  });
  const [courseForm, setCourseForm] = useState({
    name: '',
    facultyId: '',
    duration: '',
    requirements: '',
    description: '',
    level: 'undergraduate',
    capacity: '',
    tuitionFee: ''
  });

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const unsubscribeInstitutions = subscribeToInstitutions((updatedInstitutions) => {
      setInstitutions(updatedInstitutions);
    });

    const unsubscribeFaculties = subscribeToFaculties((updatedFaculties) => {
      setFaculties(updatedFaculties);
    });

    return () => {
      unsubscribeInstitutions();
      unsubscribeFaculties();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [institutionsData, facultiesData, coursesData] = await Promise.all([
        getInstitutions(),
        getFaculties(),
        getCourses()
      ]);
      setInstitutions(institutionsData);
      setFaculties(facultiesData);
      setCourses(coursesData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editingFaculty) {
        await updateFaculty(editingFaculty.id, facultyForm);
        console.log('Faculty updated:', facultyForm);
      } else {
        await createFaculty(facultyForm);
        console.log('Faculty created:', facultyForm);
      }

      setShowFacultyForm(false);
      setEditingFaculty(null);
      setFacultyForm({ name: '', institutionId: '', description: '' });
    } catch (err) {
      setError('Failed to save faculty');
      console.error('Error saving faculty:', err);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseForm);
        console.log('Course updated:', courseForm);
      } else {
        await createCourse(courseForm);
        console.log('Course created:', courseForm);
      }

      setShowCourseForm(false);
      setEditingCourse(null);
      setCourseForm({
        name: '',
        facultyId: '',
        duration: '',
        requirements: '',
        description: '',
        level: 'undergraduate',
        capacity: '',
        tuitionFee: ''
      });
    } catch (err) {
      setError('Failed to save course');
      console.error('Error saving course:', err);
    }
  };

  const handleFacultyEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFacultyForm(faculty);
    setShowFacultyForm(true);
  };

  const handleFacultyDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty?')) {
      try {
        setError('');
        await deleteFaculty(id);
        console.log('Faculty deleted:', id);
      } catch (err) {
        setError('Failed to delete faculty');
        console.error('Error deleting faculty:', err);
      }
    }
  };

  const handleCourseEdit = (course) => {
    setEditingCourse(course);
    setCourseForm(course);
    setShowCourseForm(true);
  };

  const handleCourseDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        setError('');
        await deleteCourse(id);
        console.log('Course deleted:', id);
      } catch (err) {
        setError('Failed to delete course');
        console.error('Error deleting course:', err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading faculties and courses...</div>;
  }

  return (
    <div>
      {error && <div className="error-message">{error}</div>}

      <div className="table-header">
        <h3>Manage Faculties & Courses</h3>
        <div className="table-actions">
          <button className="btn btn-primary" onClick={() => setShowFacultyForm(true)}>
            Add Faculty
          </button>
          <button className="btn btn-primary" onClick={() => setShowCourseForm(true)}>
            Add Course
          </button>
        </div>
      </div>

      {/* Faculty Form */}
      {showFacultyForm && (
        <div className="admin-form">
          <h4>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h4>
          <form onSubmit={handleFacultySubmit}>
            <div className="form-group">
              <label>Faculty Name</label>
              <input
                type="text"
                value={facultyForm.name}
                onChange={(e) => setFacultyForm({...facultyForm, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Institution</label>
              <select
                value={facultyForm.institutionId}
                onChange={(e) => setFacultyForm({...facultyForm, institutionId: e.target.value})}
                required
              >
                <option value="">Select Institution</option>
                {institutions.map(institution => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={facultyForm.description}
                onChange={(e) => setFacultyForm({...facultyForm, description: e.target.value})}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowFacultyForm(false);
                  setEditingFaculty(null);
                  setFacultyForm({ name: '', institutionId: '', description: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course Form */}
      {showCourseForm && (
        <div className="admin-form">
          <h4>{editingCourse ? 'Edit Course' : 'Add New Course'}</h4>
          <form onSubmit={handleCourseSubmit}>
            <div className="form-group">
              <label>Course Name</label>
              <input
                type="text"
                value={courseForm.name}
                onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Faculty</label>
              <select
                value={courseForm.facultyId}
                onChange={(e) => setCourseForm({...courseForm, facultyId: e.target.value})}
                required
              >
                <option value="">Select Faculty</option>
                {faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Level</label>
              <select
                value={courseForm.level}
                onChange={(e) => setCourseForm({...courseForm, level: e.target.value})}
                required
              >
                <option value="undergraduate">Undergraduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="diploma">Diploma</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                value={courseForm.duration}
                onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                placeholder="e.g., 4 years"
                required
              />
            </div>

            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                value={courseForm.capacity}
                onChange={(e) => setCourseForm({...courseForm, capacity: e.target.value})}
                placeholder="Maximum number of students"
              />
            </div>

            <div className="form-group">
              <label>Tuition Fee (ZAR)</label>
              <input
                type="number"
                value={courseForm.tuitionFee}
                onChange={(e) => setCourseForm({...courseForm, tuitionFee: e.target.value})}
                placeholder="Annual tuition fee"
              />
            </div>

            <div className="form-group">
              <label>Requirements</label>
              <textarea
                value={courseForm.requirements}
                onChange={(e) => setCourseForm({...courseForm, requirements: e.target.value})}
                rows="3"
                placeholder="Admission requirements"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingCourse ? 'Update Course' : 'Add Course'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowCourseForm(false);
                  setEditingCourse(null);
                  setCourseForm({
                    name: '',
                    facultyId: '',
                    duration: '',
                    requirements: '',
                    description: '',
                    level: 'undergraduate',
                    capacity: '',
                    tuitionFee: ''
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
        <h4>Faculties</h4>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Institution</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculties.map(faculty => (
              <tr key={faculty.id}>
                <td>{faculty.name}</td>
                <td>{institutions.find(inst => inst.id === faculty.institutionId)?.name}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleFacultyEdit(faculty)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleFacultyDelete(faculty.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="data-table" style={{ marginTop: '2rem' }}>
        <h4>Courses</h4>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Faculty</th>
              <th>Level</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id}>
                <td>{course.name}</td>
                <td>{faculties.find(fac => fac.id === course.facultyId)?.name}</td>
                <td>{course.level}</td>
                <td>{course.duration}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleCourseEdit(course)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleCourseDelete(course.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultiesManager;