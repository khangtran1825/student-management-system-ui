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
  email: string;
  dateOfBirth: string;
  classId: number;
}

// Interface Class
export interface Class {
  id: number;
  className: string;
  teacherId?: number;
}

// Interface Subject
export interface Subject {
  id: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
}

// Interface Score
export interface Score {
  id: number;
  studentId: number;
  subjectId: number;
  scoreValue: number;
}