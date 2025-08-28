"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GraduationCap,
  DollarSign,
  Calendar,
  ExternalLink,
  Building,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { useGetSingleScholarshipQuery } from "@/redux/features/scholarship/scholarshipApi";
import { Button } from "@/components/ui/button";

interface ScholarshipViewModalProps {
  scholarshipId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Loading component
function ScholarshipDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      <Separator />

      {/* Content sections skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ScholarshipViewModal({
  scholarshipId,
  isOpen,
  onClose,
}: ScholarshipViewModalProps) {
  const {
    data: scholarshipData,
    isLoading,
    isError,
    error,
  } = useGetSingleScholarshipQuery(scholarshipId, {
    skip: !scholarshipId || !isOpen,
  });

  const scholarship = scholarshipData?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getStatusInfo = (deadline: string) => {
    const isPassed = isDeadlinePassed(deadline);
    return {
      status: isPassed ? "Expired" : "Active",
      color: isPassed
        ? "bg-red-100 text-red-800"
        : "bg-green-100 text-green-800",
      icon: isPassed ? AlertCircle : CheckCircle,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            <span>Scholarship Details</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Complete information about this scholarship opportunity
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && <ScholarshipDetailsSkeleton />}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error && "data" in error && error.data
                ? `Error loading scholarship details: ${JSON.stringify(
                    error.data
                  )}`
                : "Failed to load scholarship details. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {scholarship && !isLoading && !isError && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {scholarship.title}
                </h2>
                {(() => {
                  const statusInfo = getStatusInfo(scholarship.deadline);
                  const IconComponent = statusInfo.icon;
                  return (
                    <Badge className={statusInfo.color}>
                      <IconComponent className="h-3 w-3 mr-1" />
                      {statusInfo.status}
                    </Badge>
                  );
                })()}
              </div>

              {scholarship.provider && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="h-4 w-4" />
                  <span className="font-medium">Provider:</span>
                  <span>{scholarship.provider}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Description Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {scholarship.description}
                </p>
              </CardContent>
            </Card>

            {/* Eligibility Section */}
            {scholarship.eligibility && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <CheckCircle className="h-4 w-4" />
                    Eligibility Criteria
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {scholarship.eligibility}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amount Section */}
            {scholarship.amount && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <DollarSign className="h-4 w-4" />
                    Scholarship Amount
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(scholarship.amount)}
                    </div>
                    <div className="text-sm text-green-600">
                      Total scholarship value
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deadline Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4" />
                  Application Deadline
                </h3>
                <div
                  className={`p-4 rounded-lg border ${
                    isDeadlinePassed(scholarship.deadline)
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div
                    className={`text-xl font-bold ${
                      isDeadlinePassed(scholarship.deadline)
                        ? "text-red-700"
                        : "text-blue-700"
                    }`}
                  >
                    {format(new Date(scholarship.deadline), "MMMM dd, yyyy")}
                  </div>
                  <div
                    className={`text-sm flex items-center gap-1 mt-1 ${
                      isDeadlinePassed(scholarship.deadline)
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {format(new Date(scholarship.deadline), "h:mm a")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Link Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <ExternalLink className="h-4 w-4" />
                  Application
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <a
                      href={scholarship.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium break-all"
                    >
                      {scholarship.application_url}
                    </a>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <a
                      href={scholarship.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Apply Now
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timeline Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Created
                      </p>
                      <p className="text-sm">
                        {format(new Date(scholarship.created_at), "PPP")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-orange-500">
                      <Calendar className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Last Updated
                      </p>
                      <p className="text-sm">
                        {format(new Date(scholarship.updated_at), "PPP")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  System Information
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Scholarship ID:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {scholarship.id}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
