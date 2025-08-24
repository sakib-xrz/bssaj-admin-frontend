"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import {
  useGetSingleJobQuery,
  useApproveOrRejectJobMutation,
} from "@/redux/features/job/jobApi";
import {
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Briefcase,
  Building,
  Clock,
  Loader2,
  AlertCircle,
  MapPin,
  DollarSign,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Users,
  Award,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";

interface JobViewModalProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Loading component
function JobDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex space-x-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Content sections skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>

      <Separator />

      <div className="space-y-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

export function JobViewModal({ jobId, isOpen, onClose }: JobViewModalProps) {
  const [imageError, setImageError] = useState(false);
  const [approveOrRejectJob, { isLoading: isActionLoading }] =
    useApproveOrRejectJobMutation();

  const {
    data: jobData,
    isLoading,
    isError,
    error,
  } = useGetSingleJobQuery(jobId, {
    skip: !jobId || !isOpen,
  });

  const job = jobData?.data;

  const handleApproveReject = async (isApproved: boolean) => {
    if (!job) return;

    try {
      await approveOrRejectJob({
        id: job.id,
        data: {
          id: job.id,
          is_approved: isApproved,
        },
      }).unwrap();

      toast.success(`Job ${isApproved ? "approved" : "rejected"} successfully`);
      onClose();
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          `Failed to ${isApproved ? "approve" : "reject"} job`
      );
    }
  };

  const getJobTypeBadge = () => {
    if (!job) return null;

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
      <>
        <Badge className={typeColors[job.type as keyof typeof typeColors]}>
          {job.type.replace("_", " ")}
        </Badge>
        <Badge className={kindColors[job.kind as keyof typeof kindColors]}>
          {job.kind.replace("_", " ")}
        </Badge>
      </>
    );
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Not specified";
  };

  const isApprovalPending = job && job.approved_at === null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Job Posting Details</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Complete information about the job posting
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && <JobDetailsSkeleton />}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error && "data" in error && error.data
                ? `Error loading job details: ${JSON.stringify(error.data)}`
                : "Failed to load job details. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {job && !isLoading && !isError && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {job.company_logo && !imageError ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={job.company_logo}
                      alt={`${job.company_name} logo`}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white">
                    <Building className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-gray-600">{job.company_name}</p>
                  <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                    {getJobTypeBadge()}
                    {isApprovalPending && (
                      <Badge className="bg-orange-100 text-orange-800">
                        Pending Approval
                      </Badge>
                    )}
                    {job.approved_at && (
                      <Badge className="bg-green-100 text-green-800">
                        Approved
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Job Description */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Job Description
                </h4>
                <RichTextEditor
                  content={job.description}
                  editable={false}
                  className="border-0"
                />
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Company Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Company Name</p>
                    <p className="font-medium">{job.company_name}</p>
                  </div>
                  {job.company_website && (
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a
                        href={job.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline flex items-center"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        {job.company_website}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                  {job.company_email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a
                        href={`mailto:${job.company_email}`}
                        className="font-medium text-blue-600 hover:underline flex items-center"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        {job.company_email}
                      </a>
                    </div>
                  )}
                  {job.company_phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a
                        href={`tel:${job.company_phone}`}
                        className="font-medium text-blue-600 hover:underline flex items-center"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        {job.company_phone}
                      </a>
                    </div>
                  )}
                  {job.company_address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.company_address}
                      </p>
                    </div>
                  )}
                  {job.posted_by && (
                    <div>
                      <p className="text-sm text-gray-600">Posted By</p>
                      <p className="font-medium">{job.posted_by.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Job Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Salary Range</p>
                    <p className="font-medium flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatSalary(job.salary_min, job.salary_max)}
                    </p>
                  </div>
                  {job.experience_min !== null && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Experience Required
                      </p>
                      <p className="font-medium">{job.experience_min}+ years</p>
                    </div>
                  )}
                  {job.number_of_vacancies && (
                    <div>
                      <p className="text-sm text-gray-600">Vacancies</p>
                      <p className="font-medium flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {job.number_of_vacancies}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">
                      Application Deadline
                    </p>
                    <p className="font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(job.deadline), "PPP")}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Apply Link</p>
                    <a
                      href={job.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {job.apply_link}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posted By Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Posted By
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.posted_by && (
                    <div>
                      <p className="text-sm text-gray-600">Posted By</p>
                      <p className="font-medium">{job.posted_by.name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Posted On</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(job.created_at), "PPP")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approval Status
                </h4>
                {job.approved_at ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Job Approved
                      </span>
                    </div>
                    {job.approved_by && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-green-700">
                          <strong>Approved by:</strong> {job.approved_by.name}
                        </p>
                        <p className="text-sm text-green-700">
                          <strong>Approved on:</strong>{" "}
                          {format(new Date(job.approved_at), "PPP")}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-800">
                        Pending Approval
                      </span>
                    </div>
                    <p className="text-sm text-orange-700 mt-2">
                      This job posting is waiting for administrative approval
                      before it can be published.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  System Information
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Job ID:</span>
                      <span className="ml-2 text-gray-600">{job.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Last Updated:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {format(new Date(job.updated_at), "PPP")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {isApprovalPending && (
              <>
                <Separator />
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleApproveReject(false)}
                    disabled={isActionLoading}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveReject(true)}
                    disabled={isActionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isActionLoading && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Job
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
