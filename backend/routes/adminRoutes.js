const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Institution management
router.get('/institutions', adminController.getInstitutions);
router.post('/institutions', adminController.addInstitution);
router.put('/institutions/:id', adminController.updateInstitution);
router.delete('/institutions/:id', adminController.deleteInstitution);

// Company management
router.get('/companies', adminController.getCompanies);
router.put('/companies/:id/manage', adminController.manageCompany);

// Reports
router.get('/reports', adminController.getReports);

module.exports = router;
