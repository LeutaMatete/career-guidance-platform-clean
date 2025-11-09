import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../Main.css';

const Layout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleModuleClick = (e, path) => {
    if (!currentUser) {
      e.preventDefault();
      localStorage.setItem('intendedPath', path);
      navigate('/auth/register');
    } else if (!currentUser.emailVerified) {
      e.preventDefault();
      navigate('/auth/verify-email');
    } else {
      // User is authenticated and verified, allow navigation
      navigate(path);
    }
  };

  const navigationItems = [
    { path: '/', label: 'Home' },
    { path: '/admin/dashboard', label: 'Admin Module' },
    { path: '/institute/dashboard', label: 'Institute Module' },
    { path: '/student/dashboard', label: 'Student Module' },
    { path: '/company/dashboard', label: 'Company Module' }
  ];

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">CareerGuide</h1>
          <nav className="nav">
            <div className="nav-links">
              {navigationItems.map(item => (
                item.path === '/' ? (
                  <Link key={item.path} to={item.path} className="nav-link">
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="nav-link"
                    onClick={(e) => handleModuleClick(e, item.path)}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
            <div className="auth-section">
              {currentUser ? (
                <div className="user-menu">
                  <span className="user-email">{currentUser.email}</span>
                  <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="auth-links">
                  <Link to="/auth/login" className="btn btn-secondary">
                    Login
                  </Link>
                  <Link to="/auth/register" className="btn btn-primary">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 CareerGuide. All rights reserved.</p>
          <p>Your trusted career guidance platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
