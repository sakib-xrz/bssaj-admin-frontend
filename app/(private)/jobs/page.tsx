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
  Briefcase,
  Loader2,
  Check,
  X,
  Building,
} from "lucide-react";
import { JobViewModal } from "@/app/(private)/jobs/_components/job-view-modal";
import { DeleteAlertDialog } from "@/app/(private)/_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";
import {
  useGetAllJobsQuery,
  useDeleteJobMutation,
  useApproveOrRejectJobMutation,
} from "@/redux/features/job/jobApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  description: string;
  kind: "ON_SITE" | "REMOTE" | "HYBRID";
  type: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "FREELANCE";
  company_name: string;
  company_logo: string | null;
  company_website: string | null;
  salary_min: number | null;
  salary_max: number | null;
  deadline: string;
  apply_link: string;
  approved_at: string | null;
  approved_by: {
    name: string;
  } | null;
  posted_by: {
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export default function JobsPage() {
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
    router.push(`/jobs${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetAllJobsQuery(sanitizeParams(params));

  const jobs = data?.data;

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();
  const [approveOrRejectJob] = useApproveOrRejectJobMutation();

  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (jobId: string) => {
    setImageErrors((prev) => new Set(prev).add(jobId));
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

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsViewModalOpen(true);
  };

  const handleDeleteJob = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const handleApproveJob = async (job: Job) => {
    try {
      await approveOrRejectJob({
        id: job.id,
        data: {
          id: job.id,
          is_approved: true,
        },
      }).unwrap();
      toast.success("Job approved successfully");
    } catch (error) {
      console.error("Error approving job:", error);
      toast.error("Failed to approve job");
    }
  };

  const handleRejectJob = async (job: Job) => {
    try {
      await approveOrRejectJob({
        id: job.id,
        data: {
          id: job.id,
          is_approved: false,
        },
      }).unwrap();
      toast.success("Job rejected successfully");
    } catch (error) {
      console.error("Error rejecting job:", error);
      toast.error("Failed to reject job");
    }
  };

  const getJobTypeBadge = (job: Job) => {
    const typeColors = {
      FULL_TIME: "bg-green-100 text-green-800",
      PART_TIME: "bg-blue-100 text-blue-800",
      INTERNSHIP: "bg-purple-100 text-purple-800",
      CONTRACT: "bg-orange-100 text-orange-800",
      FREELANCE: "bg-pink-100 text-pink-800",
    };

    const kindColors = {
      ON_SITE: "bg-gray-100 text-gray-800",
      REMOTE: "bg-emerald-100 text-emerald-800",
      HYBRID: "bg-yellow-100 text-yellow-800",
    };

    return (
      <div className="flex gap-1 flex-wrap">
        <Badge className={typeColors[job.type]}>
          {job.type.replace("_", " ")}
        </Badge>
        <Badge className={kindColors[job.kind]}>
          {job.kind.replace("_", " ")}
        </Badge>
      </div>
    );
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Not specified";
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
              <p className="text-gray-600">
                Manage job postings and applications
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Job Postings</CardTitle>
              <CardDescription>
                A list of all job postings in the system
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

  const hasJobs = jobs && jobs.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
            <p className="text-gray-600">
              Manage job postings and applications
            </p>
          </div>
          <Link href="/jobs/create">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Create Job
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Job Postings</CardTitle>
            <CardDescription>
              A list of all job postings in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search job postings..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              {hasJobs ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Details</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type & Location</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs?.map((job: Job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {job.company_logo && !imageErrors.has(job.id) ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                                <Image
                                  src={job.company_logo}
                                  alt={`${job.company_name} logo`}
                                  fill
                                  className="object-cover"
                                  onError={() => handleImageError(job.id)}
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-semibold">
                                <Briefcase className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium line-clamp-1">
                                {job.title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {job.description
                                  .replace(/<[^>]*>/g, "")
                                  .substring(0, 50)}
                                ...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{job.company_name}</span>
                          </div>
                          {job.posted_by && (
                            <div className="text-xs text-gray-500 mt-1">
                              via {job.posted_by.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getJobTypeBadge(job)}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatSalary(job.salary_min, job.salary_max)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {format(new Date(job.deadline), "MMM dd, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {job.approved_at ? (
                            <Badge className="bg-green-100 text-green-800">
                              Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-800">
                              Pending
                            </Badge>
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
                              {job.approved_at === null ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleViewJob(job)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleApproveJob(job)}
                                    className="text-green-600"
                                  >
                                    <Check className="h-4 w-4" />
                                    Approve Job
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRejectJob(job)}
                                    className="text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                    Reject Job
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleViewJob(job)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/jobs/edit/${job.id}`}>
                                      <Edit className="h-4 w-4" />
                                      Edit Job
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteJob(job)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
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
                        No job postings found matching &quot;{params.search}
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
                        No job postings added yet
                      </p>
                      <Link href="/jobs/create">
                        <Button>
                          <Plus className="w-4 h-4" />
                          Create your first job posting
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

        <JobViewModal
          jobId={selectedJob?.id || null}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedJob) return;
            try {
              await deleteJob({ id: selectedJob.id }).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("Job deleted successfully");
            } catch (error) {
              console.error("Failed to delete job:", error);
              toast.error("Failed to delete job");
            } finally {
              setSelectedJob(null);
            }
          }}
          title="Delete Job Posting"
          description="Are you sure you want to delete this job posting? This action cannot be undone."
          itemName={selectedJob?.title || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
