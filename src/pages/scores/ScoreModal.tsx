// src/pages/scores/ScoreModal.tsx
import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scoreApi } from '../../api/scoreApi';
import { Score, ScorePayload } from '../../types';

interface ScoreModalProps {
  open: boolean;
  onClose: () => void;
  editingScore?: Score | null;
  defaultStudentId?: number; // Hỗ trợ truyền nhanh ID sinh viên từ bộ lọc ngoài vào
}

export const ScoreModal: React.FC<ScoreModalProps> = ({ open, onClose, editingScore, defaultStudentId }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEdit = !!editingScore;

  useEffect(() => {
    if (open) {
      if (editingScore) {
        form.setFieldsValue(editingScore);
      } else {
        form.resetFields();
        if (defaultStudentId) {
          form.setFieldsValue({ studentId: defaultStudentId });
        }
      }
    }
  }, [open, editingScore, defaultStudentId, form]);

  const saveMutation = useMutation({
    mutationFn: (values: ScorePayload) => {
      if (isEdit && editingScore) {
        return scoreApi.updateScore(editingScore.id, values);
      }
      return scoreApi.createScore(values);
    },
    onSuccess: (response) => {
      if (response.success) {
        message.success(isEdit ? 'Cập nhật điểm thành công!' : 'Nhập điểm mới thành công!');
        queryClient.invalidateQueries({ queryKey: ['scores'] });
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
      saveMutation.mutate(values as ScorePayload);
    } catch (error) {
      // Validate form failed
    }
  };

  return (
    <Modal
      title={isEdit ? 'Cập nhật Điểm Số' : 'Nhập Điểm Số Mới'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={saveMutation.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="scoreForm">
        <Form.Item 
          name="studentId" 
          label="ID Sinh viên" 
          rules={[{ required: true, message: 'Vui lòng nhập ID sinh viên!' }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="Nhập ID sinh viên (Ví dụ: 1)" disabled={isEdit} />
        </Form.Item>

        <Form.Item 
          name="subjectId" 
          label="ID Môn học" 
          rules={[{ required: true, message: 'Vui lòng nhập ID môn học!' }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="Nhập ID môn học (Ví dụ: 4)" />
        </Form.Item>

        <Form.Item 
          name="midtermScore" 
          label="Điểm giữa kỳ" 
          rules={[{ required: true, message: 'Vui lòng nhập điểm giữa kỳ!' }]}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0} max={10} step={0.1} 
            placeholder="Nhập điểm giữa kỳ (0.0 - 10.0)" 
          />
        </Form.Item>

        <Form.Item 
          name="finalScore" 
          label="Điểm cuối kỳ" 
          rules={[{ required: true, message: 'Vui lòng nhập điểm cuối kỳ!' }]}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0} max={10} step={0.1} 
            placeholder="Nhập điểm cuối kỳ (0.0 - 10.0)" 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};