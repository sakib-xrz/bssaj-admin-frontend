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
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  Calendar,
  Building,
} from "lucide-react";
import { DeleteAlertDialog } from "@/app/(private)/_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";
import {
  useGetAllCertificationsQuery,
  useDeleteCertificationMutation,
} from "@/redux/features/certification/certificationApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";
import { CertificationViewModal } from "./_components/certification-view-modal";

interface Certification {
  id: string;
  sl_no: string;
  name: string;
  date_of_birth: string;
  gender: string;
  father_name: string;
  mother_name: string;
  student_id: string;
  completed_hours: string;
  grade: string;
  course_duration: string;
  issued_at: string;
  institute_name: string;
  agency_id: string;
  certificate_url: string | null;
  agency: {
    id: string;
    name: string;
    logo?: string;
  };
  created_at: string;
  updated_at: string;
}

export default function CertificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 20,
    search: searchParams.get("search") || "",
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
    router.push(`/certifications${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetAllCertificationsQuery(
    sanitizeParams(params)
  );

  const certifications = data?.data;

  const [selectedCertification, setSelectedCertification] =
    useState<Certification | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteCertification, { isLoading: isDeleting }] =
    useDeleteCertificationMutation();

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

  const handleViewCertification = (certification: Certification) => {
    setSelectedCertification(certification);
    setIsViewModalOpen(true);
  };

  const handleDeleteCertification = (certification: Certification) => {
    setSelectedCertification(certification);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return format(date, "MMM dd, yyyy");
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Certifications
              </h1>
              <p className="text-gray-600">Manage certifications and awards</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Certifications</CardTitle>
              <CardDescription>
                A list of all certifications in the system
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

  const hasCertifications = certifications && certifications.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certifications</h1>
            <p className="text-gray-600">Manage certifications and awards</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Certifications</CardTitle>
            <CardDescription>
              A list of all certifications in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search certifications..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              {hasCertifications ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial No.</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Institute</TableHead>
                      <TableHead>Course Duration</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Issued At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certifications?.map((certification: Certification) => (
                      <TableRow key={certification.id}>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                            {certification.sl_no}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-medium line-clamp-1">
                                {certification.name}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {certification.gender}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                            {certification.student_id}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium line-clamp-1">
                                {certification.institute_name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {certification.course_duration ? (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800"
                            >
                              {certification.course_duration} H
                            </Badge>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {certification.grade ? (
                            <Badge
                              variant={
                                certification.grade === "A+"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                certification.grade === "A+"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {certification.grade}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {certification.completed_hours ? (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-800"
                            >
                              {certification.completed_hours} H
                            </Badge>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {certification.issued_at ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{formatDate(certification.issued_at)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
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
                                onClick={() =>
                                  handleViewCertification(certification)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleDeleteCertification(certification)
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
                        No certifications found matching &quot;{params.search}
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
                      <p className="text-gray-500 text-lg mb-4">
                        No certifications added yet
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

        <CertificationViewModal
          certificationId={selectedCertification?.id || null}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedCertification) return;
            try {
              await deleteCertification(selectedCertification.id).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("Certification deleted successfully");
            } catch (error) {
              console.error("Failed to delete certification:", error);
              toast.error("Failed to delete certification");
            } finally {
              setSelectedCertification(null);
            }
          }}
          title="Delete Certification"
          description="Are you sure you want to delete this certification? This action cannot be undone."
          itemName={selectedCertification?.name || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
