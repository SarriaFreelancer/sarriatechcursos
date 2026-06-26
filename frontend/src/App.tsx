import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { Certificates } from './pages/dashboard/Certificates';
import { CourseViewer } from './pages/courses/CourseViewer';
import { Explore } from './pages/explore/Explore';
import { MyCourses } from './pages/dashboard/MyCourses';
import { Settings } from './pages/dashboard/Settings';
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { CourseCreator } from './pages/instructor/CourseCreator';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EvidenceReview } from './pages/instructor/EvidenceReview';
import { Profile } from './pages/profile/Profile';
import { RequireRole } from './components/auth/RequireRole';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/course/:id" element={<CourseViewer />} />

          <Route path="/" element={<MainLayout />}>
            <Route path="explore" element={<Explore />} />
            <Route path="profile" element={<Profile />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="dashboard/courses" element={<MyCourses />} />
            <Route path="dashboard/certificates" element={<Certificates />} />
            <Route path="dashboard/settings" element={<Settings />} />
            <Route path="instructor" element={<RequireRole roleNames={['INSTRUCTOR', 'ADMIN']}><InstructorDashboard /></RequireRole>} />
            <Route path="instructor/create-course" element={<RequireRole roleNames={['INSTRUCTOR', 'ADMIN']}><CourseCreator /></RequireRole>} />
            <Route path="instructor/edit-course/:id" element={<RequireRole roleNames={['INSTRUCTOR', 'ADMIN']}><CourseCreator /></RequireRole>} />
            <Route path="instructor/evidences" element={<RequireRole roleNames={['INSTRUCTOR', 'ADMIN']}><EvidenceReview /></RequireRole>} />
            <Route path="admin" element={<RequireRole roleNames={['ADMIN']}><AdminDashboard /></RequireRole>} />
          </Route>
        </Routes>
        <footer className="mt-auto border-t border-border/70 bg-background/70 px-4 py-4 text-center text-[11px] text-muted-foreground sm:px-6 sm:py-5">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] sm:text-sm">copyright sarriatech software dev 2026</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground/80">todos los derechos reservados</span>
          </div>
        </footer>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
