import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { setCredentials } from '../../store/authSlice';
import { useChangePasswordMutation } from '../../store/api/authApi';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

const ForceChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [changePassword] = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!auth.isAuthenticated || !auth.user?.mustChangePassword) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      toast.success('Đổi mật khẩu thành công! Vui lòng tiếp tục sử dụng hệ thống.');

      if (auth.user && auth.token) {
        const updatedUser = { ...auth.user, mustChangePassword: false };
        dispatch(setCredentials({ user: updatedUser, token: auth.token }));
      }
      navigate('/');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="mb-2 text-2xl font-bold text-center text-gray-800">
          Đổi Mật Khẩu Bắt Buộc
        </h2>
        <p className="mb-6 text-sm text-center text-gray-600">
          Tài khoản của bạn cần được đổi mật khẩu trong lần đăng nhập đầu tiên hoặc do yêu cầu từ quản trị viên.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu hiện tại"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForceChangePassword;
