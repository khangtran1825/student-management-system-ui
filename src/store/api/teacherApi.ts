import { apiSlice } from './apiSlice';

export const teacherApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTeachers: builder.query({
      query: (params) => ({
        url: '/teachers',
        params,
      }),
      providesTags: ['Teacher'],
    }),
    getTeacherById: builder.query({
      query: (id: number) => `/teachers/${id}`,
      providesTags: ['Teacher'],
    }),
    createTeacher: builder.mutation({
      query: (data) => ({
        url: '/teachers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Teacher'],
    }),
    updateTeacher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teachers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Teacher'],
    }),
    deleteTeacher: builder.mutation({
      query: (id: number) => ({
        url: `/teachers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Teacher'],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherByIdQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} = teacherApi;
