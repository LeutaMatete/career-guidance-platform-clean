import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

const INSTITUTIONS_COLLECTION = 'institutions';

// Get all institutions
export const getInstitutions = async () => {
  try {
    const q = query(collection(db, INSTITUTIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting institutions:', error);
    throw new Error('Failed to load institutions');
  }
};

// Get institution by ID
export const getInstitutionById = async (id) => {
  try {
    const docRef = doc(db, INSTITUTIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Institution not found');
    }
  } catch (error) {
    console.error('Error getting institution:', error);
    throw new Error('Failed to load institution');
  }
};

// Create new institution
export const createInstitution = async (institutionData) => {
  try {
    const docRef = await addDoc(collection(db, INSTITUTIONS_COLLECTION), {
      ...institutionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating institution:', error);
    throw new Error('Failed to create institution');
  }
};

// Update institution
export const updateInstitution = async (id, updates) => {
  try {
    const docRef = doc(db, INSTITUTIONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating institution:', error);
    throw new Error('Failed to update institution');
  }
};

// Delete institution
export const deleteInstitution = async (id) => {
  try {
    await deleteDoc(doc(db, INSTITUTIONS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting institution:', error);
    throw new Error('Failed to delete institution');
  }
};

// Get institutions by status
export const getInstitutionsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, INSTITUTIONS_COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting institutions by status:', error);
    throw new Error('Failed to load institutions');
  }
};

// Real-time listener for institutions
export const subscribeToInstitutions = (callback) => {
  const q = query(collection(db, INSTITUTIONS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const institutions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(institutions);
  }, (error) => {
    console.error('Error in institutions subscription:', error);
  });
};
