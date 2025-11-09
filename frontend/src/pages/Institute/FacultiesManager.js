import React, { useState, useEffect } from 'react';

const FacultiesManager = () => {
  // Mock data for demo purposes
  const [faculties, setFaculties] = useState([
    {
      id: '1',
      name: 'Faculty of Engineering',
      code: 'ENG',
      description: 'Engineering and Technology programs',
      dean: 'Dr. John Smith',
      contactEmail: 'dean.eng@uj.ac.za',
      contactPhone: '+27 11 559 2000',
      courseCount: 12,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Faculty of Business',
      code: 'BUS',
      description: 'Business and Management programs',
      dean: 'Prof. Sarah Johnson',
      contactEmail: 'dean.bus@uj.ac.za',
      contactPhone: '+27 11 559 2100',
      courseCount: 8,
      createdAt: '2024-01-16T10:00:00Z'
    },
    {
      id: '3',
      name: 'Faculty of Science',
      code: 'SCI',
      description: 'Science and Applied Sciences programs',
      dean: 'Dr. Michael Brown',
      contactEmail: 'dean.sci@uj.ac.za',
      contactPhone: '+27 11 559 2200',
      courseCount: 15,
      createdAt: '2024-01-17T10:00:00Z'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    dean: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    console.log('Faculties loaded');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const facultyData = {
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    if (editingFaculty) {
      const updatedFaculties = faculties.map(faculty =>
        faculty.id === editingFaculty.id
          ? { ...faculty, ...facultyData }
          : faculty
      );
      setFaculties(updatedFaculties);
      console.log('Faculty updated:', facultyData);
    } else {
      const newFaculty = {
        id: Date.now().toString(),
        ...facultyData,
        courseCount: 0
      };
      setFaculties([...faculties, newFaculty]);
      console.log('Faculty added:', facultyData);
    }

    setShowForm(false);
    setEditingFaculty(null);
    setFormData({
      name: '', code: '', description: '', dean: '', contactEmail: '', contactPhone: ''
    });
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData(faculty);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this faculty? This will also delete all associated courses.')) {
      const updatedFaculties = faculties.filter(faculty => faculty.id !== id);
      setFaculties(updatedFaculties);
      console.log('Faculty deleted:', id);
    }
  };

  return (
    <div>
      <div className="table-header">
        <h3>Manage Faculties</h3>
        <div className="table-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add Faculty
          </button>
        </div>
      </div>

      {showForm && (
        <div className="admin-form">
          <h4>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Faculty Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Faculty Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                  placeholder="e.g., CS, ENG, BUS"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Dean Name</label>
                <input
                  type="text"
                  value={formData.dean}
                  onChange={(e) => setFormData({...formData, dean: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  setShowForm(false);
                  setEditingFaculty(null);
                  setFormData({
                    name: '', code: '', description: '', dean: '', contactEmail: '', contactPhone: ''
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
                <th>Dean</th>
                <th>Contact</th>
                <th>Courses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map((faculty) => (
                <tr key={faculty.id}>
                  <td><strong>{faculty.code}</strong></td>
                  <td>{faculty.name}</td>
                  <td>{faculty.dean || '-'}</td>
                  <td>
                    <div>{faculty.contactEmail || '-'}</div>
                    <div>{faculty.contactPhone || '-'}</div>
                  </td>
                  <td>
                    <span className="stat-value" style={{ fontSize: '1rem' }}>
                      {faculty.courseCount || 0}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(faculty)}
                      >
                        Edit
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(faculty.id)}
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
    </div>
  );
};

export default FacultiesManager;