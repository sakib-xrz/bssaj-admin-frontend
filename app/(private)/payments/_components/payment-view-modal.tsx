"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Building2,
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useGetPaymentByIdQuery } from "@/redux/features/payment/paymentApi";

interface PaymentViewModalProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentViewModal({
  paymentId,
  isOpen,
  onClose,
}: PaymentViewModalProps) {
  const { data, isLoading, error } = useGetPaymentByIdQuery(paymentId!, {
    skip: !paymentId,
  });

  const payment = data?.data;

  useEffect(() => {
    if (error) {
      onClose();
    }
  }, [error, onClose]);

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
      case "FAILED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <DollarSign className="w-3 h-3 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : payment ? (
          <div className="space-y-6">
            {/* Payment Status & Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Payment Status</h3>
                {getPaymentStatusBadge(payment.payment_status)}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Amount</h3>
                <div>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(payment.amount)}
                  </p>
                  {payment.late_fee && payment.late_fee > 0 && (
                    <p className="text-sm text-red-600">
                      + {formatCurrency(payment.late_fee)} late fee
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Agency Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Building2 className="w-4 h-4" />
                Agency Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <div>
                  <p className="text-sm text-gray-600">Agency Name</p>
                  <p className="font-medium">{payment.agency.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Email</p>
                  <p className="font-medium">{payment.agency.contact_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subscription Status</p>
                  <Badge variant="outline">
                    {payment.agency.subscription_status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Calendar className="w-4 h-4" />
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <div>
                  <p className="text-sm text-gray-600">Payment Month</p>
                  <p className="font-medium font-mono">
                    {payment.payment_month}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Payment Date</p>
                  <p className="font-medium">
                    {formatDate(payment.payment_date)}
                  </p>
                </div>
                {payment.payment_method && (
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{payment.payment_method}</p>
                  </div>
                )}
                {payment.transaction_id && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-medium font-mono">
                      {payment.transaction_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Information */}
            {payment.approved_by && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <User className="w-4 h-4" />
                    Approval Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div>
                      <p className="text-sm text-gray-600">Approved By</p>
                      <p className="font-medium">{payment.approved_by.name}</p>
                      <p className="text-sm text-gray-500">
                        {payment.approved_by.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Approved Date</p>
                      <p className="font-medium">
                        {payment.approved_at && formatDate(payment.approved_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {payment.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Notes</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-700">{payment.notes}</p>
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Record Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p>Created: {formatDate(payment.created_at)}</p>
                </div>
                <div>
                  <p>Last Updated: {formatDate(payment.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Payment not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
