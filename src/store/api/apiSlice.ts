import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Ưu tiên dùng biến môi trường VITE_API_BASE_URL.
// - Khi dev (npm run dev): Vite proxy sẽ chuyển '/api' sang backend, không cần host tuyệt đối.
// - Khi build production: Dùng host tuyệt đối từ .env để gọi trực tiếp.
const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'AcademicYear', 'Semester', 'Class', 'Subject', 'Student', 
    'Score', 'Schedule', 'Exam', 'Attendance', 'Report', 'User'
  ],
  endpoints: () => ({}),
});
