import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosClient = axios.create({
  baseURL: 'localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Gắn token vào header
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy state trực tiếp từ Zustand store
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý lỗi 401 và parse data
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Backend luôn trả về cấu trúc ApiResponse<T>, ta có thể bóc tách data tại đây nếu cần
    // Trong trường hợp này, trả về toàn bộ data của response
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Xử lý khi token hết hạn hoặc không hợp lệ
      useAuthStore.getState().logout();
      
      // Chuyển hướng về trang login (cách bypass React Router bên ngoài component)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;