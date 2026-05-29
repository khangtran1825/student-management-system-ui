import { useState } from 'react';
import { toast } from 'sonner';
import { useGetExamsQuery, useGetMyExamsQuery, useCreateExamMutation, useDeleteExamMutation, useGetSubjectsQuery, useGetSemestersQuery } from '../../store/api/academicApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

export const ExamList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  const { data: response, isLoading } = useGetExamsQuery(undefined, { skip: isTeacher || isStudent });
  const { data: myExamsRes, isLoading: isMyExamsLoading } = useGetMyExamsQuery(undefined, { skip: isAdmin });
  const { data: subjectsRes } = useGetSubjectsQuery(undefined, { skip: !isAdmin });
  const { data: semestersRes } = useGetSemestersQuery(undefined, { skip: !isAdmin });
  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();
  const [deleteExam] = useDeleteExamMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ subjectId: '', semesterId: '', examDate: '', room: '' });
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    const tid = toast.loading('Đang thêm lịch thi...');
    try {
      await createExam({ subjectId: Number(formData.subjectId), semesterId: Number(formData.semesterId), examDate: formData.examDate, room: formData.room }).unwrap();
      toast.success('Thêm lịch thi thành công!', { id: tid });
      setIsOpen(false);
    } catch (err: any) {
      const msg = err?.data?.message || 'Đã xảy ra lỗi.';
      setFormError(msg); toast.error(msg, { id: tid });
    }
  };

  const exams = (isTeacher || isStudent) ? (myExamsRes?.data || []) : (response?.data || []);
  const subjects = subjectsRes?.data || [];
  const semesters = semestersRes?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isStudent ? 'Lịch thi của tôi' : isTeacher ? 'Lịch thi các lớp phụ trách' : 'Lịch thi'}
        </h1>
        {isAdmin && <Button onClick={() => { setFormData({ subjectId: '', semesterId: '', examDate: '', room: '' }); setFormError(''); setIsOpen(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Thêm lịch thi</Button>}
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Môn thi</TableHead><TableHead>Học kỳ</TableHead><TableHead>Ngày thi</TableHead>
            <TableHead>Phòng</TableHead>
            {isTeacher && <TableHead>Lớp đang phụ trách</TableHead>}
            {isAdmin && <TableHead className="text-right w-16">Xóa</TableHead>}
          </TableRow></TableHeader>
          <TableBody>
            {isLoading || isMyExamsLoading ? <TableRow><TableCell colSpan={isTeacher ? 5 : 4} className="text-center py-10">Đang tải...</TableCell></TableRow>
              : exams.length === 0 ? <TableRow><TableCell colSpan={isTeacher ? 5 : 4} className="text-center py-10 text-slate-400">Không có dữ liệu</TableCell></TableRow>
              : exams.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.subject?.subjectName}</TableCell>
                  <TableCell>{item.semester?.name}</TableCell>
                  <TableCell>{item.examDate}</TableCell>
                  <TableCell>{item.room}</TableCell>
                  {isTeacher && <TableCell>{item.classNames?.length ? item.classNames.join(', ') : '-'}</TableCell>}
                  {isAdmin && <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { toast.promise(deleteExam(item.id).unwrap(), { loading: 'Đang xóa...', success: 'Xóa lịch thi thành công!', error: (e) => e?.data?.message || 'Xóa thất bại' }); }} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button></TableCell>}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent><DialogHeader><DialogTitle>Thêm lịch thi mới</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Môn thi</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} required>
                  <option value="">-- Chọn môn --</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label>Học kỳ</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.semesterId} onChange={e => setFormData({ ...formData, semesterId: e.target.value })} required>
                  <option value="">-- Chọn học kỳ --</option>
                  {semesters.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Ngày thi</Label><Input type="datetime-local" value={formData.examDate} onChange={e => setFormData({ ...formData, examDate: e.target.value })} required /></div>
              <div className="space-y-1"><Label>Phòng thi</Label><Input value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} required /></div>
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
