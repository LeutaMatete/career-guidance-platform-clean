// Test script to verify qualification evaluator works with real transcript
import { evaluateStudentQualifications } from './qualificationEvaluator.js';

const testQualificationEvaluator = async () => {
  console.log('🧪 Testing Qualification Evaluator with Real Transcript\n');

  // Mock student ID (would be real in production)
  const studentId = 'test-student-id';

  // Your actual transcript content
  const realTranscript = `SAMPLE — HIGH ACHIEVEMENT TRANSCRIPT
 (NOT OFFICIAL)
 Name: Keneuoe
 School: Nqechane High School
 Form: Form E
 Year: 2022
 NOTE: This is a SAMPLE transcript created for practice and demonstration purposes only. It is not
 an official school record and must not be used to misrepresent academic qualifications.
 Subject
 Marks (%)
 English Language
 92
 Grade
 A (Distinction)
 Sesotho
 Mathematics
 Physical Science
 Biology
 Geography
 Development Studies
 Agriculture
 Average Marks: 91.00 %
 90
 95
 91
 89
 88
 90
 93
 Overall Result: Distinction level performance across all eight subjects.
 A (Distinction)
 A* (Distinction)
 A (Distinction)
 A (Distinction)
 A (Distinction)
 A (Distinction)
 A (Distinction)
 This document is a SAMPLE and NOT an official academic record. Do not use for official
 applications.
 Principal's Signature: __________________________`;

  try {
    console.log('Testing with your transcript...');
    const qualifiedAdmissions = await evaluateStudentQualifications(studentId, realTranscript);

    console.log('\n' + '='.repeat(50));
    console.log('RESULTS:');
    console.log('='.repeat(50));

    if (qualifiedAdmissions.length === 0) {
      console.log('❌ NO QUALIFIED PROGRAMS FOUND!');
      console.log('This is the problem - the evaluator is not finding any programs you qualify for.');
    } else {
      console.log(`✅ FOUND ${qualifiedAdmissions.length} QUALIFIED PROGRAMS!`);
      console.log('You should be qualifying for programs. The issue might be elsewhere.');

      qualifiedAdmissions.forEach((admission, index) => {
        console.log(`\n${index + 1}. ${admission.courseName}`);
        console.log(`   Institution: ${admission.institution?.institutionName}`);
        console.log(`   Match Score: ${admission.matchScore}%`);
        console.log(`   Reasons: ${admission.qualificationReasons?.join(', ')}`);
      });
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('The qualification evaluator is failing. This could be due to:');
    console.log('1. Firebase connection issues');
    console.log('2. Missing data in the database');
    console.log('3. Logic errors in the evaluator');
  }

  console.log('\n✅ Test completed!');
};

// Run the test
testQualificationEvaluator();
