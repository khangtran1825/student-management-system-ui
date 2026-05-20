import { useState } from 'react';
import { toast } from 'sonner';
import { useGetClassesQuery, useCreateClassMutation, useUpdateClassMutation, useDeleteClassMutation } from '../../store/api/academicApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';
import { Trash2, Plus, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

const emptyForm = { classCode: '', className: '', major: '' };

export const ClassList = () => {
  const { data: response, isLoading } = useGetClassesQuery(undefined);
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [formError, setFormError] = useState('');

  const openCreate = () => { setEditId(null); setFormData({ ...emptyForm }); setFormError(''); setIsOpen(true); };
  const openEdit = (item: any) => { setEditId(item.id); setFormData({ classCode: item.classCode, className: item.className, major: item.major || '' }); setFormError(''); setIsOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    const tid = toast.loading(editId ? 'Đang cập nhật...' : 'Đang thêm lớp học...');
    try {
      if (editId !== null) { await updateClass({ id: editId, ...formData }).unwrap(); toast.success('Cập nhật lớp học thành công!', { id: tid }); }
      else { await createClass(formData).unwrap(); toast.success('Thêm lớp học thành công!', { id: tid }); }
      setIsOpen(false);
    } catch (err: any) {
      const msg = err?.data?.message || 'Đã xảy ra lỗi.';
      setFormError(msg); toast.error(msg, { id: tid });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa lớp "${name}"?`)) return;
    const tid = toast.loading('Đang xóa...');
    try { await deleteClass(id).unwrap(); toast.success('Xóa lớp học thành công!', { id: tid }); }
    catch (err: any) { toast.error(err?.data?.message || 'Xóa thất bại', { id: tid }); }
  };

  const classes = response?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Lớp học</h1>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Thêm lớp</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Mã lớp</TableHead><TableHead>Tên lớp</TableHead><TableHead>Chuyên ngành</TableHead><TableHead className="text-right w-28">Thao tác</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">Đang tải...</TableCell></TableRow>
              : classes.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">Không có dữ liệu</TableCell></TableRow>
              : classes.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.classCode}</TableCell>
                  <TableCell>{item.className}</TableCell>
                  <TableCell>{item.major || '-'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-50"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.className)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editId ? 'Cập nhật lớp' : 'Thêm lớp học mới'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1"><Label>Mã lớp</Label><Input value={formData.classCode} onChange={e => setFormData({ ...formData, classCode: e.target.value })} required /></div>
            <div className="space-y-1"><Label>Tên lớp</Label><Input value={formData.className} onChange={e => setFormData({ ...formData, className: e.target.value })} required /></div>
            <div className="space-y-1"><Label>Chuyên ngành</Label><Input value={formData.major} onChange={e => setFormData({ ...formData, major: e.target.value })} placeholder="Tùy chọn" /></div>
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
