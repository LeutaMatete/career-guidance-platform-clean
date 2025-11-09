const { db } = require('../config/firebase');
const Application = require('../models/Application');
const Course = require('../models/Course');
const Institution = require('../models/Institution');
const Job = require('../models/Job');

// Get available courses
const getCourses = async (req, res) => {
  try {
    const coursesSnapshot = await db.collection('courses').where('status', '==', 'active').get();
    const courses = await Promise.all(coursesSnapshot.docs.map(async (doc) => {
      const course = Course.fromFirestore(doc);

      // Get institution details
      const institutionDoc = await db.collection('institutions').doc(course.institutionId).get();
      course.institution = institutionDoc.exists ? {
        id: institutionDoc.id,
        name: institutionDoc.data().name,
        location: institutionDoc.data().location
      } : null;

      return course;
    }));

    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
};

// Apply for course
const applyForCourse = async (req, res) => {
  try {
    const { id: studentId } = req.user;
    const { courseId, institutionId } = req.body;

    // Check if student already has 2 applications for this institution
    const existingApplications = await db.collection('applications')
      .where('studentId', '==', studentId)
      .where('institutionId', '==', institutionId)
      .get();

    if (existingApplications.size >= 2) {
      return res.status(400).json({ error: 'Maximum 2 applications allowed per institution' });
    }

    // Check if student already applied for this course
    const existingApplication = await db.collection('applications')
      .where('studentId', '==', studentId)
      .where('courseId', '==', courseId)
      .get();

    if (!existingApplication.empty) {
      return res.status(400).json({ error: 'Already applied for this course' });
    }

    // Check course requirements
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = Course.fromFirestore(courseDoc);
    const studentDoc = await db.collection('users').doc(studentId).get();
    const student = studentDoc.data();

    // Simple qualification check (can be enhanced)
    if (course.requirements && course.requirements.length > 0) {
      const hasQualifications = course.requirements.some(req =>
        student.qualifications && student.qualifications.includes(req)
      );

      if (!hasQualifications) {
        return res.status(400).json({ error: 'You do not meet the course requirements' });
      }
    }

    // Create application
    const applicationData = {
      studentId,
      courseId,
      institutionId,
      status: 'pending',
      appliedAt: new Date()
    };

    const application = new Application(applicationData);
    const docRef = await db.collection('applications').add(application.toFirestore());
    application.id = docRef.id;

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Apply for course error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// Get student's applications
const getApplications = async (req, res) => {
  try {
    const { id: studentId } = req.user;
    const applicationsSnapshot = await db.collection('applications').where('studentId', '==', studentId).get();
    const applications = await Promise.all(applicationsSnapshot.docs.map(async (doc) => {
      const application = Application.fromFirestore(doc);

      // Get course details
      const courseDoc = await db.collection('courses').doc(application.courseId).get();
      application.course = courseDoc.exists ? {
        id: courseDoc.id,
        name: courseDoc.data().name,
        code: courseDoc.data().code
      } : null;

      // Get institution details
      const institutionDoc = await db.collection('institutions').doc(application.institutionId).get();
      application.institution = institutionDoc.exists ? {
        id: institutionDoc.id,
        name: institutionDoc.data().name,
        location: institutionDoc.data().location
      } : null;

      return application;
    }));

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
};

// View admission results
const getAdmissionResults = async (req, res) => {
  try {
    const { id: studentId } = req.user;
    const applicationsSnapshot = await db.collection('applications')
      .where('studentId', '==', studentId)
      .where('status', 'in', ['approved', 'admitted', 'rejected'])
      .get();

    const results = applicationsSnapshot.docs.map(doc => Application.fromFirestore(doc));
    res.json({ results });
  } catch (error) {
    console.error('Get admission results error:', error);
    res.status(500).json({ error: 'Failed to get admission results' });
  }
};

// Upload transcripts and certificates
const uploadDocuments = async (req, res) => {
  try {
    const { id: studentId } = req.user;
    const { type } = req.body; // 'transcript', 'certificate'
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In a real implementation, you'd upload to cloud storage
    // For now, we'll store the file path
    const document = {
      type,
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      uploadedAt: new Date()
    };

    await db.collection('users').doc(studentId).update({
      [type === 'transcript' ? 'transcripts' : 'certificates']: db.FieldValue.arrayUnion(document),
      updatedAt: new Date()
    });

    res.json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// Get available jobs
const getJobs = async (req, res) => {
  try {
    const jobsSnapshot = await db.collection('jobs').where('status', '==', 'active').get();
    const jobs = await Promise.all(jobsSnapshot.docs.map(async (doc) => {
      const job = Job.fromFirestore(doc);

      // Get company details
      const companyDoc = await db.collection('users').doc(job.companyId).get();
      job.company = companyDoc.exists ? {
        id: companyDoc.id,
        companyName: companyDoc.data().companyName,
        location: companyDoc.data().location
      } : null;

      return job;
    }));

    // Filter jobs based on student's qualifications (simplified)
    const { id: studentId } = req.user;
    const studentDoc = await db.collection('users').doc(studentId).get();
    const student = studentDoc.data();

    const qualifiedJobs = jobs.filter(job => {
      // Simple matching logic - can be enhanced
      return job.requirements.some(req =>
        student.qualifications && student.qualifications.includes(req)
      );
    });

    res.json({ jobs: qualifiedJobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

// Get qualified courses based on student's grade
const getQualifiedCourses = async (req, res) => {
  try {
    const { id: studentId } = req.user;

    // Get student grade from user profile
    const studentDoc = await db.collection('users').doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentDoc.data();
    const studentGrade = student.studentGrade || 0;

    // Get all active courses
    const coursesSnapshot = await db.collection('courses').where('status', '==', 'active').get();
    const qualifiedCourses = [];

    for (const doc of coursesSnapshot.docs) {
      const course = Course.fromFirestore(doc);

      // Check if student qualifies (grade >= minGrade)
      if (studentGrade >= course.minGrade) {
        // Get institution details
        const institutionDoc = await db.collection('institutions').doc(course.institutionId).get();
        course.institutionName = institutionDoc.exists ? institutionDoc.data().name : 'Unknown';
        course.facultyName = course.faculty || 'General';
        course.requirements = course.requirements || 'Standard requirements';
        course.availableSlots = course.availableSlots || 0;
        course.studentGrade = studentGrade;

        qualifiedCourses.push(course);
      }
    }

    res.json(qualifiedCourses);
  } catch (error) {
    console.error('Get qualified courses error:', error);
    res.status(500).json({ error: 'Failed to get qualified courses' });
  }
};

// Upload transcript and update student grade
const uploadTranscript = async (req, res) => {
  try {
    const { id: studentId } = req.user;
    const { transcriptData, gradeAverage, additionalCertificates } = req.body;

    // Update student profile with transcript data and grade
    await db.collection('users').doc(studentId).update({
      transcriptData: transcriptData,
      studentGrade: gradeAverage,
      additionalCertificates: additionalCertificates || [],
      lastTranscriptUpload: new Date(),
      updatedAt: new Date()
    });

    // Get qualified courses count
    const coursesSnapshot = await db.collection('courses').where('status', '==', 'active').get();
    let qualifiedCoursesCount = 0;

    for (const doc of coursesSnapshot.docs) {
      const course = Course.fromFirestore(doc);
      if (gradeAverage >= course.minGrade) {
        qualifiedCoursesCount++;
      }
    }

    res.json({
      message: 'Transcript uploaded successfully',
      qualifiedCoursesCount: qualifiedCoursesCount
    });
  } catch (error) {
    console.error('Upload transcript error:', error);
    res.status(500).json({ error: 'Failed to upload transcript' });
  }
};

// Set test grade for qualification testing
const setTestGrade = async (req, res) => {
  try {
    const { id: studentId } = req.user;
    const { grade } = req.body;

    // Update student profile with test grade
    await db.collection('users').doc(studentId).update({
      studentGrade: grade,
      testGradeSet: true,
      updatedAt: new Date()
    });

    // Get qualified courses count
    const coursesSnapshot = await db.collection('courses').where('status', '==', 'active').get();
    const qualifiedCourses = [];

    for (const doc of coursesSnapshot.docs) {
      const course = Course.fromFirestore(doc);
      if (grade >= course.minGrade) {
        qualifiedCourses.push(course);
      }
    }

    res.json({
      message: 'Test grade set successfully',
      qualifiedCourses: qualifiedCourses
    });
  } catch (error) {
    console.error('Set test grade error:', error);
    res.status(500).json({ error: 'Failed to set test grade' });
  }
};

// Apply for job
const applyForJob = async (req, res) => {
  try {
    const { id: studentId } = req.user;
    const { jobId } = req.body;

    // Check if already applied
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = Job.fromFirestore(jobDoc);
    if (job.applicants.includes(studentId)) {
      return res.status(400).json({ error: 'Already applied for this job' });
    }

    // Add student to applicants
    await db.collection('jobs').doc(jobId).update({
      applicants: db.FieldValue.arrayUnion(studentId),
      updatedAt: new Date()
    });

    res.json({ message: 'Job application submitted successfully' });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ error: 'Failed to apply for job' });
  }
};

module.exports = {
  getCourses,
  applyForCourse,
  getApplications,
  getAdmissionResults,
  uploadDocuments,
  getJobs,
  applyForJob,
  getQualifiedCourses,
  uploadTranscript,
  setTestGrade
};
