import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import TakeExam from './pages/student/TakeExam';
import ExamResult from './pages/student/ExamResult';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ManageQuestions from './pages/teacher/ManageQuestions';
import GradeResults from './pages/teacher/GradeResults';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageExams from './pages/admin/ManageExams';
import ViewResults from './pages/admin/ViewResults';

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Student */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentProfile />
          </ProtectedRoute>
        } />
        <Route path="/student/exam/:id" element={
          <ProtectedRoute allowedRoles={['student']}>
            <TakeExam />
          </ProtectedRoute>
        } />
        <Route path="/student/exam/:id/result" element={
          <ProtectedRoute allowedRoles={['student']}>
            <ExamResult />
          </ProtectedRoute>
        } />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/questions" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <ManageQuestions />
          </ProtectedRoute>
        } />
        <Route path="/teacher/grading" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <GradeResults />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/exams" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageExams />
          </ProtectedRoute>
        } />
        <Route path="/admin/results" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <ViewResults />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-gray-500 mb-4">Page not found</p>
              <a href="/" className="text-primary hover:underline">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </Layout>
  );
}
