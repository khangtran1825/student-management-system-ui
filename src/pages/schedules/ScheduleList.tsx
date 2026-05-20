import { useState } from 'react';
import { toast } from 'sonner';
import { useGetSchedulesQuery, useCreateScheduleMutation, useDeleteScheduleMutation, useGetClassesQuery, useGetSubjectsQuery } from '../../store/api/academicApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

export const ScheduleList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const { data: response, isLoading } = useGetSchedulesQuery(undefined);
  const { data: classesRes } = useGetClassesQuery(undefined, { skip: !isAdmin });
  const { data: subjectsRes } = useGetSubjectsQuery(undefined, { skip: !isAdmin });
  const [createSchedule, { isLoading: isCreating }] = useCreateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ classId: '', subjectId: '', teacherName: '', dayOfWeek: '', startTime: '', endTime: '', room: '' });
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    const tid = toast.loading('Đang thêm lịch học...');
    try {
      await createSchedule({ classId: Number(formData.classId), subjectId: Number(formData.subjectId), teacherName: formData.teacherName, dayOfWeek: formData.dayOfWeek, startTime: formData.startTime, endTime: formData.endTime, room: formData.room }).unwrap();
      toast.success('Thêm lịch học thành công!', { id: tid });
      setIsOpen(false);
    } catch (err: any) {
      const msg = err?.data?.message || 'Đã xảy ra lỗi.';
      setFormError(msg); toast.error(msg, { id: tid });
    }
  };

  const schedules = response?.data || [];
  const classes = classesRes?.data || [];
  const subjects = subjectsRes?.data || [];
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const dayVN: Record<string, string> = { MONDAY: 'Thứ 2', TUESDAY: 'Thứ 3', WEDNESDAY: 'Thứ 4', THURSDAY: 'Thứ 5', FRIDAY: 'Thứ 6', SATURDAY: 'Thứ 7', SUNDAY: 'Chủ nhật' };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch học</h1>
        {isAdmin && <Button onClick={() => { setFormData({ classId: '', subjectId: '', teacherName: '', dayOfWeek: '', startTime: '', endTime: '', room: '' }); setFormError(''); setIsOpen(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Thêm lịch</Button>}
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Môn học</TableHead><TableHead>Lớp</TableHead><TableHead>Giáo viên</TableHead><TableHead>Thứ</TableHead>
            <TableHead>Giờ</TableHead><TableHead>Phòng</TableHead>
            {isAdmin && <TableHead className="text-right w-16">Xóa</TableHead>}
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-10">Đang tải...</TableCell></TableRow>
              : schedules.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-400">Không có dữ liệu</TableCell></TableRow>
              : schedules.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.subject?.subjectName}</TableCell>
                  <TableCell>{item.classEntity?.className}</TableCell>
                  <TableCell>{item.teacherName}</TableCell>
                  <TableCell>{dayVN[item.dayOfWeek] || item.dayOfWeek}</TableCell>
                  <TableCell>{item.startTime} - {item.endTime}</TableCell>
                  <TableCell>{item.room}</TableCell>
                  {isAdmin && <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { toast.promise(deleteSchedule(item.id).unwrap(), { loading: 'Đang xóa...', success: 'Xóa lịch học thành công!', error: (e) => e?.data?.message || 'Xóa thất bại' }); }} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button></TableCell>}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent><DialogHeader><DialogTitle>Thêm lịch học mới</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Lớp</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })} required>
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.className}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label>Môn học</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} required>
                  <option value="">-- Chọn môn --</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1"><Label>Giáo viên</Label>
              <Input value={formData.teacherName} onChange={e => setFormData({ ...formData, teacherName: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Thứ</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.dayOfWeek} onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })} required>
                  <option value="">-- Chọn thứ --</option>
                  {days.map(d => <option key={d} value={d}>{dayVN[d]}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Giờ bắt đầu</Label><Input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required /></div>
              <div className="space-y-1"><Label>Giờ kết thúc</Label><Input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required /></div>
              <div className="space-y-1"><Label>Phòng học</Label><Input value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} required /></div>
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
