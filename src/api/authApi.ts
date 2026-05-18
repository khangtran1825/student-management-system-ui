import axiosClient from './axiosClient';
import { ApiResponse, AuthResponse } from '../types';

// Interface cho payload gửi lên (username, password)
export interface LoginPayload {
  username: string;
  password?: string; 
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    // Đổi từ '/api/auth/login' thành '/auth/login'
    return axiosClient.post('/auth/login', payload); 
  },
};