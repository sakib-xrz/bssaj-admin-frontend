"use client";

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
  useCreateNewsMutation,
  useUpdateNewsMutation,
} from "@/redux/features/news/newsApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NewsFormData {
  title: string;
  content: string;
}

interface NewsFormProps {
  initialData?: {
    id?: string;
    title?: string;
    content?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const newsSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .required("Title is required"),
  content: Yup.string()
    .min(10, "Content must be at least 10 characters")
    .required("Content is required"),
});

export function NewsForm({ initialData, onSuccess, onCancel }: NewsFormProps) {
  const [
    createNews,
    { isLoading: isCreating, isError: isCreateError, error: createError },
  ] = useCreateNewsMutation();
  const [
    updateNews,
    { isLoading: isUpdating, isError: isUpdateError, error: updateError },
  ] = useUpdateNewsMutation();

  const isEditing = !!initialData?.id;
  const isLoading = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;

  const formik = useFormik<NewsFormData>({
    initialValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
    },
    validationSchema: newsSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (isEditing && initialData?.id) {
          await updateNews({
            id: initialData.id,
            data: values,
          }).unwrap();
          toast.success("News updated successfully");
        } else {
          await createNews(values).unwrap();
          toast.success("News created successfully");
        }

        onSuccess?.();
      } catch (error: unknown) {
        const errorMessage = (error as { data?: { message?: string } })?.data
          ?.message;
        toast.error(
          errorMessage || `Failed to ${isEditing ? "update" : "create"} news`
        );
      }
    },
  });

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit News" : "Create New News"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the news information"
            : "Fill in the details to create a new news item"}
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
                } news. Please try again.`}
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
              placeholder="Enter news title"
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

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Enter news content..."
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={10}
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
              <li>• News items are published immediately upon creation</li>
              <li>
                • Ensure content is accurate and relevant to the organization
              </li>
              <li>• Use clear and concise language</li>
              <li>• Include all necessary details and contact information</li>
            </ul>
          </div>

          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">
                Update Information
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Changes will be visible immediately after saving</li>
                <li>• News ID: {initialData?.id}</li>
                <li>• Keep the content informative and up-to-date</li>
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
                  ? "Updating News..."
                  : "Update News"
                : isLoading
                ? "Creating News..."
                : "Create News"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
