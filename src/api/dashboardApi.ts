import axiosClient from './axiosClient';
import { ApiResponse, DashboardSummary } from '../types';

export const dashboardApi = {
  getSummary: async (): Promise<ApiResponse<DashboardSummary>> => {
    return axiosClient.get('/dashboard/summary');
  },
};