import { useState } from 'react';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation, useResetUserPasswordMutation } from '../../store/api/academicApi';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Trash2, Edit2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import UserForm from './UserForm';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdAt?: string;
}

export default function UserList() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: pagedData, isLoading, isFetching, refetch } = useGetUsersQuery({ page, size, search: search || undefined, role: roleFilter || undefined });
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [resetPassword] = useResetUserPasswordMutation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const users = pagedData?.data?.items || [];
  const total = pagedData?.data?.total || 0;

  const handleCreateUser = async (data: { username: string; password: string; email: string; phone?: string; role: string }) => {
    try {
      await createUser(data).unwrap();
      toast.success('Tạo người dùng thành công!');
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Lỗi khi tạo người dùng');
    }
  };

  const handleUpdateUser = async (data: { email: string; phone?: string; role: string; active?: boolean }) => {
    if (!selectedUser) return;
    try {
      await updateUser({ id: selectedUser.id, ...data }).unwrap();
      toast.success('Cập nhật người dùng thành công!');
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Lỗi khi cập nhật người dùng');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await deleteUser(id).unwrap();
      toast.success('Xóa người dùng thành công!');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Lỗi khi xóa người dùng');
    }
  };

  const handleResetPassword = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn reset mật khẩu người dùng này về mặc định (123456)?')) return;
    try {
      await resetPassword(id).unwrap();
      toast.success('Reset mật khẩu thành công!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Lỗi khi reset mật khẩu');
    }
  };

  if (isLoading || isFetching) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản Lý Người Dùng</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo Người Dùng Mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Người Dùng Mới</DialogTitle>
            </DialogHeader>
            <UserForm onSubmit={handleCreateUser} isCreate={true} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <input className="border rounded px-2 py-1" placeholder="Tìm kiếm username hoặc email" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Tất cả role</option>
            <option value="ADMIN">ADMIN</option>
            <option value="TEACHER">TEACHER</option>
            <option value="STUDENT">STUDENT</option>
          </select>
        </div>
        <Button onClick={() => { setPage(0); refetch(); }}>Áp dụng</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Người Dùng ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Tạo Lúc</TableHead>
                  <TableHead className="text-right">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.active ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </TableCell>
                    <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog open={isEditDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                        if (open) {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        } else {
                          setIsEditDialogOpen(false);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cập Nhật Người Dùng</DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <UserForm 
                              onSubmit={handleUpdateUser} 
                              isCreate={false}
                              initialData={{
                                email: selectedUser.email,
                                role: selectedUser.role,
                                active: selectedUser.active
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Reset mật khẩu"
                        onClick={() => handleResetPassword(user.id)}
                      >
                        <KeyRound className="w-4 h-4 text-orange-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">Không có người dùng nào</div>
            )}
            <div className="flex items-center justify-between mt-4">
              <div>Hiển thị {Math.min(total, (page + 1) * size)} trên {total}</div>
              <div className="flex items-center gap-2">
                <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="px-3 py-1 border rounded">Prev</button>
                <span>Trang {page + 1}</span>
                <button disabled={(page + 1) * size >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">Next</button>
                <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }} className="border rounded px-2 py-1">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
