import { useGetDashboardSummaryQuery } from '../store/api/academicApi';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Users, GraduationCap, BookOpen, CheckSquare, Clock, BarChart2, UserCheck } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: response, isLoading } = useGetDashboardSummaryQuery(undefined, { skip: user?.role === 'STUDENT' });
  const summary = response?.data;

  if (user?.role === 'STUDENT') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Xin chào, {user.username}!</h1>
        <p className="text-slate-500">Bạn đã đăng nhập với vai trò Sinh viên. Sử dụng menu bên trái để xem điểm số và lịch học của mình.</p>
      </div>
    );
  }

  if (user?.role === 'TEACHER') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Xin chào, {user.username} (Giáo viên)!</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Lớp phụ trách</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{summary?.classesCount ?? '-'}</div></CardContent></Card>
          <Card className="border-slate-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Sinh viên trong lớp</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{summary?.studentsInCharge ?? '-'}</div></CardContent></Card>
          <Card className="border-slate-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Điểm cần chấm</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{summary?.pendingScores ?? '-'}</div></CardContent></Card>
          <Card className="border-slate-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Báo cáo nhanh</CardTitle></CardHeader><CardContent><div className="text-sm">Xuất file bảng điểm, gửi thông báo</div></CardContent></Card>
        </div>
        <div className="flex gap-2">
          <Button className="bg-green-600 hover:bg-green-700">Quản lý điểm</Button>
          <Button className="bg-amber-600 hover:bg-amber-700">Quản lý điểm danh</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
      {isLoading ? (
        <div className="text-slate-400">Đang tải dữ liệu...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Tổng sinh viên</CardTitle>
                <Users className="w-5 h-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{summary?.totalStudents ?? '-'}</div>
                <div className="text-sm text-slate-500">Cập nhật: {summary?.generatedAt ? new Date(summary.generatedAt).toLocaleString() : '-'}</div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Người dùng</CardTitle>
                <Users className="w-5 h-5 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.totalUsers ?? '-'}</div>
                <div className="text-sm text-slate-500">Đang hoạt động: {summary?.activeUsers ?? '-'}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Giáo viên</CardTitle>
                <UserCheck className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.totalTeachers ?? '-'}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Quản trị viên</CardTitle>
                <BarChart2 className="w-5 h-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.totalAdmins ?? '-'}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Điểm danh hôm nay</CardTitle>
                <Clock className="w-5 h-5 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="text-sm text-slate-700">Có mặt: <span className="font-bold">{summary?.attendanceTodayPresent ?? 0}</span></div>
                  <div className="text-sm text-slate-700">Vắng: <span className="font-bold">{summary?.attendanceTodayAbsent ?? 0}</span></div>
                  <div className="text-sm text-slate-700">Có phép: <span className="font-bold">{summary?.attendanceTodayExcused ?? 0}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Upcoming Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Môn</TableHead><TableHead>Ngày</TableHead><TableHead>Phòng</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.upcomingExams?.length ? summary.upcomingExams.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.subjectName}</TableCell>
                        <TableCell>{e.examDate ? new Date(e.examDate).toLocaleString() : '-'}</TableCell>
                        <TableCell>{e.room}</TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={3} className="text-center text-slate-500">Không có dữ liệu</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Recent Students</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Mã</TableHead><TableHead>Họ và tên</TableHead><TableHead>Lớp</TableHead><TableHead>Ngày tạo</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.recentStudents?.length ? summary.recentStudents.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.studentCode}</TableCell>
                        <TableCell>{s.fullName}</TableCell>
                        <TableCell>{s.className}</TableCell>
                        <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}</TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={4} className="text-center text-slate-500">Không có dữ liệu</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Recent Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Sinh viên</TableHead><TableHead>Môn</TableHead><TableHead>Trung bình</TableHead><TableHead>Ngày</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {summary?.recentScores?.length ? summary.recentScores.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.studentName}</TableCell>
                      <TableCell>{r.subjectName}</TableCell>
                      <TableCell>{r.averageScore ?? '-'}</TableCell>
                      <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={4} className="text-center text-slate-500">Không có dữ liệu</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
