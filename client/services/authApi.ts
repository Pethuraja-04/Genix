  import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),

    profile: builder.query({
      query: () => "/auth/profile",
      providesTags: ["User"],
    }),

    sendConnectionRequest: builder.mutation({
      query: (data) => ({
        url: "/auth/connections/request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    acceptConnectionRequest: builder.mutation({
      query: (data) => ({
        url: "/auth/connections/accept",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User", "Task"],
    }),

    rejectConnectionRequest: builder.mutation({
      query: (data) => ({
        url: "/auth/connections/reject",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    searchUsers: builder.query({
      query: (search) => `/auth/users?q=${search || ""}`,
      providesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useProfileQuery,
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
  useRejectConnectionRequestMutation,
  useSearchUsersQuery,
} = authApi;