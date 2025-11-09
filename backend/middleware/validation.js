const validateRegistration = (req, res, next) => {
  const { email, password, role, firstName, lastName } = req.body;

  if (!email || !password || !role || !firstName || !lastName) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const validRoles = ['student', 'institute', 'company'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  next();
};

const validateCourseApplication = (req, res, next) => {
  const { courseId, institutionId } = req.body;

  if (!courseId || !institutionId) {
    return res.status(400).json({ error: 'Course ID and Institution ID are required' });
  }

  next();
};

const validateJobPosting = (req, res, next) => {
  const { title, description, requirements, location, type, deadline } = req.body;

  if (!title || !description || !requirements || !location || !type || !deadline) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const validTypes = ['full-time', 'part-time', 'contract', 'internship'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid job type' });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateCourseApplication,
  validateJobPosting
};
