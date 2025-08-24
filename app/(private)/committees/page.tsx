"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import { CommitteeViewModal } from "./_components/committee-view-modal";
import { DeleteAlertDialog } from "@/app/(private)/_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";
import {
  useGetCommitteesQuery,
  useDeleteCommitteeMutation,
} from "@/redux/features/committee/committeeApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";

const designationColors = {
  PRESIDENT: "bg-purple-100 text-purple-800",
  SR_VICE_PRESIDENT: "bg-blue-100 text-blue-800",
  VICE_PRESIDENT: "bg-green-100 text-green-800",
  GENERAL_SECRETARY: "bg-orange-100 text-orange-800",
  JOINT_GENERAL_SECRETARY: "bg-yellow-100 text-yellow-800",
  TREASURER: "bg-gray-100 text-gray-800",
  JOINT_TREASURER: "bg-indigo-100 text-indigo-800",
  EXECUTIVE_MEMBER: "bg-red-100 text-red-800",
  ADVISOR: "bg-pink-100 text-pink-800",
  OTHER: "bg-gray-100 text-gray-800",
};

const designationLabels = {
  PRESIDENT: "President",
  SR_VICE_PRESIDENT: "Sr. Vice President",
  VICE_PRESIDENT: "Vice President",
  GENERAL_SECRETARY: "General Secretary",
  JOINT_GENERAL_SECRETARY: "Joint General Secretary",
  TREASURER: "Treasurer",
  JOINT_TREASURER: "Joint Treasurer",
  EXECUTIVE_MEMBER: "Executive Member",
  ADVISOR: "Advisor",
  OTHER: "Other",
};

interface Committee {
  id: string;
  name: string;
  designation: string;
  term_start_year: number;
  term_end_year: number;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}

export default function CommitteesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 20,
    search: searchParams.get("search") || "",
    designation: searchParams.get("designation") || "",
    term_start_year: searchParams.get("term_start_year") || "",
    term_end_year: searchParams.get("term_end_year") || "",
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
    router.push(`/committees${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetCommitteesQuery(sanitizeParams(params));

  const committees = data?.data;

  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteCommittee, { isLoading: isDeleting }] =
    useDeleteCommitteeMutation();

  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (committeeId: string) => {
    setImageErrors((prev) => new Set(prev).add(committeeId));
  };

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

  const handleViewCommittee = (committee: Committee) => {
    setSelectedCommittee(committee);
    setIsViewModalOpen(true);
  };

  const handleDeleteCommittee = (committee: Committee) => {
    setSelectedCommittee(committee);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Committee</h1>
              <p className="text-gray-600">
                Manage committee members and their designations
              </p>
            </div>
            <div className="w-[120px] h-10 bg-gray-200 animate-pulse rounded-md" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Committee Members</CardTitle>
              <CardDescription>
                A list of all committee members and their designations
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

  const hasCommittees = committees && committees.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Committee</h1>
            <p className="text-gray-600">
              Manage committee members and their designations
            </p>
          </div>
          <Link href="/committees/create">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add Committee Member
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Committee Members</CardTitle>
            <CardDescription>
              A list of all committee members and their designations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search committee members..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              {hasCommittees ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {committees?.map((committee: Committee) => (
                      <TableRow key={committee.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {committee.profile_picture &&
                            !imageErrors.has(committee.id) ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
                                <Image
                                  src={committee.profile_picture}
                                  alt={`${committee.name} profile`}
                                  fill
                                  className="object-cover"
                                  onError={() => handleImageError(committee.id)}
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                                {committee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-medium">
                                {committee.name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              designationColors[
                                committee.designation as keyof typeof designationColors
                              ] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {designationLabels[
                              committee.designation as keyof typeof designationLabels
                            ] || committee.designation}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {committee.term_start_year} -{" "}
                            {committee.term_end_year}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(committee.created_at),
                            "dd MMM yyyy"
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
                                onClick={() => handleViewCommittee(committee)}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/committees/edit/${committee.id}`}>
                                  <Edit className="h-4 w-4" />
                                  Edit Member
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteCommittee(committee)}
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
                        No committee members found matching &quot;
                        {params.search}&quot;
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
                        No committee members added yet
                      </p>
                      <Link href="/committees/create">
                        <Button>
                          <Plus className="w-4 h-4" />
                          Add your first committee member
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

        <CommitteeViewModal
          committeeId={selectedCommittee?.id || null}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedCommittee) return;
            try {
              await deleteCommittee(selectedCommittee.id).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("Committee member deleted successfully");
            } catch (error) {
              console.error("Failed to delete committee member:", error);
              toast.error("Failed to delete committee member");
            } finally {
              setSelectedCommittee(null);
            }
          }}
          title="Delete Committee Member"
          description="Are you sure you want to delete this committee member? This action cannot be undone."
          itemName={selectedCommittee?.name || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
