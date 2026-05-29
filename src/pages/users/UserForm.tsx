import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';

interface UserFormProps {
  onSubmit: (data: any) => void;
  isCreate: boolean;
  initialData?: {
    email?: string;
    phone?: string;
    role?: string;
    active?: boolean;
  };
}

export default function UserForm({ onSubmit, isCreate, initialData }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'TEACHER',
    active: initialData?.active ?? true,
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [k: string]: string } = {};
    if (isCreate) {
      if (!formData.username.trim()) newErrors.username = 'Username là bắt buộc';
      if (!formData.password || formData.password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
      if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
      if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc';
      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      onSubmit(formData);
    } else {
      // update
      if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
      if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc';
      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      onSubmit({ email: formData.email, phone: formData.phone, role: formData.role, active: formData.active });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isCreate && (
        <>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập username"
              required
              minLength={3}
            />
            {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
              minLength={6}
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>
        </>
      )}
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Nhập email"
          required
        />
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          name="phone"
          type="text"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Nhập số điện thoại"
          required
        />
        {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ADMIN">ADMIN</option>
          <option value="TEACHER">TEACHER</option>
          <option value="STUDENT">STUDENT</option>
        </select>
      </div>

      {!isCreate && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Tài khoản đang hoạt động
          </Label>
        </div>
      )}

      <Button type="submit" className="w-full">
        {isCreate ? 'Tạo Người Dùng' : 'Cập Nhật'}
      </Button>
    </form>
  );
}
