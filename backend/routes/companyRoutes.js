const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateJobPosting } = require('../middleware/validation');

// All company routes require authentication and company role
router.use(authenticateToken);
router.use(authorizeRoles('company'));

// Profile management
router.get('/profile', companyController.getProfile);
router.put('/profile', companyController.updateProfile);

// Job management
router.post('/jobs', validateJobPosting, companyController.postJob);
router.get('/jobs', companyController.getJobs);
router.put('/jobs/:jobId', companyController.updateJob);
router.delete('/jobs/:jobId', companyController.deleteJob);

// Applicant management
router.get('/jobs/:jobId/applicants', companyController.getApplicants);

module.exports = router;
