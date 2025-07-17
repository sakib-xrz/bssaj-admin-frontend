import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const committeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommittees: builder.query({
      query: (query) => ({
        url: `/committees`,
        method: "GET",
        params: query,
      }),
      providesTags: [tagTypes.committee],
    }),
    getCommitteeById: builder.query({
      query: (id) => ({
        url: `/committees/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.committee],
    }),
    getUniqueTermPairs: builder.query({
      query: () => ({
        url: `/committees/years`,
        method: "GET",
      }),
      providesTags: [tagTypes.committee],
    }),
    getCommitteesByDesignation: builder.query({
      query: (query) => ({
        url: `/committees/by-designation`,
        method: "GET",
        params: query,
      }),
      providesTags: [tagTypes.committee],
    }),
    getCommitteesByTermRange: builder.query({
      query: (query) => ({
        url: `/committees/by-term-range`,
        method: "GET",
        params: query,
      }),
      providesTags: [tagTypes.committee],
    }),
    createCommittee: builder.mutation({
      query: (data) => ({
        url: `/committees`,
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.committee],
    }),
    updateCommittee: builder.mutation({
      query: ({ data, id }) => ({
        url: `/committees/${id}`,
        method: "PATCH",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.committee],
    }),
    deleteCommittee: builder.mutation({
      query: (id) => ({
        url: `/committees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.committee],
    }),
  }),
});

export const {
  useGetCommitteesQuery,
  useGetCommitteeByIdQuery,
  useGetUniqueTermPairsQuery,
  useGetCommitteesByDesignationQuery,
  useGetCommitteesByTermRangeQuery,
  useCreateCommitteeMutation,
  useUpdateCommitteeMutation,
  useDeleteCommitteeMutation,
} = committeeApi;
