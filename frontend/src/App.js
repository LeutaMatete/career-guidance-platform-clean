import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentProfile from './pages/Student/StudentProfile';
import DocumentsManager from './pages/Student/DocumentsManager';
import CourseApplications from './pages/Student/CourseApplications';
import AutomaticApplications from './pages/Student/AutomaticApplications';
import AdmissionsResults from './pages/Student/AdmissionsResults';
import JobPortal from './pages/Student/JobPortal';
import Notifications from './pages/Student/Notifications';
import InstituteDashboard from './pages/Institute/InstituteDashboard';
import CompanyDashboard from './pages/Company/CompanyDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Profile from './pages/Profile/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmailVerification from './pages/auth/EmailVerification';
import './Main.css';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/verify-email" element={<EmailVerification />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/documents"
        element={
          <ProtectedRoute requiredRole="student">
            <DocumentsManager />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/applications"
        element={
          <ProtectedRoute requiredRole="student">
            <CourseApplications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/auto-apply"
        element={
          <ProtectedRoute requiredRole="student">
            <AutomaticApplications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/admissions"
        element={
          <ProtectedRoute requiredRole="student">
            <AdmissionsResults />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/jobs"
        element={
          <ProtectedRoute requiredRole="student">
            <JobPortal />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/notifications"
        element={
          <ProtectedRoute requiredRole="student">
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/institute/dashboard"
        element={
          <ProtectedRoute requiredRole="institute">
            <InstituteDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute requiredRole="company">
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/profile" element={<Profile />} />

      <Route path="/unauthorized" element={
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Unauthorized Access</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;