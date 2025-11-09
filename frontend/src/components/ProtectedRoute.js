import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole, redirectTo = '/auth/login' }) => {
  const { currentUser, userProfile, isAuthenticated, isEmailVerified } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated || !currentUser) {
    // Store the intended path for redirect after login
    localStorage.setItem('intendedPath', location.pathname);
    return <Navigate to={redirectTo} replace />;
  }

  // Check if email is verified
  if (!isEmailVerified) {
    return <Navigate to="/auth/verify-email" replace />;
  }

  // Check if user profile is loaded
  if (!userProfile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading user profile...</p>
      </div>
    );
  }

  // Check role if required
  if (requiredRole && userProfile.role !== requiredRole) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this module.</p>
        <p>Your role: {userProfile.role}</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
