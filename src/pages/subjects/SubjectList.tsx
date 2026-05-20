import { useState } from 'react';
import { toast } from 'sonner';
import { useGetSubjectsQuery, useCreateSubjectMutation, useUpdateSubjectMutation, useDeleteSubjectMutation } from '../../store/api/academicApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';
import { Trash2, Plus, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

const emptyForm = { subjectCode: '', subjectName: '', credits: 3 };

export const SubjectList = () => {
  const { data: response, isLoading } = useGetSubjectsQuery(undefined);
  const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [formError, setFormError] = useState('');

  const openCreate = () => { setEditId(null); setFormData({ ...emptyForm }); setFormError(''); setIsOpen(true); };
  const openEdit = (item: any) => { setEditId(item.id); setFormData({ subjectCode: item.subjectCode, subjectName: item.subjectName, credits: item.credits || 3 }); setFormError(''); setIsOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    const tid = toast.loading(editId ? 'Đang cập nhật...' : 'Đang thêm môn học...');
    try {
      const payload = { ...formData, credits: Number(formData.credits) };
      if (editId !== null) { await updateSubject({ id: editId, ...payload }).unwrap(); toast.success('Cập nhật môn học thành công!', { id: tid }); }
      else { await createSubject(payload).unwrap(); toast.success('Thêm môn học thành công!', { id: tid }); }
      setIsOpen(false);
    } catch (err: any) {
      const msg = err?.data?.message || 'Đã xảy ra lỗi.';
      setFormError(msg); toast.error(msg, { id: tid });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa môn học "${name}"?`)) return;
    const tid = toast.loading('Đang xóa...');
    try { await deleteSubject(id).unwrap(); toast.success('Xóa môn học thành công!', { id: tid }); }
    catch (err: any) { toast.error(err?.data?.message || 'Xóa thất bại', { id: tid }); }
  };

  const subjects = response?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Môn học</h1>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Thêm môn</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Mã môn</TableHead><TableHead>Tên môn học</TableHead><TableHead>Tín chỉ</TableHead><TableHead className="text-right w-28">Thao tác</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">Đang tải...</TableCell></TableRow>
              : subjects.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">Không có dữ liệu</TableCell></TableRow>
              : subjects.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.subjectCode}</TableCell>
                  <TableCell>{item.subjectName}</TableCell>
                  <TableCell>{item.credits}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-50"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.subjectName)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editId ? 'Cập nhật môn học' : 'Thêm môn học mới'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1"><Label>Mã môn học</Label><Input value={formData.subjectCode} onChange={e => setFormData({ ...formData, subjectCode: e.target.value })} required /></div>
            <div className="space-y-1"><Label>Tên môn học</Label><Input value={formData.subjectName} onChange={e => setFormData({ ...formData, subjectName: e.target.value })} required /></div>
            <div className="space-y-1"><Label>Số tín chỉ</Label><Input type="number" min="1" max="10" value={formData.credits} onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })} required /></div>
            {formError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isCreating || isUpdating}>{editId ? 'Cập nhật' : 'Thêm'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
