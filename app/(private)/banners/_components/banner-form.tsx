"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateBannerMutation,
  useUpdateBannerMutation,
} from "@/redux/features/banner/bannerApi";
import { Loader2, Upload, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface BannerFormData {
  title: string;
  description: string;
  link: string;
}

interface BannerFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    link?: string;
    image?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const bannerSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .required("Description is required"),
  link: Yup.string()
    .url("Please enter a valid URL")
    .required("Link is required"),
});

export function BannerForm({
  initialData,
  onSuccess,
  onCancel,
}: BannerFormProps) {
  const [
    createBanner,
    { isLoading: isCreating, isError: isCreateError, error: createError },
  ] = useCreateBannerMutation();
  const [
    updateBanner,
    { isLoading: isUpdating, isError: isUpdateError, error: updateError },
  ] = useUpdateBannerMutation();
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(
    initialData?.image || null
  );

  const isEditing = !!initialData?.id;
  const isLoading = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;

  const formik = useFormik<BannerFormData>({
    initialValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      link: initialData?.link || "",
    },
    validationSchema: bannerSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("link", values.link);

        if (bannerImage) {
          formData.append("image", bannerImage);
        } else if (!isEditing) {
          toast.error("Banner image is required");
          return;
        }

        if (isEditing && initialData?.id) {
          await updateBanner({
            id: initialData.id,
            data: formData,
          }).unwrap();
          toast.success("Banner updated successfully");
        } else {
          await createBanner(formData).unwrap();
          toast.success("Banner created successfully");
        }

        onSuccess?.();
      } catch (error: unknown) {
        const errorMessage = (error as { data?: { message?: string } })?.data
          ?.message;
        toast.error(
          errorMessage || `Failed to ${isEditing ? "update" : "create"} banner`
        );
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Banner" : "Create New Banner"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the banner information"
            : "Fill in the details to create a new banner"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {/* @ts-expect-error server error */}
              {error?.data?.message ||
                `Failed to ${
                  isEditing ? "update" : "create"
                } banner. Please try again.`}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter banner title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.title && formik.errors.title
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-sm text-red-500">{formik.errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter banner description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.description && formik.errors.description
                  ? "border-red-500"
                  : ""
              }
              rows={4}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-500">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Link URL *</Label>
            <div className="relative">
              <Input
                id="link"
                name="link"
                type="url"
                placeholder="https://example.com"
                value={formik.values.link}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.link && formik.errors.link
                    ? "border-red-500 pr-10"
                    : "pr-10"
                }
              />
              <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {formik.touched.link && formik.errors.link && (
              <p className="text-sm text-red-500">{formik.errors.link}</p>
            )}
          </div>

          {/* Banner Image */}
          <div className="space-y-2">
            <Label htmlFor="banner_image">
              Banner Image {!isEditing && "*"}
            </Label>
            <div className="flex flex-col gap-4">
              <Input
                id="banner_image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {bannerImagePreview ? (
                <div className="relative w-full h-48">
                  <Image
                    src={bannerImagePreview}
                    alt="Banner preview"
                    fill
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      URL.revokeObjectURL(bannerImagePreview);
                      setBannerImagePreview(null);
                      setBannerImage(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("banner_image")?.click()
                  }
                >
                  <Upload className="w-4 h-4" />
                  Upload Banner Image
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload a banner image for promotional content (recommended size:
              400x400px). {!isEditing && "Required for new banners."}
            </p>
          </div>

          {/* Information Cards */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Banner Guidelines
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Banner images should be high quality and eye-catching</li>
              <li>• Ensure the link URL is valid and accessible</li>
              <li>• Keep descriptions concise but informative</li>
              <li>• Use relevant titles that describe the promotion</li>
            </ul>
          </div>

          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">
                Update Information
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Existing banner will be updated with new information</li>
                <li>• Banner ID: {initialData?.id}</li>
                <li>
                  • Image update is optional - leave blank to keep current image
                </li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing
                ? isLoading
                  ? "Updating Banner..."
                  : "Update Banner"
                : isLoading
                ? "Creating Banner..."
                : "Create Banner"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
