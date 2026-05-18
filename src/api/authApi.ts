import axiosClient from './axiosClient';
import { ApiResponse, AuthResponse } from '../types';

// Interface cho payload gửi lên (username, password)
export interface LoginPayload {
  username: string;
  password?: string; 
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    return axiosClient.post('/api/auth/login', payload);
  },
};