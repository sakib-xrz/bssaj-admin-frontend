import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const memberApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query({
      query: (query) => ({
        url: `/members`,
        method: "GET",
        params: query,
      }),
      providesTags: [tagTypes.member],
    }),
    getMemberById: builder.query({
      query: (id) => ({
        url: `/members/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.member],
    }),
    getMemberStats: builder.query({
      query: () => ({
        url: `/members/stats`,
        method: "GET",
      }),
      providesTags: [tagTypes.member],
    }),
    createMember: builder.mutation({
      query: (data) => ({
        url: `/members`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.member],
    }),
    updateMember: builder.mutation({
      query: ({ data, id }) => ({
        url: `/members/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.member],
    }),
    approveOrRejectMember: builder.mutation({
      query: ({ data, id }) => ({
        url: `/admin/approve-reject-member/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [tagTypes.member],
    }),
    deleteMember: builder.mutation({
      query: (id) => ({
        url: `/members/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.member],
    }),
  }),
});

export const {
  useGetMembersQuery,
  useGetMemberByIdQuery,
  useGetMemberStatsQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useApproveOrRejectMemberMutation,
  useDeleteMemberMutation,
} = memberApi;
