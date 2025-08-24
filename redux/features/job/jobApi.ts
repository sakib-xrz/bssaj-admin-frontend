import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const jobApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllJobs: builder.query({
      query: (params) => ({
        url: `/jobs`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.job],
    }),
    getSingleJob: builder.query({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.job],
    }),
    createJob: builder.mutation({
      query: (data) => ({
        url: `/jobs`,
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.job],
    }),
    updateJob: builder.mutation({
      query: ({ id, data }) => ({
        url: `/jobs/${id}`,
        method: "PATCH",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.job],
    }),
    deleteJob: builder.mutation({
      query: ({ id, isHardDelete = false }) => ({
        url: `/jobs/${id}?hard_delete=${isHardDelete}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.job],
    }),
    approveOrRejectJob: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/approve-reject-job/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [tagTypes.job],
    }),
    getMyJobs: builder.query({
      query: (params) => ({
        url: `/jobs/my-jobs`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.job],
    }),
  }),
});

export const {
  useGetAllJobsQuery,
  useGetSingleJobQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useApproveOrRejectJobMutation,
  useGetMyJobsQuery,
} = jobApi;
