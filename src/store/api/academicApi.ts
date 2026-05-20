import { apiSlice } from './apiSlice';

export const academicApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ───── ACADEMIC YEARS: /api/academic-years ─────
    getAcademicYears: builder.query({ query: () => '/academic-years', providesTags: ['AcademicYear'] }),
    createAcademicYear: builder.mutation({
      query: (data) => ({ url: '/academic-years', method: 'POST', body: data }),
      invalidatesTags: ['AcademicYear'],
    }),
    updateAcademicYear: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/academic-years/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['AcademicYear'],
    }),
    deleteAcademicYear: builder.mutation({
      query: (id: number) => ({ url: `/academic-years/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AcademicYear'],
    }),

    // ───── SEMESTERS: /api/semesters ─────
    getSemesters: builder.query({ query: () => '/semesters', providesTags: ['Semester'] }),
    createSemester: builder.mutation({
      query: (data) => ({ url: '/semesters', method: 'POST', body: data }),
      invalidatesTags: ['Semester'],
    }),
    updateSemester: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/semesters/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Semester'],
    }),
    deleteSemester: builder.mutation({
      query: (id: number) => ({ url: `/semesters/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Semester'],
    }),

    // ───── CLASSES: /api/classes ─────
    getClasses: builder.query({ query: () => '/classes', providesTags: ['Class'] }),
    createClass: builder.mutation({
      query: (data) => ({ url: '/classes', method: 'POST', body: data }),
      invalidatesTags: ['Class'],
    }),
    updateClass: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/classes/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Class'],
    }),
    deleteClass: builder.mutation({
      query: (id: number) => ({ url: `/classes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Class'],
    }),

    // ───── SUBJECTS: /api/subjects ─────
    getSubjects: builder.query({ query: () => '/subjects', providesTags: ['Subject'] }),
    createSubject: builder.mutation({
      query: (data) => ({ url: '/subjects', method: 'POST', body: data }),
      invalidatesTags: ['Subject'],
    }),
    updateSubject: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/subjects/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Subject'],
    }),
    deleteSubject: builder.mutation({
      query: (id: number) => ({ url: `/subjects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Subject'],
    }),

    // ───── SCHEDULES: /api/schedules ─────
    getSchedules: builder.query({ query: () => '/schedules', providesTags: ['Schedule'] }),
    createSchedule: builder.mutation({
      query: (data) => ({ url: '/schedules', method: 'POST', body: data }),
      invalidatesTags: ['Schedule'],
    }),
    updateSchedule: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/schedules/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Schedule'],
    }),
    deleteSchedule: builder.mutation({
      query: (id: number) => ({ url: `/schedules/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Schedule'],
    }),

    // ───── EXAMS: /api/exams ─────
    getExams: builder.query({ query: () => '/exams', providesTags: ['Exam'] }),
    createExam: builder.mutation({
      query: (data) => ({ url: '/exams', method: 'POST', body: data }),
      invalidatesTags: ['Exam'],
    }),
    updateExam: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/exams/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Exam'],
    }),
    deleteExam: builder.mutation({
      query: (id: number) => ({ url: `/exams/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Exam'],
    }),

    // ───── ATTENDANCES: /api/attendances ─────
    getAttendances: builder.query({ query: (params?: { studentId?: number; scheduleId?: number }) => ({ url: '/attendances', params }), providesTags: ['Attendance'] }),
    createAttendance: builder.mutation({
      query: (data) => ({ url: '/attendances', method: 'POST', body: data }),
      invalidatesTags: ['Attendance'],
    }),
    updateAttendance: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/attendances/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Attendance'],
    }),
    deleteAttendance: builder.mutation({
      query: (id: number) => ({ url: `/attendances/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Attendance'],
    }),

    // ───── SCORES: /api/scores ─────
    getScores: builder.query({
      query: (params?: { studentId?: number; subjectId?: number }) => ({
        url: '/scores',
        params,
      }),
      providesTags: ['Score'],
    }),
    getScoresByStudent: builder.query({ query: (studentId: number) => `/scores/student/${studentId}`, providesTags: ['Score'] }),
    createScore: builder.mutation({
      query: (data) => ({ url: '/scores', method: 'POST', body: data }),
      invalidatesTags: ['Score'],
    }),
    updateScore: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/scores/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Score'],
    }),
    deleteScore: builder.mutation({
      query: (id: number) => ({ url: `/scores/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Score'],
    }),

    // ───── DASHBOARD: /api/dashboard/summary ─────
    getDashboardSummary: builder.query({ query: () => '/dashboard/summary', providesTags: [] }),

    // ───── REPORTS: /api/reports ─────
    getStudentTranscriptPdfUrl: builder.query<string, number>({
      queryFn: async (studentId, _api, _extra, baseQuery) => {
        const result = await baseQuery({ url: `/reports/student/${studentId}/transcript.pdf`, responseHandler: (res) => res.blob() });
        if (result.error) return { error: result.error };
        const url = URL.createObjectURL(result.data as Blob);
        return { data: url };
      },
    }),
    getStudentTranscriptExcelUrl: builder.query<string, number>({
      queryFn: async (studentId, _api, _extra, baseQuery) => {
        const result = await baseQuery({ url: `/reports/student/${studentId}/transcript.xlsx`, responseHandler: (res) => res.blob() });
        if (result.error) return { error: result.error };
        const url = URL.createObjectURL(result.data as Blob);
        return { data: url };
      },
    }),
    getClassGradesExcelUrl: builder.query<string, number>({
      queryFn: async (classId, _api, _extra, baseQuery) => {
        const result = await baseQuery({ url: `/reports/class/${classId}/grades.xlsx`, responseHandler: (res) => res.blob() });
        if (result.error) return { error: result.error };
        const url = URL.createObjectURL(result.data as Blob);
        return { data: url };
      },
    }),
    getAttendanceReportPdfUrl: builder.query<string, { classId: number; startDate?: string; endDate?: string }>({
      queryFn: async ({ classId, startDate, endDate }, _api, _extra, baseQuery) => {
        const result = await baseQuery({ url: `/reports/attendance/${classId}.pdf`, params: { startDate, endDate }, responseHandler: (res) => res.blob() });
        if (result.error) return { error: result.error };
        const url = URL.createObjectURL(result.data as Blob);
        return { data: url };
      },
    }),

  }),
});

export const {
  useGetAcademicYearsQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
  useDeleteAcademicYearMutation,
  useGetSemestersQuery,
  useCreateSemesterMutation,
  useUpdateSemesterMutation,
  useDeleteSemesterMutation,
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useGetAttendancesQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetScoresQuery,
  useGetScoresByStudentQuery,
  useCreateScoreMutation,
  useUpdateScoreMutation,
  useDeleteScoreMutation,
  useGetDashboardSummaryQuery,
  useGetStudentTranscriptPdfUrlQuery,
  useGetStudentTranscriptExcelUrlQuery,
  useGetClassGradesExcelUrlQuery,
  useGetAttendanceReportPdfUrlQuery,
} = academicApi;
