import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const certificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCertifications: builder.query({
      query: (params) => ({
        url: `/certifications`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.certification],
    }),
    getSingleCertification: builder.query({
      query: (id) => ({
        url: `/certifications/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.certification],
    }),
    createCertification: builder.mutation({
      query: (data) => ({
        url: `/certifications`,
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.certification],
    }),
    updateCertification: builder.mutation({
      query: ({ id, data }) => ({
        url: `/certifications/${id}`,
        method: "PATCH",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.certification],
    }),
    deleteCertification: builder.mutation({
      query: (id) => ({
        url: `/certifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.certification],
    }),
    verifyCertification: builder.query({
      query: (sl_no) => ({
        url: `/certifications/verify/${sl_no}`,
        method: "GET",
      }),
      providesTags: [tagTypes.certification],
    }),
    getCertificationsByAgency: builder.query({
      query: ({ agency_id, ...params }) => ({
        url: `/certifications/agency/${agency_id}`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.certification],
    }),
    getMyAgenciesCertifications: builder.query({
      query: () => ({
        url: `/certifications/my-agencies`,
        method: "GET",
      }),
      providesTags: [tagTypes.certification],
    }),
  }),
});

export const {
  useGetAllCertificationsQuery,
  useGetSingleCertificationQuery,
  useCreateCertificationMutation,
  useUpdateCertificationMutation,
  useDeleteCertificationMutation,
  useVerifyCertificationQuery,
  useGetCertificationsByAgencyQuery,
  useGetMyAgenciesCertificationsQuery,
} = certificationApi;
