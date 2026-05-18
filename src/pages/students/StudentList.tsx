import React, { useState } from 'react';
import { Table, Button, Space, Input, Popconfirm, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../../api/studentApi';
import { Student } from '../../types';
import { StudentModal } from './StudentModal';

const { Search } = Input;

export const StudentList: React.FC = () => {
  const queryClient = useQueryClient();
  
  // States cho phân trang và tìm kiếm
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState<string>('');

  // States cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Fetch dữ liệu danh sách
  const { data, isLoading } = useQuery({
    queryKey: ['students', currentPage, pageSize, keyword],
    queryFn: () => 
      studentApi.getStudents({ 
        // Giả sử Backend page bắt đầu từ 0
        page: currentPage - 1, 
        size: pageSize, 
        keyword 
      }),
  });

  // Mutation cho tính năng Xóa
  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentApi.deleteStudent(id),
    onSuccess: (response) => {
      if (response.success) {
        message.success('Xóa sinh viên thành công!');
        queryClient.invalidateQueries({ queryKey: ['students'] });
      } else {
        message.error(response.message || 'Không thể xóa!');
      }
    },
    onError: () => message.error('Có lỗi xảy ra khi xóa!'),
  });

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'Mã SV', dataIndex: 'studentCode', key: 'studentCode' },
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Ngày sinh', dataIndex: 'dateOfBirth', key: 'dateOfBirth' },
    { title: 'Class ID', dataIndex: 'classId', key: 'classId' },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: Student) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
            style={{ color: '#1890ff' }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sinh viên này?"
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
    <Card title="Danh sách Sinh viên">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm theo mã, tên..."
          onSearch={(value) => {
            setKeyword(value);
            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
          }}
          style={{ width: 300 }}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm Sinh viên
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

      <StudentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingStudent={editingStudent}
      />
    </Card>
  );
};