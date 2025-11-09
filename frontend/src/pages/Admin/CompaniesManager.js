import React, { useState, useEffect } from 'react';
import { getCompanies, updateCompanyStatus, subscribeToCompanies } from '../../services/companiesService';

const CompaniesManager = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCompanies();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToCompanies((updatedCompanies) => {
      setCompanies(updatedCompanies);
    });

    return () => unsubscribe();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      setError('Failed to load companies');
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (companyId) => {
    try {
      setError('');
      await updateCompanyStatus(companyId, 'approved');
      console.log('Company approved:', companyId);
    } catch (err) {
      setError('Failed to approve company');
      console.error('Error approving company:', err);
    }
  };

  const handleSuspend = async (companyId) => {
    try {
      setError('');
      await updateCompanyStatus(companyId, 'suspended');
      console.log('Company suspended:', companyId);
    } catch (err) {
      setError('Failed to suspend company');
      console.error('Error suspending company:', err);
    }
  };

  const handleReject = async (companyId) => {
    try {
      setError('');
      await updateCompanyStatus(companyId, 'rejected');
      console.log('Company rejected:', companyId);
    } catch (err) {
      setError('Failed to reject company');
      console.error('Error rejecting company:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading companies...</div>;
  }

  return (
    <div>
      {error && <div className="error-message">{error}</div>}

      <div className="table-header">
        <h3>Manage Companies</h3>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Contact Email</th>
              <th>Phone</th>
              <th>Registration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <tr key={company.id}>
                <td>{company.companyName}</td>
                <td>{company.email}</td>
                <td>{company.phone}</td>
                <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${company.status || 'pending'}`}>
                    {company.status || 'pending'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {company.status !== 'approved' && company.status !== 'rejected' && (
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleApprove(company.id)}
                      >
                        Approve
                      </button>
                    )}
                    {company.status !== 'suspended' && company.status !== 'rejected' && (
                      <button
                        className="action-btn btn-danger"
                        onClick={() => handleSuspend(company.id)}
                      >
                        Suspend
                      </button>
                    )}
                    {company.status === 'pending' && (
                      <button
                        className="action-btn reject-btn"
                        onClick={() => handleReject(company.id)}
                      >
                        Reject
                      </button>
                    )}
                    <button className="action-btn edit-btn">View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompaniesManager;