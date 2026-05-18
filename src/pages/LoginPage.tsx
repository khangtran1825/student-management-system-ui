import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Navigate } from 'react-router-dom';
import { authApi, LoginPayload } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  

  // Khởi tạo mutation với TanStack Query
  const loginMutation = useMutation({
    mutationFn: (values: LoginPayload) => authApi.login(values),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Lưu token và thông tin user vào Zustand
        setAuth(response.data.token, response.data.user);
        message.success('Đăng nhập thành công!');
        // Chuyển hướng vào trang quản trị
        navigate('/');
      } else {
        message.error(response.message || 'Đăng nhập thất bại!');
      }
    },
    onError: (error: any) => {
      // Xử lý lỗi từ server trả về (ví dụ: sai user/pass)
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập.';
      message.error(errorMsg);
    },
  });
  // Nếu đã đăng nhập thì tự động chuyển hướng vào Dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onFinish = (values: LoginPayload) => {
    loginMutation.mutate(values);
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#f0f2f5' 
      }}
    >
      <Card title="Hệ thống Quản lý Sinh viên" style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Form
          name="login_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%' }} 
              loading={loginMutation.isPending}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};