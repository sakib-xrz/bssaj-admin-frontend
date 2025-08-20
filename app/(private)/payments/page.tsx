"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  Edit,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Check,
  X,
  Calendar,
  Building2,
} from "lucide-react";
import { PaymentViewModal } from "./_components/payment-view-modal";
import { DeleteAlertDialog } from "../_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import {
  useGetPaymentsQuery,
  useDeletePaymentMutation,
  useApprovePaymentMutation,
  useGetPaymentStatsQuery,
  useMarkOverduePaymentsMutation,
  Payment,
} from "@/redux/features/payment/paymentApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { BulkCreateModal } from "./_components/bulk-create-modal";

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 20,
    search: searchParams.get("search") || "",
    payment_status: searchParams.get("payment_status") || "",
    payment_month: searchParams.get("payment_month") || "",
  };

  const [params, setParams] = useState(initialParams);
  const [searchInput, setSearchInput] = useState(initialParams.search);

  // Debounce search query
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update search param when debounced search changes
  useEffect(() => {
    setParams((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Update URL when filters change
  useEffect(() => {
    const queryString = generateQueryString(params);
    router.push(`/payments${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetPaymentsQuery(sanitizeParams(params));
  const { data: statsData, isLoading: isStatsLoading } =
    useGetPaymentStatsQuery(undefined);

  const payments = data?.data;
  const stats = statsData?.data;

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBulkCreateModalOpen, setIsBulkCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deletePayment, { isLoading: isDeleting }] = useDeletePaymentMutation();
  const [approvePayment] = useApprovePaymentMutation();
  const [markOverduePayments, { isLoading: isMarkingOverdue }] =
    useMarkOverduePaymentsMutation();

  // Handle pagination page change
  const handlePageChange = (page: number) => {
    if (
      page < 1 ||
      (data?.meta && page > Math.ceil(data?.meta.total / data?.meta.limit)) ||
      page === params.page
    ) {
      return;
    }
    setParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  const handleDeletePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleApprovePayment = async (payment: Payment) => {
    try {
      await approvePayment({
        id: payment.id,
        data: { payment_status: "PAID" },
      }).unwrap();
      toast.success("Payment approved successfully");
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Failed to approve payment");
    }
  };

  const handleRejectPayment = async (payment: Payment) => {
    try {
      await approvePayment({
        id: payment.id,
        data: { payment_status: "REJECTED" },
      }).unwrap();
      toast.success("Payment rejected successfully");
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast.error("Failed to reject payment");
    }
  };

  const handleMarkOverdue = async () => {
    try {
      const result = await markOverduePayments({}).unwrap();
      toast.success(
        `Marked ${result.data.updated_payments} payments as overdue and paused ${result.data.paused_agencies} agencies`
      );
    } catch (error) {
      console.error("Error marking overdue payments:", error);
      toast.error("Failed to mark overdue payments");
    }
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
      case "FAILED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <CreditCard className="w-3 h-3 mr-1" />
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
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading || isStatsLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600">
                Manage agency subscription payments and approvals
              </p>
            </div>
            <div className="w-[120px] h-10 bg-gray-200 animate-pulse rounded-md" />
          </div>

          {/* Stats Cards Loading */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
                      <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Payments</CardTitle>
              <CardDescription>
                A list of all subscription payments in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  const hasPayments = payments && payments.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">
              Manage agency subscription payments and approvals
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleMarkOverdue}
              disabled={isMarkingOverdue}
            >
              {isMarkingOverdue ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              Mark Overdue
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsBulkCreateModalOpen(true)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Bulk Create
            </Button>
            <Link href="/payments/create">
              <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Payments",
              count: stats?.total_payments || 0,
              color: "text-blue-600",
              icon: CreditCard,
            },
            {
              label: "Paid Payments",
              count: stats?.total_paid_payments || 0,
              color: "text-green-600",
              icon: CheckCircle,
            },
            {
              label: "Pending Payments",
              count: stats?.total_pending_payments || 0,
              color: "text-yellow-600",
              icon: Clock,
            },
            {
              label: "Overdue Payments",
              count: stats?.total_overdue_payments || 0,
              color: "text-red-600",
              icon: AlertTriangle,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.count}
                      </p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats?.total_revenue || 0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    This Month Revenue
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats?.current_month_revenue || 0)}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
            <CardDescription>
              A list of all subscription payments in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={params.payment_status || "all"}
                onValueChange={(value) =>
                  setParams((prev) => ({
                    ...prev,
                    payment_status: value === "all" ? "" : value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="month"
                placeholder="Payment month"
                value={params.payment_month}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    payment_month: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full sm:w-[200px]"
              />
            </div>

            <div className="rounded-md border">
              {hasPayments ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agency</TableHead>
                      <TableHead>Payment Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments?.map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {payment.agency.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.agency.contact_email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {payment.payment_month}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </div>
                          {payment.late_fee && payment.late_fee > 0 && (
                            <div className="text-sm text-red-600">
                              + {formatCurrency(payment.late_fee)} late fee
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(payment.payment_status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(payment.due_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(payment.payment_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.approved_by ? (
                            <div className="text-sm">
                              <div className="font-medium">
                                {payment.approved_by.name}
                              </div>
                              <div className="text-gray-500">
                                {payment.approved_at &&
                                  formatDate(payment.approved_at)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not approved</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewPayment(payment)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {payment.payment_status === "PENDING" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleApprovePayment(payment)
                                    }
                                    className="text-green-600"
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Approve Payment
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRejectPayment(payment)}
                                    className="text-red-600"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Reject Payment
                                  </DropdownMenuItem>
                                </>
                              )}
                              <Link href={`/payments/edit/${payment.id}`}>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Payment
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeletePayment(payment)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Payment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  {hasSearchQuery ? (
                    <>
                      <p className="text-gray-500 text-lg mb-4">
                        No payments found matching your criteria
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchInput("");
                          setParams((prev) => ({
                            ...prev,
                            search: "",
                            payment_status: "",
                            payment_month: "",
                            page: 1,
                          }));
                        }}
                      >
                        Clear filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 text-lg mb-4">
                        No payments recorded yet
                      </p>
                      <Link href="/payments/create">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add your first payment
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {data?.meta && data?.meta.total > 1 && (
              <CustomPagination
                params={{ page: params.page }}
                totalPages={Math.ceil(data?.meta.total / params.limit)}
                handlePageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>

        <PaymentViewModal
          paymentId={selectedPayment?.id || null}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <BulkCreateModal
          isOpen={isBulkCreateModalOpen}
          onClose={() => setIsBulkCreateModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedPayment) return;
            try {
              await deletePayment(selectedPayment.id).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("Payment deleted successfully");
            } catch (error) {
              console.error("Failed to delete payment:", error);
              toast.error("Failed to delete payment");
            } finally {
              setSelectedPayment(null);
            }
          }}
          title="Delete Payment"
          description="Are you sure you want to delete this payment? This action cannot be undone."
          itemName={
            `Payment for ${selectedPayment?.agency.name} - ${selectedPayment?.payment_month}` ||
            ""
          }
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
