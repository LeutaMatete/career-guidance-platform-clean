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

const FACULTIES_COLLECTION = 'faculties';

// Get all faculties
export const getFaculties = async () => {
  try {
    const q = query(collection(db, FACULTIES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting faculties:', error);
    throw new Error('Failed to load faculties');
  }
};

// Get faculties by institution ID
export const getFacultiesByInstitution = async (institutionId) => {
  try {
    const q = query(
      collection(db, FACULTIES_COLLECTION),
      where('institutionId', '==', institutionId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting faculties by institution:', error);
    throw new Error('Failed to load faculties');
  }
};

// Get faculty by ID
export const getFacultyById = async (id) => {
  try {
    const docRef = doc(db, FACULTIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Faculty not found');
    }
  } catch (error) {
    console.error('Error getting faculty:', error);
    throw new Error('Failed to load faculty');
  }
};

// Create new faculty
export const createFaculty = async (facultyData) => {
  try {
    const docRef = await addDoc(collection(db, FACULTIES_COLLECTION), {
      ...facultyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      courseCount: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating faculty:', error);
    throw new Error('Failed to create faculty');
  }
};

// Update faculty
export const updateFaculty = async (id, updates) => {
  try {
    const docRef = doc(db, FACULTIES_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    throw new Error('Failed to update faculty');
  }
};

// Delete faculty
export const deleteFaculty = async (id) => {
  try {
    await deleteDoc(doc(db, FACULTIES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting faculty:', error);
    throw new Error('Failed to delete faculty');
  }
};

// Update course count for faculty
export const updateFacultyCourseCount = async (facultyId) => {
  try {
    // Import coursesService to avoid circular dependency
    const { getCoursesByFaculty } = await import('./coursesService');
    const courses = await getCoursesByFaculty(facultyId);

    const docRef = doc(db, FACULTIES_COLLECTION, facultyId);
    await updateDoc(docRef, {
      courseCount: courses.length,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating faculty course count:', error);
  }
};

// Real-time listener for faculties by institution
export const subscribeToFacultiesByInstitution = (institutionId, callback) => {
  const q = query(
    collection(db, FACULTIES_COLLECTION),
    where('institutionId', '==', institutionId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (querySnapshot) => {
    const faculties = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(faculties);
  }, (error) => {
    console.error('Error in faculties subscription:', error);
  });
};

// Real-time listener for all faculties (admin)
export const subscribeToFaculties = (callback) => {
  const q = query(collection(db, FACULTIES_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const faculties = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(faculties);
  }, (error) => {
    console.error('Error in faculties subscription:', error);
  });
};
