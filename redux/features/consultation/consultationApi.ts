import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const consultationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConsultations: builder.query({
      query: (query) => ({
        url: `/consultations`,
        method: "GET",
        params: query,
      }),
      providesTags: [tagTypes.consultation],
    }),
    getConsultationById: builder.query({
      query: (id) => ({
        url: `/consultations/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.consultation],
    }),
    updateConsultationStatus: builder.mutation({
      query: ({ data, id }) => ({
        url: `/consultations/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.consultation],
    }),
    deleteConsultation: builder.mutation({
      query: (id) => ({
        url: `/consultations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.consultation],
    }),
  }),
});

export const {
  useGetConsultationsQuery,
  useGetConsultationByIdQuery,
  useUpdateConsultationStatusMutation,
  useDeleteConsultationMutation,
} = consultationApi;
