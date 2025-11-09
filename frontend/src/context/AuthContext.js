import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Enhanced Lesotho phone validation
  const validateLesothoPhone = (phone) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Strict Lesotho phone number validation
    const validFormats = [
      /^\+266\d{8}$/,        // +26650123456
      /^266\d{8}$/,          // 26650123456
      /^0\d{8}$/,            // 050123456
      /^\d{8}$/              // 50123456
    ];
    
    const isValid = validFormats.some(format => format.test(cleanPhone));
    
    if (!isValid) {
      throw new Error('Please enter a valid Lesotho phone number. Formats: +26650123456, 26650123456, 050123456, or 50123456');
    }
    
    return true;
  };

  // Enhanced email validation - only real email formats
  const validateEmail = (email) => {
    if (!email || !email.trim()) {
      throw new Error('Please enter your email address');
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address (e.g., name@gmail.com)');
    }
    
    // Block common fake/test email domains
    const fakeDomains = [
      'example.com', 'test.com', 'localhost.com', 'fake.com', 
      'demo.com', 'temp.com', 'mailinator.com', '10minutemail.com'
    ];
    
    const domain = email.split('@')[1].toLowerCase();
    if (fakeDomains.includes(domain)) {
      throw new Error('Please use a real email address for verification');
    }
    
    return true;
  };

  const validateName = (name) => {
    if (!name.trim() || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      throw new Error('Name can only contain letters and spaces');
    }
    return true;
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    return true;
  };

  // Format Lesotho phone to international format
  const formatLesothoPhone = (phone) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (cleanPhone.startsWith('+266') && cleanPhone.length === 12) {
      return cleanPhone;
    }
    
    if (cleanPhone.startsWith('266') && cleanPhone.length === 11) {
      return '+' + cleanPhone;
    }
    
    if (cleanPhone.startsWith('0') && cleanPhone.length === 9) {
      return '+266' + cleanPhone.slice(1);
    }
    
    if (/^\d{8}$/.test(cleanPhone)) {
      return '+266' + cleanPhone;
    }
    
    throw new Error('Invalid Lesotho phone number format');
  };

  // Register with Firebase - REAL EMAIL VERIFICATION
  const register = async (userData) => {
    try {
      console.log('Starting REAL registration process...');
      
      // Enhanced validation
      validateName(userData.name);
      validateEmail(userData.email);
      validateLesothoPhone(userData.phone);
      validatePassword(userData.password);

      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Format phone number to international standard
      const formattedPhone = formatLesothoPhone(userData.phone);

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: userData.name
      });

      // Create user profile in Firestore
      const userProfileData = {
        uid: user.uid,
        name: userData.name,
        email: userData.email,
        phone: formattedPhone,
        role: userData.role,
        institutionName: userData.institutionName || '',
        companyName: userData.companyName || '',
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userProfileData);

      // Send REAL email verification via Firebase
      await sendEmailVerification(user);

      return { 
        user: user,
        message: 'Registration successful! Check your REAL email for verification link from Firebase.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email or login.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address (e.g., name@gmail.com).';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = error.message || 'Registration failed. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Login without mandatory email verification check
  const login = async (email, password) => {
    try {
      // Enhanced email validation
      validateEmail(email);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const userProfileData = userDoc.data();
        setUserProfile(userProfileData);
      }

      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);

      let errorMessage = 'Login failed. Please try again.';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please register first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Invalid password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many login attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'Login failed. Please try again.';
      }

      throw new Error(errorMessage);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed. Please try again.');
    }
  };

  // Verify email with code (for custom verification if needed)
  const verifyEmail = async (code) => {
    try {
      // For Firebase Auth, email verification is handled via links
      // This function can be used for custom verification codes if implemented
      if (!currentUser) {
        throw new Error('No user logged in.');
      }

      // In a real implementation, you might verify a code here
      // For now, we'll assume the email is verified if this function is called
      await updateDoc(doc(db, 'users', currentUser.uid), {
        emailVerified: true,
        updatedAt: new Date().toISOString()
      });

      // Force refresh of user profile
      setUserProfile(prev => ({ ...prev, emailVerified: true }));

      return 'Email verified successfully!';
    } catch (error) {
      throw new Error('Failed to verify email. Please try again.');
    }
  };

  // Check if user has pending verification
  const hasPendingVerification = () => {
    if (!currentUser) return false;
    return !currentUser.emailVerified;
  };

  // Resend REAL verification email
  const resendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return 'Verification email sent successfully! Check your inbox.';
      } else {
        throw new Error('No user logged in.');
      }
    } catch (error) {
      throw new Error('Failed to send verification email. Please try again.');
    }
  };

  // Update user profile with validation
  const updateUserProfile = async (updates) => {
    try {
      if (!currentUser) {
        throw new Error('No user logged in.');
      }

      // Validate phone if being updated
      if (updates.phone) {
        validateLesothoPhone(updates.phone);
        updates.phone = formatLesothoPhone(updates.phone);
      }

      // Update in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setUserProfile(prev => ({ ...prev, ...updates }));

      // Update display name in Firebase Auth if name changed
      if (updates.name) {
        await updateProfile(currentUser, {
          displayName: updates.name
        });
      }

      return 'Profile updated successfully!';
    } catch (error) {
      throw new Error('Failed to update profile. Please try again.');
    }
  };

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Get user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile(userData);

            // Check if there's an intended path to redirect to
            const intendedPath = localStorage.getItem('intendedPath');
            if (intendedPath && user.emailVerified) {
              // Only redirect if user is verified and has the correct role for the path
              const roleFromPath = getRoleFromPath(intendedPath);
              if (!roleFromPath || userData.role === roleFromPath) {
                localStorage.removeItem('intendedPath');
                window.location.href = intendedPath;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Helper function to extract role from path
  const getRoleFromPath = (path) => {
    if (path.includes('/admin/')) return 'admin';
    if (path.includes('/institute/')) return 'institute';
    if (path.includes('/student/')) return 'student';
    if (path.includes('/company/')) return 'company';
    return null;
  };

  const value = {
    currentUser,
    userProfile,
    register,
    login,
    logout,
    verifyEmail,
    resendVerification,
    hasPendingVerification,
    updateProfile: updateUserProfile,
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false,
    formatLesothoPhone
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};