const { db } = require('../config/firebase');
const Institution = require('../models/Institution');
const User = require('../models/User');

// Get all institutions
const getInstitutions = async (req, res) => {
  try {
    const institutionsSnapshot = await db.collection('institutions').get();
    const institutions = institutionsSnapshot.docs.map(doc => Institution.fromFirestore(doc));

    res.json({ institutions });
  } catch (error) {
    console.error('Get institutions error:', error);
    res.status(500).json({ error: 'Failed to get institutions' });
  }
};

// Add new institution
const addInstitution = async (req, res) => {
  try {
    const institutionData = req.body;
    const institution = new Institution(institutionData);

    const docRef = await db.collection('institutions').add(institution.toFirestore());
    institution.id = docRef.id;

    res.status(201).json({ message: 'Institution added successfully', institution });
  } catch (error) {
    console.error('Add institution error:', error);
    res.status(500).json({ error: 'Failed to add institution' });
  }
};

// Update institution
const updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date();

    await db.collection('institutions').doc(id).update(updates);

    res.json({ message: 'Institution updated successfully' });
  } catch (error) {
    console.error('Update institution error:', error);
    res.status(500).json({ error: 'Failed to update institution' });
  }
};

// Delete institution
const deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection('institutions').doc(id).delete();

    res.json({ message: 'Institution deleted successfully' });
  } catch (error) {
    console.error('Delete institution error:', error);
    res.status(500).json({ error: 'Failed to delete institution' });
  }
};

// Get all companies
const getCompanies = async (req, res) => {
  try {
    const companiesSnapshot = await db.collection('users').where('role', '==', 'company').get();
    const companies = companiesSnapshot.docs.map(doc => User.fromFirestore(doc));

    res.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to get companies' });
  }
};

// Manage company account (approve/suspend/delete)
const manageCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve', 'suspend', 'delete'

    if (action === 'delete') {
      await db.collection('users').doc(id).delete();
      res.json({ message: 'Company deleted successfully' });
    } else if (action === 'suspend') {
      await db.collection('users').doc(id).update({ status: 'suspended' });
      res.json({ message: 'Company suspended successfully' });
    } else if (action === 'approve') {
      await db.collection('users').doc(id).update({ status: 'active' });
      res.json({ message: 'Company approved successfully' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Manage company error:', error);
    res.status(500).json({ error: 'Failed to manage company' });
  }
};

// Get system reports
const getReports = async (req, res) => {
  try {
    // Get user statistics
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    const students = usersSnapshot.docs.filter(doc => doc.data().role === 'student').length;
    const institutes = usersSnapshot.docs.filter(doc => doc.data().role === 'institute').length;
    const companies = usersSnapshot.docs.filter(doc => doc.data().role === 'company').length;

    // Get application statistics
    const applicationsSnapshot = await db.collection('applications').get();
    const totalApplications = applicationsSnapshot.size;
    const pendingApplications = applicationsSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
    const approvedApplications = applicationsSnapshot.docs.filter(doc => doc.data().status === 'approved').length;

    // Get job statistics
    const jobsSnapshot = await db.collection('jobs').get();
    const totalJobs = jobsSnapshot.size;
    const activeJobs = jobsSnapshot.docs.filter(doc => doc.data().status === 'active').length;

    res.json({
      userStats: { totalUsers, students, institutes, companies },
      applicationStats: { totalApplications, pendingApplications, approvedApplications },
      jobStats: { totalJobs, activeJobs }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
};

module.exports = {
  getInstitutions,
  addInstitution,
  updateInstitution,
  deleteInstitution,
  getCompanies,
  manageCompany,
  getReports
};
