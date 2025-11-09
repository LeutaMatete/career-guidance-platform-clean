const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, auth: firebaseAuth } = require('../config/firebase');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, ...otherData } = req.body;

    // Check if user already exists
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data
    const userData = {
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      ...otherData,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to Firestore
    const userRef = await db.collection('users').add(userData);
    const user = new User({ id: userRef.id, ...userData });

    // Create Firebase Auth user for email verification
    try {
      await firebaseAuth.createUser({
        uid: userRef.id,
        email: email,
        password: password,
        displayName: `${firstName} ${lastName}`,
        disabled: false
      });

      // Send email verification
      // Note: In production, you might want to send a custom email
      // For now, we'll mark as verified for simplicity
      await db.collection('users').doc(userRef.id).update({ isVerified: true });
    } catch (authError) {
      console.error('Firebase Auth error:', authError);
      // Continue without Firebase Auth for now
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Check password
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if verified
    if (!userData.isVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: userDoc.id, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userDoc.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token and update user
    // This is a simplified version - in production, use proper email verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await db.collection('users').doc(decoded.id).update({ isVerified: true });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ error: 'Invalid verification token' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const updates = req.body;

    // Remove sensitive fields
    delete updates.password;
    delete updates.role;
    delete updates.isVerified;

    updates.updatedAt = new Date();

    await db.collection('users').doc(id).update(updates);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  getProfile,
  updateProfile
};
