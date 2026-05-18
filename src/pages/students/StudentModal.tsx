import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, message, InputNumber } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { studentApi, StudentPayload } from '../../api/studentApi';
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

  // Cập nhật giá trị form khi mở modal sửa hoặc thêm mới
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
        // Yêu cầu React Query fetch lại danh sách sinh viên
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
      // Format lại ngày tháng trước khi gửi lên backend
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
        <Form.Item name="studentCode" label="Mã sinh viên" rules={[{ required: true }]}>
          <Input placeholder="Nhập mã sinh viên" />
        </Form.Item>
        <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="Nhập email" />
        </Form.Item>
        <Form.Item name="dateOfBirth" label="Ngày sinh" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="classId" label="ID Lớp học" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} placeholder="Nhập ID lớp học" />
        </Form.Item>
      </Form>
    </Modal>
  );
};