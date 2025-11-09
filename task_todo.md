# Current Task: Backend Refactor to MVC with Firebase Integration

## Backend Refactor Steps
- [ ] Create new backend/app.js: Express app with CORS, JSON parsing, middleware setup, route mounting
- [ ] Refactor backend/server.js: Remove Express setup, make it entry point that imports app and starts server
- [ ] Implement middleware: auth.js (JWT verification), validation.js (input validation), upload.js (file handling)
- [ ] Implement controllers: Use Firebase Firestore with models for CRUD operations
  - [ ] authController.js: Registration, login, email verification
  - [ ] adminController.js: Manage institutions, companies, reports
  - [ ] instituteController.js: Manage faculties, courses, applications, admissions
  - [ ] studentController.js: Course applications, profile updates, transcript uploads, job applications
  - [ ] companyController.js: Post jobs, view applicants, manage profile
- [ ] Implement routes: Mount controllers to routes
  - [ ] authRoutes.js: Registration, login, email verification
  - [ ] adminRoutes.js: Admin CRUD operations
  - [ ] instituteRoutes.js: Institute management endpoints
  - [ ] studentRoutes.js: Student operations
  - [ ] companyRoutes.js: Company operations
- [ ] Update TODO.md: Mark backend setup tasks as completed

## Followup Steps
- [ ] Install backend dependencies (npm install in backend/)
- [ ] Test backend APIs with Postman
- [ ] Complete frontend dashboards (Institute, Student, Company pages)
- [ ] Implement frontend components and services
- [ ] Set up environment variables (.env files)
- [ ] Deploy frontend to Firebase Hosting, backend to Firebase Functions
