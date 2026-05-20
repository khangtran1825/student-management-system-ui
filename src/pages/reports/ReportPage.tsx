import { useState } from 'react';
import { toast } from 'sonner';
import { useGetStudentsQuery } from '../../store/api/studentApi';
import { useGetClassesQuery } from '../../store/api/academicApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

const downloadFile = async (url: string, filename: string, token: string | null) => {
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || 'Tải file thất bại');
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
};

export const ReportPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const token = localStorage.getItem('token');
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  // Student transcript
  const [studentId, setStudentId] = useState('');
  // Class grades
  const [classId, setClassId] = useState('');
  // Attendance report
  const [attendClassId, setAttendClassId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: studentsRes } = useGetStudentsQuery({ page: 0, size: 200 });
  const { data: classesRes } = useGetClassesQuery(undefined);

  const students = studentsRes?.data?.content || [];
  const classes = classesRes?.data || [];

  // Nếu là STUDENT thì chỉ xem được bảng điểm của chính mình
  const effectiveStudentId = user?.role === 'STUDENT' ? String(user.studentId ?? '') : studentId;

  const handleDownload = async (url: string, filename: string) => {
    const tid = toast.loading('Đang tải file...');
    try {
      await downloadFile(url, filename, token);
      toast.success('Tải file thành công!', { id: tid });
    } catch (err: any) {
      toast.error(err.message || 'Tải file thất bại', { id: tid });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Báo cáo & Xuất file</h1>

      {/* Bảng điểm sinh viên */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Bảng điểm sinh viên
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.role === 'STUDENT' ? (
            <p className="text-sm text-slate-500">Xuất bảng điểm của bạn.</p>
          ) : (
            <div className="space-y-1 max-w-sm">
              <Label>Chọn sinh viên</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
              >
                <option value="">-- Chọn sinh viên --</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.studentCode} - {s.fullName}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!effectiveStudentId}
              onClick={() => handleDownload(
                `${BASE_URL}/reports/student/${effectiveStudentId}/transcript.pdf`,
                `transcript-${effectiveStudentId}.pdf`
              )}
            >
              <Download className="w-4 h-4 mr-2" /> Xuất PDF
            </Button>
            <Button
              variant="outline"
              disabled={!effectiveStudentId}
              onClick={() => handleDownload(
                `${BASE_URL}/reports/student/${effectiveStudentId}/transcript.xlsx`,
                `transcript-${effectiveStudentId}.xlsx`
              )}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Xuất Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Báo cáo điểm lớp — chỉ Admin/Teacher */}
      {isAdminOrTeacher && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              Báo cáo điểm lớp học
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 max-w-sm">
              <Label>Chọn lớp</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={classId}
                onChange={e => setClassId(e.target.value)}
              >
                <option value="">-- Chọn lớp --</option>
                {classes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.className}</option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              disabled={!classId}
              onClick={() => handleDownload(
                `${BASE_URL}/reports/class/${classId}/grades.xlsx`,
                `class-grades-${classId}.xlsx`
              )}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Xuất Excel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Báo cáo điểm danh — chỉ Admin/Teacher */}
      {isAdminOrTeacher && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" />
              Báo cáo điểm danh lớp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <div className="space-y-1">
                <Label>Chọn lớp</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={attendClassId}
                  onChange={e => setAttendClassId(e.target.value)}
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.className}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Từ ngày</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Đến ngày</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <Button
              variant="outline"
              disabled={!attendClassId}
              onClick={() => {
                const params = new URLSearchParams();
                if (startDate) params.set('startDate', startDate);
                if (endDate) params.set('endDate', endDate);
                const query = params.toString() ? `?${params.toString()}` : '';
                handleDownload(
                  `${BASE_URL}/reports/attendance/${attendClassId}.pdf${query}`,
                  `attendance-report-${attendClassId}.pdf`
                );
              }}
            >
              <Download className="w-4 h-4 mr-2" /> Xuất PDF
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
