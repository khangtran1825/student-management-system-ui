import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classApi } from '../../api/classApi';
import { Class } from '../../types';
import { ClassModal } from './ClassModal';

export const ClassList: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['classes', currentPage, pageSize],
    queryFn: () => classApi.getClasses({ page: currentPage - 1, size: pageSize }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => classApi.deleteClass(id),
    onSuccess: (response) => {
      if (response.success) {
        message.success('Xóa lớp học thành công!');
        queryClient.invalidateQueries({ queryKey: ['classes'] });
      } else {
        message.error(response.message || 'Không thể xóa lớp học này!');
      }
    },
    onError: () => message.error('Có lỗi xảy ra khi xóa!'),
  });

  const handleEdit = (record: Class) => {
    setEditingClass(record);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  // src/pages/classes/ClassList.tsx

// Tìm đến mảng columns bên trong component ClassList và sửa lại như sau:
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: 'Mã Lớp', dataIndex: 'classCode', key: 'classCode' },
  { title: 'Tên Lớp', dataIndex: 'className', key: 'className' },
  { title: 'Chuyên ngành', dataIndex: 'major', key: 'major' },
  {
    title: 'Hành động',
    key: 'actions',
    render: (_: any, record: Class) => (
      <Space size="middle">
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          onClick={() => handleEdit(record)} 
          style={{ color: '#1890ff' }}
        />
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa lớp học này?"
          onConfirm={() => deleteMutation.mutate(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="text" danger icon={<DeleteOutlined />} loading={deleteMutation.isPending} />
        </Popconfirm>
      </Space>
    ),
  },
];

  return (
    <Card title="Danh sách Lớp học">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm Lớp học
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data?.content || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.data?.totalElements || 0,
          showSizeChanger: true,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
      />

      <ClassModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingClass={editingClass}
      />
    </Card>
  );
};