import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { StudentList } from '../pages/students/StudentList';
// Import file thực tế vừa tạo
import { ClassList } from '../pages/classes/ClassList';

// Mock Pages (Sẽ làm ở các bước sau)
const SubjectList = () => <div>Trang Quản lý Môn học</div>;
const ScoreList = () => <div>Trang Quản lý Điểm số</div>;

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/students" replace />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/classes" element={<ClassList />} />
          <Route path="/subjects" element={<SubjectList />} />
          <Route path="/scores" element={<ScoreList />} />
        </Route>
      </Route>
    </Routes>
  );
};