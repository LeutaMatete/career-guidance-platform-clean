import React, { useState, useEffect } from 'react';

const CoursesManager = () => {
  // Mock data for demo purposes
  const [courses, setCourses] = useState([
    {
      id: '1',
      name: 'Bachelor of Computer Science',
      code: 'BCS101',
      facultyId: '1',
      duration: '4 years',
      level: 'undergraduate',
      tuitionFee: '45000',
      requirements: 'Mathematics and English proficiency',
      description: 'Comprehensive computer science program covering programming, algorithms, and software development.',
      capacity: '120',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Master of Business Administration',
      code: 'MBA201',
      facultyId: '2',
      duration: '2 years',
      level: 'postgraduate',
      tuitionFee: '65000',
      requirements: 'Bachelor\'s degree and 2 years work experience',
      description: 'Advanced business management program for aspiring leaders.',
      capacity: '60',
      createdAt: '2024-01-16T10:00:00Z'
    },
    {
      id: '3',
      name: 'Bachelor of Engineering',
      code: 'BENG301',
      facultyId: '1',
      duration: '4 years',
      level: 'undergraduate',
      tuitionFee: '50000',
      requirements: 'Mathematics, Physics, and English',
      description: 'Engineering program focusing on practical applications and innovation.',
      capacity: '100',
      createdAt: '2024-01-17T10:00:00Z'
    }
  ]);

  const [faculties, setFaculties] = useState([
    {
      id: '1',
      name: 'Faculty of Engineering',
      code: 'ENG'
    },
    {
      id: '2',
      name: 'Faculty of Business',
      code: 'BUS'
    },
    {
      id: '3',
      name: 'Faculty of Science',
      code: 'SCI'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    facultyId: '',
    duration: '',
    level: 'undergraduate',
    tuitionFee: '',
    requirements: '',
    description: '',
    capacity: ''
  });

  useEffect(() => {
    console.log('Courses and faculties loaded');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const courseData = {
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    if (editingCourse) {
      const updatedCourses = courses.map(course =>
        course.id === editingCourse.id
          ? { ...course, ...courseData }
          : course
      );
      setCourses(updatedCourses);
      console.log('Course updated:', courseData);
    } else {
      const newCourse = {
        id: Date.now().toString(),
        ...courseData
      };
      setCourses([...courses, newCourse]);
      console.log('Course added:', courseData);
    }

    setShowForm(false);
    setEditingCourse(null);
    setFormData({
      name: '', code: '', facultyId: '', duration: '', level: 'undergraduate',
      tuitionFee: '', requirements: '', description: '', capacity: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const updatedCourses = courses.filter(course => course.id !== id);
      setCourses(updatedCourses);
      console.log('Course deleted:', id);
    }
  };

  return (
    <div>
      <div className="table-header">
        <h3>Manage Courses</h3>
        <div className="table-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={faculties.length === 0}
          >
            Add Course
          </button>
        </div>
        {faculties.length === 0 && (
          <p style={{ color: '#dc3545', marginTop: '0.5rem' }}>
            Please create at least one faculty before adding courses.
          </p>
        )}
      </div>

      {showForm && (
        <div className="admin-form">
          <h4>{editingCourse ? 'Edit Course' : 'Add New Course'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Course Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Faculty</label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
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
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  required
                >
                  <option value="undergraduate">Undergraduate</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="diploma">Diploma</option>
                  <option value="certificate">Certificate</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="e.g., 4 years, 2 semesters"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tuition Fee (LSL)</label>
                <input
                  type="number"
                  value={formData.tuitionFee}
                  onChange={(e) => setFormData({...formData, tuitionFee: e.target.value})}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                min="1"
                placeholder="Maximum number of students"
              />
            </div>

            <div className="form-group">
              <label>Requirements</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                rows="3"
                placeholder="Entry requirements for this course..."
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                placeholder="Course description and overview..."
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
                  setShowForm(false);
                  setEditingCourse(null);
                  setFormData({
                    name: '', code: '', facultyId: '', duration: '', level: 'undergraduate', 
                    tuitionFee: '', requirements: '', description: '', capacity: ''
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
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Faculty</th>
                <th>Level</th>
                <th>Duration</th>
                <th>Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const faculty = faculties.find(f => f.id === course.facultyId);
                return (
                  <tr key={course.id}>
                    <td><strong>{course.code}</strong></td>
                    <td>{course.name}</td>
                    <td>{faculty?.name || '-'}</td>
                    <td>
                      <span className="status-badge" style={{ textTransform: 'capitalize' }}>
                        {course.level}
                      </span>
                    </td>
                    <td>{course.duration}</td>
                    <td>{course.tuitionFee ? `LSL ${course.tuitionFee}` : '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => {
                            setEditingCourse(course);
                            setFormData(course);
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(course.id)}
                        >
                          Delete
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

export default CoursesManager;