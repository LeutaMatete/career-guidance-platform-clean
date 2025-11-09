import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';

// Rule 1: Institutions cannot admit the same student into multiple programs
export const checkMultipleAdmissions = async (studentId, institutionId) => {
  try {
    const q = query(
      collection(db, 'applications'),
      where('studentId', '==', studentId),
      where('institutionId', '==', institutionId),
      where('status', '==', 'approved')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0;
  } catch (error) {
    console.error('Error checking multiple admissions:', error);
    return false;
  }
};

// Rule 2: Students cannot apply for courses they don't qualify for
export const checkStudentQualifications = async (studentId, courseId) => {
  try {
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    
    if (!studentDoc.exists() || !courseDoc.exists()) return false;

    const student = studentDoc.data();
    const course = courseDoc.data();

    // Check academic background
    if (course.requirements && student.academicBackground) {
      const meetsRequirements = evaluateRequirements(course.requirements, student.academicBackground);
      if (!meetsRequirements) return false;
    }

    // Check education level
    if (course.minEducationLevel && student.educationLevel) {
      const educationLevels = {
        'high-school': 1,
        'diploma': 2,
        'bachelors': 3,
        'masters': 4,
        'phd': 5
      };
      
      const studentLevel = educationLevels[student.educationLevel] || 0;
      const requiredLevel = educationLevels[course.minEducationLevel] || 0;
      
      if (studentLevel < requiredLevel) return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking qualifications:', error);
    return false;
  }
};

// Rule 3: Maximum 2 courses per institution
export const checkMaxApplications = async (studentId, institutionId) => {
  try {
    const q = query(
      collection(db, 'applications'),
      where('studentId', '==', studentId),
      where('institutionId', '==', institutionId),
      where('status', 'in', ['pending', 'approved'])
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size >= 2;
  } catch (error) {
    console.error('Error checking max applications:', error);
    return true;
  }
};

// Rule 4: Only qualified students receive job notifications
export const getQualifiedStudentsForJob = async (jobId) => {
  try {
    const jobDoc = await getDoc(doc(db, 'jobPostings', jobId));
    if (!jobDoc.exists()) return [];

    const job = jobDoc.data();
    const studentsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('emailVerified', '==', true)
    );
    
    const studentsSnapshot = await getDocs(studentsQuery);
    const qualifiedStudents = [];

    for (const studentDoc of studentsSnapshot.docs) {
      const student = studentDoc.data();
      const isQualified = await checkJobQualifications(job, student);
      
      if (isQualified) {
        qualifiedStudents.push({
          id: studentDoc.id,
          ...student,
          matchScore: calculateJobMatchScore(job, student)
        });
      }
    }

    // Sort by match score (highest first)
    return qualifiedStudents.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error getting qualified students:', error);
    return [];
  }
};

// Rule 5: Handle multiple admissions across institutions
export const handleMultipleAdmissionOffers = async (studentId, selectedInstitutionId) => {
  const batch = writeBatch(db);
  
  try {
    // Get all approved applications for the student
    const q = query(
      collection(db, 'applications'),
      where('studentId', '==', studentId),
      where('status', '==', 'approved')
    );
    
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const application = doc.data();
      
      if (application.institutionId === selectedInstitutionId) {
        // Accept the selected institution
        batch.update(doc.ref, {
          status: 'accepted',
          acceptedAt: new Date().toISOString()
        });
      } else {
        // Reject other institutions and move to waitlist
        batch.update(doc.ref, {
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectionReason: 'Student accepted offer from another institution'
        });

        // Move first student from waitlist to main list
        await promoteFromWaitlist(application.admissionId, batch);
      }
    }
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error handling multiple admissions:', error);
    return false;
  }
};

const promoteFromWaitlist = async (admissionId, batch) => {
  try {
    const waitlistQuery = query(
      collection(db, 'applications'),
      where('admissionId', '==', admissionId),
      where('status', '==', 'waitlisted'),
      where('waitlistPosition', '==', 1)
    );
    
    const waitlistSnapshot = await getDocs(waitlistQuery);
    
    if (!waitlistSnapshot.empty) {
      const firstWaitlisted = waitlistSnapshot.docs[0];
      batch.update(firstWaitlisted.ref, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        waitlistPosition: null
      });

      // Update waitlist positions for remaining students
      const remainingWaitlistQuery = query(
        collection(db, 'applications'),
        where('admissionId', '==', admissionId),
        where('status', '==', 'waitlisted'),
        where('waitlistPosition', '>', 1)
      );
      
      const remainingSnapshot = await getDocs(remainingWaitlistQuery);
      remainingSnapshot.forEach(doc => {
        batch.update(doc.ref, {
          waitlistPosition: doc.data().waitlistPosition - 1
        });
      });
    }
  } catch (error) {
    console.error('Error promoting from waitlist:', error);
  }
};

const evaluateRequirements = (requirements, academicBackground) => {
  // Simple requirement evaluation
  // In production, this would be more sophisticated
  const requiredKeywords = requirements.toLowerCase().split(' ');
  const background = academicBackground.toLowerCase();
  
  return requiredKeywords.some(keyword => 
    background.includes(keyword) && keyword.length > 3
  );
};

const checkJobQualifications = async (job, student) => {
  // Check education level
  if (job.educationLevel) {
    const educationLevels = {
      'high-school': 1,
      'diploma': 2,
      'bachelors': 3,
      'masters': 4,
      'phd': 5
    };
    
    const studentLevel = educationLevels[student.educationLevel] || 0;
    const requiredLevel = educationLevels[job.educationLevel] || 0;
    
    if (studentLevel < requiredLevel) return false;
  }

  // Check experience level
  if (job.experienceLevel && student.experience) {
    const experienceLevels = {
      'internship': 1,
      'entry': 2,
      'mid': 3,
      'senior': 4,
      'executive': 5
    };
    
    const studentExp = experienceLevels[student.experience] || 0;
    const requiredExp = experienceLevels[job.experienceLevel] || 0;
    
    if (studentExp < requiredExp) return false;
  }

  // Check skills match
  if (job.requirements && student.skills) {
    const skillsMatch = calculateSkillsMatch(job.requirements, student.skills);
    if (skillsMatch < 0.3) return false; // Require at least 30% skills match
  }

  return true;
};

const calculateJobMatchScore = (job, student) => {
  let score = 0;

  // Education match (30%)
  const educationMatch = getEducationMatch(job.educationLevel, student.educationLevel);
  score += educationMatch * 30;

  // Skills match (40%)
  const skillsMatch = calculateSkillsMatch(job.requirements, student.skills);
  score += skillsMatch * 40;

  // Experience match (20%)
  const experienceMatch = getExperienceMatch(job.experienceLevel, student.experience);
  score += experienceMatch * 20;

  // Certificates bonus (10%)
  const hasCertificates = student.certificates && student.certificates.length > 0;
  if (hasCertificates) score += 10;

  return Math.min(100, Math.round(score));
};

const calculateSkillsMatch = (jobRequirements, studentSkills) => {
  if (!jobRequirements || !studentSkills) return 0;
  
  const requiredSkills = extractSkills(jobRequirements);
  const studentSkillList = studentSkills.split(',').map(s => s.trim().toLowerCase());
  
  let matches = 0;
  requiredSkills.forEach(skill => {
    if (studentSkillList.some(s => s.includes(skill) || skill.includes(s))) {
      matches++;
    }
  });
  
  return matches / Math.max(requiredSkills.length, 1);
};

const extractSkills = (text) => {
  if (!text) return [];
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'sql',
    'mongodb', 'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
    'communication', 'leadership', 'problem solving', 'teamwork'
  ];
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill)
  );
};

const getEducationMatch = (required, student) => {
  const levels = {
    'high-school': 1,
    'diploma': 2,
    'bachelors': 3,
    'masters': 4,
    'phd': 5
  };
  
  const requiredLevel = levels[required] || 0;
  const studentLevel = levels[student] || 0;
  
  if (studentLevel >= requiredLevel) return 1;
  if (studentLevel >= requiredLevel - 1) return 0.5;
  return 0;
};

const getExperienceMatch = (required, studentExperience) => {
  const levels = {
    'internship': 1,
    'entry': 2,
    'mid': 3,
    'senior': 4,
    'executive': 5
  };
  
  const requiredLevel = levels[required] || 0;
  const studentLevel = studentExperience ? levels[studentExperience] || 0 : 0;
  
  if (studentLevel >= requiredLevel) return 1;
  if (studentLevel >= requiredLevel - 1) return 0.7;
  if (studentLevel >= requiredLevel - 2) return 0.4;
  return 0;
};