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
  useCreateScholarshipMutation,
  useUpdateScholarshipMutation,
} from "@/redux/features/scholarship/scholarshipApi";
import {
  Loader2,
  DollarSign,
  Calendar,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScholarshipFormData {
  title: string;
  description: string;
  eligibility: string;
  provider: string;
  amount: string;
  deadline: string;
  application_url: string;
}

interface ScholarshipFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    eligibility?: string;
    provider?: string;
    amount?: number;
    deadline?: string;
    application_url?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const scholarshipSchema = Yup.object({
  title: Yup.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters")
    .required("Description is required"),
  eligibility: Yup.string().max(
    1000,
    "Eligibility must be less than 1000 characters"
  ),
  provider: Yup.string().max(200, "Provider must be less than 200 characters"),
  amount: Yup.number()
    .positive("Amount must be a positive number")
    .max(1000000, "Amount must be less than 1,000,000"),
  deadline: Yup.date()
    .min(new Date(), "Deadline must be in the future")
    .required("Deadline is required"),
  application_url: Yup.string()
    .url("Please enter a valid URL")
    .required("Application URL is required"),
});

export function ScholarshipForm({
  initialData,
  onSuccess,
  onCancel,
}: ScholarshipFormProps) {
  const [
    createScholarship,
    { isLoading: isCreating, isError: isCreateError, error: createError },
  ] = useCreateScholarshipMutation();
  const [
    updateScholarship,
    { isLoading: isUpdating, isError: isUpdateError, error: updateError },
  ] = useUpdateScholarshipMutation();

  const isEditing = !!initialData?.id;
  const isLoading = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;

  // Format date for input (YYYY-MM-DDTHH:MM)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const formik = useFormik<ScholarshipFormData>({
    initialValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      eligibility: initialData?.eligibility || "",
      provider: initialData?.provider || "",
      amount: initialData?.amount ? initialData.amount.toString() : "",
      deadline: formatDateForInput(initialData?.deadline),
      application_url: initialData?.application_url || "",
    },
    validationSchema: scholarshipSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const scholarshipData = {
          title: values.title,
          description: values.description,
          eligibility: values.eligibility || undefined,
          provider: values.provider || undefined,
          amount: values.amount ? Number(values.amount) : undefined,
          deadline: new Date(values.deadline).toISOString(),
          application_url: values.application_url,
        };

        if (isEditing && initialData?.id) {
          await updateScholarship({
            id: initialData.id,
            data: scholarshipData,
          }).unwrap();
          toast.success("Scholarship updated successfully");
        } else {
          await createScholarship(scholarshipData).unwrap();
          toast.success("Scholarship created successfully");
        }

        onSuccess?.();
      } catch (error: unknown) {
        const errorMessage = (error as { data?: { message?: string } })?.data
          ?.message;
        toast.error(
          errorMessage ||
            `Failed to ${isEditing ? "update" : "create"} scholarship`
        );
      }
    },
  });

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          {isEditing ? "Edit Scholarship" : "Create New Scholarship"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the scholarship details below"
            : "Fill in the details to create a new scholarship opportunity"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {/* @ts-expect-error server error */}
              {error?.data?.message ||
                `Failed to ${isEditing ? "update" : "create"} scholarship`}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter scholarship title..."
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

              {/* Provider */}
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  name="provider"
                  placeholder="Enter scholarship provider..."
                  value={formik.values.provider}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.provider && formik.errors.provider
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.provider && formik.errors.provider && (
                  <p className="text-sm text-red-500">
                    {formik.errors.provider}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Scholarship Amount (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Enter amount..."
                    className={
                      formik.touched.amount && formik.errors.amount
                        ? "border-red-500 pl-9"
                        : "pl-9"
                    }
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.amount && formik.errors.amount && (
                  <p className="text-sm text-red-500">{formik.errors.amount}</p>
                )}
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">
                  Application Deadline <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="deadline"
                    name="deadline"
                    type="datetime-local"
                    className={
                      formik.touched.deadline && formik.errors.deadline
                        ? "border-red-500 pl-9"
                        : "pl-9"
                    }
                    value={formik.values.deadline}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.deadline && formik.errors.deadline && (
                  <p className="text-sm text-red-500">
                    {formik.errors.deadline}
                  </p>
                )}
              </div>

              {/* Application URL */}
              <div className="space-y-2">
                <Label htmlFor="application_url">
                  Application URL <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="application_url"
                    name="application_url"
                    type="url"
                    placeholder="https://example.com/apply"
                    className={
                      formik.touched.application_url &&
                      formik.errors.application_url
                        ? "border-red-500 pl-9"
                        : "pl-9"
                    }
                    value={formik.values.application_url}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.application_url &&
                  formik.errors.application_url && (
                    <p className="text-sm text-red-500">
                      {formik.errors.application_url}
                    </p>
                  )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter detailed description of the scholarship..."
                  rows={6}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.description && formik.errors.description
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-sm text-red-500">
                    {formik.errors.description}
                  </p>
                )}
                <div className="text-right text-sm text-gray-500">
                  {formik.values.description.length}/2000 characters
                </div>
              </div>

              {/* Eligibility */}
              <div className="space-y-2">
                <Label htmlFor="eligibility">Eligibility Criteria</Label>
                <Textarea
                  id="eligibility"
                  name="eligibility"
                  placeholder="Enter eligibility requirements..."
                  rows={6}
                  value={formik.values.eligibility}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.eligibility && formik.errors.eligibility
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.eligibility && formik.errors.eligibility && (
                  <p className="text-sm text-red-500">
                    {formik.errors.eligibility}
                  </p>
                )}
                <div className="text-right text-sm text-gray-500">
                  {formik.values.eligibility.length}/1000 characters
                </div>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Scholarship Guidelines
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Provide clear and accurate scholarship information</li>
              <li>• Ensure the application URL is valid and accessible</li>
              <li>• Set realistic deadlines for applications</li>
              <li>• Include detailed eligibility criteria when applicable</li>
            </ul>
          </div>

          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">
                Update Information
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>
                  • Existing scholarship will be updated with new information
                </li>
                <li>• Scholarship ID: {initialData?.id}</li>
                <li>• All changes will be reflected immediately</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
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
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing
                ? isLoading
                  ? "Updating..."
                  : "Update Scholarship"
                : isLoading
                ? "Creating..."
                : "Create Scholarship"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
