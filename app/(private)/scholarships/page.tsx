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
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Loader2,
} from "lucide-react";
import { DeleteAlertDialog } from "@/app/(private)/_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";
import {
  useGetAllScholarshipsQuery,
  useDeleteScholarshipMutation,
} from "@/redux/features/scholarship/scholarshipApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";
import { ScholarshipViewModal } from "./_components/scholarship-view-modal";

interface Scholarship {
  id: string;
  title: string;
  description: string;
  eligibility?: string;
  provider?: string;
  amount?: number;
  deadline: string;
  application_url: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export default function ScholarshipsPage() {
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
    router.push(`/scholarships${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetAllScholarshipsQuery(
    sanitizeParams(params)
  );

  const scholarships = data?.data;

  const [selectedScholarship, setSelectedScholarship] =
    useState<Scholarship | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteScholarship, { isLoading: isDeleting }] =
    useDeleteScholarshipMutation();

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

  const handleViewScholarship = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setIsViewModalOpen(true);
  };

  const handleDeleteScholarship = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setIsDeleteDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scholarships</h1>
              <p className="text-gray-600">
                Manage scholarship opportunities and applications
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Scholarships</CardTitle>
              <CardDescription>
                A list of all scholarships in the system
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

  const hasScholarships = scholarships && scholarships.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scholarships</h1>
            <p className="text-gray-600">
              Manage scholarship opportunities and applications
            </p>
          </div>
          <Link href="/scholarships/create">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add Scholarship
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Scholarships</CardTitle>
            <CardDescription>
              A list of all scholarships in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search scholarships..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              {hasScholarships ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scholarships?.map((scholarship: Scholarship) => (
                      <TableRow key={scholarship.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium line-clamp-1 w-[350px]">
                              {scholarship.title}
                            </div>
                            {scholarship.description && (
                              <div className="text-sm text-gray-500 line-clamp-2 w-[350px]">
                                {scholarship.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {scholarship.provider || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {scholarship.amount ? (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">
                                {formatCurrency(scholarship.amount)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span
                              className={
                                isDeadlinePassed(scholarship.deadline)
                                  ? "text-red-600"
                                  : "text-gray-900"
                              }
                            >
                              {format(
                                new Date(scholarship.deadline),
                                "dd MMM yyyy"
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isDeadlinePassed(scholarship.deadline)
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isDeadlinePassed(scholarship.deadline)
                              ? "Expired"
                              : "Active"}
                          </span>
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
                                  handleViewScholarship(scholarship)
                                }
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/scholarships/edit/${scholarship.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Scholarship
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleDeleteScholarship(scholarship)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
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
                        No scholarships found matching &quot;{params.search}
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
                        No scholarships added yet
                      </p>
                      <Link href="/scholarships/create">
                        <Button>
                          <Plus className="w-4 h-4" />
                          Create your first scholarship
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

        <ScholarshipViewModal
          scholarshipId={selectedScholarship?.id || null}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedScholarship) return;
            try {
              await deleteScholarship(selectedScholarship.id).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("Scholarship deleted successfully");
            } catch (error) {
              console.error("Failed to delete scholarship:", error);
              toast.error("Failed to delete scholarship");
            } finally {
              setSelectedScholarship(null);
            }
          }}
          title="Delete Scholarship"
          description="Are you sure you want to delete this scholarship? This action cannot be undone."
          itemName={selectedScholarship?.title || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
