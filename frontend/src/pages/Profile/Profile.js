import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../Main.css';

const Profile = () => {
  const { userProfile, updateProfile, resendVerification, isEmailVerified } = useAuth();
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    institutionName: userProfile?.institutionName || '',
    companyName: userProfile?.companyName || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        return;
      }
    }
    
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: cleaned
        }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFormData({
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      institutionName: userProfile?.institutionName || '',
      companyName: userProfile?.companyName || ''
    });
    setIsEditing(true);
    setMessage('');
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage('');
    setError('');
  };

  const formatPhoneDisplay = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Personal Information</h2>
            {!isEditing && (
              <button onClick={handleEdit} className="edit-btn">
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div className="message success">
              {message}
            </div>
          )}

          {error && (
            <div className="message error">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  pattern="[a-zA-Z\s]+"
                  title="Name can only contain letters and spaces"
                  maxLength="50"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={userProfile.email}
                  disabled
                  className="disabled-input"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formatPhoneDisplay(formData.phone)}
                  onChange={handleChange}
                  required
                  placeholder="(123) 456-7890"
                  maxLength="14"
                />
                <small>10-digit number only</small>
              </div>

              <div className="form-group">
                <label htmlFor="role">Account Type</label>
                <input
                  type="text"
                  id="role"
                  value={userProfile.role}
                  disabled
                  className="disabled-input"
                />
                <small>Account type cannot be changed</small>
              </div>

              {userProfile.role === 'institute' && (
                <div className="form-group">
                  <label htmlFor="institutionName">Institution Name</label>
                  <input
                    type="text"
                    id="institutionName"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    required
                    maxLength="100"
                  />
                </div>
              )}

              {userProfile.role === 'company' && (
                <div className="form-group">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    maxLength="100"
                  />
                </div>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <label>Full Name:</label>
                <span>{userProfile.name}</span>
              </div>
              
              <div className="info-item">
                <label>Email Address:</label>
                <span>{userProfile.email}</span>
              </div>
              
              <div className="info-item">
                <label>Phone Number:</label>
                <span>{formatPhoneDisplay(userProfile.phone)}</span>
              </div>
              
              <div className="info-item">
                <label>Account Type:</label>
                <span className="role-badge">{userProfile.role}</span>
              </div>
              
              <div className="info-item">
                <label>Email Verification:</label>
                <div className="verification-section">
                  <span className={`verification-status ${userProfile.emailVerified ? 'verified' : 'unverified'}`}>
                    {userProfile.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                  {!userProfile.emailVerified && (
                    <button
                      onClick={async () => {
                        setVerificationLoading(true);
                        setVerificationMessage('');
                        try {
                          await resendVerification();
                          setVerificationMessage('Verification email sent! Check your inbox.');
                        } catch (error) {
                          setVerificationMessage('Failed to send verification email.');
                        } finally {
                          setVerificationLoading(false);
                        }
                      }}
                      disabled={verificationLoading}
                      className="verify-email-btn"
                    >
                      {verificationLoading ? 'Sending...' : 'Verify Email'}
                    </button>
                  )}
                </div>
                {verificationMessage && (
                  <small className="verification-message">{verificationMessage}</small>
                )}
              </div>
              
              <div className="info-item">
                <label>Member Since:</label>
                <span>{new Date(userProfile.createdAt).toLocaleDateString()}</span>
              </div>

              {userProfile.role === 'institute' && userProfile.institutionName && (
                <div className="info-item">
                  <label>Institution Name:</label>
                  <span>{userProfile.institutionName}</span>
                </div>
              )}

              {userProfile.role === 'company' && userProfile.companyName && (
                <div className="info-item">
                  <label>Company Name:</label>
                  <span>{userProfile.companyName}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;