import { useState } from 'react';
import { toast } from 'sonner';
import { useGetScoresQuery, useCreateScoreMutation, useUpdateScoreMutation, useDeleteScoreMutation, useGetSubjectsQuery, useGetSemestersQuery } from '../../store/api/academicApi';
import { useGetStudentsQuery } from '../../store/api/studentApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';
import { Trash2, Plus, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

export const ScoreList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const { data: scoresRes, isLoading } = useGetScoresQuery(undefined);
  const { data: studentsRes } = useGetStudentsQuery({ page: 0, size: 100 }, { skip: !isAdminOrTeacher });
  const { data: subjectsRes } = useGetSubjectsQuery(undefined);
  const { data: semestersRes } = useGetSemestersQuery(undefined);
  const [createScore, { isLoading: isCreating }] = useCreateScoreMutation();
  const [updateScore, { isLoading: isUpdating }] = useUpdateScoreMutation();
  const [deleteScore] = useDeleteScoreMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ studentId: '', subjectId: '', semesterId: '', midtermScore: '', finalScore: '' });
  const [formError, setFormError] = useState('');

  const openCreate = () => { setEditId(null); setFormData({ studentId: '', subjectId: '', semesterId: '', midtermScore: '', finalScore: '' }); setFormError(''); setIsOpen(true); };
  const openEdit = (item: any) => {
    setEditId(item.id);
    setFormData({ studentId: item.student?.id || '', subjectId: item.subject?.id || '', semesterId: item.semester?.id || '', midtermScore: item.midtermScore ?? '', finalScore: item.finalScore ?? '' });
    setFormError(''); setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    const tid = toast.loading(editId ? 'Đang cập nhật điểm...' : 'Đang lưu điểm...');
    try {
      const payload = {
        studentId: Number(formData.studentId),
        subjectId: Number(formData.subjectId),
        semesterId: Number(formData.semesterId),
        midtermScore: formData.midtermScore !== '' ? Number(formData.midtermScore) : null,
        finalScore: formData.finalScore !== '' ? Number(formData.finalScore) : null,
      };
      if (editId !== null) { await updateScore({ id: editId, ...payload }).unwrap(); toast.success('Cập nhật điểm thành công!', { id: tid }); }
      else { await createScore(payload).unwrap(); toast.success('Nhập điểm thành công!', { id: tid }); }
      setIsOpen(false);
    } catch (err: any) {
      const msg = err?.data?.message || 'Đã xảy ra lỗi.';
      setFormError(msg); toast.error(msg, { id: tid });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa điểm này?')) return;
    const tid = toast.loading('Đang xóa...');
    try { await deleteScore(id).unwrap(); toast.success('Xóa điểm thành công!', { id: tid }); }
    catch (err: any) { toast.error(err?.data?.message || 'Xóa thất bại', { id: tid }); }
  };

  const scores = scoresRes?.data || [];
  const students = studentsRes?.data?.content || [];
  const subjects = subjectsRes?.data || [];
  const semesters = semestersRes?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Điểm số</h1>
        {isAdminOrTeacher && <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Nhập điểm</Button>}
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Sinh viên</TableHead><TableHead>Môn học</TableHead><TableHead>Học kỳ</TableHead>
            <TableHead>GK</TableHead><TableHead>CK</TableHead><TableHead>TB</TableHead>
            {isAdminOrTeacher && <TableHead className="text-right w-28">Thao tác</TableHead>}
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-10">Đang tải...</TableCell></TableRow>
              : scores.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-400">Không có dữ liệu</TableCell></TableRow>
              : scores.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.student?.fullName}</TableCell>
                  <TableCell>{item.subject?.subjectName}</TableCell>
                  <TableCell>{item.semester?.name}</TableCell>
                  <TableCell>{item.midtermScore ?? '-'}</TableCell>
                  <TableCell>{item.finalScore ?? '-'}</TableCell>
                  <TableCell>{item.averageScore?.toFixed(1) ?? '-'}</TableCell>
                  {isAdminOrTeacher && (
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-50"><Pencil className="w-4 h-4" /></Button>
                      {user?.role === 'ADMIN' && <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>}
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editId ? 'Cập nhật điểm' : 'Nhập điểm mới'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {!editId && <div className="space-y-1"><Label>Sinh viên</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} required>
                <option value="">-- Chọn sinh viên --</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.studentCode} - {s.fullName}</option>)}
              </select></div>}
            <div className="space-y-1"><Label>Môn học</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} required>
                <option value="">-- Chọn môn --</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
              </select></div>
            <div className="space-y-1"><Label>Học kỳ</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.semesterId} onChange={e => setFormData({ ...formData, semesterId: e.target.value })} required>
                <option value="">-- Chọn học kỳ --</option>
                {semesters.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Điểm GK</Label><Input type="number" min="0" max="10" step="0.1" value={formData.midtermScore} onChange={e => setFormData({ ...formData, midtermScore: e.target.value })} /></div>
              <div className="space-y-1"><Label>Điểm CK</Label><Input type="number" min="0" max="10" step="0.1" value={formData.finalScore} onChange={e => setFormData({ ...formData, finalScore: e.target.value })} /></div>
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isCreating || isUpdating}>{editId ? 'Cập nhật' : 'Lưu điểm'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
