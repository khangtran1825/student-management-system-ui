// src/api/subjectApi.ts
import axiosClient from './axiosClient';
import { ApiResponse, PageResponse, Subject, SubjectPayload } from '../types';

export interface GetSubjectsParams {
  keyword?: string;
  page: number; // Chỉ số trang xuất phát từ 0 khớp chuẩn Quarkus
  size: number;
}

export const subjectApi = {
  // Lấy tất cả môn học (Khớp Step 3 của Postman và @GET /api/subjects)
  getAllSubjects: async (): Promise<ApiResponse<Subject[]>> => {
    return axiosClient.get('/subjects');
  },

  // Tìm kiếm và phân trang môn học (Khớp Step 4 của Postman và @GET /api/subjects/search)
  searchSubjects: async (params: GetSubjectsParams): Promise<ApiResponse<PageResponse<Subject>>> => {
    return axiosClient.get('/subjects/search', { params });
  },

  // Xem chi tiết môn học theo ID (Khớp Step 5 & Step 8 của Postman)
  getSubjectById: async (id: number): Promise<ApiResponse<Subject>> => {
    return axiosClient.get(`/subjects/${id}`);
  },

  // Tạo mới một môn học (Khớp Step 2 của Postman và @POST /api/subjects)
  createSubject: async (data: SubjectPayload): Promise<ApiResponse<Subject>> => {
    return axiosClient.post('/subjects', data);
  },

  // Cập nhật thông tin môn học (Khớp Step 6 của Postman và @PUT /api/subjects/{id})
  updateSubject: async (id: number, data: SubjectPayload): Promise<ApiResponse<Subject>> => {
    return axiosClient.put(`/subjects/${id}`, data);
  },

  // Xóa môn học theo ID (Khớp Step 10 của Postman và @DELETE /api/subjects/{id})
  deleteSubject: async (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/subjects/${id}`);
  },
};