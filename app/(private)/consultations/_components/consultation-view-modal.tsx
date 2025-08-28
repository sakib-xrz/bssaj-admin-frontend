"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  Loader2,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { useGetConsultationByIdQuery } from "@/redux/features/consultation/consultationApi";

interface ConsultationViewModalProps {
  consultationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const consultationKindLabels = {
  ACADEMIC_CONSULTATION: "Academic Consultation",
  CAREER_CONSULTATION: "Career Consultation",
  VISA_AND_IMMIGRATION_CONSULTATION: "Visa & Immigration Consultation",
  PERSONAL_CONSULTATION: "Personal Consultation",
};

const statusLabels = {
  PENDING: "Pending",
  RESOLVED: "Resolved",
  CANCELLED: "Cancelled",
};

const statusColors = {
  PENDING: "bg-orange-100 text-orange-800",
  RESOLVED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

// Loading component
function ConsultationDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Basic Information Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Contact Information Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Message skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

export function ConsultationViewModal({
  consultationId,
  isOpen,
  onClose,
}: ConsultationViewModalProps) {
  const {
    data: consultationData,
    isLoading,
    isError,
    error,
  } = useGetConsultationByIdQuery(consultationId, {
    skip: !consultationId || !isOpen,
  });

  const consultation = consultationData?.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Consultation Details</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Complete information about the consultation request
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && <ConsultationDetailsSkeleton />}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error && "data" in error && error.data
                ? `Error loading consultation details: ${JSON.stringify(
                    error.data
                  )}`
                : "Failed to load consultation details. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {consultation && !isLoading && !isError && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {consultation.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{consultation.name}</h3>
                  <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                    <Badge className="bg-blue-100 text-blue-800">
                      <Tag className="w-3 h-3 mr-1" />
                      {consultationKindLabels[
                        consultation.kind as keyof typeof consultationKindLabels
                      ] || consultation.kind}
                    </Badge>
                    <Badge
                      className={
                        statusColors[
                          consultation.status as keyof typeof statusColors
                        ]
                      }
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
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <a
                      href={`mailto:${consultation.email}`}
                      className="text-sm text-secondary hover:underline"
                    >
                      {consultation.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <a
                      href={`tel:${consultation.phone}`}
                      className="text-sm text-secondary hover:underline"
                    >
                      {consultation.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Message */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Message</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {consultation.message}
                </p>
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Timeline</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Submitted
                    </p>
                    <p className="text-sm">
                      {format(new Date(consultation.created_at), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Last Updated
                    </p>
                    <p className="text-sm">
                      {format(new Date(consultation.updated_at), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* System Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                System Information
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Consultation ID:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {consultation.id}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600">
                      {consultation.kind}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 text-gray-600">
                      {consultation.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
