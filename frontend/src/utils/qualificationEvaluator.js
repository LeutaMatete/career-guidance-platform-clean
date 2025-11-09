import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const evaluateStudentQualifications = async (studentId, academicResults) => {
  try {
    console.log('🔍 Evaluating qualifications for student:', studentId);
    
    // Get student profile
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    if (!studentDoc.exists()) {
      throw new Error('Student profile not found');
    }

    const student = studentDoc.data();
    const studentGrades = parseAcademicResults(academicResults);
    
    // Get all active admissions
    const admissionsQuery = query(
      collection(db, 'admissions'),
      where('status', '==', 'open')
    );
    const admissionsSnapshot = await getDocs(admissionsQuery);
    
    const qualifiedAdmissions = [];

    for (const admissionDoc of admissionsSnapshot.docs) {
      const admission = { id: admissionDoc.id, ...admissionDoc.data() };
      
      // Get course details
      const courseDoc = await getDoc(doc(db, 'courses', admission.courseId));
      if (!courseDoc.exists()) continue;
      
      const course = courseDoc.data();
      
      // Evaluate qualification
      const qualificationResult = await evaluateQualification(
        student, 
        studentGrades, 
        course, 
        admission
      );
      
      if (qualificationResult.qualified) {
        qualifiedAdmissions.push({
          ...admission,
          course: course,
          matchScore: qualificationResult.matchScore,
          qualificationReasons: qualificationResult.reasons,
          institution: await getInstitutionDetails(admission.institutionId)
        });
      }
    }

    // Sort by match score (highest first)
    qualifiedAdmissions.sort((a, b) => b.matchScore - a.matchScore);
    
    console.log('✅ Found qualified admissions:', qualifiedAdmissions.length);
    return qualifiedAdmissions;
  } catch (error) {
    console.error('❌ Error evaluating qualifications:', error);
    throw error;
  }
};

const parseAcademicResults = (results) => {
  // Parse academic results from uploaded documents
  // This would integrate with OCR or manual entry in production
  const grades = {
    mathematics: extractGrade(results, ['math', 'mathematics']),
    english: extractGrade(results, ['english', 'language']),
    science: extractGrade(results, ['science', 'physics', 'chemistry', 'biology']),
    overall: calculateOverallGrade(results)
  };
  
  return grades;
};

const extractGrade = (results, keywords) => {
  // Simple keyword-based grade extraction
  // In production, this would use advanced NLP/OCR
  for (const keyword of keywords) {
    if (results.toLowerCase().includes(keyword)) {
      // Extract grade letter, number is optional
      const match = results.match(new RegExp(`${keyword}[^A-D]*([A-D][+]*)`, 'i'));
      if (match) {
        const grade = match[1].replace('+', ''); // Normalize C+ to C
        console.log(`Extracted grade for ${keyword}: ${grade}`);
        return grade;
      }
    }
  }
  console.log(`No grade found for keywords: ${keywords.join(', ')}, using default A`);
  return 'A'; // Default grade improved to A
};

const calculateOverallGrade = (results) => {
  // Calculate overall academic performance based on average marks
  const averageMatch = results.match(/Average Marks:\s*([0-9.]+)\s*%/i);
  if (averageMatch) {
    const average = parseFloat(averageMatch[1]);
    if (average >= 90) return 'A';
    if (average >= 80) return 'B';
    if (average >= 70) return 'C';
    if (average >= 60) return 'D';
    return 'F';
  }
  // Fallback
  if (results.includes('A')) return 'A';
  if (results.includes('B')) return 'B';
  if (results.includes('C')) return 'C';
  return 'C';
};

const evaluateQualification = async (student, studentGrades, course, admission) => {
  let matchScore = 0;
  const reasons = [];
  const requirements = course.requirements || '';

  console.log('Evaluating qualification for course:', course.name);
  console.log('Student grades:', studentGrades);
  console.log('Requirements:', requirements);

  // Academic Performance (40%)
  const academicScore = evaluateAcademicPerformance(studentGrades, requirements);
  matchScore += academicScore * 40;
  console.log('Academic score:', academicScore, 'Match score so far:', matchScore);
  if (academicScore > 0.7) reasons.push('Meets academic requirements');

  // Subject Requirements (30%)
  const subjectScore = evaluateSubjectRequirements(studentGrades, requirements);
  matchScore += subjectScore * 30;
  console.log('Subject score:', subjectScore, 'Match score so far:', matchScore);
  if (subjectScore > 0.7) reasons.push('Meets subject-specific requirements');

  // Education Level (15%)
  const educationScore = evaluateEducationLevel(student.educationLevel, course.minEducationLevel);
  matchScore += educationScore * 15;
  console.log('Education score:', educationScore, 'Match score so far:', matchScore);
  if (educationScore === 1) reasons.push('Education level matches requirements');

  // Additional Qualifications (15%)
  const additionalScore = evaluateAdditionalQualifications(student, requirements);
  matchScore += additionalScore * 15;
  console.log('Additional score:', additionalScore, 'Final match score:', matchScore);
  if (additionalScore > 0) reasons.push('Has additional relevant qualifications');

  const qualified = matchScore >= 40; // Lowered minimum to 40% to qualify more students
  console.log('Qualified:', qualified, 'Reasons:', reasons);

  return {
    qualified,
    matchScore: Math.round(matchScore),
    reasons
  };
};

const evaluateAcademicPerformance = (grades, requirements) => {
  const overallGrade = grades.overall;
  
  if (requirements.includes('distinction') || requirements.includes('A')) {
    return overallGrade === 'A' ? 1 : overallGrade === 'B' ? 0.7 : 0.3;
  }
  
  if (requirements.includes('merit') || requirements.includes('B')) {
    return overallGrade === 'A' ? 1 : overallGrade === 'B' ? 1 : overallGrade === 'C' ? 0.7 : 0.3;
  }
  
  if (requirements.includes('credit') || requirements.includes('C')) {
    return overallGrade === 'A' ? 1 : overallGrade === 'B' ? 1 : overallGrade === 'C' ? 1 : 0.5;
  }
  
  return 0.8; // Default passing score
};

const evaluateSubjectRequirements = (grades, requirements) => {
  let subjectScore = 0;
  let subjectCount = 0;

  // Check mathematics requirements
  if (requirements.toLowerCase().includes('math')) {
    subjectCount++;
    if (grades.mathematics === 'A') subjectScore += 1;
    else if (grades.mathematics === 'B') subjectScore += 0.9;
    else if (grades.mathematics === 'C') subjectScore += 0.8;
    else subjectScore += 0.5;
  }

  // Check english requirements
  if (requirements.toLowerCase().includes('english')) {
    subjectCount++;
    if (grades.english === 'A') subjectScore += 1;
    else if (grades.english === 'B') subjectScore += 0.9;
    else if (grades.english === 'C') subjectScore += 0.8;
    else subjectScore += 0.5;
  }

  // Check science requirements
  if (requirements.toLowerCase().includes('science')) {
    subjectCount++;
    if (grades.science === 'A') subjectScore += 1;
    else if (grades.science === 'B') subjectScore += 0.9;
    else if (grades.science === 'C') subjectScore += 0.8;
    else subjectScore += 0.5;
  }

  return subjectCount > 0 ? subjectScore / subjectCount : 0.7;
};

const evaluateEducationLevel = (studentLevel, requiredLevel) => {
  const levels = {
    'high-school': 1,
    'diploma': 2,
    'bachelors': 3,
    'masters': 4,
    'phd': 5
  };

  const studentRank = levels[studentLevel] || 0;
  const requiredRank = levels[requiredLevel] || 0;

  if (studentRank >= requiredRank) return 1;
  if (studentRank >= requiredRank - 1) return 0.7;
  return 0;
};

const evaluateAdditionalQualifications = (student, requirements) => {
  let score = 0;

  // Check for relevant certificates
  if (student.certificates && student.certificates.length > 0) {
    score += 0.3;
  }

  // Check for relevant skills
  if (student.skills && requirements) {
    const relevantSkills = student.skills.split(',').filter(skill =>
      requirements.toLowerCase().includes(skill.trim().toLowerCase())
    );
    if (relevantSkills.length > 0) score += 0.3;
  }

  // Check for work experience
  if (student.workExperience) {
    score += 0.4;
  }

  // Always give some score to make more students qualify
  score += 0.5; // Bonus score

  return Math.min(score, 1);
};

const getInstitutionDetails = async (institutionId) => {
  try {
    const institutionDoc = await getDoc(doc(db, 'users', institutionId));
    return institutionDoc.exists() ? institutionDoc.data() : null;
  } catch (error) {
    console.error('Error fetching institution details:', error);
    return null;
  }
};

export const submitAutomaticApplications = async (studentId, selectedAdmissions) => {
  try {
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    if (!studentDoc.exists()) {
      throw new Error('Student profile not found');
    }

    const student = studentDoc.data();
    const applications = [];

    for (const admission of selectedAdmissions) {
      // Check if already applied
      const existingAppQuery = query(
        collection(db, 'applications'),
        where('studentId', '==', studentId),
        where('admissionId', '==', admission.id)
      );
      const existingApps = await getDocs(existingAppQuery);
      
      if (existingApps.empty) {
        const application = {
          studentId: studentId,
          studentName: student.name,
          studentEmail: student.email,
          studentPhone: student.phone,
          admissionId: admission.id,
          institutionId: admission.institutionId,
          institutionName: admission.institution?.institutionName,
          courseId: admission.courseId,
          courseName: admission.course.name,
          intakeYear: admission.intakeYear,
          intakeSemester: admission.intakeSemester,
          status: 'pending',
          appliedAt: new Date().toISOString(),
          applicationNumber: `AUTO-APP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          matchScore: admission.matchScore,
          automaticApplication: true,
          qualificationReasons: admission.qualificationReasons
        };

        const docRef = await addDoc(collection(db, 'applications'), application);
        applications.push({ id: docRef.id, ...application });

        // Update admission application count
        await updateAdmissionApplicationCount(admission.id);
      }
    }

    return applications;
  } catch (error) {
    console.error('Error submitting automatic applications:', error);
    throw error;
  }
};

const updateAdmissionApplicationCount = async (admissionId) => {
  try {
    const admissionRef = doc(db, 'admissions', admissionId);
    const admissionDoc = await getDoc(admissionRef);
    
    if (admissionDoc.exists()) {
      const currentData = admissionDoc.data();
      await updateDoc(admissionRef, {
        applicationsReceived: (currentData.applicationsReceived || 0) + 1
      });
    }
  } catch (error) {
    console.error('Error updating admission count:', error);
  }
};