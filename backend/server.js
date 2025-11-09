import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { auth as adminAuth, db as adminDb } from './firebaseAdmin.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'career_guidance_secret_2024';

app.use(cors());
app.use(express.json());

// In-memory database (in production, use real database)
let users = [];
let institutions = [];
let courses = [];
let applications = [];
let jobs = [];
let faculties = [];
let transcripts = [];
let jobApplications = [];

// Firebase Firestore integration functions
const syncWithFirestore = async () => {
  try {
    console.log('🔄 Syncing with Firebase Firestore...');
    
    // Sync users to Firestore
    const usersCollection = adminDb.collection('users');
    for (const user of users) {
      await usersCollection.doc(user.id).set(user, { merge: true });
    }
    
    // Sync institutions to Firestore
    const institutionsCollection = adminDb.collection('institutions');
    for (const institution of institutions) {
      await institutionsCollection.doc(institution.id).set(institution, { merge: true });
    }
    
    // Sync courses to Firestore
    const coursesCollection = adminDb.collection('courses');
    for (const course of courses) {
      await coursesCollection.doc(course.id).set(course, { merge: true });
    }
    
    console.log('✅ Data synced with Firestore successfully');
  } catch (error) {
    console.error('❌ Error syncing with Firestore:', error);
  }
};

// Firebase Auth verification middleware
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Sample data initialization (same as before)
const initializeSampleData = () => {
  // ... (your existing sample data code remains the same) ...
};

// Initialize sample data
initializeSampleData();

// Sync with Firestore on startup
syncWithFirestore();

// Routes

// Health check with Firebase status
app.get('/api/health', async (req, res) => {
  try {
    // Test Firebase connection
    await adminAuth.listUsers(1);
    
    res.json({ 
      status: 'OK', 
      message: 'Career Guidance Backend is running',
      firebase: 'Connected',
      timestamp: new Date().toISOString(),
      stats: {
        users: users.length,
        institutions: institutions.length,
        courses: courses.length,
        applications: applications.length,
        jobs: jobs.length
      }
    });
  } catch (error) {
    res.json({ 
      status: 'OK', 
      message: 'Career Guidance Backend is running',
      firebase: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
      stats: {
        users: users.length,
        institutions: institutions.length,
        courses: courses.length,
        applications: applications.length,
        jobs: jobs.length
      }
    });
  }
});

// Firebase test route
app.get('/api/firebase-test', async (req, res) => {
  try {
    // Test Firebase Auth
    const usersList = await adminAuth.listUsers(1);
    
    // Test Firestore
    const testDoc = await adminDb.collection('test').doc('connection').set({
      test: true,
      timestamp: new Date()
    });
    
    res.json({
      firebaseAuth: 'Working',
      firestore: 'Working',
      message: 'Firebase services are connected successfully'
    });
  } catch (error) {
    res.status(500).json({
      firebaseAuth: 'Error',
      firestore: 'Error',
      error: error.message
    });
  }
});

// ... (rest of your routes remain the same, but you can now use verifyFirebaseToken instead of JWT middleware if needed) ...

// Your existing auth routes, student routes, admin routes, etc. remain the same
// ... (all your existing route code) ...

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Firebase test: http://localhost:${PORT}/api/firebase-test`);
  console.log(`Sample student login: student@test.com / student123`);
  console.log(`Sample admin login: admin@careerguidance.com / admin123`);
});