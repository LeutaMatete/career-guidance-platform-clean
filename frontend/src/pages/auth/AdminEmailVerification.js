import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const AdminEmailVerification = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyEmail, resendVerification, hasPendingVerification } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(code.toUpperCase());

      // Check if there's an intended path after verification
      const intendedPath = localStorage.getItem('intendedPath');
      if (intendedPath) {
        localStorage.removeItem('intendedPath');
        navigate(intendedPath);
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const newCode = await resendVerification();
      alert(`New verification code sent: ${newCode}\n\n(In a real app, this would be sent to your email)`);
    } catch (err) {
      setError('Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  if (!hasPendingVerification) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>No Verification Required</h2>
          <p>Your email is already verified or there's no pending verification.</p>
          <button
            onClick={() => navigate('/auth/admin/login')}
            className="auth-button"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Admin Email</h2>
        <p className="auth-subtitle">
          We've sent a verification code to your email address.
          Please enter the code below to verify your admin account.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="code">Verification Code</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Enter 6-digit code"
              maxLength="6"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Admin Email'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Didn't receive the code?{' '}
            <button
              onClick={handleResendCode}
              disabled={resending}
              className="resend-button"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailVerification;
