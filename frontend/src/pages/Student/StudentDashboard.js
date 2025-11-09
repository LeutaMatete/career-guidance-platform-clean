import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import '../../Main.css';

const StudentDashboard = () => {
  const location = useLocation();
  const { userProfile } = useAuth();
  const [qualifiedCourses, setQualifiedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [studentGrade, setStudentGrade] = useState(0);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  const fetchQualifiedCourses = async () => {
    if (!userProfile?.uid) return;

    try {
      console.log('Fetching qualified courses...');

      // Get student's academic results
      const studentDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', userProfile.uid)));
      let studentData = null;
      studentDoc.forEach((doc) => {
        studentData = { id: doc.id, ...doc.data() };
      });

      if (studentData?.academicResults) {
        setStudentGrade(parseFloat(studentData.academicResults.split('Overall - ')[1]?.replace('%', '') || 0));
      }

      // Get all courses with status 'active'
      const coursesQuery = query(collection(db, 'courses'), where('status', '==', 'active'));
      const coursesSnapshot = await getDocs(coursesQuery);
      const courses = [];

      for (const doc of coursesSnapshot.docs) {
        const courseData = { id: doc.id, ...doc.data() };

        // Get institution details
        const institutionDoc = await getDocs(query(collection(db, 'institutions'), where('__name__', '==', courseData.institutionId)));
        let institutionName = 'Unknown Institution';
        institutionDoc.forEach((instDoc) => {
          institutionName = instDoc.data().name || 'Unknown Institution';
        });

        courseData.institutionName = institutionName;
        courseData.facultyName = courseData.faculty || 'General';
        courseData.requirements = courseData.requirements || 'Standard requirements';
        courseData.availableSlots = courseData.availableSlots || courseData.capacity || 0;
        courseData.minGrade = courseData.minGrade || 60; // Default to 60 if not set

        courses.push(courseData);
      }

      // Filter qualified courses based on student's grade and course.minGrade
      const qualified = courses.filter(course => {
        return studentGrade >= course.minGrade;
      });

      setQualifiedCourses(qualified);
      setDebugInfo(`Found ${qualified.length} qualified courses`);
    } catch (error) {
      console.error('Error fetching qualified courses:', error);
      setDebugInfo(`Error: ${error.message}`);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const coursesQuery = query(collection(db, 'courses'), where('status', '==', 'active'));
      const coursesSnapshot = await getDocs(coursesQuery);
      const courses = [];

      for (const doc of coursesSnapshot.docs) {
        const courseData = { id: doc.id, ...doc.data() };

        // Get institution details
        const institutionDoc = await getDocs(query(collection(db, 'institutions'), where('__name__', '==', courseData.institutionId)));
        let institutionName = 'Unknown Institution';
        institutionDoc.forEach((instDoc) => {
          institutionName = instDoc.data().name || 'Unknown Institution';
        });

        courseData.institutionName = institutionName;
        courseData.facultyName = courseData.faculty || 'General';
        courseData.requirements = courseData.requirements || 'Standard requirements';
        courseData.availableSlots = courseData.availableSlots || courseData.capacity || 0;
        courseData.minGrade = courseData.minGrade || 60; // Default to 60 if not set

        courses.push(courseData);
      }

      console.log('All courses:', courses);
      setAllCourses(courses);
    } catch (error) {
      console.error('Error fetching all courses:', error);
    }
  };

  const uploadTranscript = async (grade) => {
    if (!userProfile?.uid) return;

    try {
      console.log(`Uploading transcript with grade: ${grade}%`);

      // Update student's academic results in Firestore
      const studentQuery = query(collection(db, 'users'), where('uid', '==', userProfile.uid));
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const studentDoc = studentSnapshot.docs[0];
        await updateDoc(doc(db, 'users', studentDoc.id), {
          academicResults: `Mathematics - A, English - B, Science - A, Overall - ${grade}%`,
          lastQualificationCheck: new Date().toISOString()
        });

        alert(`Transcript uploaded! Grade: ${grade}%`);
        setStudentGrade(grade);
        fetchQualifiedCourses();
      }
    } catch (error) {
      console.error('Error uploading transcript:', error);
      alert('Failed to upload transcript');
    }
  };

  const setTestGrade = async (grade) => {
    if (!userProfile?.uid) return;

    try {
      console.log(` Setting test grade to: ${grade}%`);

      // Update student's grade in Firestore
      const studentQuery = query(collection(db, 'users'), where('uid', '==', userProfile.uid));
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const studentDoc = studentSnapshot.docs[0];
        await updateDoc(doc(db, 'users', studentDoc.id), {
          academicResults: `Test Grade - ${grade}%`,
          lastQualificationCheck: new Date().toISOString()
        });

        alert(`Grade set to ${grade}%`);
        setStudentGrade(grade);
        fetchQualifiedCourses();
      }
    } catch (error) {
      console.error('Error setting test grade:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (userProfile?.uid) {
        setLoading(true);
        await Promise.all([fetchQualifiedCourses(), fetchAllCourses()]);
        setLoading(false);
      }
    };
    loadData();
  }, [userProfile]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading student data...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        padding: '20px 0'
      }}>
        <h3 style={{ padding: '0 20px', marginBottom: '20px', color: '#495057' }}>Student Menu</h3>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '5px' }}>
              <Link
                to="/student/dashboard"
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  color: location.pathname === '/student/dashboard' ? '#007bff' : '#495057',
                  backgroundColor: location.pathname === '/student/dashboard' ? '#e3f2fd' : 'transparent',
                  borderRadius: '4px',
                  margin: '0 10px'
                }}
              >
                Dashboard
              </Link>
            </li>
            <li style={{ marginBottom: '5px' }}>
              <Link
                to="/student/profile"
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  color: location.pathname === '/student/profile' ? '#007bff' : '#495057',
                  backgroundColor: location.pathname === '/student/profile' ? '#e3f2fd' : 'transparent',
                  borderRadius: '4px',
                  margin: '0 10px'
                }}
              >
                Profile
              </Link>
            </li>
            <li style={{ marginBottom: '5px' }}>
              <Link
                to="/student/documents"
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  color: location.pathname === '/student/documents' ? '#007bff' : '#495057',
                  backgroundColor: location.pathname === '/student/documents' ? '#e3f2fd' : 'transparent',
                  borderRadius: '4px',
                  margin: '0 10px'
                }}
              >
                Documents
              </Link>
            </li>
            <li style={{ marginBottom: '5px' }}>
              <Link
                to="/student/applications"
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  color: location.pathname === '/student/applications' ? '#007bff' : '#495057',
                  backgroundColor: location.pathname === '/student/applications' ? '#e3f2fd' : 'transparent',
                  borderRadius: '4px',
                  margin: '0 10px'
                }}
              >
                Course Applications
              </Link>
            </li>
            <li style={{ marginBottom: '5px' }}>
              <Link
                to="/student/auto-apply"
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  color: location.pathname === '/student/auto-apply' ? '#007bff' : '#495057',
                  backgroundColor: location.pathname === '/student/auto-apply' ? '#e3f2fd' : 'transparent',
                  borderRadius: '4px',
                  margin: '0 10px'
                }}
              >
                Auto Apply
              </Link>
            </li>
            <li style={{ marginBottom: '5px' }}>
              <Link
                to="/student/admissions"
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  color: location.pathname === '/student/admissions' ? '#007bff' : '#495057',
                  backgroundColor: location.pathname === '/student/admissions' ? '#e3f2fd' : 'transparent',
                  borderRadius: '4px',
                  margin: '0 10px'
                }}
              >
                Admissions Results
              </Link>
            </li>
            <li style={{ marginBottom: '5px' }}>
              <Link
                to="/student/jobs"
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  color: location.pathname === '/student/jobs' ? '#007bff' : '#495057',
                  backgroundColor: location.pathname === '/student/jobs' ? '#e3f2fd' : 'transparent',
                  borderRadius: '4px',
                  margin: '0 10px'
                }}
              >
                Job Portal
              </Link>
            </li>
            <li style={{ marginBottom: '5px' }}>
              <Link
                to="/student/notifications"
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  color: location.pathname === '/student/notifications' ? '#007bff' : '#495057',
                  backgroundColor: location.pathname === '/student/notifications' ? '#e3f2fd' : 'transparent',
                  borderRadius: '4px',
                  margin: '0 10px'
                }}
              >
                Notifications
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px', maxWidth: 'calc(100% - 250px)' }}>
        <h2>Student Dashboard - Course Applications</h2>

        {/* Debug Info */}
        <div style={{
          padding: '15px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #b3d9ff'
        }}>
          <h3>Debug Information</h3>
          <p><strong>Current Grade:</strong> {studentGrade}%</p>
          <p><strong>Qualified Courses:</strong> {qualifiedCourses.length}</p>
          <p><strong>All Available Courses:</strong> {allCourses.length}</p>
          <p><strong>Status:</strong> {debugInfo}</p>

          <div style={{ marginTop: '10px' }}>
            <h4>Quick Test Grades:</h4>
            <button onClick={() => setTestGrade(80)} style={{ margin: '5px', padding: '8px 12px' }}>Set 80%</button>
            <button onClick={() => setTestGrade(65)} style={{ margin: '5px', padding: '8px 12px' }}>Set 65%</button>
            <button onClick={() => setTestGrade(50)} style={{ margin: '5px', padding: '8px 12px' }}>Set 50%</button>
            <button onClick={() => setTestGrade(40)} style={{ margin: '5px', padding: '8px 12px' }}>Set 40%</button>
            <button onClick={() => setTestGrade(30)} style={{ margin: '5px', padding: '8px 12px' }}>Set 30%</button>
          </div>

          <div style={{ marginTop: '10px' }}>
            <h4>Test Transcript Upload:</h4>
            <button onClick={() => uploadTranscript(75)} style={{ margin: '5px', padding: '8px 12px' }}>Upload 75% Transcript</button>
            <button onClick={() => uploadTranscript(55)} style={{ margin: '5px', padding: '8px 12px' }}>Upload 55% Transcript</button>
          </div>
        </div>

        {/* Current Course Requirements */}
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>Current Course Requirements</h3>
          <ul>
            {allCourses.map(course => (
              <li key={course.id}>
                <strong>{course.name} - {course.institutionName}</strong> - Minimum Grade: {course.minGrade}%
                {studentGrade >= course.minGrade ? ' You qualify' : ' You do not qualify'}
              </li>
            ))}
          </ul>
        </div>

        {/* Qualified Courses */}
        <h3>Courses You Qualify For ({qualifiedCourses.length})</h3>
        {qualifiedCourses.length === 0 ? (
          <div style={{
            padding: '20px',
            backgroundColor: '#ffe6e6',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h4>No Qualified Courses Found</h4>
            <p>Your current grade ({studentGrade}%) doesn't meet the requirements for any available courses.</p>
            <p><strong>Try setting a higher test grade using the buttons above.</strong></p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {qualifiedCourses.map(course => (
              <div key={course.id} style={{
                border: '2px solid #28a745',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#f8fff9'
              }}>
                <h4>{course.name} - {course.institutionName}</h4>
                <p><strong>Faculty:</strong> {course.facultyName}</p>
                <p><strong>Requirements:</strong> {course.requirements}</p>
                <p><strong>Minimum Grade:</strong> {course.minGrade}%</p>
                <p><strong>Your Grade:</strong> {studentGrade}% QUALIFIED</p>
                <p><strong>Available Slots:</strong> {course.availableSlots}</p>
                <button
                  onClick={() => {
                    // Add your apply function here
                    alert(`Applying to ${course.name}`);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* All Available Courses */}
        <h3 style={{ marginTop: '30px' }}>All Available Courses ({allCourses.length})</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {allCourses.map(course => (
            <div key={course.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: studentGrade >= 60 ? '#f8f9fa' : '#ffe6e6',
              opacity: studentGrade >= 60 ? 1 : 0.7
            }}>
              <h4>{course.name} - {course.institutionName}</h4>
              <p><strong>Minimum Grade:</strong> {course.minGrade}%</p>
              <p><strong>Your Grade:</strong> {studentGrade}%
                {studentGrade >= course.minGrade ? ' Qualified' : ' Does not qualify'}
              </p>
              <p><strong>Available Slots:</strong> {course.availableSlots}</p>
              <button
                onClick={() => {
                  // Add your apply function here
                  alert(`Applying to ${course.name}`);
                }}
                disabled={studentGrade < course.minGrade || course.availableSlots <= 0}
                style={{
                  padding: '10px 20px',
                  backgroundColor: studentGrade >= course.minGrade ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: studentGrade >= course.minGrade ? 'pointer' : 'not-allowed'
                }}
              >
                {studentGrade >= course.minGrade ? 'Apply' : 'Does Not Qualify'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;