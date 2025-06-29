import { baseApi } from "@/redux/api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    me: builder.query({
      query: () => ({
        url: `/auth/me`,
        method: "GET",
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: `/auth/change-password`,
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const { useMeQuery, useChangePasswordMutation } = authApi;
