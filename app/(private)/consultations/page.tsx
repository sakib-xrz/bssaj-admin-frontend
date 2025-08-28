"use client";

import { useEffect, useState } from "react";
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
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  X,
  Loader2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { ConsultationViewModal } from "./_components/consultation-view-modal";
import { DeleteAlertDialog } from "../_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import {
  useGetConsultationsQuery,
  useDeleteConsultationMutation,
  useUpdateConsultationStatusMutation,
} from "@/redux/features/consultation/consultationApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";
import { format } from "date-fns";

interface Consultation {
  id: string;
  kind: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const consultationKindLabels = {
  ACADEMIC_CONSULTATION: "Academic",
  CAREER_CONSULTATION: "Career",
  VISA_AND_IMMIGRATION_CONSULTATION: "Visa & Immigration",
  PERSONAL_CONSULTATION: "Personal",
};

const statusLabels = {
  PENDING: "Pending",
  RESOLVED: "Resolved",
  CANCELLED: "Cancelled",
};

const statusColors = {
  PENDING: "text-orange-600 bg-orange-100",
  RESOLVED: "text-green-600 bg-green-100",
  CANCELLED: "text-red-600 bg-red-100",
};

export default function ConsultationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 20,
    search: searchParams.get("search") || "",
    name: searchParams.get("name") || "",
    phone: searchParams.get("phone") || "",
    email: searchParams.get("email") || "",
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
    router.push(`/consultations${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetConsultationsQuery(sanitizeParams(params));

  const consultations = data?.data;

  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteConsultation, { isLoading: isDeleting }] =
    useDeleteConsultationMutation();
  const [updateConsultationStatus] = useUpdateConsultationStatusMutation();

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

  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsViewModalOpen(true);
  };

  const handleDeleteConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsDeleteDialogOpen(true);
  };

  const handleStatusUpdate = async (
    consultation: Consultation,
    status: string
  ) => {
    try {
      await updateConsultationStatus({
        id: consultation.id,
        data: { status },
      }).unwrap();
      toast.success(`Consultation ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error updating consultation status:", error);
      toast.error("Failed to update consultation status");
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Consultations
              </h1>
              <p className="text-gray-600">
                Manage consultation requests and inquiries
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Consultations</CardTitle>
              <CardDescription>
                A list of all consultation requests in the system
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

  const hasConsultations = consultations && consultations.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultations</h1>
            <p className="text-gray-600">
              Manage consultation requests and inquiries
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Consultations</CardTitle>
            <CardDescription>
              A list of all consultation requests in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search consultations..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              {hasConsultations ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requester</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultations?.map((consultation: Consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                              {consultation.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">
                                {consultation.name}
                              </div>
                              <div className="text-sm text-gray-500 max-w-[200px] truncate">
                                {consultation.message}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {consultationKindLabels[
                              consultation.kind as keyof typeof consultationKindLabels
                            ] || consultation.kind}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1 text-gray-400" />
                              <a
                                href={`mailto:${consultation.email}`}
                                className="text-secondary hover:underline"
                              >
                                {consultation.email}
                              </a>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              <a
                                href={`tel:${consultation.phone}`}
                                className="text-gray-600 hover:underline"
                              >
                                {consultation.phone}
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[
                                consultation.status as keyof typeof statusColors
                              ]
                            }`}
                          >
                            {consultation.status === "PENDING" && (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {consultation.status === "RESOLVED" && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {consultation.status === "CANCELLED" && (
                              <X className="w-3 h-3 mr-1" />
                            )}
                            {
                              statusLabels[
                                consultation.status as keyof typeof statusLabels
                              ]
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                            {format(
                              new Date(consultation.created_at),
                              "MMM dd, yyyy"
                            )}
                          </div>
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
                                onClick={() =>
                                  handleViewConsultation(consultation)
                                }
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {consultation.status === "PENDING" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusUpdate(
                                        consultation,
                                        "RESOLVED"
                                      )
                                    }
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Mark as Resolved
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusUpdate(
                                        consultation,
                                        "CANCELLED"
                                      )
                                    }
                                    className="text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                    Mark as Cancelled
                                  </DropdownMenuItem>
                                </>
                              )}
                              {consultation.status !== "PENDING" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(consultation, "PENDING")
                                  }
                                  className="text-orange-600"
                                >
                                  <Clock className="h-4 w-4" />
                                  Mark as Pending
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleDeleteConsultation(consultation)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Permanently
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
                      <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg mb-4">
                        No consultations found matching &quot;{params.search}
                        &quot;
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchInput("");
                          setParams((prev) => ({
                            ...prev,
                            search: "",
                            page: 1,
                          }));
                        }}
                      >
                        Clear search
                      </Button>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg mb-4">
                        No consultation requests yet
                      </p>
                      <p className="text-gray-400 text-sm">
                        Consultation requests will appear here once users submit
                        them
                      </p>
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

        <ConsultationViewModal
          consultationId={selectedConsultation?.id || null}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedConsultation) return;
            try {
              await deleteConsultation(selectedConsultation.id).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("Consultation deleted successfully");
            } catch (error) {
              console.error("Failed to delete consultation:", error);
              toast.error("Failed to delete consultation");
            } finally {
              setSelectedConsultation(null);
            }
          }}
          title="Delete Consultation"
          description="Are you sure you want to delete this consultation? This action cannot be undone."
          itemName={selectedConsultation?.name || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
