// src/pages/scores/ScoreList.tsx
import React, { useState } from 'react';
import { Table, Button, Space, Card, InputNumber, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scoreApi } from '../../api/scoreApi';
import { ScoreModal } from './ScoreModal';
import { Score } from '../../types';

const { Title } = Typography;

export const ScoreList: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchStudentId, setSearchStudentId] = useState<number | null>(1); // Mặc định tìm ID: 1 theo Postman
  const [targetStudentId, setTargetStudentId] = useState<number | null>(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);

  // Kích hoạt React Query gọi dữ liệu
  const { data: response, isLoading } = useQuery({
    queryKey: ['scores', targetStudentId],
    queryFn: () => scoreApi.getScoresByStudent(targetStudentId!),
    enabled: targetStudentId !== null,
  });

  // Xử lý xóa điểm
  const deleteMutation = useMutation({
    mutationFn: scoreApi.deleteScore,
    onSuccess: (res) => {
      if (res.success) {
        message.success('Xóa điểm số thành công!');
        queryClient.invalidateQueries({ queryKey: ['scores'] });
      } else {
        message.error(res.message || 'Xóa thất bại');
      }
    },
    onError: () => message.error('Đã xảy ra lỗi hệ thống.'),
  });

  const handleSearch = () => {
    if (searchStudentId) {
      setTargetStudentId(searchStudentId);
    } else {
      message.warning('Vui lòng nhập ID sinh viên trước khi tìm kiếm.');
    }
  };

  const handleEdit = (record: Score) => {
    setEditingScore(record);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingScore(null);
    setModalOpen(true);
  };

  const columns = [
    { title: 'ID Điểm', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'ID Môn Học', dataIndex: 'subjectId', key: 'subjectId' },
    { title: 'Tên Môn Học', dataIndex: 'subjectName', key: 'subjectName', render: (text: string) => text || 'N/A' },
    { title: 'Điểm Giữa Kỳ', dataIndex: 'midtermScore', key: 'midtermScore' },
    { title: 'Điểm Cuối Kỳ', dataIndex: 'finalScore', key: 'finalScore' },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_: any, record: Score) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#1890ff' }} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa điểm số này?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space style={{ marginBottom: 24, justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <Title level={4} style={{ margin: 0 }}>Quản Lý Điểm Số Sinh Viên</Title>
            <InputNumber
              min={1}
              placeholder="Nhập ID Sinh viên"
              value={searchStudentId}
              onChange={(value) => setSearchStudentId(value)}
              style={{ width: 180, marginLeft: 16 }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Nhập điểm mới
          </Button>
        </Space>

        <Table
          dataSource={response?.data || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: 'Không tìm thấy dữ liệu điểm cho Sinh viên ID này' }}
        />
      </Card>

      <ScoreModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingScore={editingScore}
        defaultStudentId={targetStudentId || undefined}
      />
    </div>
  );
};