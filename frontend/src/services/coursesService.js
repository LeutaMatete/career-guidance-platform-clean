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

const COURSES_COLLECTION = 'courses';

// Get all courses
export const getCourses = async () => {
  try {
    const q = query(collection(db, COURSES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting courses:', error);
    throw new Error('Failed to load courses');
  }
};

// Get courses by faculty ID
export const getCoursesByFaculty = async (facultyId) => {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('facultyId', '==', facultyId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting courses by faculty:', error);
    throw new Error('Failed to load courses');
  }
};

// Get courses by institution ID
export const getCoursesByInstitution = async (institutionId) => {
  try {
    // First get faculties for this institution
    const { getFacultiesByInstitution } = await import('./facultiesService');
    const faculties = await getFacultiesByInstitution(institutionId);
    const facultyIds = faculties.map(fac => fac.id);

    if (facultyIds.length === 0) return [];

    // Get courses for all faculties in this institution
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('facultyId', 'in', facultyIds),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting courses by institution:', error);
    throw new Error('Failed to load courses');
  }
};

// Get course by ID
export const getCourseById = async (id) => {
  try {
    const docRef = doc(db, COURSES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Course not found');
    }
  } catch (error) {
    console.error('Error getting course:', error);
    throw new Error('Failed to load course');
  }
};

// Create new course
export const createCourse = async (courseData) => {
  try {
    const docRef = await addDoc(collection(db, COURSES_COLLECTION), {
      ...courseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    });

    // Update faculty course count
    const { updateFacultyCourseCount } = await import('./facultiesService');
    await updateFacultyCourseCount(courseData.facultyId);

    return docRef.id;
  } catch (error) {
    console.error('Error creating course:', error);
    throw new Error('Failed to create course');
  }
};

// Update course
export const updateCourse = async (id, updates) => {
  try {
    const docRef = doc(db, COURSES_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating course:', error);
    throw new Error('Failed to update course');
  }
};

// Delete course
export const deleteCourse = async (id) => {
  try {
    // Get course data first to update faculty count
    const course = await getCourseById(id);

    await deleteDoc(doc(db, COURSES_COLLECTION, id));

    // Update faculty course count
    const { updateFacultyCourseCount } = await import('./facultiesService');
    await updateFacultyCourseCount(course.facultyId);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw new Error('Failed to delete course');
  }
};

// Get courses by level (undergraduate, postgraduate, etc.)
export const getCoursesByLevel = async (level) => {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where('level', '==', level),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting courses by level:', error);
    throw new Error('Failed to load courses');
  }
};

// Real-time listener for courses by faculty
export const subscribeToCoursesByFaculty = (facultyId, callback) => {
  const q = query(
    collection(db, COURSES_COLLECTION),
    where('facultyId', '==', facultyId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (querySnapshot) => {
    const courses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(courses);
  }, (error) => {
    console.error('Error in courses subscription:', error);
  });
};

// Real-time listener for courses by institution
export const subscribeToCoursesByInstitution = (institutionId, callback) => {
  // This is more complex as it needs to listen to both faculties and courses
  // For now, we'll use a simpler approach
  const q = query(collection(db, COURSES_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, async (querySnapshot) => {
    const allCourses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter courses that belong to faculties of this institution
    try {
      const { getFacultiesByInstitution } = await import('./facultiesService');
      const faculties = await getFacultiesByInstitution(institutionId);
      const facultyIds = faculties.map(fac => fac.id);

      const institutionCourses = allCourses.filter(course =>
        facultyIds.includes(course.facultyId)
      );

      callback(institutionCourses);
    } catch (error) {
      console.error('Error filtering courses by institution:', error);
      callback([]);
    }
  }, (error) => {
    console.error('Error in courses subscription:', error);
  });
};
