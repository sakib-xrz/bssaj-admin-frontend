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
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  User,
  Facebook,
  CheckCircle,
  Clock,
  X,
  UserCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useGetAgencyByIdQuery } from "@/redux/features/agency/agencyApi";
import { useState, useEffect } from "react";
import Image from "next/image";

interface AgencyViewModalProps {
  agencyId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Loading component
function AgencyDetailsSkeleton() {
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
              <Skeleton className="h-5 w-24" />
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

      {/* Additional sections skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

export function AgencyViewModal({
  agencyId,
  isOpen,
  onClose,
}: AgencyViewModalProps) {
  const [imageError, setImageError] = useState(false);

  const {
    data: agencyData,
    isLoading,
    isError,
    error,
  } = useGetAgencyByIdQuery(agencyId, {
    skip: !agencyId || !isOpen,
  });

  const agency = agencyData?.data;

  // Reset image error when modal opens with different agency
  useEffect(() => {
    setImageError(false);
  }, [agencyId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Agency Details</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Complete information about the agency
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && <AgencyDetailsSkeleton />}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error && "data" in error && error.data
                ? `Error loading agency details: ${JSON.stringify(error.data)}`
                : "Failed to load agency details. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {agency && !isLoading && !isError && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {agency.logo && !imageError ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={agency.logo}
                      alt={`${agency.name} logo`}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {agency.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{agency.name}</h3>
                  <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                    {agency.established_year && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Est. {agency.established_year}
                      </Badge>
                    )}
                    {agency.approved_at ? (
                      <Badge className="bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                      </Badge>
                    ) : agency.status === "REJECTED" ? (
                      <Badge className="bg-red-100 text-red-800">
                        <X className="w-3 h-3 mr-1" />
                        Rejected
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Approval
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {agency.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{agency.description}</p>
                </div>
              )}
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
                      href={`mailto:${agency.contact_email}`}
                      className="text-sm text-secondary hover:underline"
                    >
                      {agency.contact_email}
                    </a>
                  </div>
                </div>
                {agency.contact_phone && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <a
                        href={`tel:${agency.contact_phone}`}
                        className="text-sm text-secondary hover:underline"
                      >
                        {agency.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
                {agency.website && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Website
                      </p>
                      <a
                        href={agency.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-secondary hover:underline"
                      >
                        {agency.website}
                      </a>
                    </div>
                  </div>
                )}
                {agency.facebook_url && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                      <Facebook className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Facebook
                      </p>
                      <a
                        href={agency.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-secondary hover:underline"
                      >
                        Facebook Page
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {agency.address && (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-700">{agency.address}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Director Information */}
            {agency.director_name && (
              <>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Director Information
                  </h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Director
                      </p>
                      <p className="text-sm font-semibold">
                        {agency.director_name}
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Approval Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Approval Status</h4>
              {agency.approved_at ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Agency Approved
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-green-700">
                      <strong>Approved on:</strong>{" "}
                      {format(new Date(agency.approved_at), "PPP")}
                    </p>
                    {agency.approved_by && (
                      <p className="text-sm text-green-700">
                        <strong>Approved by:</strong> {agency.approved_by.name}
                      </p>
                    )}
                  </div>
                </div>
              ) : agency.status === "REJECTED" ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <X className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">
                      Agency Rejected
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-2">
                    This agency application was rejected by the admin team.
                  </p>
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
                    This agency is waiting for administrative approval to access
                    agency features.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Success Stories */}
            {agency.success_stories && agency.success_stories.length > 0 && (
              <>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    Success Stories
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {agency.success_stories.map((story: any) => (
                      <div key={story.id} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={story.image}
                          alt="Success story"
                          className="w-full h-32 object-cover rounded-lg shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* User Account Information */}
            {agency.user && (
              <>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    User Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          User Name
                        </p>
                        <p className="text-sm font-semibold">
                          {agency.user.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          User Email
                        </p>
                        <p className="text-sm">{agency.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                        <UserCheck className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          User Role
                        </p>
                        <p className="text-sm font-semibold">
                          {agency.user.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Account Status
                        </p>
                        <p className="text-sm">
                          {agency.user.is_deleted ? "Inactive" : "Active"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Agency Timeline */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Agency Timeline</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Registered
                    </p>
                    <p className="text-sm">
                      {format(new Date(agency.created_at), "PPP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <UserCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Last Updated
                    </p>
                    <p className="text-sm">
                      {format(new Date(agency.updated_at), "PPP")}
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
                      Agency ID:
                    </span>
                    <span className="ml-2 text-gray-600">{agency.id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">User ID:</span>
                    <span className="ml-2 text-gray-600">{agency.user_id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 text-gray-600">{agency.status}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Active:</span>
                    <span className="ml-2 text-gray-600">
                      {agency.is_deleted ? "No" : "Yes"}
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
