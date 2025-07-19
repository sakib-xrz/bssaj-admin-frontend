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
  useGetSingleBlogQuery,
  useApproveOrRejectBlogMutation,
} from "@/redux/features/blog/blogApi";
import {
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  Eye,
  Clock,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";

interface BlogViewModalProps {
  blogId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Loading component
function BlogDetailsSkeleton() {
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

export function BlogViewModal({ blogId, isOpen, onClose }: BlogViewModalProps) {
  const [imageError, setImageError] = useState(false);
  const [approveOrRejectBlog, { isLoading: isActionLoading }] =
    useApproveOrRejectBlogMutation();

  const {
    data: blogData,
    isLoading,
    isError,
    error,
  } = useGetSingleBlogQuery(blogId, {
    skip: !blogId || !isOpen,
  });

  const blog = blogData?.data;

  const handleApproveReject = async (isApproved: boolean) => {
    if (!blog) return;

    try {
      await approveOrRejectBlog({
        id: blog.id,
        data: {
          id: blog.id,
          is_approved: isApproved,
          is_published: isApproved, // Auto-publish when approved
        },
      }).unwrap();

      toast.success(
        `Blog ${isApproved ? "approved" : "rejected"} successfully`
      );
      onClose();
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          `Failed to ${isApproved ? "approve" : "reject"} blog`
      );
    }
  };

  const getPublishStatusBadge = () => {
    if (!blog) return null;

    return blog.is_published ? (
      <Badge className="bg-blue-100 text-blue-800">Published</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Blog Post Details</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Complete information about the blog post
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && <BlogDetailsSkeleton />}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error && "data" in error && error.data
                ? `Error loading blog details: ${JSON.stringify(error.data)}`
                : "Failed to load blog details. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {blog && !isLoading && !isError && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {blog.cover_image && !imageError ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={blog.cover_image}
                      alt={`${blog.title} cover`}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white">
                    <FileText className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{blog.title}</h3>
                  <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                    {getPublishStatusBadge()}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Author and Metadata */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Author Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {blog.author?.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Author
                      </p>
                      <p className="text-sm">
                        {blog.author?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Created
                      </p>
                      <p className="text-sm">
                        {format(new Date(blog.created_at), "PPP")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image Section */}
            {blog.cover_image && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Cover Image
                  </h4>
                  <div className="w-full h-48 rounded-lg overflow-hidden relative">
                    <Image
                      src={blog.cover_image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Content
                </h4>
                <RichTextEditor
                  content={blog.content}
                  editable={false}
                  className="border-0"
                />
              </CardContent>
            </Card>

            {/* Approval Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approval Status
                </h4>
                {blog.is_approved === true ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Blog Approved
                      </span>
                    </div>
                    {blog.approved_by && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-green-700">
                          <strong>Approved by:</strong> {blog.approved_by.name}
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
                      This blog post is waiting for administrative approval
                      before it can be published.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Publishing Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Publishing Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Publication Status</p>
                    <p className="font-medium">
                      {blog.is_published ? "Published" : "Draft"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium">
                      {format(new Date(blog.updated_at), "PPP")}
                    </p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Blog ID:
                      </span>
                      <span className="ml-2 text-gray-600">{blog.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Author ID:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {blog.author?.id}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {blog.is_approved !== true && blog.is_approved !== false && (
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
                    Approve & Publish
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
