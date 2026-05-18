// src/api/scoreApi.ts
import axiosClient from './axiosClient';
import { ApiResponse, Score, ScorePayload } from '../types';

export const scoreApi = {
  // Lấy danh sách điểm theo ID của sinh viên (Khớp Step 3 & Step 6 của Postman)
  getScoresByStudent: async (studentId: number): Promise<ApiResponse<Score[]>> => {
    return axiosClient.get(`/scores/student/${studentId}`);
  },

  // Thêm mới điểm số (Khớp Step 2)
  createScore: async (data: ScorePayload): Promise<ApiResponse<Score>> => {
    return axiosClient.post('/scores', data);
  },

  // Cập nhật điểm số (Khớp Step 4)
  updateScore: async (id: number, data: ScorePayload): Promise<ApiResponse<Score>> => {
    return axiosClient.put(`/scores/${id}`, data);
  },

  // Xóa điểm số (Khớp Step 8)
  deleteScore: async (id: number): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/scores/${id}`);
  },
};