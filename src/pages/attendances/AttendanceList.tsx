import { useState } from 'react';
import { toast } from 'sonner';
import { useGetAttendancesQuery, useCreateAttendanceMutation, useUpdateAttendanceMutation } from '../../store/api/academicApi';
import { useGetStudentsQuery } from '../../store/api/studentApi';
import { useGetSchedulesQuery } from '../../store/api/academicApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

export const AttendanceList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isTeacherOrAdmin = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const { data: response, isLoading } = useGetAttendancesQuery(undefined);
  const { data: studentsRes } = useGetStudentsQuery({ page: 0, size: 100 }, { skip: !isTeacherOrAdmin });
  const { data: schedulesRes } = useGetSchedulesQuery(undefined, { skip: !isTeacherOrAdmin });
  const [createAttendance, { isLoading: isCreating }] = useCreateAttendanceMutation();
  const [updateAttendance] = useUpdateAttendanceMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', scheduleId: '', date: '', status: 'PRESENT', note: '' });
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    const tid = toast.loading('Đang lưu điểm danh...');
    try {
      await createAttendance({ studentId: Number(formData.studentId), scheduleId: Number(formData.scheduleId), date: formData.date, status: formData.status, note: formData.note }).unwrap();
      toast.success('Điểm danh thành công!', { id: tid });
      setIsOpen(false);
    } catch (err: any) {
      const msg = err?.data?.message || 'Đã xảy ra lỗi.';
      setFormError(msg); toast.error(msg, { id: tid });
    }
  };

  const toggleStatus = async (item: any) => {
    const newStatus = item.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    const label = newStatus === 'PRESENT' ? 'có mặt' : 'vắng';
    toast.promise(
      updateAttendance({
        id: item.id,
        studentId: item.student?.id,
        scheduleId: item.schedule?.id,
        date: item.date,
        status: newStatus,
        note: item.note,
      }).unwrap(),
      { loading: 'Đang cập nhật...', success: `Đã đánh ${label} cho ${item.student?.fullName}!`, error: (e) => e?.data?.message || 'Cập nhật thất bại' }
    );
  };

  const attendances = response?.data || [];
  const students = studentsRes?.data?.content || [];
  const schedules = schedulesRes?.data || [];

  if (!isTeacherOrAdmin) return <div className="p-6 text-center text-slate-500">Bạn không có quyền truy cập trang này.</div>;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Điểm danh</h1>
        <Button onClick={() => { setFormData({ studentId: '', scheduleId: '', date: '', status: 'PRESENT', note: '' }); setFormError(''); setIsOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />Điểm danh
        </Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Sinh viên</TableHead><TableHead>Buổi học</TableHead><TableHead>Ngày</TableHead>
            <TableHead>Trạng thái</TableHead><TableHead>Ghi chú</TableHead>
            <TableHead className="text-right w-28">Thao tác</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-10">Đang tải...</TableCell></TableRow>
              : attendances.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">Không có dữ liệu</TableCell></TableRow>
              : attendances.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.student?.fullName}</TableCell>
                  <TableCell>{item.schedule?.subject?.subjectName}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${item.status === 'PRESENT' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {item.status === 'PRESENT' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {item.status === 'PRESENT' ? 'Có mặt' : 'Vắng'}
                    </span>
                  </TableCell>
                  <TableCell>{item.note || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(item)} className="text-xs">
                      {item.status === 'PRESENT' ? 'Đánh vắng' : 'Đánh có mặt'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent><DialogHeader><DialogTitle>Thêm điểm danh</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1"><Label>Sinh viên</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} required>
                <option value="">-- Chọn sinh viên --</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.studentCode} - {s.fullName}</option>)}
              </select></div>
            <div className="space-y-1"><Label>Buổi học</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.scheduleId} onChange={e => setFormData({ ...formData, scheduleId: e.target.value })} required>
                <option value="">-- Chọn buổi học --</option>
                {schedules.map((s: any) => <option key={s.id} value={s.id}>{s.subject?.subjectName} - {s.dayOfWeek}</option>)}
              </select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Ngày</Label><Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required /></div>
              <div className="space-y-1"><Label>Trạng thái</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="PRESENT">Có mặt</option>
                  <option value="ABSENT">Vắng</option>
                </select>
              </div>
            </div>
            <div className="space-y-1"><Label>Ghi chú</Label><Input value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} placeholder="Tùy chọn" /></div>
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
