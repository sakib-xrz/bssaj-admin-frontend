import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNews: builder.query({
      query: (params) => ({
        url: `/news`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.news],
    }),
    getSingleNews: builder.query({
      query: (id) => ({
        url: `/news/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.news],
    }),
    createNews: builder.mutation({
      query: (data) => ({
        url: `/news`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.news],
    }),
    updateNews: builder.mutation({
      query: ({ id, data }) => ({
        url: `/news/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.news],
    }),
    deleteNews: builder.mutation({
      query: ({ id, isHardDelete = false }) => ({
        url: `/news/${id}?hard_delete=${isHardDelete}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.news],
    }),
  }),
});

export const {
  useGetAllNewsQuery,
  useGetSingleNewsQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} = newsApi;
