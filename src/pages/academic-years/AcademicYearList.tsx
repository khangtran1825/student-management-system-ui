import { useState } from 'react';
import { toast } from 'sonner';
import { useGetAcademicYearsQuery, useCreateAcademicYearMutation, useDeleteAcademicYearMutation } from '../../store/api/academicApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trash2, Plus } from 'lucide-react';

export const AcademicYearList = () => {
  const { data: response, isLoading } = useGetAcademicYearsQuery(undefined);
  const [createYear] = useCreateAcademicYearMutation();
  const [deleteYear] = useDeleteAcademicYearMutation();
  
  const [newYearName, setNewYearName] = useState('');

  const handleCreate = async () => {
    if (!newYearName.trim()) { toast.warning('Vui lòng nhập tên năm học!'); return; }
    const tid = toast.loading('Đang tạo năm học...');
    try {
      await createYear({ name: newYearName, startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }).unwrap();
      toast.success('Tạo năm học thành công!', { id: tid });
      setNewYearName('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Tạo năm học thất bại', { id: tid });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa năm học này? Dữ liệu liên quan sẽ bị ảnh hưởng.')) return;
    const tid = toast.loading('Đang xóa...');
    try {
      await deleteYear(id).unwrap();
      toast.success('Xóa năm học thành công!', { id: tid });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Xóa thất bại', { id: tid });
    }
  };

  const academicYears = response?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Năm học</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-base font-medium">Thêm năm học mới</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Tên năm học (VD: 2023-2024)" 
              value={newYearName}
              onChange={(e) => setNewYearName(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Thêm
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên năm học</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Ngày kết thúc</TableHead>
                <TableHead className="w-[100px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Đang tải...</TableCell></TableRow>
              ) : academicYears.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-slate-500">Không có dữ liệu</TableCell></TableRow>
              ) : (
                academicYears.map((year: any) => (
                  <TableRow key={year.id}>
                    <TableCell className="font-medium">{year.id}</TableCell>
                    <TableCell>{year.name}</TableCell>
                    <TableCell>{year.startDate}</TableCell>
                    <TableCell>{year.endDate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(year.id)} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
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
