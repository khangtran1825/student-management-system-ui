import { useGetDashboardSummaryQuery } from '../store/api/academicApi';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, GraduationCap, BookOpen, CheckSquare } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: response, isLoading } = useGetDashboardSummaryQuery(undefined);
  const summary = response?.data;

  if (user?.role === 'STUDENT') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Xin chào, {user.username}!</h1>
        <p className="text-slate-500">Bạn đã đăng nhập với vai trò Sinh viên. Sử dụng menu bên trái để xem điểm số và lịch học của mình.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>

      {isLoading ? (
        <div className="text-slate-400">Đang tải dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng sinh viên</CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{summary?.totalStudents ?? '-'}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng lớp học</CardTitle>
              <GraduationCap className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{summary?.totalClasses ?? '-'}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng môn học</CardTitle>
              <BookOpen className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{summary?.totalSubjects ?? '-'}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Bản ghi điểm</CardTitle>
              <CheckSquare className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{summary?.totalScores ?? '-'}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
