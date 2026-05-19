import React from 'react';
import { Card, Col, Row, Statistic, Space, Typography, Button, Skeleton } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const statCards = [
  { key: 'totalStudents', title: 'Sinh viên', color: '#1677ff' },
  { key: 'totalClasses', title: 'Lớp học', color: '#13c2c2' },
  { key: 'totalSubjects', title: 'Môn học', color: '#722ed1' },
  { key: 'totalScores', title: 'Bản ghi điểm', color: '#eb2f96' },
  { key: 'totalUsers', title: 'Tài khoản', color: '#fa8c16' },
  { key: 'activeUsers', title: 'Tài khoản hoạt động', color: '#52c41a' },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary(),
  });

  const summary = data?.data;

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <Card
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%)',
          color: '#fff',
          border: 'none',
        }}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>
            Tổng quan hệ thống quản lý sinh viên
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 0, maxWidth: 760 }}>
            Theo dõi nhanh số lượng sinh viên, lớp học, môn học và tài khoản đang hoạt động.
            Màn hình này giúp quản trị viên nắm được tình trạng hệ thống ngay khi đăng nhập.
          </Paragraph>
          <Space wrap>
            <Button type="primary" onClick={() => navigate('/students')}>
              Quản lý sinh viên
            </Button>
            <Button onClick={() => navigate('/classes')}>Quản lý lớp học</Button>
            <Button onClick={() => navigate('/subjects')}>Quản lý môn học</Button>
          </Space>
          {summary?.generatedAt && (
            <Text style={{ color: 'rgba(255,255,255,0.75)' }}>
              Cập nhật lúc: {new Date(summary.generatedAt).toLocaleString('vi-VN')}
            </Text>
          )}
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {statCards.map((item) => (
          <Col key={item.key} xs={24} sm={12} lg={8}>
            <Card bordered={false} style={{ borderTop: `4px solid ${item.color}` }}>
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic title={item.title} value={summary?.[item.key as keyof typeof summary] as number | undefined ?? 0} />
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Phân quyền nhanh">
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
              <li>ADMIN: toàn quyền quản lý sinh viên, lớp học, môn học, điểm và tài khoản.</li>
              <li>TEACHER: quản lý dữ liệu học tập và tra cứu thông tin học phần.</li>
              <li>STUDENT: chỉ xem thông tin cá nhân và điểm số của chính mình.</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Trạng thái hệ thống">
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
              <li>Thống kê được lấy trực tiếp từ backend Quarkus.</li>
              <li>Form sinh viên và điểm số dùng dữ liệu thật để chọn lớp/môn.</li>
              <li>Cấu trúc hiện tại vẫn giữ nguyên luồng CRUD sẵn có.</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};