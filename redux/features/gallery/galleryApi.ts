import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllGallery: builder.query({
      query: (params) => ({
        url: `/gallery`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.gallery],
    }),
    getSingleGallery: builder.query({
      query: (id) => ({
        url: `/gallery/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.gallery],
    }),
    createGallery: builder.mutation({
      query: (data) => ({
        url: `/gallery`,
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.gallery],
    }),
    updateGallery: builder.mutation({
      query: ({ id, data }) => ({
        url: `/gallery/${id}`,
        method: "PATCH",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.gallery],
    }),
    deleteGallery: builder.mutation({
      query: (id) => ({
        url: `/gallery/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.gallery],
    }),
  }),
});

export const {
  useGetAllGalleryQuery,
  useGetSingleGalleryQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useDeleteGalleryMutation,
} = galleryApi;
