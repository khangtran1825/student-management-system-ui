// src/pages/subjects/SubjectModal.tsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectApi } from '../../api/subjectApi';
import { Subject, SubjectPayload } from '../../types';

interface SubjectModalProps {
  open: boolean;
  onClose: () => void;
  editingSubject?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({ open, onClose, editingSubject }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEdit = !!editingSubject;

  useEffect(() => {
    if (open) {
      if (editingSubject) {
        form.setFieldsValue(editingSubject);
      } else {
        form.resetFields();
      }
    }
  }, [open, editingSubject, form]);

  const saveMutation = useMutation({
    mutationFn: (values: SubjectPayload) => {
      if (isEdit && editingSubject) {
        return subjectApi.updateSubject(editingSubject.id, values);
      }
      return subjectApi.createSubject(values);
    },
    onSuccess: (response) => {
      // (Giữ nguyên cấu hình onSuccess cũ của bạn)
      if (response.success) {
        message.success(isEdit ? 'Cập nhật môn học thành công!' : 'Thêm môn học mới thành công!');
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
        onClose();
      } else {
        message.error(response.message || 'Có lỗi xảy ra!');
      }
    },
    // SỬA LẠI ĐOẠN ON_ERROR NÀY
    onError: (error: any) => {
      // Trích xuất trực tiếp thông báo lỗi từ cấu trúc ApiResponse của Back-end
      const errorMsg = error.response?.data?.message || 'Thao tác thất bại, vui lòng kiểm tra lại dữ liệu nhập!';
      message.error(errorMsg); 
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      saveMutation.mutate(values as SubjectPayload);
    } catch (error) {
      // Validate form thất bại
    }
  };

  return (
    <Modal
      title={isEdit ? 'Cập nhật Môn Học' : 'Thêm Môn Học Mới'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={saveMutation.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="subjectForm">
        <Form.Item
          name="subjectCode"
          label="Mã môn học"
          rules={[{ required: true, message: 'Vui lòng nhập mã môn học!' }]}
        >
          <Input placeholder="Nhập mã môn học (VD: TEST_101)" />
        </Form.Item>

        <Form.Item
          name="subjectName"
          label="Tên môn học"
          rules={[{ required: true, message: 'Vui lòng nhập tên môn học!' }]}
        >
          <Input placeholder="Nhập tên môn học" />
        </Form.Item>

        <Form.Item
          name="credits"
          label="Số tín chỉ"
          rules={[
            { required: true, message: 'Vui lòng nhập số tín chỉ!' },
            { type: 'number', min: 1, max: 10, message: 'Số tín chỉ hợp lệ từ 1 đến 10!' }
          ]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="Nhập số tín chỉ (VD: 3)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};