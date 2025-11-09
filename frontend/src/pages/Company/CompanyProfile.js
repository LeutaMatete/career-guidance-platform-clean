import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const CompanyProfile = () => {
  const { userProfile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    foundedYear: '',
    headquarters: '',
    description: '',
    contactPerson: '',
    contactPosition: '',
    contactEmail: '',
    contactPhone: '',
    companyValues: '',
    specialties: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        companyName: userProfile.companyName || '',
        industry: userProfile.industry || '',
        companySize: userProfile.companySize || '',
        website: userProfile.website || '',
        foundedYear: userProfile.foundedYear || '',
        headquarters: userProfile.headquarters || '',
        description: userProfile.description || '',
        contactPerson: userProfile.contactPerson || '',
        contactPosition: userProfile.contactPosition || '',
        contactEmail: userProfile.contactEmail || userProfile.email || '',
        contactPhone: userProfile.contactPhone || userProfile.phone || '',
        companyValues: userProfile.companyValues || '',
        specialties: userProfile.specialties || ''
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateProfile(formData);
      setMessage('Company profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Hospitality',
    'Construction',
    'Transportation',
    'Energy',
    'Telecommunications',
    'Other'
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  return (
    <div>
      <div className="table-header">
        <h3>Company Profile</h3>
        {userProfile?.status === 'pending' && (
          <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
            <strong>Status: Pending Approval</strong> - Your company profile is under review by our admin team.
          </div>
        )}
      </div>

      <div className="admin-form">
        {message && (
          <div className={`message ${message.includes('Error') ? 'error-message' : 'success-message'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h4>Company Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Industry</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
              >
                <option value="">Select Industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company Size</label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                required
              >
                <option value="">Select Company Size</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Founded Year</label>
              <input
                type="number"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleChange}
                min="1800"
                max="2024"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Headquarters Location</label>
            <input
              type="text"
              name="headquarters"
              value={formData.headquarters}
              onChange={handleChange}
              placeholder="City, Country"
            />
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
            <label>Company Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Brief description of your company, mission, and vision..."
            />
          </div>

          <div className="form-group">
            <label>Specialties</label>
            <textarea
              name="specialties"
              value={formData.specialties}
              onChange={handleChange}
              rows="2"
              placeholder="Company specialties, key areas of expertise..."
            />
          </div>

          <div className="form-group">
            <label>Company Values</label>
            <textarea
              name="companyValues"
              value={formData.companyValues}
              onChange={handleChange}
              rows="2"
              placeholder="Core values and culture..."
            />
          </div>

          <h4>Contact Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Position</label>
              <input
                type="text"
                name="contactPosition"
                value={formData.contactPosition}
                onChange={handleChange}
                placeholder="e.g., HR Manager, Recruiter"
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

export default CompanyProfile;