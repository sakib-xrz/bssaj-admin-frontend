import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const agencyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAgencies: builder.query({
      query: (query) => ({
        url: `/agencies`,
        method: "GET",
        params: query,
      }),
      providesTags: [tagTypes.agency],
    }),
    getAgencyById: builder.query({
      query: (id) => ({
        url: `/agencies/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.agency],
    }),
    getAgencyStats: builder.query({
      query: () => ({
        url: `/agencies/stats`,
        method: "GET",
      }),
      providesTags: [tagTypes.agency],
    }),
    createAgency: builder.mutation({
      query: (data) => ({
        url: `/agencies`,
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.agency],
    }),
    updateAgency: builder.mutation({
      query: ({ data, id }) => ({
        url: `/agencies/${id}`,
        method: "PATCH",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.agency],
    }),
    approveOrRejectAgency: builder.mutation({
      query: ({ data, id }) => ({
        url: `/admin/approve-reject-agency/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [tagTypes.agency],
    }),
    deleteAgency: builder.mutation({
      query: (id) => ({
        url: `/agencies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.agency],
    }),
  }),
});

export const {
  useGetAgenciesQuery,
  useGetAgencyByIdQuery,
  useGetAgencyStatsQuery,
  useCreateAgencyMutation,
  useUpdateAgencyMutation,
  useApproveOrRejectAgencyMutation,
  useDeleteAgencyMutation,
} = agencyApi;
