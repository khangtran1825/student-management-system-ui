// src/pages/students/StudentModal.tsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, message, Select } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { studentApi, StudentPayload } from '../../api/studentApi';
import { classApi } from '../../api/classApi';
import { Student } from '../../types';

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  editingStudent?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({ open, onClose, editingStudent }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEdit = !!editingStudent;

  const { data: classResponse, isLoading: classLoading } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classApi.getAllClasses(),
    enabled: open,
  });

  useEffect(() => {
    if (open && editingStudent) {
      form.setFieldsValue({
        ...editingStudent,
        dateOfBirth: editingStudent.dateOfBirth ? dayjs(editingStudent.dateOfBirth) : null,
      });
    } else if (open && !editingStudent) {
      form.resetFields();
    }
  }, [open, editingStudent, form]);

  const saveMutation = useMutation({
    mutationFn: (values: StudentPayload) => {
      if (isEdit && editingStudent) {
        return studentApi.updateStudent(editingStudent.id, values);
      }
      return studentApi.createStudent(values);
    },
    onSuccess: (response) => {
      if (response.success) {
        message.success(isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        queryClient.invalidateQueries({ queryKey: ['students'] });
        onClose();
      } else {
        message.error(response.message || 'Có lỗi xảy ra!');
      }
    },
    onError: () => {
      message.error('Thao tác thất bại, vui lòng thử lại.');
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: StudentPayload = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      };
      saveMutation.mutate(payload);
    } catch (error) {
      // Validate form thất bại
    }
  };

  return (
    <Modal
      title={isEdit ? 'Cập nhật Sinh viên' : 'Thêm mới Sinh viên'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={saveMutation.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="studentForm">
        <Form.Item name="studentCode" label="Mã sinh viên" rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên!' }]}>
          <Input placeholder="Nhập mã sinh viên" />
        </Form.Item>

        <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        {/* Thêm trường Giới tính */}
        <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
          <Select placeholder="Chọn giới tính">
            <Select.Option value="MALE">Nam</Select.Option>
            <Select.Option value="FEMALE">Nữ</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
          <Input placeholder="Nhập email" />
        </Form.Item>

        {/* Thêm trường Số điện thoại */}
        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        {/* Thêm trường Địa chỉ */}
        <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
          <Input placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item name="classId" label="Lớp học" rules={[{ required: true, message: 'Vui lòng chọn lớp học!' }]}>
          <Select
            placeholder="Chọn lớp học"
            loading={classLoading}
            options={(classResponse?.data || []).map((item) => ({
              value: item.id,
              label: `${item.classCode} - ${item.className}`,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};