import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api",

  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

// Wraps the base query to handle 401 (token expired / unauthorized) globally.
// On any 401, clears the stored token and redirects to the login page.
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    localStorage.removeItem("token");
    // Hard redirect so the router re-evaluates the ProtectedRoute
    window.location.href = "/";
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["Task", "User"],

  endpoints: () => ({}),
});