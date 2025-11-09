import React, { useState, useEffect } from 'react';

const StudentsManager = () => {
  // Mock data for demo purposes
  const [students, setStudents] = useState([
    {
      id: '1',
      studentId: 'STU2024001',
      studentName: 'John Doe',
      dateOfBirth: '2000-05-15',
      courseName: 'Bachelor of Computer Science',
      intakeYear: 2024,
      intakeSemester: 'fall',
      reviewedAt: '2024-07-20T10:00:00Z',
      enrollmentCompleted: true,
      studentEmail: 'john.doe@email.com',
      studentPhone: '+266 123 4567'
    },
    {
      id: '2',
      studentId: 'STU2024002',
      studentName: 'Jane Smith',
      dateOfBirth: '1999-12-08',
      courseName: 'Master of Business Administration',
      intakeYear: 2024,
      intakeSemester: 'spring',
      reviewedAt: '2024-07-18T14:30:00Z',
      enrollmentCompleted: true,
      studentEmail: 'jane.smith@email.com',
      studentPhone: '+266 234 5678'
    },
    {
      id: '3',
      studentId: 'STU2024003',
      studentName: 'Mike Johnson',
      dateOfBirth: '2001-03-22',
      courseName: 'Bachelor of Engineering',
      intakeYear: 2024,
      intakeSemester: 'fall',
      reviewedAt: '2024-07-15T09:15:00Z',
      enrollmentCompleted: false,
      studentEmail: 'mike.johnson@email.com',
      studentPhone: '+266 345 6789'
    },
    {
      id: '4',
      studentId: 'STU2024004',
      studentName: 'Sarah Wilson',
      dateOfBirth: '2000-08-10',
      courseName: 'Bachelor of Computer Science',
      intakeYear: 2024,
      intakeSemester: 'fall',
      reviewedAt: '2024-07-22T16:45:00Z',
      enrollmentCompleted: true,
      studentEmail: 'sarah.wilson@email.com',
      studentPhone: '+266 456 7890'
    }
  ]);

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    console.log('Students loaded');
  }, []);

  const getEnrollmentStatus = (student) => {
    // This would check if student has completed enrollment process
    return student.enrollmentCompleted ? 'Enrolled' : 'Admitted';
  };

  return (
    <div>
      <div className="table-header">
        <h3>Student Management</h3>
        <div className="table-actions">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="all">All Students</option>
            <option value="enrolled">Enrolled</option>
            <option value="admitted">Admitted</option>
          </select>
        </div>
      </div>

      <div className="data-table">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Admission Date</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <strong>{student.studentId || 'N/A'}</strong>
                  </td>
                  <td>
                    <div><strong>{student.studentName}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      DOB: {student.dateOfBirth || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div><strong>{student.courseName}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {student.intakeYear} {student.intakeSemester}
                    </div>
                  </td>
                  <td>
                    {new Date(student.reviewedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`status-badge status-${getEnrollmentStatus(student).toLowerCase()}`}>
                      {getEnrollmentStatus(student)}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      {student.studentEmail}
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>
                      {student.studentPhone}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn">
                        View Profile
                      </button>
                      <button className="action-btn approve-btn">
                        Generate ID
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {students.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No students found. Student records will appear here after applications are approved.
        </div>
      )}
    </div>
  );
};

export default StudentsManager;