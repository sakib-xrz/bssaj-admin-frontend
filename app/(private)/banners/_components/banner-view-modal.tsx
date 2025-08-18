"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetSingleBannerQuery } from "@/redux/features/banner/bannerApi";
import {
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  FileText,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

interface BannerViewModalProps {
  bannerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Loading component
function BannerDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
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

export function BannerViewModal({
  bannerId,
  isOpen,
  onClose,
}: BannerViewModalProps) {
  const [imageError, setImageError] = useState(false);

  const {
    data: bannerData,
    isLoading,
    isError,
    error,
  } = useGetSingleBannerQuery(bannerId, {
    skip: !bannerId || !isOpen,
  });

  const banner = bannerData?.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5" />
            <span>Banner Details</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Complete information about the banner
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && <BannerDetailsSkeleton />}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error && "data" in error && error.data
                ? `Error loading banner details: ${JSON.stringify(error.data)}`
                : "Failed to load banner details. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {banner && !isLoading && !isError && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {banner.image && !imageError ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={banner.image}
                      alt={`${banner.title} banner`}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{banner.title}</h3>
                  <p className="text-gray-600 mt-1">{banner.description}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Banner Image Section */}
            {banner.image && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Banner Image
                  </h4>
                  <div className="w-full h-64 rounded-lg overflow-hidden relative">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Description
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {banner.description}
                </p>
              </CardContent>
            </Card>

            {/* Link Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Link Information
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium break-all"
                    >
                      {banner.link}
                    </a>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => window.open(banner.link, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
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
                        {format(new Date(banner.created_at), "PPP")}
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
                        {format(new Date(banner.updated_at), "PPP")}
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
                        Banner ID:
                      </span>
                      <span className="ml-2 text-gray-600">{banner.id}</span>
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
