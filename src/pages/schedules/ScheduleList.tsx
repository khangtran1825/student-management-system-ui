import { useState } from 'react';
import { toast } from 'sonner';
import {
  useGetSchedulesQuery, useGetMyScheduleQuery, useCreateScheduleMutation, useDeleteScheduleMutation,
  useGetClassesQuery, useGetSubjectsQuery,
} from '../../store/api/academicApi';
import { useGetTeachersQuery } from '../../store/api/teacherApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trash2, Plus, Sun, Sunset } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
const DAY_VN: Record<string, string> = {
  MONDAY: 'Thứ 2', TUESDAY: 'Thứ 3', WEDNESDAY: 'Thứ 4',
  THURSDAY: 'Thứ 5', FRIDAY: 'Thứ 6', SATURDAY: 'Thứ 7', SUNDAY: 'CN',
};

// Khung giờ chuẩn — sáng: trước 12:00, chiều: từ 12:00 trở đi
const MORNING_SLOTS = ['07:00', '08:00', '09:00', '10:00', '11:00'];
const AFTERNOON_SLOTS = ['12:30', '13:30', '14:30', '15:30', '16:30', '17:30'];

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// Kiểm tra một schedule có rơi vào slot không (startTime <= slot < endTime)
const matchesSlot = (schedule: any, slot: string) => {
  const slotMin = toMinutes(slot);
  const startMin = toMinutes(schedule.startTime?.substring(0, 5) ?? '00:00');
  const endMin = toMinutes(schedule.endTime?.substring(0, 5) ?? '00:00');
  return startMin <= slotMin && slotMin < endMin;
};

const SESSION_COLOR = [
  'bg-blue-50 border-blue-200 text-blue-800',
  'bg-green-50 border-green-200 text-green-800',
  'bg-purple-50 border-purple-200 text-purple-800',
  'bg-orange-50 border-orange-200 text-orange-800',
  'bg-pink-50 border-pink-200 text-pink-800',
  'bg-teal-50 border-teal-200 text-teal-800',
];

// Gán màu ổn định theo id môn học
const getColor = (id: number) => SESSION_COLOR[id % SESSION_COLOR.length];

export const ScheduleList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';
  const isTeacher = user?.role === 'TEACHER';

  const { data: response, isLoading } = useGetSchedulesQuery(undefined, { skip: isStudent || isTeacher });
  const { data: myScheduleRes, isLoading: isMyScheduleLoading } = useGetMyScheduleQuery(undefined, { skip: !isStudent && !isTeacher });
  const { data: classesRes } = useGetClassesQuery(undefined, { skip: !isAdmin });
  const { data: subjectsRes } = useGetSubjectsQuery(undefined, { skip: !isAdmin });
  const { data: teachersRes } = useGetTeachersQuery({ size: 1000 }, { skip: !isAdmin });
  const [createSchedule, { isLoading: isCreating }] = useCreateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    classId: '', subjectId: '', teacherId: '',
    dayOfWeek: '', startTime: '', endTime: '', room: '',
  });
  const [formError, setFormError] = useState('');

  const schedules: any[] = (isStudent || isTeacher) ? (myScheduleRes?.data || []) : (response?.data || []);
  const classes: any[] = classesRes?.data || [];
  const subjects: any[] = subjectsRes?.data || [];
  const teachers: any[] = teachersRes?.data?.items || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    const tid = toast.loading('Đang thêm lịch học...');
    try {
      await createSchedule({
        classId: Number(formData.classId), subjectId: Number(formData.subjectId),
        teacherId: Number(formData.teacherId), dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime, endTime: formData.endTime, room: formData.room,
      }).unwrap();
      toast.success('Thêm lịch học thành công!', { id: tid });
      setIsOpen(false);
    } catch (err: any) {
      const msg = err?.data?.message || 'Đã xảy ra lỗi.';
      setFormError(msg); toast.error(msg, { id: tid });
    }
  };

  const handleDelete = (id: number) => {
    toast.promise(deleteSchedule(id).unwrap(), {
      loading: 'Đang xóa...', success: 'Xóa lịch học thành công!',
      error: (e) => e?.data?.message || 'Xóa thất bại',
    });
  };

  // Render một ô trong thời khóa biểu
  const renderCell = (day: string, slot: string) => {
    const items = schedules.filter(s => s.dayOfWeek === day && matchesSlot(s, slot));
    if (items.length === 0) return <td key={slot} className="border border-slate-100 p-1 align-top min-h-[56px] h-14" />;
    return (
      <td key={slot} className="border border-slate-100 p-1 align-top h-14">
        {items.map((item: any) => (
          <div
            key={item.id}
            className={`rounded border px-1.5 py-1 text-xs leading-tight ${getColor(item.subject?.id ?? 0)}`}
          >
            <div className="font-semibold truncate">{item.subject?.subjectName}</div>
            <div className="text-[10px] opacity-75 truncate">{item.classEntity?.className} · {item.room}</div>
            {(isAdmin || isStudent) && (
              <div className="text-[10px] font-medium opacity-80 mt-0.5 truncate" title={`${item.teacherName || 'Chưa phân công'} ${item.teacherPhone ? ` - ${item.teacherPhone}` : ''}`}>
                GV: {item.teacherName || 'Chưa phân công'} {item.teacherPhone ? `(${item.teacherPhone})` : ''}
              </div>
            )}
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] opacity-60">{item.startTime?.substring(0, 5)}–{item.endTime?.substring(0, 5)}</span>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-600 ml-1"
                  title="Xóa"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </td>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{isTeacher ? 'Lịch giảng dạy của tôi' : 'Thời khóa biểu'}</h1>
        {isAdmin && (
          <Button
            onClick={() => {
              setFormData({ classId: '', subjectId: '', teacherId: '', dayOfWeek: '', startTime: '', endTime: '', room: '' });
              setFormError(''); setIsOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm lịch
          </Button>
        )}
      </div>

      {isLoading || isMyScheduleLoading ? (
        <div className="text-center py-16 text-slate-400">Đang tải...</div>
      ) : (
        <div className="space-y-4">
          {/* BUỔI SÁNG */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-amber-600 flex items-center gap-1.5">
                <Sun className="w-4 h-4" /> Buổi sáng (07:00 – 12:00)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 px-3 py-2 text-left text-xs font-medium text-slate-500 w-20">Giờ</th>
                    {DAYS.map(d => (
                      <th key={d} className="border border-slate-200 px-2 py-2 text-center text-xs font-medium text-slate-700 min-w-[120px]">
                        {DAY_VN[d]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MORNING_SLOTS.map(slot => (
                    <tr key={slot}>
                      <td className="border border-slate-100 px-3 py-1 text-xs text-slate-400 font-mono bg-slate-50 whitespace-nowrap">
                        {slot}
                      </td>
                      {DAYS.map(day => renderCell(day, slot))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* BUỔI CHIỀU */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-orange-500 flex items-center gap-1.5">
                <Sunset className="w-4 h-4" /> Buổi chiều (12:30 – 18:00)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 px-3 py-2 text-left text-xs font-medium text-slate-500 w-20">Giờ</th>
                    {DAYS.map(d => (
                      <th key={d} className="border border-slate-200 px-2 py-2 text-center text-xs font-medium text-slate-700 min-w-[120px]">
                        {DAY_VN[d]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AFTERNOON_SLOTS.map(slot => (
                    <tr key={slot}>
                      <td className="border border-slate-100 px-3 py-1 text-xs text-slate-400 font-mono bg-slate-50 whitespace-nowrap">
                        {slot}
                      </td>
                      {DAYS.map(day => renderCell(day, slot))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog thêm lịch */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Thêm lịch học mới</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Lớp</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })} required>
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.className}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label>Môn học</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} required>
                  <option value="">-- Chọn môn --</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Giáo viên</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.teacherId} onChange={e => setFormData({ ...formData, teacherId: e.target.value })} required>
                  <option value="">-- Chọn giáo viên --</option>
                  {teachers.map((teacher: any) => <option key={teacher.id} value={teacher.id}>{teacher.fullName} - {teacher.email}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label>Thứ</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.dayOfWeek} onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })} required>
                  <option value="">-- Chọn thứ --</option>
                  {DAYS.map(d => <option key={d} value={d}>{DAY_VN[d]}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Giờ bắt đầu</Label>
                <Input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
              </div>
              <div className="space-y-1"><Label>Giờ kết thúc</Label>
                <Input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
              </div>
              <div className="space-y-1"><Label>Phòng học</Label>
                <Input value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} required />
              </div>
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isCreating}>Lưu</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
