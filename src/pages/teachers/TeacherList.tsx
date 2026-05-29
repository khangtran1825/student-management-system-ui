import { useState } from 'react';
import { toast } from 'sonner';
import { useGetTeachersQuery, useCreateTeacherMutation, useUpdateTeacherMutation, useDeleteTeacherMutation } from '../../store/api/teacherApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';
import { Trash2, Plus, Pencil, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

const emptyForm = { teacherCode: '', fullName: '', gender: 'MALE', email: '', dateOfBirth: '', phone: '', department: '' };

export const TeacherList = () => {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const { data: response, isLoading } = useGetTeachersQuery({ search: keyword, page, size: 10 });
  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  const [deleteTeacher] = useDeleteTeacherMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [formError, setFormError] = useState('');

  const openCreate = () => { setEditId(null); setFormData({ ...emptyForm }); setFormError(''); setIsOpen(true); };
  const openEdit = (t: any) => {
    setEditId(t.id);
    setFormData({ 
      teacherCode: t.teacherCode, 
      fullName: t.fullName, 
      gender: t.gender || 'MALE', 
      email: t.email || '', 
      dateOfBirth: t.dateOfBirth || '', 
      phone: t.phone || '', 
      department: t.department || ''
    });
    setFormError(''); setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    const tid = toast.loading(editId ? 'Đang cập nhật giảng viên...' : 'Đang thêm giảng viên mới...');
    try {
      if (editId !== null) {
        await updateTeacher({ id: editId, ...formData }).unwrap();
        toast.success('Cập nhật giảng viên thành công!', { id: tid });
      } else {
        await createTeacher(formData).unwrap();
        toast.success('Thêm giảng viên thành công! Tài khoản đăng nhập đã được tạo.', { id: tid });
      }
      setIsOpen(false);
    } catch (err: any) {
      const msg = err?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại.';
      setFormError(msg);
      toast.error(msg, { id: tid });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa giảng viên "${name}"? Thao tác này có thể ảnh hưởng đến lịch dạy của giảng viên này.`)) return;
    const tid = toast.loading('Đang xóa...');
    try {
      await deleteTeacher(id).unwrap();
      toast.success('Xóa giảng viên thành công!', { id: tid });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Xóa thất bại', { id: tid });
    }
  };

  const teachers = response?.data?.items || [];
  const totalPages = response?.data?.totalPages || 1;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Giảng viên</h1>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Thêm giảng viên
        </Button>
      </div>

      <div className="flex gap-2 max-w-sm">
        <Input 
          placeholder="Tìm theo tên hoặc mã GV..." 
          value={searchInput} 
          onChange={e => setSearchInput(e.target.value)} 
          onKeyDown={e => { if (e.key === 'Enter') { setKeyword(searchInput); setPage(0); } }} 
        />
        <Button variant="outline" onClick={() => { setKeyword(searchInput); setPage(0); }}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GV</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Khoa</TableHead>
                <TableHead className="text-right w-28">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">Đang tải...</TableCell></TableRow>
                : teachers.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">Không có dữ liệu</TableCell></TableRow>
                : teachers.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.teacherCode}</TableCell>
                    <TableCell>{t.fullName}</TableCell>
                    <TableCell>{t.gender === 'MALE' ? 'Nam' : t.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell>{t.department}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)} className="text-blue-600 hover:bg-blue-50"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id, t.fullName)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center text-sm text-slate-500">
        <span>Trang {page + 1} / {totalPages}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Trước</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Tiếp →</Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Cập nhật giảng viên' : 'Thêm giảng viên mới'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Mã giảng viên</Label><Input value={formData.teacherCode} onChange={e => setFormData({ ...formData, teacherCode: e.target.value })} required disabled={!!editId} /></div>
              <div className="space-y-1"><Label>Họ và tên</Label><Input value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Giới tính</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} required>
                  <option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option>
                </select>
              </div>
              <div className="space-y-1"><Label>Ngày sinh</Label><Input type="date" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required /></div>
              <div className="space-y-1"><Label>Số điện thoại</Label><Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Bắt buộc" required /></div>
            </div>
            <div className="space-y-1"><Label>Khoa</Label><Input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="Ví dụ: Khoa CNTT" /></div>
            {formError && <p className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded">{formError}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isCreating || isUpdating}>{editId ? 'Cập nhật' : 'Thêm mới'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
