"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { useGetAgencyPaymentSummaryQuery } from "@/redux/features/payment/paymentApi";
import { format } from "date-fns";

interface AgencyPaymentSummaryProps {
  agencyId: string;
}

export function AgencyPaymentSummary({ agencyId }: AgencyPaymentSummaryProps) {
  const { data, isLoading, error } = useGetAgencyPaymentSummaryQuery(agencyId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM yyyy");
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "OVERDUE":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSubscriptionStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "PAUSED":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            Paused
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load payment information. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const paymentData = data?.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subscription Status */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Subscription Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Current Status</p>
              <div className="mt-1">
                {getSubscriptionStatusBadge(
                  paymentData?.agency_info.subscription_status || "UNKNOWN"
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Last Payment</p>
              <p className="font-medium">
                {paymentData?.agency_info.last_payment_month
                  ? formatDate(
                      paymentData.agency_info.last_payment_month + "-01"
                    )
                  : "None"}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Subscription End</p>
              <p className="font-medium">
                {paymentData?.agency_info.subscription_end_date
                  ? format(
                      new Date(paymentData.agency_info.subscription_end_date),
                      "PP"
                    )
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Payment Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xl font-bold text-green-800">
                {paymentData?.payment_stats.total_paid_payments || 0}
              </p>
              <p className="text-xs text-green-600">Paid</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-xl font-bold text-yellow-800">
                {paymentData?.payment_stats.total_pending_payments || 0}
              </p>
              <p className="text-xs text-yellow-600">Pending</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-xl font-bold text-red-800">
                {paymentData?.payment_stats.total_overdue_payments || 0}
              </p>
              <p className="text-xs text-red-600">Overdue</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xl font-bold text-blue-800">
                {formatCurrency(
                  paymentData?.payment_stats.total_amount_paid || 0
                )}
              </p>
              <p className="text-xs text-blue-600">Total Paid</p>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        {paymentData?.recent_payments &&
          paymentData.recent_payments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Recent Payments</h4>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {paymentData.recent_payments.slice(0, 4).map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">
                          {formatDate(payment.payment_month + "-01")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPaymentStatusBadge(payment.payment_status)}
                    </div>
                  </div>
                ))}
              </div>
              {paymentData.recent_payments.length > 4 && (
                <p className="text-sm text-gray-500 text-center">
                  And {paymentData.recent_payments.length - 4} more payments...
                </p>
              )}
            </div>
          )}

        {(!paymentData?.recent_payments ||
          paymentData.recent_payments.length === 0) && (
          <div className="text-center py-6">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No payment history available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
