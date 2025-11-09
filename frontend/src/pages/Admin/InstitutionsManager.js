import React, { useState, useEffect } from 'react';
import { getInstitutions, createInstitution, updateInstitution, deleteInstitution, subscribeToInstitutions } from '../../services/institutionsService';

const InstitutionsManager = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'university',
    location: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    loadInstitutions();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToInstitutions((updatedInstitutions) => {
      setInstitutions(updatedInstitutions);
    });

    return () => unsubscribe();
  }, []);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getInstitutions();
      setInstitutions(data);
    } catch (err) {
      setError('Failed to load institutions');
      console.error('Error loading institutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editingInstitution) {
        await updateInstitution(editingInstitution.id, formData);
        console.log('Institution updated:', formData);
      } else {
        await createInstitution(formData);
        console.log('Institution created:', formData);
      }

      setShowForm(false);
      setEditingInstitution(null);
      setFormData({
        name: '', type: 'university', location: '', contactEmail: '', contactPhone: '', website: '', description: ''
      });
    } catch (err) {
      setError('Failed to save institution');
      console.error('Error saving institution:', err);
    }
  };

  const handleEdit = (institution) => {
    setEditingInstitution(institution);
    setFormData(institution);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this institution?')) {
      try {
        setError('');
        await deleteInstitution(id);
        console.log('Institution deleted:', id);
      } catch (err) {
        setError('Failed to delete institution');
        console.error('Error deleting institution:', err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading institutions...</div>;
  }

  return (
    <div>
      {error && <div className="error-message">{error}</div>}

      <div className="table-header">
        <h3>Manage Institutions</h3>
        <div className="table-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add Institution
          </button>
        </div>
      </div>

      {showForm && (
        <div className="admin-form">
          <h4>{editingInstitution ? 'Edit Institution' : 'Add New Institution'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Institution Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                required
              >
                <option value="university">University</option>
                <option value="college">College</option>
                <option value="institute">Institute</option>
                <option value="polytechnic">Polytechnic</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingInstitution ? 'Update Institution' : 'Add Institution'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingInstitution(null);
                  setFormData({
                    name: '', type: 'university', location: '', contactEmail: '', contactPhone: '', website: '', description: ''
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
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((institution) => (
                <tr key={institution.id}>
                  <td>{institution.name}</td>
                  <td>{institution.type}</td>
                  <td>{institution.location}</td>
                  <td>
                    <div>{institution.contactEmail}</div>
                    <div>{institution.contactPhone}</div>
                  </td>
                  <td>
                    <span className={`status-badge status-${institution.status || 'active'}`}>
                      {institution.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(institution)}
                      >
                        Edit
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(institution.id)}
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

export default InstitutionsManager;