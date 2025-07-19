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
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from "@/redux/features/blog/blogApi";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface BlogFormData {
  title: string;
  content: string;
}

interface BlogFormProps {
  initialData?: {
    id?: string;
    title?: string;
    content?: string;
    cover_image?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const blogSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .required("Title is required"),
  content: Yup.string()
    .min(10, "Content must be at least 10 characters")
    .required("Content is required"),
});

export function BlogForm({ initialData, onSuccess, onCancel }: BlogFormProps) {
  const [
    createBlog,
    { isLoading: isCreating, isError: isCreateError, error: createError },
  ] = useCreateBlogMutation();
  const [
    updateBlog,
    { isLoading: isUpdating, isError: isUpdateError, error: updateError },
  ] = useUpdateBlogMutation();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    initialData?.cover_image || null
  );

  const isEditing = !!initialData?.id;
  const isLoading = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;

  const formik = useFormik<BlogFormData>({
    initialValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
    },
    validationSchema: blogSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("content", values.content);

        // FIXED: Changed from 'file' to 'cover_image' to match backend expectation
        if (coverImage) {
          formData.append("cover_image", coverImage);
        }

        if (isEditing && initialData?.id) {
          await updateBlog({
            id: initialData.id,
            data: formData,
          }).unwrap();
          toast.success("Blog updated successfully");
        } else {
          await createBlog(formData).unwrap();
          toast.success("Blog created successfully");
        }

        onSuccess?.();
      } catch (error: unknown) {
        const errorMessage = (error as { data?: { message?: string } })?.data
          ?.message;
        toast.error(
          errorMessage || `Failed to ${isEditing ? "update" : "create"} blog`
        );
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the blog post information"
            : "Fill in the details to create a new blog post"}
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
                } blog post. Please try again.`}
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
              placeholder="Enter blog title"
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

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="cover_photo">Cover Image (Optional)</Label>
            <div className="flex flex-col gap-4">
              <Input
                id="cover_photo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {coverImagePreview ? (
                <div className="relative w-full h-48">
                  <Image
                    src={coverImagePreview}
                    alt="Cover photo preview"
                    fill
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      URL.revokeObjectURL(coverImagePreview);
                      setCoverImagePreview(null);
                      setCoverImage(null);
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
                    document.getElementById("cover_photo")?.click()
                  }
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Cover Image
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload a cover image to showcase your blog (recommended size:
              1200x400px)
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <RichTextEditor
              content={formik.values.content}
              onChange={(content) => formik.setFieldValue("content", content)}
              placeholder="Start writing your blog content..."
              className={
                formik.touched.content && formik.errors.content
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.content && formik.errors.content && (
              <p className="text-sm text-red-500">{formik.errors.content}</p>
            )}
          </div>

          {/* Information Cards */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Publishing Guidelines
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Blog posts require approval before being published</li>
              <li>• Ensure content is relevant to the organization</li>
              <li>• Use proper formatting and check for spelling errors</li>
              <li>• Cover images should be high quality and relevant</li>
            </ul>
          </div>

          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">
                Update Information
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>
                  • Changes will require re-approval if previously approved
                </li>
                <li>• Blog ID: {initialData?.id}</li>
                <li>• Keep the content engaging and informative</li>
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
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing
                ? isLoading
                  ? "Updating Blog..."
                  : "Update Blog"
                : isLoading
                ? "Creating Blog..."
                : "Create Blog"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
