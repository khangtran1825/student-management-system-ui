import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetStudentByIdQuery } from '../store/api/studentApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export const StudentProfile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const studentId = user?.studentId;

  const { data: response, isLoading } = useGetStudentByIdQuery(studentId ?? 0, { skip: !studentId });
  const student = response?.data;

  if (!studentId) {
    return <div className="p-6 text-center text-slate-500">Không có thông tin sinh viên liên kết với tài khoản.</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ sinh viên</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-slate-500">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><strong>Mã SV:</strong> {student?.studentCode}</div>
              <div><strong>Họ và tên:</strong> {student?.fullName}</div>
              <div><strong>Giới tính:</strong> {student?.gender}</div>
              <div><strong>Email:</strong> {student?.email}</div>
              <div><strong>Ngày sinh:</strong> {student?.dateOfBirth}</div>
              <div><strong>Số điện thoại:</strong> {student?.phone || '-'}</div>
              <div><strong>Lớp:</strong> {student?.className || '-'}</div>
              <div><strong>Địa chỉ:</strong> {student?.address || '-'}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
