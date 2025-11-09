import React from 'react';
import { Link } from 'react-router-dom';
import '../../Main.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to CareerGuide</h1>
          <p className="hero-subtitle">
            Your comprehensive career guidance platform connecting students, institutions, and companies
          </p>

          <div className="hero-actions">
            <Link to="/auth/student/login" className="btn btn-primary">
              Student Login
            </Link>
            <Link to="/auth/student/register" className="btn btn-secondary">
              Student Register
            </Link>
            <Link to="/auth/admin/login" className="btn btn-outline">
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose CareerGuide?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Personalized Guidance</h3>
              <p>Get tailored career advice based on your skills, interests, and goals</p>
            </div>
            <div className="feature-card">
              <h3>Institute Connections</h3>
              <p>Connect with educational institutions for courses and certifications</p>
            </div>
            <div className="feature-card">
              <h3>Career Opportunities</h3>
              <p>Discover job opportunities and internships from top companies</p>
            </div>
            <div className="feature-card">
              <h3>Skill Assessment</h3>
              <p>Evaluate your skills and identify areas for improvement</p>
            </div>
          </div>
        </div>
      </section>

      <section className="user-types">
        <div className="container">
          <h2>Designed For Everyone</h2>
          <div className="user-types-grid">
            <div className="user-type-card">
              <h3>Students</h3>
              <ul>
                <li>Career path guidance</li>
                <li>Skill development</li>
                <li>Job opportunities</li>
                <li>Institute connections</li>
              </ul>
              <div className="user-actions">
                <Link to="/auth/student/login" className="btn btn-small">Login</Link>
                <Link to="/auth/student/register" className="btn btn-small btn-secondary">Register</Link>
              </div>
            </div>
            <div className="user-type-card">
              <h3>Institutions</h3>
              <ul>
                <li>Student recruitment</li>
                <li>Course promotion</li>
                <li>Industry partnerships</li>
                <li>Career services</li>
              </ul>
              <div className="user-actions">
                <Link to="/auth/institute/login" className="btn btn-small">Login</Link>
                <Link to="/auth/institute/register" className="btn btn-small btn-secondary">Register</Link>
              </div>
            </div>
            <div className="user-type-card">
              <h3>Companies</h3>
              <ul>
                <li>Talent acquisition</li>
                <li>Internship programs</li>
                <li>Campus recruitment</li>
                <li>Industry insights</li>
              </ul>
              <div className="user-actions">
                <Link to="/auth/company/login" className="btn btn-small">Login</Link>
                <Link to="/auth/company/register" className="btn btn-small btn-secondary">Register</Link>
              </div>
            </div>
            <div className="user-type-card">
              <h3>Admins</h3>
              <ul>
                <li>System management</li>
                <li>User oversight</li>
                <li>Platform analytics</li>
                <li>Content moderation</li>
              </ul>
              <div className="user-actions">
                <Link to="/auth/admin/login" className="btn btn-small">Login</Link>
                <Link to="/auth/admin/register" className="btn btn-small btn-secondary">Register</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
