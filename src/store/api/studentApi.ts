import { apiSlice } from './apiSlice';

export const studentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/students?keyword=&page=0&size=10
    getStudents: builder.query({
      query: (params?: { keyword?: string; classId?: number; page?: number; size?: number }) => ({
        url: '/students',
        params: { keyword: params?.keyword || '', classId: params?.classId, page: params?.page ?? 0, size: params?.size ?? 10 },
      }),
      providesTags: ['Student'],
    }),
    getStudentById: builder.query({
      query: (id: number) => `/students/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Student', id }],
    }),
    getMyStudent: builder.query({
      query: () => '/students/me',
      providesTags: ['Student'],
    }),
    createStudent: builder.mutation({
      query: (data) => ({ url: '/students', method: 'POST', body: data }),
      invalidatesTags: ['Student'],
    }),
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/students/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Student'],
    }),
    deleteStudent: builder.mutation({
      query: (id: number) => ({ url: `/students/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Student'],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useGetMyStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentApi;
