import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    me: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    // Student đăng nhập qua endpoint riêng để hỗ trợ mã sinh viên/username
    studentLogin: builder.mutation({
      query: (credentials) => ({
        url: '/auth/student-login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useMeQuery, useLazyMeQuery, useLoginMutation, useStudentLoginMutation, useRegisterMutation, useChangePasswordMutation } = authApi;
