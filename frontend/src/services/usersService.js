import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

const USERS_COLLECTION = 'users';

// Get all users
export const getUsers = async () => {
  try {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Failed to load users');
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('Failed to load user');
  }
};

// Update user
export const updateUser = async (id, updates) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
};

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw new Error('Failed to load users');
  }
};

// Get users by institution (for institute admins)
export const getUsersByInstitution = async (institutionId) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('institutionId', '==', institutionId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users by institution:', error);
    throw new Error('Failed to load users');
  }
};

// Get students by institution
export const getStudentsByInstitution = async (institutionId) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'student'),
      where('institutionId', '==', institutionId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting students by institution:', error);
    throw new Error('Failed to load students');
  }
};

// Get unverified users
export const getUnverifiedUsers = async () => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('emailVerified', '==', false),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting unverified users:', error);
    throw new Error('Failed to load unverified users');
  }
};

// Verify user email (admin action)
export const verifyUserEmail = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      emailVerified: true,
      verifiedBy: 'admin',
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error verifying user email:', error);
    throw new Error('Failed to verify user email');
  }
};

// Suspend user
export const suspendUser = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      status: 'suspended',
      suspendedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    throw new Error('Failed to suspend user');
  }
};

// Reactivate user
export const reactivateUser = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      status: 'active',
      reactivatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    throw new Error('Failed to reactivate user');
  }
};

// Get user statistics
export const getUserStatistics = async () => {
  try {
    const allUsers = await getUsers();

    const stats = {
      total: allUsers.length,
      students: allUsers.filter(u => u.role === 'student').length,
      institutes: allUsers.filter(u => u.role === 'institute').length,
      companies: allUsers.filter(u => u.role === 'company').length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      verified: allUsers.filter(u => u.emailVerified).length,
      unverified: allUsers.filter(u => !u.emailVerified).length,
      active: allUsers.filter(u => u.status !== 'suspended').length,
      suspended: allUsers.filter(u => u.status === 'suspended').length
    };

    return stats;
  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw new Error('Failed to load user statistics');
  }
};

// Real-time listener for users
export const subscribeToUsers = (callback) => {
  const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(users);
  }, (error) => {
    console.error('Error in users subscription:', error);
  });
};

// Update user role (generic function for admin actions)
export const updateUserRole = async (id, role) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, id);
    await updateDoc(docRef, {
      role,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
};

// Real-time listener for users by role
export const subscribeToUsersByRole = (role, callback) => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('role', '==', role),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (querySnapshot) => {
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(users);
  }, (error) => {
    console.error('Error in users subscription:', error);
  });
};
