import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Get system statistics
export const getSystemStatistics = async () => {
  try {
    // Get all collections data
    const [
      institutions,
      faculties,
      courses,
      admissions,
      applications,
      users,
      companies
    ] = await Promise.all([
      import('./institutionsService').then(s => s.getInstitutions()),
      import('./facultiesService').then(s => s.getFaculties()),
      import('./coursesService').then(s => s.getCourses()),
      import('./admissionsService').then(s => s.getAdmissions()),
      import('./applicationsService').then(s => s.getApplications()),
      import('./usersService').then(s => s.getUsers()),
      import('./companiesService').then(s => s.getCompanies())
    ]);

    const stats = {
      institutions: {
        total: institutions.length,
        active: institutions.filter(i => i.status === 'active').length
      },
      faculties: {
        total: faculties.length,
        active: faculties.filter(f => f.status === 'active').length
      },
      courses: {
        total: courses.length,
        active: courses.filter(c => c.status === 'active').length,
        undergraduate: courses.filter(c => c.level === 'undergraduate').length,
        postgraduate: courses.filter(c => c.level === 'postgraduate').length
      },
      admissions: {
        total: admissions.length,
        open: admissions.filter(a => a.status === 'open').length,
        closed: admissions.filter(a => a.status === 'closed').length
      },
      applications: {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length
      },
      users: {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        institutes: users.filter(u => u.role === 'institute').length,
        companies: users.filter(u => u.role === 'company').length,
        admins: users.filter(u => u.role === 'admin').length,
        verified: users.filter(u => u.emailVerified).length,
        unverified: users.filter(u => !u.emailVerified).length
      },
      companies: {
        total: companies.length,
        pending: companies.filter(c => c.status === 'pending').length,
        approved: companies.filter(c => c.status === 'approved').length,
        rejected: companies.filter(c => c.status === 'rejected').length
      }
    };

    return stats;
  } catch (error) {
    console.error('Error getting system statistics:', error);
    throw new Error('Failed to load system statistics');
  }
};

// Get admissions report by institution
export const getAdmissionsReportByInstitution = async (institutionId) => {
  try {
    const { getAdmissionsByInstitution } = await import('./admissionsService');
    const { getApplicationsByInstitution } = await import('./applicationsService');

    const admissions = await getAdmissionsByInstitution(institutionId);
    const applications = await getApplicationsByInstitution(institutionId);

    const report = admissions.map(admission => {
      const admissionApplications = applications.filter(app => app.admissionId === admission.id);
      return {
        ...admission,
        totalApplications: admissionApplications.length,
        approvedApplications: admissionApplications.filter(app => app.status === 'approved').length,
        rejectedApplications: admissionApplications.filter(app => app.status === 'rejected').length,
        pendingApplications: admissionApplications.filter(app => app.status === 'pending').length
      };
    });

    return report;
  } catch (error) {
    console.error('Error getting admissions report:', error);
    throw new Error('Failed to load admissions report');
  }
};

// Get user registration trends (last 30 days)
export const getUserRegistrationTrends = async () => {
  try {
    const { getUsers } = await import('./usersService');
    const users = await getUsers();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= thirtyDaysAgo;
    });

    // Group by date
    const trends = {};
    recentUsers.forEach(user => {
      const date = new Date(user.createdAt).toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { date, total: 0, students: 0, institutes: 0, companies: 0 };
      }
      trends[date].total++;
      if (user.role === 'student') trends[date].students++;
      if (user.role === 'institute') trends[date].institutes++;
      if (user.role === 'company') trends[date].companies++;
    });

    return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error getting user registration trends:', error);
    throw new Error('Failed to load registration trends');
  }
};

// Get application trends (last 30 days)
export const getApplicationTrends = async () => {
  try {
    const { getApplications } = await import('./applicationsService');
    const applications = await getApplications();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApplications = applications.filter(app => {
      const appliedAt = new Date(app.appliedAt);
      return appliedAt >= thirtyDaysAgo;
    });

    // Group by date
    const trends = {};
    recentApplications.forEach(app => {
      const date = new Date(app.appliedAt).toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { date, total: 0, pending: 0, approved: 0, rejected: 0 };
      }
      trends[date].total++;
      if (app.status === 'pending') trends[date].pending++;
      if (app.status === 'approved') trends[date].approved++;
      if (app.status === 'rejected') trends[date].rejected++;
    });

    return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error getting application trends:', error);
    throw new Error('Failed to load application trends');
  }
};

// Get institution performance report
export const getInstitutionPerformanceReport = async () => {
  try {
    const { getInstitutions } = await import('./institutionsService');
    const institutions = await getInstitutions();

    const reports = await Promise.all(
      institutions.map(async (institution) => {
        const admissionsReport = await getAdmissionsReportByInstitution(institution.id);

        const totalApplications = admissionsReport.reduce((sum, admission) => sum + admission.totalApplications, 0);
        const totalApproved = admissionsReport.reduce((sum, admission) => sum + admission.approvedApplications, 0);
        const totalRejected = admissionsReport.reduce((sum, admission) => sum + admission.rejectedApplications, 0);
        const totalPending = admissionsReport.reduce((sum, admission) => sum + admission.pendingApplications, 0);

        return {
          institution: institution.name,
          institutionId: institution.id,
          totalAdmissions: admissionsReport.length,
          openAdmissions: admissionsReport.filter(a => a.status === 'open').length,
          totalApplications,
          totalApproved,
          totalRejected,
          totalPending,
          approvalRate: totalApplications > 0 ? ((totalApproved / totalApplications) * 100).toFixed(1) : 0
        };
      })
    );

    return reports.sort((a, b) => b.totalApplications - a.totalApplications);
  } catch (error) {
    console.error('Error getting institution performance report:', error);
    throw new Error('Failed to load institution performance report');
  }
};

// Get course popularity report
export const getCoursePopularityReport = async () => {
  try {
    const { getCourses } = await import('./coursesService');
    const { getAdmissions } = await import('./admissionsService');
    const { getApplications } = await import('./applicationsService');

    const courses = await getCourses();
    const admissions = await getAdmissions();
    const applications = await getApplications();

    const report = courses.map(course => {
      const courseAdmissions = admissions.filter(a => a.courseId === course.id);
      const courseApplications = applications.filter(app =>
        courseAdmissions.some(admission => admission.id === app.admissionId)
      );

      return {
        course: course.name,
        courseId: course.id,
        faculty: course.facultyId, // Will be resolved to faculty name in component
        level: course.level,
        totalAdmissions: courseAdmissions.length,
        totalApplications: courseApplications.length,
        approvedApplications: courseApplications.filter(app => app.status === 'approved').length,
        capacity: course.capacity || 0,
        tuitionFee: course.tuitionFee || 0
      };
    });

    return report.sort((a, b) => b.totalApplications - a.totalApplications);
  } catch (error) {
    console.error('Error getting course popularity report:', error);
    throw new Error('Failed to load course popularity report');
  }
};
