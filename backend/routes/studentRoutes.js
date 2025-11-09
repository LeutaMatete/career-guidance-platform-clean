const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateCourseApplication } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/upload');

// All student routes require authentication and student role
router.use(authenticateToken);
router.use(authorizeRoles('student'));

// Course browsing and applications
router.get('/courses', studentController.getCourses);
router.post('/applications', validateCourseApplication, studentController.applyForCourse);
router.get('/applications', studentController.getApplications);

// Qualified courses based on student grade
router.get('/qualified-courses', studentController.getQualifiedCourses);

// Transcript upload and grade management
router.post('/upload-transcript', studentController.uploadTranscript);

// Test grade setting for qualification testing
router.post('/test/set-grade', studentController.setTestGrade);

// Admissions
router.get('/admissions', studentController.getAdmissionResults);

// Document uploads
router.post('/documents/upload', uploadSingle, studentController.uploadDocuments);

// Job browsing and applications
router.get('/jobs', studentController.getJobs);
router.post('/jobs/apply', studentController.applyForJob);

module.exports = router;
