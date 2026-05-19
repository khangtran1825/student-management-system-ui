import axiosClient from './axiosClient';
import { ApiResponse, PageResponse, Class } from '../types';

export interface GetClassesParams {
  page: number; // Thường bắt đầu từ 0
  size: number;
}

export type ClassPayload = Omit<Class, 'id'>;

export const classApi = {
  getAllClasses: async (): Promise<ApiResponse<Class[]>> => {
    return axiosClient.get('/classes');
  },

  getClasses: async (params: GetClassesParams): Promise<ApiResponse<PageResponse<Class>>> => {
    return axiosClient.get('/classes/page', { params });
  },

  createClass: async (data: ClassPayload): Promise<ApiResponse<Class>> => {
    return axiosClient.post('/classes', data);
  },

  updateClass: async (id: number, data: ClassPayload): Promise<ApiResponse<Class>> => {
    return axiosClient.put(`/classes/${id}`, data);
  },

  deleteClass: async (id: number): Promise<ApiResponse<null>> => {
    return axiosClient.delete(`/classes/${id}`);
  },
};