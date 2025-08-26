"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
} from "@/redux/features/gallery/galleryApi";
import { Loader2, Upload, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface GalleryFormData {
  title: string;
  link: string;
}

interface GalleryFormProps {
  initialData?: {
    id?: string;
    title?: string;
    link?: string;
    image?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const gallerySchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  link: Yup.string().url("Please enter a valid URL"),
});

export function GalleryForm({
  initialData,
  onSuccess,
  onCancel,
}: GalleryFormProps) {
  const [
    createGalleryItem,
    { isLoading: isCreating, isError: isCreateError, error: createError },
  ] = useCreateGalleryMutation();
  const [
    updateGalleryItem,
    { isLoading: isUpdating, isError: isUpdateError, error: updateError },
  ] = useUpdateGalleryMutation();
  const [galleryImage, setGalleryImage] = useState<File | null>(null);
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(
    initialData?.image || null
  );

  const isEditing = !!initialData?.id;
  const isLoading = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;

  const formik = useFormik<GalleryFormData>({
    initialValues: {
      title: initialData?.title || "",
      link: initialData?.link || "",
    },
    validationSchema: gallerySchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        if (values.title) {
          formData.append("title", values.title);
        }
        if (values.link) {
          formData.append("link", values.link);
        }

        if (galleryImage) {
          formData.append("image", galleryImage);
        } else if (!isEditing) {
          toast.error("Gallery image is required");
          return;
        }

        if (isEditing && initialData?.id) {
          await updateGalleryItem({
            id: initialData.id,
            data: formData,
          }).unwrap();
          toast.success("Gallery item updated successfully");
        } else {
          await createGalleryItem(formData).unwrap();
          toast.success("Gallery item created successfully");
        }

        onSuccess?.();
      } catch (error: unknown) {
        const errorMessage = (error as { data?: { message?: string } })?.data
          ?.message;
        toast.error(
          errorMessage ||
            `Failed to ${isEditing ? "update" : "create"} gallery item`
        );
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setGalleryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Gallery Item" : "Create New Gallery Item"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the gallery item information"
            : "Fill in the details to add a new image to the gallery"}
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
                } gallery item. Please try again.`}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter gallery item title (optional)"
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

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Link URL</Label>
            <div className="relative">
              <Input
                id="link"
                name="link"
                type="url"
                placeholder="https://example.com (optional)"
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

          {/* Gallery Image */}
          <div className="space-y-2">
            <Label htmlFor="gallery_image">
              Gallery Image {!isEditing && "*"}
            </Label>
            <div className="flex flex-col gap-4">
              <Input
                id="gallery_image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {galleryImagePreview ? (
                <div className="relative w-full h-48">
                  <Image
                    src={galleryImagePreview}
                    alt="Gallery preview"
                    fill
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      URL.revokeObjectURL(galleryImagePreview);
                      setGalleryImagePreview(null);
                      setGalleryImage(null);
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
                    document.getElementById("gallery_image")?.click()
                  }
                >
                  <Upload className="w-4 h-4" />
                  Upload Gallery Image
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload an image for the gallery (recommended size: 400x400px).{" "}
              {!isEditing && "Required for new gallery items."}
            </p>
          </div>

          {/* Information Cards */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Gallery Guidelines
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Gallery images should be high quality and visually appealing
              </li>
              <li>
                • Title and link are optional but can provide additional context
              </li>
              <li>• Ensure any link URL is valid and accessible</li>
              <li>• Images will be displayed in the public gallery section</li>
            </ul>
          </div>

          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">
                Update Information
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>
                  • Existing gallery item will be updated with new information
                </li>
                <li>• Gallery Item ID: {initialData?.id}</li>
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
                  ? "Updating Gallery Item..."
                  : "Update Gallery Item"
                : isLoading
                ? "Creating Gallery Item..."
                : "Create Gallery Item"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
