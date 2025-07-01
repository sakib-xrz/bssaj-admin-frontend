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
  Phone,
  Mail,
  UserCheck,
  CheckCircle,
  Clock,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { MemberViewModal } from "./_components/member-view-modal";
import { DeleteAlertDialog } from "@/app/(private)/_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";
import {
  useGetMembersQuery,
  useDeleteMemberMutation,
  useApproveOrRejectMemberMutation,
  useGetMemberStatsQuery,
} from "@/redux/features/member/memberApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";

const memberKindColors = {
  ADVISER: "bg-slate-100 text-slate-800",
  HONORABLE: "bg-amber-100 text-amber-800",
  EXECUTIVE: "bg-blue-100 text-blue-800",
  ASSOCIATE: "bg-emerald-100 text-emerald-800",
  STUDENT_REPRESENTATIVE: "bg-cyan-100 text-cyan-800",
};

const memberKindLabels = {
  ADVISER: "Adviser",
  HONORABLE: "Honorable",
  EXECUTIVE: "Executive",
  ASSOCIATE: "Associate",
  STUDENT_REPRESENTATIVE: "Student Rep",
};

interface Member {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  kind: string;
  is_deleted: boolean;
  approved_at: string | null;
  approved_by_id: string | null;
  created_at: string;
  updated_at: string;
  user: {
    role: string;
    is_deleted: boolean;
  };
  approved_by: {
    name: string;
  } | null;
}

export default function MembersPage() {
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
    router.push(`/members${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetMembersQuery(sanitizeParams(params));
  const { data: statsData, isLoading: isStatsLoading } =
    useGetMemberStatsQuery(undefined);

  const members = data?.data;
  const stats = statsData?.data;

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteMember, { isLoading: isDeleting }] = useDeleteMemberMutation();
  const [approveOrRejectMember] = useApproveOrRejectMemberMutation();

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

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleDeleteMember = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const handleApprove = async (member: Member) => {
    try {
      await approveOrRejectMember({
        id: member.id,
        data: { status: "APPROVED" },
      }).unwrap();
      toast.success("Member approved successfully");
    } catch (error) {
      console.error("Error approving member:", error);
      toast.error("Failed to approve member");
    }
  };

  const handleReject = async (member: Member) => {
    try {
      await approveOrRejectMember({
        id: member.id,
        data: { status: "REJECTED" },
      }).unwrap();
      toast.success("Member rejected successfully");
    } catch (error) {
      console.error("Error rejecting member:", error);
      toast.error("Failed to reject member");
    }
  };

  if (isLoading || isStatsLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Members</h1>
              <p className="text-gray-600">
                Manage BSSAJ organization members and their roles
              </p>
            </div>
            <div className="w-[120px] h-10 bg-gray-200 animate-pulse rounded-md" />
          </div>

          {/* Stats Cards Loading */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
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
              <CardTitle>All Members</CardTitle>
              <CardDescription>
                A list of all organization members and their designations
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

  const hasMembers = members && members.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600">
              Manage BSSAJ organization members and their roles
            </p>
          </div>
          <Link href="/members/create">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              label: "Total Members",
              count: stats?.total_members || 0,
              color: "text-blue-600",
              icon: UserCheck,
            },
            {
              label: "Approved Members",
              count: stats?.total_approved_members || 0,
              color: "text-purple-600",
              icon: CheckCircle,
            },
            {
              label: "Pending Approval",
              count: stats?.total_pending_members || 0,
              color: "text-orange-600",
              icon: Clock,
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

        <Card>
          <CardHeader>
            <CardTitle>All Members</CardTitle>
            <CardDescription>
              A list of all organization members and their designations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search members..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              {hasMembers ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((member: Member) => (
                      <TableRow
                        key={member.id}
                        className={member.is_deleted ? "opacity-60" : ""}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-500">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              memberKindColors[
                                member.kind as keyof typeof memberKindColors
                              ]
                            }
                          >
                            {
                              memberKindLabels[
                                member.kind as keyof typeof memberKindLabels
                              ]
                            }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1 text-gray-400" />
                              <a
                                href={`mailto:${member.email}`}
                                className="text-secondary hover:underline"
                              >
                                {member.email}
                              </a>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              <a
                                href={`tel:${member.phone}`}
                                className="text-gray-600 hover:underline"
                              >
                                {member.phone}
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.approved_at ? (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">
                                Approved
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-orange-600">
                                Pending
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(member.created_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!member.approved_at && !member.is_deleted ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleViewMember(member)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(member)}
                                    className="text-green-600"
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Approve Member
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleReject(member)}
                                    className="text-red-600"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Reject Member
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleViewMember(member)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/members/edit/${member.id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Member
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteMember(member)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Permanently
                                  </DropdownMenuItem>
                                </>
                              )}
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
                        No members found matching &quot;{params.search}&quot;
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
                        No members added yet
                      </p>
                      <Link href="/members/create">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add your first member
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

        <MemberViewModal
          memberId={selectedMember?.id || null}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedMember) return;
            try {
              await deleteMember(selectedMember.id).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("Member deleted successfully");
            } catch (error) {
              console.error("Failed to delete member:", error);
              toast.error("Failed to delete member");
            } finally {
              setSelectedMember(null);
            }
          }}
          title="Delete Member"
          description="Are you sure you want to delete this member? This action cannot be undone."
          itemName={selectedMember?.name || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
