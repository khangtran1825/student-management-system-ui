// src/pages/classes/ClassModal.tsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd'; // Bỏ InputNumber vì không dùng nữa
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classApi, ClassPayload } from '../../api/classApi';
import { Class } from '../../types';

interface ClassModalProps {
  open: boolean;
  onClose: () => void;
  editingClass?: Class | null;
}

export const ClassModal: React.FC<ClassModalProps> = ({ open, onClose, editingClass }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEdit = !!editingClass;

  useEffect(() => {
    if (open && editingClass) {
      form.setFieldsValue(editingClass);
    } else if (open && !editingClass) {
      form.resetFields();
    }
  }, [open, editingClass, form]);

  const saveMutation = useMutation({
    mutationFn: (values: ClassPayload) => {
      if (isEdit && editingClass) {
        return classApi.updateClass(editingClass.id, values);
      }
      return classApi.createClass(values);
    },
    onSuccess: (response) => {
      if (response.success) {
        message.success(isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        queryClient.invalidateQueries({ queryKey: ['classes'] });
        onClose();
      } else {
        message.error(response.message || 'Có lỗi xảy ra!');
      }
    },
    onError: () => message.error('Thao tác thất bại, vui lòng thử lại.'),
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      saveMutation.mutate(values);
    } catch (error) {
      // Validate form failed
    }
  };

  return (
    <Modal
      title={isEdit ? 'Cập nhật Lớp học' : 'Thêm mới Lớp học'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={saveMutation.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="classForm">
        {/* Trường Mã Lớp học */}
        <Form.Item 
          name="classCode" 
          label="Mã Lớp học" 
          rules={[{ required: true, message: 'Vui lòng nhập mã lớp học' }]}
        >
          <Input placeholder="Nhập mã lớp học (VD: TH01, PM02...)" />
        </Form.Item>

        {/* Trường Tên Lớp học */}
        <Form.Item 
          name="className" 
          label="Tên Lớp học" 
          rules={[{ required: true, message: 'Vui lòng nhập tên lớp học' }]}
        >
          <Input placeholder="Nhập tên lớp học" />
        </Form.Item>

        {/* Trường Chuyên ngành */}
        <Form.Item 
          name="major" 
          label="Chuyên ngành" 
          rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành' }]}
        >
          <Input placeholder="Nhập chuyên ngành (VD: Công nghệ phần mềm...)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};