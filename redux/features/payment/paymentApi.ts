import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export interface Payment {
  id: string;
  agency_id: string;
  payment_month: string;
  amount: number;
  payment_date: string;
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "OVERDUE";
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  late_fee?: number;
  approved_at?: string;
  approved_by_id?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  agency: {
    id: string;
    name: string;
    contact_email: string;
    subscription_status: "ACTIVE" | "PAUSED" | "SUSPENDED" | "CANCELLED";
  };
  approved_by?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PaymentStats {
  total_payments: number;
  total_paid_payments: number;
  total_pending_payments: number;
  total_overdue_payments: number;
  total_revenue: number;
  current_month_revenue: number;
}

export interface CreatePaymentData {
  agency_id: string;
  payment_month: string;
  amount: number;
  payment_method?: string;
  notes?: string;
}

export interface UpdatePaymentData {
  agency_id?: string;
  payment_month?: string;
  amount?: number;
  payment_status?: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "OVERDUE";
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  late_fee?: number;
}

export interface ApprovePaymentData {
  payment_status: "PAID" | "FAILED";
  notes?: string;
}

export interface BulkCreatePaymentData {
  payment_month: string;
  amount: number;
  agency_ids?: string[];
  include_all_active_agencies?: boolean;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: (query) => ({
        url: `/payments`,
        method: "GET",
        params: query,
      }),
      providesTags: [tagTypes.payment],
    }),
    getPaymentById: builder.query({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.payment],
    }),
    getPaymentStats: builder.query({
      query: () => ({
        url: `/payments/stats`,
        method: "GET",
      }),
      providesTags: [tagTypes.payment],
    }),
    getAgencyPayments: builder.query({
      query: ({ agencyId, ...query }) => ({
        url: `/payments/agency/${agencyId}`,
        method: "GET",
        params: query,
      }),
      providesTags: [tagTypes.payment],
    }),
    getAgencyPaymentSummary: builder.query({
      query: (agencyId: string) => ({
        url: `/payments/agency/${agencyId}/summary`,
        method: "GET",
      }),
      providesTags: [tagTypes.payment, tagTypes.agency],
    }),
    createPayment: builder.mutation({
      query: (data: CreatePaymentData) => ({
        url: `/payments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.payment, tagTypes.agency],
    }),
    updatePayment: builder.mutation({
      query: ({ data, id }: { data: UpdatePaymentData; id: string }) => ({
        url: `/payments/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.payment, tagTypes.agency],
    }),
    approvePayment: builder.mutation({
      query: ({ data, id }: { data: ApprovePaymentData; id: string }) => ({
        url: `/payments/${id}/approve`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.payment, tagTypes.agency],
    }),
    deletePayment: builder.mutation({
      query: (id: string) => ({
        url: `/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.payment, tagTypes.agency],
    }),
    bulkCreatePayments: builder.mutation({
      query: (data: BulkCreatePaymentData) => ({
        url: `/payments/bulk-create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.payment, tagTypes.agency],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetPaymentStatsQuery,
  useGetAgencyPaymentsQuery,
  useGetAgencyPaymentSummaryQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useApprovePaymentMutation,
  useDeletePaymentMutation,
  useBulkCreatePaymentsMutation,
} = paymentApi;
