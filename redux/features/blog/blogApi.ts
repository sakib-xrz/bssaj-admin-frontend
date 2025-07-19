import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBlogs: builder.query({
      query: (params) => ({
        url: `/blogs`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.blog],
    }),
    getSingleBlog: builder.query({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.blog],
    }),
    createBlog: builder.mutation({
      query: (data) => ({
        url: `/blogs`,
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.blog],
    }),
    updateBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `/blogs/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.blog],
    }),
    deleteBlog: builder.mutation({
      query: ({ id, isHardDelete = false }) => ({
        url: `/blogs/${id}?hard_delete=${isHardDelete}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.blog],
    }),
    approveOrRejectBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/approve-reject-blog/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [tagTypes.blog],
    }),
  }),
});

export const {
  useGetAllBlogsQuery,
  useGetSingleBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useApproveOrRejectBlogMutation,
} = blogApi;
