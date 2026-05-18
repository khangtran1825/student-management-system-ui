import axiosClient from './axiosClient';
import { ApiResponse, PageResponse, Student } from '../types';

export interface GetStudentsParams {
  keyword?: string;
  page: number; // Thường backend Spring/Quarkus page bắt đầu từ 0
  size: number;
}

export type StudentPayload = Omit<Student, 'id'>;

export const studentApi = {
  getStudents: async (params: GetStudentsParams): Promise<ApiResponse<PageResponse<Student>>> => {
    return axiosClient.get('/api/students', { params });
  },

  createStudent: async (data: StudentPayload): Promise<ApiResponse<Student>> => {
    return axiosClient.post('/api/students', data);
  },

  updateStudent: async (id: number, data: StudentPayload): Promise<ApiResponse<Student>> => {
    return axiosClient.put(`/api/students/${id}`, data);
  },

  deleteStudent: async (id: number): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/api/students/${id}`);
  },
};