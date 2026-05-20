import { useState } from 'react';
import { toast } from 'sonner';
import { useGetSemestersQuery, useCreateSemesterMutation, useDeleteSemesterMutation, useGetAcademicYearsQuery } from '../../store/api/academicApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

export const SemesterList = () => {
  const { data: response, isLoading } = useGetSemestersQuery(undefined);
  const { data: yearsResponse } = useGetAcademicYearsQuery(undefined);
  
  const [createSemester] = useCreateSemesterMutation();
  const [deleteSemester] = useDeleteSemesterMutation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    academicYearId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading('Đang thêm học kỳ...');
    try {
      await createSemester({ name: formData.name, startDate: formData.startDate, endDate: formData.endDate, academicYearId: Number(formData.academicYearId) }).unwrap();
      toast.success('Thêm học kỳ thành công!', { id: tid });
      setIsOpen(false);
      setFormData({ name: '', startDate: '', endDate: '', academicYearId: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Thêm học kỳ thất bại', { id: tid });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa học kỳ này?')) return;
    const tid = toast.loading('Đang xóa...');
    try {
      await deleteSemester(id).unwrap();
      toast.success('Xóa học kỳ thành công!', { id: tid });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Xóa thất bại', { id: tid });
    }
  };

  const semesters = response?.data || [];
  const academicYears = yearsResponse?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Học kỳ</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Thêm học kỳ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm học kỳ mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="semesterName">Tên học kỳ</Label>
                <Input id="semesterName" placeholder="VD: Học kỳ 1" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYearId">Năm học</Label>
                <select 
                  id="academicYearId" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.academicYearId} 
                  onChange={e => setFormData({...formData, academicYearId: e.target.value})} 
                  required
                >
                  <option value="">-- Chọn năm học --</option>
                  {academicYears.map((y: any) => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input id="endDate" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
              </div>
              <Button type="submit" className="w-full">Lưu</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên học kỳ</TableHead>
                <TableHead>Năm học</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Ngày kết thúc</TableHead>
                <TableHead className="w-[100px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Đang tải dữ liệu...</TableCell></TableRow>
              ) : semesters.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">Không có dữ liệu</TableCell></TableRow>
              ) : (
                semesters.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.academicYear?.name}</TableCell>
                    <TableCell>{item.startDate}</TableCell>
                    <TableCell>{item.endDate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
