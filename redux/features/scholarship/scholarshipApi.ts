import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const scholarshipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllScholarships: builder.query({
      query: (params) => ({
        url: `/scholarships`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.scholarship],
    }),
    getSingleScholarship: builder.query({
      query: (id) => ({
        url: `/scholarships/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.scholarship],
    }),
    createScholarship: builder.mutation({
      query: (data) => ({
        url: `/scholarships`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.scholarship],
    }),
    updateScholarship: builder.mutation({
      query: ({ id, data }) => ({
        url: `/scholarships/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.scholarship],
    }),
    deleteScholarship: builder.mutation({
      query: (id) => ({
        url: `/scholarships/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.scholarship],
    }),
  }),
});

export const {
  useGetAllScholarshipsQuery,
  useGetSingleScholarshipQuery,
  useCreateScholarshipMutation,
  useUpdateScholarshipMutation,
  useDeleteScholarshipMutation,
} = scholarshipApi;
