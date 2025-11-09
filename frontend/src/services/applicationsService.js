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

const APPLICATIONS_COLLECTION = 'applications';

// Get all applications
export const getApplications = async () => {
  try {
    const q = query(collection(db, APPLICATIONS_COLLECTION), orderBy('appliedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting applications:', error);
    throw new Error('Failed to load applications');
  }
};

// Get applications by admission ID
export const getApplicationsByAdmission = async (admissionId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('admissionId', '==', admissionId),
      orderBy('appliedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting applications by admission:', error);
    throw new Error('Failed to load applications');
  }
};

// Get applications by institution ID
export const getApplicationsByInstitution = async (institutionId) => {
  try {
    // First get admissions for this institution
    const { getAdmissionsByInstitution } = await import('./admissionsService');
    const admissions = await getAdmissionsByInstitution(institutionId);
    const admissionIds = admissions.map(admission => admission.id);

    if (admissionIds.length === 0) return [];

    // Get applications for admissions in this institution
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('admissionId', 'in', admissionIds),
      orderBy('appliedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting applications by institution:', error);
    throw new Error('Failed to load applications');
  }
};

// Get applications by student ID
export const getApplicationsByStudent = async (studentId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('appliedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting applications by student:', error);
    throw new Error('Failed to load applications');
  }
};

// Get application by ID
export const getApplicationById = async (id) => {
  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Application not found');
    }
  } catch (error) {
    console.error('Error getting application:', error);
    throw new Error('Failed to load application');
  }
};

// Create new application
export const createApplication = async (applicationData) => {
  try {
    const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...applicationData,
      appliedAt: new Date().toISOString(),
      status: 'pending',
      reviewedAt: null
    });

    // Update admission application counts
    const { updateAdmissionApplicationCounts } = await import('./admissionsService');
    await updateAdmissionApplicationCounts(applicationData.admissionId);

    return docRef.id;
  } catch (error) {
    console.error('Error creating application:', error);
    throw new Error('Failed to submit application');
  }
};

// Update application status
export const updateApplicationStatus = async (id, status) => {
  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, id);
    await updateDoc(docRef, {
      status: status,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Update admission application counts
    const application = await getApplicationById(id);
    const { updateAdmissionApplicationCounts } = await import('./admissionsService');
    await updateAdmissionApplicationCounts(application.admissionId);
  } catch (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update application status');
  }
};

// Update application
export const updateApplication = async (id, updates) => {
  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating application:', error);
    throw new Error('Failed to update application');
  }
};

// Delete application
export const deleteApplication = async (id) => {
  try {
    // Get application data first to update admission counts
    const application = await getApplicationById(id);

    await deleteDoc(doc(db, APPLICATIONS_COLLECTION, id));

    // Update admission application counts
    const { updateAdmissionApplicationCounts } = await import('./admissionsService');
    await updateAdmissionApplicationCounts(application.admissionId);
  } catch (error) {
    console.error('Error deleting application:', error);
    throw new Error('Failed to delete application');
  }
};

// Get applications by status
export const getApplicationsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('status', '==', status),
      orderBy('appliedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting applications by status:', error);
    throw new Error('Failed to load applications');
  }
};

// Get pending applications for institution
export const getPendingApplicationsByInstitution = async (institutionId) => {
  try {
    const allApplications = await getApplicationsByInstitution(institutionId);
    return allApplications.filter(app => app.status === 'pending');
  } catch (error) {
    console.error('Error getting pending applications by institution:', error);
    throw new Error('Failed to load pending applications');
  }
};

// Real-time listener for applications by institution
export const subscribeToApplicationsByInstitution = (institutionId, callback) => {
  // This is complex as it needs to listen to admissions and applications
  // For now, we'll use a simpler approach
  const q = query(collection(db, APPLICATIONS_COLLECTION), orderBy('appliedAt', 'desc'));
  return onSnapshot(q, async (querySnapshot) => {
    const allApplications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    try {
      // Filter applications that belong to admissions of this institution
      const { getAdmissionsByInstitution } = await import('./admissionsService');
      const admissions = await getAdmissionsByInstitution(institutionId);
      const admissionIds = admissions.map(admission => admission.id);

      const institutionApplications = allApplications.filter(application =>
        admissionIds.includes(application.admissionId)
      );

      callback(institutionApplications);
    } catch (error) {
      console.error('Error filtering applications by institution:', error);
      callback([]);
    }
  }, (error) => {
    console.error('Error in applications subscription:', error);
  });
};

// Real-time listener for applications by admission
export const subscribeToApplicationsByAdmission = (admissionId, callback) => {
  const q = query(
    collection(db, APPLICATIONS_COLLECTION),
    where('admissionId', '==', admissionId),
    orderBy('appliedAt', 'desc')
  );
  return onSnapshot(q, (querySnapshot) => {
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(applications);
  }, (error) => {
    console.error('Error in applications subscription:', error);
  });
};

// Real-time listener for all applications (admin)
export const subscribeToApplications = (callback) => {
  const q = query(collection(db, APPLICATIONS_COLLECTION), orderBy('appliedAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(applications);
  }, (error) => {
    console.error('Error in applications subscription:', error);
  });
};
