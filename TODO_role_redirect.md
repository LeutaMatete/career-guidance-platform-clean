# Role-Based Dashboard Redirect Implementation

## Tasks
- [x] Modify Login.js to redirect users to role-specific dashboards after successful login
- [ ] Add role-based redirect logic in AuthContext.js if needed for better handling
- [x] Ensure all user roles (student, institute, company, admin) redirect correctly
- [x] Test login flow for different user roles

## Files to Edit
- career-guidance/frontend/src/pages/auth/Login.js
- career-guidance/frontend/src/context/AuthContext.js (if needed)

## Implementation Details
- After login, check userProfile.role and redirect to appropriate dashboard
- Handle asynchronous nature of userProfile loading
- Fallback to generic dashboard if role not found
