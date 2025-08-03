import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllEvents: builder.query({
      query: (params) => ({
        url: `/events`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.event],
    }),
    getSingleEvent: builder.query({
      query: (id) => ({
        url: `/events/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.event],
    }),
    createEvent: builder.mutation({
      query: (data) => ({
        url: `/events`,
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.event],
    }),
    updateEvent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: "PATCH",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.event],
    }),
    deleteEvent: builder.mutation({
      query: ({ id, isHardDelete = false }) => ({
        url: `/events/${id}?hard_delete=${isHardDelete}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.event],
    }),
  }),
});

export const {
  useGetAllEventsQuery,
  useGetSingleEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventApi;
