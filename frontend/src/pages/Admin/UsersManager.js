import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRole, deleteUser, subscribeToUsers } from '../../services/usersService';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    loadUsers();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
    });

    return () => unsubscribe();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      setError('');
      await updateUserRole(userId, role);
      console.log('User role updated:', userId, role);
    } catch (err) {
      setError('Failed to update user role');
      console.error('Error updating user role:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setError('');
        await deleteUser(userId);
        console.log('User deleted:', userId);
      } catch (err) {
        setError('Failed to delete user');
        console.error('Error deleting user:', err);
      }
    }
  };

  const openRoleForm = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleForm(true);
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUser) {
      await handleRoleChange(selectedUser.id, newRole);
      setShowRoleForm(false);
      setSelectedUser(null);
      setNewRole('');
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div>
      {error && <div className="error-message">{error}</div>}

      <div className="table-header">
        <h3>Manage Users</h3>
      </div>

      {/* Role Change Form */}
      {showRoleForm && selectedUser && (
        <div className="admin-form">
          <h4>Change User Role</h4>
          <p>Changing role for: <strong>{selectedUser.name}</strong> ({selectedUser.email})</p>
          <form onSubmit={handleRoleSubmit}>
            <div className="form-group">
              <label>New Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                required
              >
                <option value="student">Student</option>
                <option value="company">Company</option>
                <option value="institute">Institute</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Update Role
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowRoleForm(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Registered</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.phone}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${user.emailVerified ? 'active' : 'pending'}`}>
                    {user.emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openRoleForm(user)}
                    >
                      Change Role
                    </button>
                    <button
                      className="action-btn btn-danger"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
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

export default UsersManager;