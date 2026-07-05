import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import UserApprovals from './pages/admin/UserApprovals';
import Departments from './pages/admin/Departments';
import Classrooms from './pages/admin/Classrooms';
import Timetable from './pages/admin/Timetable';
import Events from './pages/admin/Events';
import Complaints from './pages/admin/Complaints';
import Announcements from './pages/admin/Announcements';
import Analytics from './pages/admin/Analytics';
import ActivityLogs from './pages/admin/ActivityLogs';
import Notifications from './pages/admin/Notifications';
import Profile from './pages/admin/Profile';
import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyTimetable from './pages/faculty/Timetable';
import FacultyEvents from './pages/faculty/Events';
import FacultyComplaints from './pages/faculty/Complaints';
import FacultyAnnouncements from './pages/faculty/Announcements';
import FacultyNotifications from './pages/faculty/Notifications';
import FacultyProfile from './pages/faculty/Profile';
import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/Attendance';
import StudentEvents from './pages/student/Events';
import StudentComplaints from './pages/student/Complaints';
import StudentAnnouncements from './pages/student/Announcements';
import StudentNotifications from './pages/student/Notifications';
import StudentAIAssistant from './pages/student/AIAssistant';
import StudentProfile from './pages/student/Profile';
import { Card, StatCard, LoadingScreen } from './components/ui';
import { CalendarDays, Users, ClipboardList, Calendar, CheckSquare, Bell } from 'lucide-react';

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
}

// Public Route (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><Register /></PublicRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/approvals" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><UserApprovals /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/departments" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Departments /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/classrooms" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Classrooms /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/timetable" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Timetable /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/events" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Events /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/complaints" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Complaints /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/announcements" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Announcements /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Analytics /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/activity-logs" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><ActivityLogs /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Notifications /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/profile" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      } />

      {/* Faculty routes */}
      <Route path="/faculty" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <Layout><FacultyDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/faculty/attendance" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <Layout><FacultyAttendance /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/faculty/timetable" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <Layout><FacultyTimetable /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/faculty/events" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <Layout><FacultyEvents /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/faculty/complaints" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <Layout><FacultyComplaints /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/faculty/announcements" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <Layout><FacultyAnnouncements /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/faculty/notifications" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <Layout><FacultyNotifications /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/faculty/profile" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <Layout><FacultyProfile /></Layout>
        </ProtectedRoute>
      } />

      {/* Student routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><StudentDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/student/attendance" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><StudentAttendance /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/student/events" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><StudentEvents /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/student/complaints" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><StudentComplaints /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/student/announcements" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><StudentAnnouncements /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/student/notifications" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><StudentNotifications /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/student/ai-assistant" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><StudentAIAssistant /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/student/profile" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><StudentProfile /></Layout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={
        user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/login" replace />
      } />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}