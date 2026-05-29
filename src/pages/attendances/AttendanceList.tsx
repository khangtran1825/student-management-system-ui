import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useGetClassAttendanceQuery, useCreateAttendanceMutation, useUpdateAttendanceMutation, useGetMyScheduleQuery } from '../../store/api/academicApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Plus, CheckCircle, XCircle, FileText, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api';

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

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const isNowInSchedule = (schedule: any) => {
  if (!schedule?.dayOfWeek || !schedule?.startTime || !schedule?.endTime) return false;
  const dayMap: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };
  const today = new Date();
  if (today.getDay() !== dayMap[schedule.dayOfWeek]) return false;
  const nowMinutes = today.getHours() * 60 + today.getMinutes();
  return nowMinutes >= toMinutes(schedule.startTime.substring(0, 5)) && nowMinutes < toMinutes(schedule.endTime.substring(0, 5));
};

const orderClasses = (classes: any[]) => {
  return [...classes].sort((left, right) => {
    const leftActive = (left.studentCount ?? 0) > 0 ? 0 : 1;
    const rightActive = (right.studentCount ?? 0) > 0 ? 0 : 1;
    if (leftActive !== rightActive) return leftActive - rightActive;
    return String(left.className || '').localeCompare(String(right.className || ''));
  });
};

export const AttendanceList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isTeacherOrAdmin = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const isTeacher = user?.role === 'TEACHER';


  const { data: myScheduleRes } = useGetMyScheduleQuery(undefined, { skip: !isTeacher });
  const [createAttendance, { isLoading: isCreating }] = useCreateAttendanceMutation();
  const [updateAttendance] = useUpdateAttendanceMutation();

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', scheduleId: '', date: '', status: 'PRESENT', note: '' });
  const [formError, setFormError] = useState('');

  const teacherSchedules = myScheduleRes?.data || [];
  const teacherClasses = useMemo(() => {
    const seen = new Map<number, any>();
    teacherSchedules.forEach((schedule: any) => {
      if (schedule.classEntity?.id && !seen.has(schedule.classEntity.id)) {
        seen.set(schedule.classEntity.id, schedule.classEntity);
      }
    });
    return orderClasses(Array.from(seen.values()));
  }, [teacherSchedules]);

  useEffect(() => {
    if (isTeacher && !selectedClassId && teacherClasses.length > 0) {
      const currentSchedule = teacherSchedules.find((schedule: any) => isNowInSchedule(schedule));
      setSelectedClassId(String(currentSchedule?.classEntity?.id || teacherClasses[0].id));
    }
  }, [isTeacher, selectedClassId, teacherClasses, teacherSchedules]);

  const selectedClass = teacherClasses.find((item: any) => String(item.id) === selectedClassId);
  const classSchedules = isTeacher ? teacherSchedules.filter((schedule: any) => String(schedule.classEntity?.id) === selectedClassId) : [];
  
  useEffect(() => {
    if (selectedClassId && classSchedules.length > 0) {
      const currentSchedule = classSchedules.find((schedule: any) => isNowInSchedule(schedule)) || classSchedules[0];
      if (!selectedScheduleId || !classSchedules.find(s => String(s.id) === selectedScheduleId)) {
        setSelectedScheduleId(String(currentSchedule?.id || ''));
      }
    }
  }, [selectedClassId, classSchedules]);

  const currentSchedule = classSchedules.find((s: any) => String(s.id) === selectedScheduleId);

  const { data: classAttendanceRes, isLoading: isClassAttendanceLoading } = useGetClassAttendanceQuery(
    { classId: Number(selectedClassId), scheduleId: Number(selectedScheduleId), date: selectedDate },
    { skip: !isTeacherOrAdmin || !selectedClassId || !selectedScheduleId || !selectedDate }
  );

  const classAttendances = classAttendanceRes?.data || [];

  const handleMarkAttendance = async (studentId: number, status: 'PRESENT' | 'ABSENT', existingRecord?: any) => {
    if (!selectedScheduleId || !selectedDate) {
      toast.error('Vui lòng chọn buổi học và ngày điểm danh');
      return;
    }
    const tid = toast.loading('Đang lưu...');
    try {
      if (existingRecord) {
        await updateAttendance({
          id: existingRecord.id,
          studentId,
          scheduleId: Number(selectedScheduleId),
          date: selectedDate,
          status,
          note: existingRecord.note || '',
        }).unwrap();
      } else {
        await createAttendance({
          studentId,
          scheduleId: Number(selectedScheduleId),
          date: selectedDate,
          status,
          note: '',
        }).unwrap();
      }
      toast.success(`Đã đánh ${status === 'PRESENT' ? 'có mặt' : 'vắng'}!`, { id: tid });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi điểm danh', { id: tid });
    }
  };

  const exportAttendanceReport = async () => {
    if (!selectedClassId) return;
    const token = localStorage.getItem('token');
    const tid = toast.loading('Đang tải báo cáo điểm danh...');
    try {
      await downloadFile(`${BASE_URL}/reports/attendance/${selectedClassId}.pdf`, `attendance-report-${selectedClassId}.pdf`, token);
      toast.success('Tải báo cáo thành công!', { id: tid });
    } catch (error: any) {
      toast.error(error?.message || 'Tải báo cáo thất bại', { id: tid });
    }
  };

  if (!isTeacherOrAdmin) return <div className="p-6 text-center text-slate-500">Bạn không có quyền truy cập trang này.</div>;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Điểm danh</h1>
          {isTeacher && <p className="text-sm text-slate-500 mt-1">Chọn lớp và tích điểm danh trực tiếp trên danh sách sinh viên.</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {isTeacher && <Button variant="outline" onClick={exportAttendanceReport} disabled={!selectedClassId}><FileText className="w-4 h-4 mr-2" />Xuất báo cáo</Button>}
        </div>
      </div>

      {isTeacher && (
        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lớp đang phụ trách</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teacherClasses.map((classItem: any) => (
                <button
                  key={classItem.id}
                  type="button"
                  onClick={() => setSelectedClassId(String(classItem.id))}
                  className={`rounded-xl border p-3 text-left transition ${String(classItem.id) === selectedClassId ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-slate-900">{classItem.className}</div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${classItem.studentCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {classItem.studentCount > 0 ? 'Đang học' : 'Đã đóng'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">{classItem.classCode} · {classItem.major}</div>
                  <div className="text-xs text-slate-400 mt-1">{classItem.studentCount ?? 0} sinh viên</div>
                </button>
              ))}
            </div>
            {teacherClasses.length === 0 && <p className="text-sm text-slate-500">Chưa có lớp nào được gán vào lịch giảng dạy của bạn.</p>}
          </CardContent>
        </Card>
      )}

      {isTeacher && selectedClassId && (
        <Card className={isTeacher && currentSchedule && isNowInSchedule(currentSchedule) ? 'border-amber-200' : ''}>
          <CardHeader className="pb-2 border-b bg-slate-50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <div className="space-y-1">
                <CardTitle className="text-base">Danh sách điểm danh: {selectedClass?.className}</CardTitle>
                <div className="text-sm text-slate-500 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Ngày:</Label>
                    <Input 
                      type="date" 
                      className="h-8 py-1"
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Buổi học:</Label>
                    <select
                      className="flex h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={selectedScheduleId}
                      onChange={e => setSelectedScheduleId(e.target.value)}
                    >
                      {classSchedules.map((schedule: any) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.subject?.subjectName} ({schedule.dayOfWeek} {schedule.startTime?.substring(0, 5)}-{schedule.endTime?.substring(0, 5)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">STT</TableHead>
                  <TableHead>Sinh viên</TableHead>
                  <TableHead>Mã SV</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right w-48">Thao tác nhanh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isClassAttendanceLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10">Đang tải...</TableCell></TableRow>
                ) : classAttendances.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Lớp chưa có sinh viên</TableCell></TableRow>
                ) : (
                  classAttendances.map((record: any, index: number) => {
                    return (
                      <TableRow key={record.studentId}>
                        <TableCell className="text-center text-slate-500">{index + 1}</TableCell>
                        <TableCell className="font-medium">{record.fullName}</TableCell>
                        <TableCell>{record.studentCode}</TableCell>
                        <TableCell>
                          {record.attendanceId ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${record.status === 'PRESENT' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {record.status === 'PRESENT' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {record.status === 'PRESENT' ? 'Có mặt' : 'Vắng'}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Chưa điểm danh</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant={record.status === 'PRESENT' ? 'default' : 'outline'}
                            size="sm" 
                            className={record.status === 'PRESENT' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 border-green-200 hover:bg-green-50'}
                            onClick={() => handleMarkAttendance(record.studentId, 'PRESENT', record.attendanceId ? { id: record.attendanceId, note: record.note } : undefined)}
                          >
                            <Check className="w-4 h-4 mr-1" /> Có mặt
                          </Button>
                          <Button 
                            variant={record.status === 'ABSENT' ? 'default' : 'outline'}
                            size="sm" 
                            className={record.status === 'ABSENT' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 border-red-200 hover:bg-red-50'}
                            onClick={() => handleMarkAttendance(record.studentId, 'ABSENT', record.attendanceId ? { id: record.attendanceId, note: record.note } : undefined)}
                          >
                            <X className="w-4 h-4 mr-1" /> Vắng
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

