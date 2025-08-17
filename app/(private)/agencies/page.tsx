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
  Trash2,
  Eye,
  ExternalLink,
  Building2,
  CheckCircle,
  Clock,
  X,
  Check,
  Loader2,
  Mail,
  Phone,
  Edit,
} from "lucide-react";
import { AgencyViewModal } from "./_components/agency-view-modal";
import { DeleteAlertDialog } from "../_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import {
  useGetAgenciesQuery,
  useDeleteAgencyMutation,
  useApproveOrRejectAgencyMutation,
  useGetAgencyStatsQuery,
} from "@/redux/features/agency/agencyApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";

interface Agency {
  id: string;
  user_id: string;
  name: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  contact_email: string;
  agency_email: string | null;
  contact_phone: string | null;
  address: string | null;
  facebook_url: string | null;
  established_year: number | null;
  director_name: string | null;
  status: string;
  approved_at: string | null;
  approved_by_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    email: string;
    role: string;
    is_deleted: boolean;
  } | null;
  approved_by: {
    name: string;
  } | null;
  success_stories?: {
    id: string;
    image: string;
  }[];
}

export default function AgenciesPage() {
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
    router.push(`/agencies${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetAgenciesQuery(sanitizeParams(params));
  const { data: statsData, isLoading: isStatsLoading } =
    useGetAgencyStatsQuery(undefined);

  const agencies = data?.data;
  const stats = statsData?.data;

  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteAgency, { isLoading: isDeleting }] = useDeleteAgencyMutation();
  const [approveOrRejectAgency] = useApproveOrRejectAgencyMutation();

  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (agencyId: string) => {
    setImageErrors((prev) => new Set(prev).add(agencyId));
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

  const handleViewAgency = (agency: Agency) => {
    setSelectedAgency(agency);
    setIsViewModalOpen(true);
  };

  const handleDeleteAgency = (agency: Agency) => {
    setSelectedAgency(agency);
    setIsDeleteDialogOpen(true);
  };

  const handleApprove = async (agency: Agency) => {
    try {
      await approveOrRejectAgency({
        id: agency.id,
        data: { status: "APPROVED" },
      }).unwrap();
      toast.success("Agency approved successfully");
    } catch (error) {
      console.error("Error approving agency:", error);
      toast.error("Failed to approve agency");
    }
  };

  const handleReject = async (agency: Agency) => {
    try {
      await approveOrRejectAgency({
        id: agency.id,
        data: { status: "REJECTED" },
      }).unwrap();
      toast.success("Agency rejected successfully");
    } catch (error) {
      console.error("Error rejecting agency:", error);
      toast.error("Failed to reject agency");
    }
  };

  if (isLoading || isStatsLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agencies</h1>
              <p className="text-gray-600">
                Manage registered agencies and their information
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
              <CardTitle>All Agencies</CardTitle>
              <CardDescription>
                A list of all registered agencies in the system
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

  const hasAgencies = agencies && agencies.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agencies</h1>
            <p className="text-gray-600">
              Manage registered agencies and their information
            </p>
          </div>
          <Link href="/agencies/create">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Agency
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              label: "Total Agencies",
              count: stats?.total_agencies || 0,
              color: "text-blue-600",
              icon: Building2,
            },
            {
              label: "Approved Agencies",
              count: stats?.total_approved_agencies || 0,
              color: "text-green-600",
              icon: CheckCircle,
            },
            {
              label: "Pending Approval",
              count: stats?.total_pending_agencies || 0,
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
            <CardTitle>All Agencies</CardTitle>
            <CardDescription>
              A list of all registered agencies in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search agencies..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              {hasAgencies ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agency</TableHead>
                      <TableHead>Director</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead>Established</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agencies?.map((agency: Agency) => (
                      <TableRow
                        key={agency.id}
                        className={agency.is_deleted ? "opacity-60" : ""}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {agency.logo && !imageErrors.has(agency.id) ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
                                <Image
                                  src={agency.logo}
                                  alt={`${agency.name} logo`}
                                  fill
                                  className="object-cover"
                                  onError={() => handleImageError(agency.id)}
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                                {agency.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div
                                className="font-medium max-w-[150px] truncate"
                                title={agency.name}
                              >
                                {agency.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {agency.user?.email || agency.contact_email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {agency.director_name || (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1 text-gray-400" />
                              <a
                                href={`mailto:${agency.contact_email}`}
                                className="text-secondary hover:underline"
                              >
                                {agency.contact_email}
                              </a>
                            </div>
                            {agency.contact_phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                <a
                                  href={`tel:${agency.contact_phone}`}
                                  className="text-gray-600 hover:underline"
                                >
                                  {agency.contact_phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {agency.website ? (
                            <a
                              href={agency.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-secondary hover:underline flex items-center"
                            >
                              Visit <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          ) : (
                            <span className="text-gray-400">No website</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {agency.approved_at ? (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">
                                Approved
                              </span>
                            </div>
                          ) : agency.status === "REJECTED" ? (
                            <div className="flex items-center space-x-1">
                              <X className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-600">
                                Rejected
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm text-yellow-600">
                                Pending
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {agency.established_year || (
                            <span className="text-gray-400">Not specified</span>
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
                              {!agency.approved_at && !agency.is_deleted ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleViewAgency(agency)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <Link href={`/agencies/edit/${agency.id}`}>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Agency
                                    </DropdownMenuItem>
                                  </Link>
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(agency)}
                                    className="text-green-600"
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Approve Agency
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleReject(agency)}
                                    className="text-red-600"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Reject Agency
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleViewAgency(agency)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <Link href={`/agencies/edit/${agency.id}`}>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Agency
                                    </DropdownMenuItem>
                                  </Link>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteAgency(agency)}
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
                        No agencies found matching &quot;{params.search}&quot;
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
                        No agencies registered yet
                      </p>
                      <Link href="/agencies/create">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add your first agency
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

        <AgencyViewModal
          agencyId={selectedAgency?.id || null}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedAgency) return;
            try {
              await deleteAgency(selectedAgency.id).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("Agency deleted successfully");
            } catch (error) {
              console.error("Failed to delete agency:", error);
              toast.error("Failed to delete agency");
            } finally {
              setSelectedAgency(null);
            }
          }}
          title="Delete Agency"
          description="Are you sure you want to delete this agency? This will permanently remove the agency and all associated data."
          itemName={selectedAgency?.name || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
