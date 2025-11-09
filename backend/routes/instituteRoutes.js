const express = require('express');
const router = express.Router();
const instituteController = require('../controllers/instituteController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All institute routes require authentication and institute role
router.use(authenticateToken);
router.use(authorizeRoles('institute'));

// Profile management
router.get('/profile', instituteController.getProfile);
router.put('/profile', instituteController.updateProfile);

// Faculty management
router.post('/faculties', instituteController.addFaculty);
router.get('/faculties', instituteController.getFaculties);

// Course management
router.post('/courses', instituteController.addCourse);
router.get('/courses', instituteController.getCourses);

// Application management
router.get('/applications', instituteController.getApplications);
router.put('/applications/:id/status', instituteController.updateApplicationStatus);

// Admissions
router.post('/admissions/publish', instituteController.publishAdmissions);

module.exports = router;
