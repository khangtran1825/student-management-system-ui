// src/pages/subjects/SubjectList.tsx
import React, { useState } from 'react';
import { Table, Button, Space, Card, Input, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectApi } from '../../api/subjectApi';
import { SubjectModal } from './SubjectModal';
import { Subject } from '../../types';

const { Title } = Typography;

export const SubjectList: React.FC = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Gọi đúng hàm phân trang searchSubjects ứng với Step 4 trong Postman
  const { data: response, isLoading } = useQuery({
    queryKey: ['subjects', page, keyword],
    queryFn: () => subjectApi.searchSubjects({ page, size, keyword: keyword || undefined }),
  });

  // Xử lý xóa môn học ứng với Step 10 trong Postman
  const deleteMutation = useMutation({
    mutationFn: subjectApi.deleteSubject,
    onSuccess: (res) => {
      if (res.success) {
        message.success('Xóa môn học thành công!');
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
      } else {
        message.error(res.message || 'Xóa thất bại');
      }
    },
    onError: () => message.error('Hệ thống gặp lỗi khi xóa môn học.'),
  });

  const handleEdit = (record: Subject) => {
    setEditingSubject(record);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setModalOpen(true);
  };

  const columns = [
    { title: 'ID Môn', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Mã Môn Học', dataIndex: 'subjectCode', key: 'subjectCode' },
    { title: 'Tên Môn Học', dataIndex: 'subjectName', key: 'subjectName' },
    { title: 'Số Tín Chỉ', dataIndex: 'credits', key: 'credits', width: 150 },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_: any, record: Subject) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#1890ff' }} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa môn học này?"
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
            <Title level={4} style={{ margin: 0 }}>Quản Lý Môn Học</Title>
            <Input
              placeholder="Tìm mã hoặc tên môn học..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0); // Quay về trang 1 khi gõ tìm kiếm mới
              }}
              style={{ width: 260, marginLeft: 16 }}
              suffix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              allowClear
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm môn học mới
          </Button>
        </Space>

        <Table
          dataSource={response?.data?.content || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page + 1,
            pageSize: size,
            total: response?.data?.totalElements || 0,
            onChange: (p) => setPage(p - 1),
          }}
        />
      </Card>

      <SubjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingSubject={editingSubject}
      />
    </div>
  );
};