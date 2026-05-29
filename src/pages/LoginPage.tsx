import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { useLoginMutation, useStudentLoginMutation } from '../store/api/authApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { GraduationCap } from 'lucide-react';
import { RootState } from '../store';

export const LoginPage = () => {
  const [loginType, setLoginType] = useState<'admin' | 'student'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [studentLogin, { isLoading: isStudentLoginLoading }] = useStudentLoginMutation();

  const getDefaultRouteByRole = (role?: string) => {
    if (role === 'STUDENT') return '/profile';
    if (role === 'TEACHER') return '/schedules';
    return '/dashboard'; // ADMIN and fallback
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDefaultRouteByRole(user?.role), { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const tid = toast.loading('Đang đăng nhập...');
    try {
      const res = await login({ username, password }).unwrap();
      if (res.success && res.data) {
        dispatch(setCredentials({ 
          user: { 
            username: res.data.username, 
            role: res.data.role, 
            studentId: res.data.studentId ?? null,
            mustChangePassword: res.data.mustChangePassword
          }, 
          token: res.data.token 
        }));
        toast.success(`Chào mừng, ${res.data.username}! (Quyền: ${res.data.role})`, { id: tid });
        navigate(getDefaultRouteByRole(res.data.role));
      } else {
        const msg = res.message || 'Đăng nhập thất bại';
        setError(msg);
        toast.error(msg, { id: tid });
      }
    } catch (err: any) {
      const msg = err?.data?.message || 'Lỗi kết nối đến server';
      setError(msg);
      toast.error(msg, { id: tid });
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const tid = toast.loading('Đang đăng nhập...');
    try {
      const res = await studentLogin({ username, password }).unwrap();
      if (res.success && res.data) {
        dispatch(setCredentials({ 
          user: { 
            username: res.data.username, 
            role: res.data.role, 
            studentId: res.data.studentId ?? null,
            mustChangePassword: res.data.mustChangePassword
          }, 
          token: res.data.token 
        }));
        toast.success(`Chào mừng, ${res.data.username}! (Sinh viên)`, { id: tid });
        navigate(getDefaultRouteByRole(res.data.role));
      } else {
        const msg = res.message || 'Đăng nhập thất bại';
        setError(msg);
        toast.error(msg, { id: tid });
      }
    } catch (err: any) {
      const msg = err?.message || 'Lỗi kết nối đến server';
      setError(msg);
      toast.error(msg, { id: tid });
    }
  };

  const isLoading = loginType === 'admin' ? isLoginLoading : isStudentLoginLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm shadow-lg border-slate-200">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-600 p-3 rounded-full">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Hệ thống Quản lý</CardTitle>
          <CardDescription>Đăng nhập để tiếp tục</CardDescription>
        </CardHeader>

        {/* Login Type Tabs */}
        <div className="flex gap-2 px-6 pt-2">
          <button
            onClick={() => setLoginType('admin')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              loginType === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Admin/Giáo viên
          </button>
          <button
            onClick={() => setLoginType('student')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              loginType === 'student'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Sinh viên
          </button>
        </div>

        <CardContent className="pt-4">
          <form onSubmit={loginType === 'admin' ? handleAdminLogin : handleStudentLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                {loginType === 'admin' ? 'Tên đăng nhập' : 'Mã sinh viên/Tên đăng nhập'}
              </Label>
              <Input 
                id="username" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={loginType === 'admin' ? 'Nhập tên đăng nhập' : 'Nhập mã sinh viên hoặc tên đăng nhập'}
                required
                className="focus-visible:ring-blue-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                className="focus-visible:ring-blue-600"
              />
            </div>
            {error && (
              <div className="text-sm font-medium text-destructive bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            {loginType === 'student' && (
              <div className="text-xs text-slate-500 mt-4 p-3 bg-blue-50 rounded border border-blue-100">
                <p className="font-medium mb-1">Hướng dẫn đăng nhập sinh viên:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Dùng mã sinh viên hoặc username do hệ thống cấp khi tạo sinh viên</li>
                  <li>Mật khẩu là mật khẩu đã nhập lúc tạo sinh viên</li>
                </ul>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};