import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const StudentProfile = () => {
  const { userProfile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    nationality: '',
    address: '',
    emergencyContact: '',
    highSchool: '',
    graduationYear: '',
    academicBackground: '',
    skills: '',
    careerInterests: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        dateOfBirth: userProfile.dateOfBirth || '',
        gender: userProfile.gender || '',
        nationality: userProfile.nationality || '',
        address: userProfile.address || '',
        emergencyContact: userProfile.emergencyContact || '',
        highSchool: userProfile.highSchool || '',
        graduationYear: userProfile.graduationYear || '',
        academicBackground: userProfile.academicBackground || '',
        skills: userProfile.skills || '',
        careerInterests: userProfile.careerInterests || ''
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
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

  return (
    <div>
      <div className="table-header">
        <h3>Student Profile</h3>
      </div>

      <div className="admin-form">
        {message && (
          <div className={`message ${message.includes('Error') ? 'error-message' : 'success-message'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h4>Personal Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nationality</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="Your nationality"
              />
            </div>

            <div className="form-group">
              <label>Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Emergency contact number"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Your current address"
            />
          </div>

          <h4>Academic Background</h4>
          <div className="form-row">
            <div className="form-group">
              <label>High School</label>
              <input
                type="text"
                name="highSchool"
                value={formData.highSchool}
                onChange={handleChange}
                placeholder="Name of your high school"
              />
            </div>

            <div className="form-group">
              <label>Graduation Year</label>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                min="1980"
                max="2024"
                placeholder="Year of graduation"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Academic Background</label>
            <textarea
              name="academicBackground"
              value={formData.academicBackground}
              onChange={handleChange}
              rows="3"
              placeholder="Previous education, qualifications, etc."
            />
          </div>

          <h4>Career Information</h4>
          <div className="form-group">
            <label>Skills</label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              rows="2"
              placeholder="List your skills (comma separated)"
            />
          </div>

          <div className="form-group">
            <label>Career Interests</label>
            <textarea
              name="careerInterests"
              value={formData.careerInterests}
              onChange={handleChange}
              rows="2"
              placeholder="Your career interests and goals"
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

export default StudentProfile;