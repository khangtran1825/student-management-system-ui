import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { StudentList } from '../pages/students/StudentList';
// Import file thực tế vừa tạo
import { ClassList } from '../pages/classes/ClassList';
import { ScoreList } from '../pages/scores/ScoreList';
import { SubjectList } from '../pages/subjects/SubjectList';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/classes" element={<ClassList />} />
          <Route path="/subjects" element={<SubjectList />} />
          <Route path="/scores" element={<ScoreList />} />
        </Route>
      </Route>
    </Routes>
  );
};