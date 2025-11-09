const { db } = require('../config/firebase');
const Job = require('../models/Job');
const User = require('../models/User');

// Get company profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({ company: user });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update company profile
const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const updates = req.body;
    updates.updatedAt = new Date();

    await db.collection('users').doc(id).update(updates);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Post a job
const postJob = async (req, res) => {
  try {
    const { id: companyId } = req.user;
    const jobData = req.body;
    jobData.companyId = companyId;

    const job = new Job(jobData);
    const docRef = await db.collection('jobs').add(job.toFirestore());
    job.id = docRef.id;

    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Post job error:', error);
    res.status(500).json({ error: 'Failed to post job' });
  }
};

// Get company's jobs
const getJobs = async (req, res) => {
  try {
    const { id: companyId } = req.user;
    const jobsSnapshot = await db.collection('jobs').where('companyId', '==', companyId).get();
    const jobs = jobsSnapshot.docs.map(doc => Job.fromFirestore(doc));

    res.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

// Get qualified applicants for a job
const getApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { id: companyId } = req.user;

    // Verify job belongs to company
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists || jobDoc.data().companyId !== companyId) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = Job.fromFirestore(jobDoc);
    const applicants = [];

    for (const applicantId of job.applicants) {
      const applicantDoc = await db.collection('users').doc(applicantId).get();
      if (applicantDoc.exists) {
        const applicant = User.fromFirestore(applicantDoc);

        // Check qualifications match
        const isQualified = job.requirements.every(req =>
          applicant.qualifications && applicant.qualifications.includes(req)
        );

        if (isQualified) {
          applicants.push({
            id: applicant.id,
            firstName: applicant.firstName,
            lastName: applicant.lastName,
            email: applicant.email,
            qualifications: applicant.qualifications,
            transcripts: applicant.transcripts,
            grade: applicant.grade
          });
        }
      }
    }

    res.json({ applicants });
  } catch (error) {
    console.error('Get applicants error:', error);
    res.status(500).json({ error: 'Failed to get applicants' });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { id: companyId } = req.user;
    const updates = req.body;

    // Verify job belongs to company
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists || jobDoc.data().companyId !== companyId) {
      return res.status(404).json({ error: 'Job not found' });
    }

    updates.updatedAt = new Date();
    await db.collection('jobs').doc(jobId).update(updates);

    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { id: companyId } = req.user;

    // Verify job belongs to company
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists || jobDoc.data().companyId !== companyId) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await db.collection('jobs').doc(jobId).delete();

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  postJob,
  getJobs,
  getApplicants,
  updateJob,
  deleteJob
};
