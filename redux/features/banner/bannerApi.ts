import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBanners: builder.query({
      query: (params) => ({
        url: `/banners`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.banner],
    }),
    getSingleBanner: builder.query({
      query: (id) => ({
        url: `/banners/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.banner],
    }),
    createBanner: builder.mutation({
      query: (data) => ({
        url: `/banners`,
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.banner],
    }),
    updateBanner: builder.mutation({
      query: ({ id, data }) => ({
        url: `/banners/${id}`,
        method: "PATCH",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.banner],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.banner],
    }),
  }),
});

export const {
  useGetAllBannersQuery,
  useGetSingleBannerQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
