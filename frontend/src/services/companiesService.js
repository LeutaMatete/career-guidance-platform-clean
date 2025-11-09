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

const COMPANIES_COLLECTION = 'companies';

// Get all companies
export const getCompanies = async () => {
  try {
    const q = query(collection(db, COMPANIES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting companies:', error);
    throw new Error('Failed to load companies');
  }
};

// Get company by ID
export const getCompanyById = async (id) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Company not found');
    }
  } catch (error) {
    console.error('Error getting company:', error);
    throw new Error('Failed to load company');
  }
};

// Create new company
export const createCompany = async (companyData) => {
  try {
    const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
      ...companyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending', // Companies need admin approval
      approved: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating company:', error);
    throw new Error('Failed to create company');
  }
};

// Update company
export const updateCompany = async (id, updates) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating company:', error);
    throw new Error('Failed to update company');
  }
};

// Delete company
export const deleteCompany = async (id) => {
  try {
    await deleteDoc(doc(db, COMPANIES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting company:', error);
    throw new Error('Failed to delete company');
  }
};

// Approve company (admin action)
export const approveCompany = async (id) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'approved',
      approved: true,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error approving company:', error);
    throw new Error('Failed to approve company');
  }
};

// Reject company (admin action)
export const rejectCompany = async (id, reason) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'rejected',
      approved: false,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error rejecting company:', error);
    throw new Error('Failed to reject company');
  }
};

// Get companies by status
export const getCompaniesByStatus = async (status) => {
  try {
    const q = query(
      collection(db, COMPANIES_COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting companies by status:', error);
    throw new Error('Failed to load companies');
  }
};

// Get pending companies (for admin approval)
export const getPendingCompanies = async () => {
  try {
    return await getCompaniesByStatus('pending');
  } catch (error) {
    console.error('Error getting pending companies:', error);
    throw new Error('Failed to load pending companies');
  }
};

// Get approved companies
export const getApprovedCompanies = async () => {
  try {
    return await getCompaniesByStatus('approved');
  } catch (error) {
    console.error('Error getting approved companies:', error);
    throw new Error('Failed to load approved companies');
  }
};

// Suspend company
export const suspendCompany = async (id, reason) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'suspended',
      suspendedAt: new Date().toISOString(),
      suspensionReason: reason,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error suspending company:', error);
    throw new Error('Failed to suspend company');
  }
};

// Reactivate company
export const reactivateCompany = async (id) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'approved',
      reactivatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reactivating company:', error);
    throw new Error('Failed to reactivate company');
  }
};

// Get company statistics
export const getCompanyStatistics = async () => {
  try {
    const allCompanies = await getCompanies();

    const stats = {
      total: allCompanies.length,
      pending: allCompanies.filter(c => c.status === 'pending').length,
      approved: allCompanies.filter(c => c.status === 'approved').length,
      rejected: allCompanies.filter(c => c.status === 'rejected').length,
      suspended: allCompanies.filter(c => c.status === 'suspended').length
    };

    return stats;
  } catch (error) {
    console.error('Error getting company statistics:', error);
    throw new Error('Failed to load company statistics');
  }
};

// Real-time listener for companies
export const subscribeToCompanies = (callback) => {
  const q = query(collection(db, COMPANIES_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const companies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(companies);
  }, (error) => {
    console.error('Error in companies subscription:', error);
  });
};

// Update company status (generic function for admin actions)
export const updateCompanyStatus = async (id, status, reason = null) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, id);
    const updates = {
      status,
      updatedAt: new Date().toISOString()
    };

    // Add status-specific fields
    if (status === 'approved') {
      updates.approved = true;
      updates.approvedAt = new Date().toISOString();
    } else if (status === 'rejected') {
      updates.approved = false;
      updates.rejectedAt = new Date().toISOString();
      if (reason) updates.rejectionReason = reason;
    } else if (status === 'suspended') {
      updates.suspendedAt = new Date().toISOString();
      if (reason) updates.suspensionReason = reason;
    }

    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating company status:', error);
    throw new Error('Failed to update company status');
  }
};

// Real-time listener for companies by status
export const subscribeToCompaniesByStatus = (status, callback) => {
  const q = query(
    collection(db, COMPANIES_COLLECTION),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (querySnapshot) => {
    const companies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(companies);
  }, (error) => {
    console.error('Error in companies subscription:', error);
  });
};
