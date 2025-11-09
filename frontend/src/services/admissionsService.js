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

const ADMISSIONS_COLLECTION = 'admissions';

// Get all admissions
export const getAdmissions = async () => {
  try {
    const q = query(collection(db, ADMISSIONS_COLLECTION), orderBy('publishedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting admissions:', error);
    throw new Error('Failed to load admissions');
  }
};

// Get admissions by institution ID
export const getAdmissionsByInstitution = async (institutionId) => {
  try {
    // First get courses for this institution
    const { getCoursesByInstitution } = await import('./coursesService');
    const courses = await getCoursesByInstitution(institutionId);
    const courseIds = courses.map(course => course.id);

    if (courseIds.length === 0) return [];

    // Get admissions for courses in this institution
    const q = query(
      collection(db, ADMISSIONS_COLLECTION),
      where('courseId', 'in', courseIds),
      orderBy('publishedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting admissions by institution:', error);
    throw new Error('Failed to load admissions');
  }
};

// Get admissions by course ID
export const getAdmissionsByCourse = async (courseId) => {
  try {
    const q = query(
      collection(db, ADMISSIONS_COLLECTION),
      where('courseId', '==', courseId),
      orderBy('publishedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting admissions by course:', error);
    throw new Error('Failed to load admissions');
  }
};

// Get admission by ID
export const getAdmissionById = async (id) => {
  try {
    const docRef = doc(db, ADMISSIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Admission not found');
    }
  } catch (error) {
    console.error('Error getting admission:', error);
    throw new Error('Failed to load admission');
  }
};

// Create new admission
export const createAdmission = async (admissionData) => {
  try {
    const docRef = await addDoc(collection(db, ADMISSIONS_COLLECTION), {
      ...admissionData,
      publishedAt: new Date().toISOString(),
      status: 'open',
      applicationsReceived: 0,
      applicationsApproved: 0,
      applicationsRejected: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating admission:', error);
    throw new Error('Failed to create admission');
  }
};

// Update admission
export const updateAdmission = async (id, updates) => {
  try {
    const docRef = doc(db, ADMISSIONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating admission:', error);
    throw new Error('Failed to update admission');
  }
};

// Close admission
export const closeAdmission = async (id) => {
  try {
    const docRef = doc(db, ADMISSIONS_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'closed',
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error closing admission:', error);
    throw new Error('Failed to close admission');
  }
};

// Reopen admission
export const reopenAdmission = async (id) => {
  try {
    const docRef = doc(db, ADMISSIONS_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'open',
      reopenedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reopening admission:', error);
    throw new Error('Failed to reopen admission');
  }
};

// Update admission status
export const updateAdmissionStatus = async (id, status) => {
  try {
    const docRef = doc(db, ADMISSIONS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating admission status:', error);
    throw new Error('Failed to update admission status');
  }
};

// Delete admission
export const deleteAdmission = async (id) => {
  try {
    await deleteDoc(doc(db, ADMISSIONS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting admission:', error);
    throw new Error('Failed to delete admission');
  }
};

// Get active admissions (status = 'open')
export const getActiveAdmissions = async () => {
  try {
    const q = query(
      collection(db, ADMISSIONS_COLLECTION),
      where('status', '==', 'open'),
      orderBy('publishedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting active admissions:', error);
    throw new Error('Failed to load active admissions');
  }
};

// Update application counts for admission
export const updateAdmissionApplicationCounts = async (admissionId) => {
  try {
    // Import applicationsService to avoid circular dependency
    const { getApplicationsByAdmission } = await import('./applicationsService');
    const applications = await getApplicationsByAdmission(admissionId);

    const approved = applications.filter(app => app.status === 'approved').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const received = applications.length;

    const docRef = doc(db, ADMISSIONS_COLLECTION, admissionId);
    await updateDoc(docRef, {
      applicationsReceived: received,
      applicationsApproved: approved,
      applicationsRejected: rejected,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating admission application counts:', error);
  }
};

// Real-time listener for admissions by institution
export const subscribeToAdmissionsByInstitution = (institutionId, callback) => {
  // This is complex as it needs to listen to courses and admissions
  // For now, we'll use a simpler approach
  const q = query(collection(db, ADMISSIONS_COLLECTION), orderBy('publishedAt', 'desc'));
  return onSnapshot(q, async (querySnapshot) => {
    const allAdmissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    try {
      // Filter admissions that belong to courses of this institution
      const { getCoursesByInstitution } = await import('./coursesService');
      const courses = await getCoursesByInstitution(institutionId);
      const courseIds = courses.map(course => course.id);

      const institutionAdmissions = allAdmissions.filter(admission =>
        courseIds.includes(admission.courseId)
      );

      callback(institutionAdmissions);
    } catch (error) {
      console.error('Error filtering admissions by institution:', error);
      callback([]);
    }
  }, (error) => {
    console.error('Error in admissions subscription:', error);
  });
};

// Real-time listener for all admissions (admin)
export const subscribeToAdmissions = (callback) => {
  const q = query(collection(db, ADMISSIONS_COLLECTION), orderBy('publishedAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const admissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(admissions);
  }, (error) => {
    console.error('Error in admissions subscription:', error);
  });
};
