import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { StudentList } from '../pages/students/StudentList';
import { StudentProfile } from '../pages/StudentProfile';
import { ClassList } from '../pages/classes/ClassList';
import { SubjectList } from '../pages/subjects/SubjectList';
import { AcademicYearList } from '../pages/academic-years/AcademicYearList';
import { SemesterList } from '../pages/semesters/SemesterList';
import { ScheduleList } from '../pages/schedules/ScheduleList';
import { ExamList } from '../pages/exams/ExamList';
import { ScoreList } from '../pages/scores/ScoreList';
import { AttendanceList } from '../pages/attendances/AttendanceList';
import { ReportPage } from '../pages/reports/ReportPage';

const RoleGuard = ({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user || !allowedRoles.includes(user.role)) {
    return <div className="p-8 text-center text-slate-500"><p className="text-lg font-medium">Bạn không có quyền truy cập trang này.</p></div>;
  }
  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<StudentProfile />} />

          {/* ADMIN + TEACHER */}
          <Route path="/students" element={<RoleGuard allowedRoles={['ADMIN', 'TEACHER']}><StudentList /></RoleGuard>} />

          {/* ADMIN ONLY */}
          <Route path="/classes" element={<RoleGuard allowedRoles={['ADMIN']}><ClassList /></RoleGuard>} />
          <Route path="/subjects" element={<RoleGuard allowedRoles={['ADMIN']}><SubjectList /></RoleGuard>} />
          <Route path="/academic-years" element={<RoleGuard allowedRoles={['ADMIN']}><AcademicYearList /></RoleGuard>} />
          <Route path="/semesters" element={<RoleGuard allowedRoles={['ADMIN']}><SemesterList /></RoleGuard>} />

          {/* ALL ROLES */}
          <Route path="/schedules" element={<ScheduleList />} />
          <Route path="/exams" element={<ExamList />} />
          <Route path="/scores" element={<ScoreList />} />

          {/* TEACHER + ADMIN */}
          <Route path="/attendances" element={<RoleGuard allowedRoles={['ADMIN', 'TEACHER']}><AttendanceList /></RoleGuard>} />

          {/* ALL ROLES */}
          <Route path="/reports" element={<ReportPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};