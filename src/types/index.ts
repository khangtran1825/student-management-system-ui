// Định nghĩa cấu trúc chuẩn của Backend Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Định nghĩa cấu trúc phân trang
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Định nghĩa Role
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

// Interface User (Thông tin đăng nhập)
export interface User {
  id: number;
  username: string;
  role: Role;
}

// Interface Login Response
export interface AuthResponse {
  token: string;
  user: User;
}

// Interface Student
export interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE'; // Thêm giới tính dạng Enum chuẩn dữ liệu gửi lên
  dateOfBirth: string;
  email: string;
  phone: string;             // Thêm số điện thoại
  address: string;           // Thêm địa chỉ
  classId: number;
}

export interface Class {
  id: number;
  classCode: string;   // Mã lớp học
  className: string;   // Tên lớp học
  major: string;       // Chuyên ngành
}

// Interface Subject
export interface Subject {
  id: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
}

export interface Score {
  id: number;
  studentId: number;
  subjectId: number;
  midtermScore: number;
  finalScore: number;
  // Các thuộc tính bổ sung nếu Backend trả về thông tin hiển thị mở rộng
  studentCode?: string;
  fullName?: string;
  subjectName?: string;
}

export type ScorePayload = Omit<Score, 'id'>;