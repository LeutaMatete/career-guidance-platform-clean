# TODO: Consolidate CSS and Update Imports

## Completed Tasks
- [x] Create Main.css file with consolidated styles
- [x] Update color scheme to GitHub dark theme with blue accents
- [x] Fix CSS syntax error in Main.css

## Pending Tasks
- [ ] Update all JS files to import Main.css instead of individual CSS files
- [ ] Remove old individual CSS files
- [ ] Test the application to ensure styles work correctly
- [ ] Verify GitHub-like color scheme is applied consistently

## Files to Update Imports
- [ ] src/App.js (import './App.css' -> import './Main.css')
- [ ] src/components/Layout/Layout.js (import './Layout.css' -> import './Main.css')
- [ ] src/index.js (import './index.css' -> import './Main.css')
- [ ] src/pages/Profile/Profile.js (import './Profile.css' -> import './Main.css')
- [ ] src/pages/Institute/InstituteDashboard.js (import './InstituteDashboard.css' -> import './Main.css')
- [ ] src/pages/Admin/AdminDashboard.js (import './AdminDashboard.css' -> import './Main.css')
- [ ] src/pages/Dashboard/Dashboard.js (import './Dashboard.css' -> import './Main.css')
- [ ] src/pages/Home/Home.js (import './Home.css' -> import './Main.css')
- [ ] src/pages/auth/*.js files (import './Auth.css' -> import './Main.css')
- [ ] src/pages/Company/CompanyDashboard.js (import './CompanyDashboard.css' -> import './Main.css')
- [ ] src/pages/Student/StudentDashboard.js (import './StudentDashboard.css' -> import './Main.css')

## Files to Remove
- [ ] src/App.css
- [ ] src/index.css
- [ ] src/components/Layout/Layout.css
- [ ] src/pages/auth/Auth.css
- [ ] src/pages/Dashboard/Dashboard.css
- [ ] src/pages/Home/Home.css
- [ ] src/pages/Profile/Profile.css
- [ ] src/pages/Admin/AdminDashboard.css
- [ ] src/pages/Company/CompanyDashboard.css
- [ ] src/pages/Institute/InstituteDashboard.css
- [ ] src/pages/Student/StudentDashboard.css
