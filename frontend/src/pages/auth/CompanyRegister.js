import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const CompanyRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'company',
    companyName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        return;
      }
    }

    if (name === 'phone') {
      // Allow numbers and + only for Lesotho numbers
      const cleaned = value.replace(/[^\d+]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: cleaned
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }

    // Enhanced Lesotho phone validation in UI
    const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
    const isValidPhone = /^(\+266\d{8}|266\d{8}|0\d{8}|\d{8})$/.test(cleanPhone);

    if (!isValidPhone) {
      setError('Please enter a valid Lesotho phone number');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.companyName.trim()) {
      setError('Please enter your company name');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await register(formData);
      alert('✅ Company registration successful! Check your REAL email for verification link from Firebase.');
      navigate('/auth/company/verify-email');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneDisplay = (phone) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    if (cleanPhone.startsWith('+266') && cleanPhone.length >= 5) {
      const rest = cleanPhone.slice(4);
      if (rest.length <= 2) return `+266 ${rest}`;
      if (rest.length <= 4) return `+266 ${rest.slice(0,2)} ${rest.slice(2)}`;
      return `+266 ${rest.slice(0,2)} ${rest.slice(2,4)} ${rest.slice(4,6)} ${rest.slice(6,8)}`;
    }

    if (cleanPhone.startsWith('266') && cleanPhone.length >= 4) {
      const rest = cleanPhone.slice(3);
      if (rest.length <= 2) return `266 ${rest}`;
      if (rest.length <= 4) return `266 ${rest.slice(0,2)} ${rest.slice(2)}`;
      return `266 ${rest.slice(0,2)} ${rest.slice(2,4)} ${rest.slice(4,6)} ${rest.slice(6,8)}`;
    }

    if (cleanPhone.startsWith('0') && cleanPhone.length >= 2) {
      const rest = cleanPhone.slice(1);
      if (rest.length <= 2) return `0 ${rest}`;
      if (rest.length <= 4) return `0 ${rest.slice(0,2)} ${rest.slice(2)}`;
      return `0 ${rest.slice(0,2)} ${rest.slice(2,4)} ${rest.slice(4,6)} ${rest.slice(6,8)}`;
    }

    if (/^\d+$/.test(cleanPhone) && cleanPhone.length <= 8) {
      if (cleanPhone.length <= 2) return cleanPhone;
      if (cleanPhone.length <= 4) return `${cleanPhone.slice(0,2)} ${cleanPhone.slice(2)}`;
      return `${cleanPhone.slice(0,2)} ${cleanPhone.slice(2,4)} ${cleanPhone.slice(4,6)} ${rest.slice(6,8)}`;
    }

    return phone;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Company Account</h2>
        <p className="auth-subtitle">Join CareerGuide as a Company/Employer - Real email verification required</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              pattern="[a-zA-Z\s]+"
              title="Name can only contain letters and spaces"
              maxLength="50"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your-real-email@gmail.com"
              title="Use a real email address for verification"
            />
            <small>Use a real email - verification link will be sent</small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Lesotho Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formatPhoneDisplay(formData.phone)}
              onChange={handleChange}
              required
              placeholder="+266 50 123 456 or 050 123 456"
              maxLength="20"
              pattern="[\d+\s]+"
              title="Lesotho phone number required"
            />
            <small>Formats: +26650123456, 26650123456, 050123456, or 50123456</small>
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="Enter your company name"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password (min. 6 characters)"
              minLength="6"
              maxLength="50"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              minLength="6"
              maxLength="50"
            />
          </div>

          <div className="form-notice">
            <p>📧 <strong>Real Email Required:</strong> You will receive a verification link from Firebase to activate your company account.</p>
            <p>📱 <strong>Lesotho Phone:</strong> Only Lesotho phone numbers accepted in specified formats.</p>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Company Account...' : 'Create Company Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have a company account? <Link to="/auth/company/login">Sign In as Company</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;
