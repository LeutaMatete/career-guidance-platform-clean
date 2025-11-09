import React, { useState, useEffect } from 'react';

const InstituteProfile = () => {
  // Mock data for demo purposes
  const [formData, setFormData] = useState({
    institutionName: 'University of Johannesburg',
    type: 'university',
    location: 'Johannesburg, Gauteng',
    contactEmail: 'info@uj.ac.za',
    contactPhone: '+27 11 559 2000',
    website: 'https://www.uj.ac.za',
    description: 'The University of Johannesburg (UJ) is a public university located in Johannesburg, South Africa. It was established in 2005 through the merger of the Rand Afrikaans University, Technikon Witwatersrand, and the Soweto and East Rand campuses of Vista University.',
    establishedYear: '2005',
    accreditation: 'Council on Higher Education (CHE), South African Qualifications Authority (SAQA)',
    totalStudents: '50000',
    campusFacilities: 'Libraries, Computer Labs, Sports Facilities, Student Residences, Medical Center'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('Profile loaded');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Simulate API call
    setTimeout(() => {
      console.log('Profile updated:', formData);
      setMessage('Profile updated successfully!');
      setLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div>
      <div className="table-header">
        <h3>Institute Profile</h3>
      </div>

      <div className="admin-form">
        {message && (
          <div className={`message ${message.includes('Error') ? 'error-message' : 'success-message'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Institution Name</label>
              <input
                type="text"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Institution Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="university">University</option>
                <option value="college">College</option>
                <option value="institute">Institute</option>
                <option value="polytechnic">Polytechnic</option>
                <option value="vocational">Vocational School</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="City, District"
              />
            </div>

            <div className="form-group">
              <label>Established Year</label>
              <input
                type="number"
                name="establishedYear"
                value={formData.establishedYear}
                onChange={handleChange}
                min="1900"
                max="2024"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label>Accreditation</label>
            <input
              type="text"
              name="accreditation"
              value={formData.accreditation}
              onChange={handleChange}
              placeholder="Accrediting bodies"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Students</label>
              <input
                type="number"
                name="totalStudents"
                value={formData.totalStudents}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Campus Facilities</label>
              <input
                type="text"
                name="campusFacilities"
                value={formData.campusFacilities}
                onChange={handleChange}
                placeholder="Library, Labs, Sports, etc."
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Brief description of your institution..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstituteProfile;