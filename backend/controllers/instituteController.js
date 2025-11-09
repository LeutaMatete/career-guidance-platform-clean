const { db } = require('../config/firebase');
const Institution = require('../models/Institution');
const Course = require('../models/Course');
const Application = require('../models/Application');

// Get institute profile
const getProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const instituteDoc = await db.collection('institutions').doc(id).get();

    if (!instituteDoc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    const institution = Institution.fromFirestore(instituteDoc);
    res.json({ institution });
  } catch (error) {
    console.error('Get institute profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update institute profile
const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const updates = req.body;
    updates.updatedAt = new Date();

    await db.collection('institutions').doc(id).update(updates);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update institute profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Add faculty
const addFaculty = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, description } = req.body;

    const faculty = {
      id: Date.now().toString(),
      name,
      description,
      courses: []
    };

    await db.collection('institutions').doc(id).update({
      faculties: db.FieldValue.arrayUnion(faculty),
      updatedAt: new Date()
    });

    res.status(201).json({ message: 'Faculty added successfully', faculty });
  } catch (error) {
    console.error('Add faculty error:', error);
    res.status(500).json({ error: 'Failed to add faculty' });
  }
};

// Get faculties
const getFaculties = async (req, res) => {
  try {
    const { id } = req.user;
    const instituteDoc = await db.collection('institutions').doc(id).get();

    if (!instituteDoc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    const faculties = instituteDoc.data().faculties || [];
    res.json({ faculties });
  } catch (error) {
    console.error('Get faculties error:', error);
    res.status(500).json({ error: 'Failed to get faculties' });
  }
};

// Add course
const addCourse = async (req, res) => {
  try {
    const { id } = req.user;
    const courseData = req.body;
    courseData.institutionId = id;

    const course = new Course(courseData);
    const docRef = await db.collection('courses').add(course.toFirestore());
    course.id = docRef.id;

    // Add course to institution's courses array
    await db.collection('institutions').doc(id).update({
      courses: db.FieldValue.arrayUnion(docRef.id),
      updatedAt: new Date()
    });

    res.status(201).json({ message: 'Course added successfully', course });
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({ error: 'Failed to add course' });
  }
};

// Get courses
const getCourses = async (req, res) => {
  try {
    const { id } = req.user;
    const coursesSnapshot = await db.collection('courses').where('institutionId', '==', id).get();
    const courses = coursesSnapshot.docs.map(doc => Course.fromFirestore(doc));

    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
};

// Get student applications
const getApplications = async (req, res) => {
  try {
    const { id } = req.user;
    const applicationsSnapshot = await db.collection('applications').where('institutionId', '==', id).get();
    const applications = await Promise.all(applicationsSnapshot.docs.map(async (doc) => {
      const application = Application.fromFirestore(doc);

      // Get student details
      const studentDoc = await db.collection('users').doc(application.studentId).get();
      application.student = studentDoc.exists ? {
        id: studentDoc.id,
        firstName: studentDoc.data().firstName,
        lastName: studentDoc.data().lastName,
        email: studentDoc.data().email
      } : null;

      // Get course details
      const courseDoc = await db.collection('courses').doc(application.courseId).get();
      application.course = courseDoc.exists ? {
        id: courseDoc.id,
        name: courseDoc.data().name,
        code: courseDoc.data().code
      } : null;

      return application;
    }));

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const reviewerId = req.user.id;

    const updateData = {
      status,
      reviewedAt: new Date(),
      reviewerId,
      notes: notes || ''
    };

    await db.collection('applications').doc(id).update(updateData);

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

// Publish admissions
const publishAdmissions = async (req, res) => {
  try {
    const { id } = req.user;
    // This would involve complex logic for admission selection
    // For now, we'll mark approved applications as admitted
    const approvedApplications = await db.collection('applications')
      .where('institutionId', '==', id)
      .where('status', '==', 'approved')
      .get();

    const batch = db.batch();
    approvedApplications.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'admitted' });
    });

    await batch.commit();

    res.json({ message: 'Admissions published successfully' });
  } catch (error) {
    console.error('Publish admissions error:', error);
    res.status(500).json({ error: 'Failed to publish admissions' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addFaculty,
  getFaculties,
  addCourse,
  getCourses,
  getApplications,
  updateApplicationStatus,
  publishAdmissions
};
