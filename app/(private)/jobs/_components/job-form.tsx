"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import {
  useCreateJobMutation,
  useUpdateJobMutation,
} from "@/redux/features/job/jobApi";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface JobFormData {
  title: string;
  description: string;
  kind: "ON_SITE" | "REMOTE" | "HYBRID" | "";
  type:
    | "FULL_TIME"
    | "PART_TIME"
    | "INTERNSHIP"
    | "CONTRACT"
    | "FREELANCE"
    | "";
  company_name: string;
  company_website?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  experience_min?: number;
  salary_min?: number;
  salary_max?: number;
  deadline: string;
  apply_link: string;
  number_of_vacancies?: number;
  posted_by_agency_id?: string;
}

interface JobFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    kind?: "ON_SITE" | "REMOTE" | "HYBRID";
    type?: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "FREELANCE";
    company_name?: string;
    company_logo?: string;
    company_website?: string;
    company_email?: string;
    company_phone?: string;
    company_address?: string;
    experience_min?: number;
    salary_min?: number;
    salary_max?: number;
    deadline?: string;
    apply_link?: string;
    number_of_vacancies?: number;
    posted_by_agency_id?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const jobSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  kind: Yup.string().required("Job kind is required"),
  type: Yup.string().required("Job type is required"),
  company_name: Yup.string().required("Company name is required"),
  company_website: Yup.string().url("Must be a valid URL").optional(),
  company_email: Yup.string().email("Must be a valid email").optional(),
  apply_link: Yup.string()
    .url("Must be a valid URL")
    .required("Apply link is required"),
  deadline: Yup.string().required("Deadline is required"),
  experience_min: Yup.number()
    .min(0, "Experience must be 0 or greater")
    .optional(),
  salary_min: Yup.number().min(0, "Salary must be 0 or greater").optional(),
  salary_max: Yup.number().min(0, "Salary must be 0 or greater").optional(),
  number_of_vacancies: Yup.number().min(1, "Must be at least 1").optional(),
});

export function JobForm({ initialData, onSuccess, onCancel }: JobFormProps) {
  const [
    createJob,
    { isLoading: isCreating, isError: isCreateError, error: createError },
  ] = useCreateJobMutation();
  const [
    updateJob,
    { isLoading: isUpdating, isError: isUpdateError, error: updateError },
  ] = useUpdateJobMutation();
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(
    initialData?.company_logo || null
  );

  const isEditing = !!initialData?.id;
  const isLoading = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;

  const formik = useFormik<JobFormData>({
    initialValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      kind: initialData?.kind || "",
      type: initialData?.type || "",
      company_name: initialData?.company_name || "",
      company_website: initialData?.company_website || "",
      company_email: initialData?.company_email || "",
      company_phone: initialData?.company_phone || "",
      company_address: initialData?.company_address || "",
      experience_min: initialData?.experience_min || undefined,
      salary_min: initialData?.salary_min || undefined,
      salary_max: initialData?.salary_max || undefined,
      deadline: initialData?.deadline
        ? new Date(initialData.deadline).toISOString().split("T")[0]
        : "",
      apply_link: initialData?.apply_link || "",
      number_of_vacancies: initialData?.number_of_vacancies || undefined,
      posted_by_agency_id: initialData?.posted_by_agency_id || "",
    },
    validationSchema: jobSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        // Append all text fields
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== null) {
            if (key === "deadline") {
              // Convert date to ISO string for backend
              formData.append(key, new Date(value).toISOString());
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        // Append logo file if selected
        if (companyLogo) {
          formData.append("company_logo", companyLogo);
        }

        if (isEditing && initialData?.id) {
          await updateJob({
            id: initialData.id,
            data: formData,
          }).unwrap();
          toast.success("Job updated successfully");
        } else {
          await createJob(formData).unwrap();
          toast.success("Job created successfully");
        }

        onSuccess?.();
      } catch (error: unknown) {
        const errorMessage = (error as { data?: { message?: string } })?.data
          ?.message;
        toast.error(
          errorMessage || `Failed to ${isEditing ? "update" : "create"} job`
        );
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCompanyLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Job Posting" : "Create New Job Posting"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the job posting information"
            : "Fill in the details to create a new job posting"}
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
                } job posting. Please try again.`}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Senior Software Engineer"
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

            {/* Job Type and Kind */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Job Type *</Label>
                <Select
                  value={formik.values.type}
                  onValueChange={(value) => formik.setFieldValue("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="FREELANCE">Freelance</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <p className="text-sm text-red-500">{formik.errors.type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="kind">Work Location *</Label>
                <Select
                  value={formik.values.kind}
                  onValueChange={(value) => formik.setFieldValue("kind", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON_SITE">On-site</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.kind && formik.errors.kind && (
                  <p className="text-sm text-red-500">{formik.errors.kind}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <RichTextEditor
                content={formik.values.description}
                onChange={(content) =>
                  formik.setFieldValue("description", content)
                }
                placeholder="Describe the job responsibilities, requirements, and benefits..."
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
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company Information</h3>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                name="company_name"
                placeholder="e.g. Tech Solutions Inc"
                value={formik.values.company_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.company_name && formik.errors.company_name
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.company_name && formik.errors.company_name && (
                <p className="text-sm text-red-500">
                  {formik.errors.company_name}
                </p>
              )}
            </div>

            {/* Company Logo */}
            <div className="space-y-2">
              <Label htmlFor="company_logo">Company Logo (Optional)</Label>
              <div className="flex flex-col gap-4">
                <Input
                  id="company_logo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {companyLogoPreview ? (
                  <div className="relative w-32 h-32">
                    <Image
                      src={companyLogoPreview}
                      alt="Company logo preview"
                      fill
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => {
                        if (companyLogoPreview?.startsWith("blob:")) {
                          URL.revokeObjectURL(companyLogoPreview);
                        }
                        setCompanyLogoPreview(null);
                        setCompanyLogo(null);
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
                      document.getElementById("company_logo")?.click()
                    }
                  >
                    <Upload className="w-4 h-4" />
                    Upload Company Logo
                  </Button>
                )}
              </div>
            </div>

            {/* Company Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_website">Company Website</Label>
                <Input
                  id="company_website"
                  name="company_website"
                  type="url"
                  placeholder="https://company.com"
                  value={formik.values.company_website}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.company_website &&
                  formik.errors.company_website && (
                    <p className="text-sm text-red-500">
                      {formik.errors.company_website}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_email">Company Email</Label>
                <Input
                  id="company_email"
                  name="company_email"
                  type="email"
                  placeholder="hr@company.com"
                  value={formik.values.company_email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.company_email &&
                  formik.errors.company_email && (
                    <p className="text-sm text-red-500">
                      {formik.errors.company_email}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_phone">Company Phone</Label>
                <Input
                  id="company_phone"
                  name="company_phone"
                  placeholder="+1 (555) 123-4567"
                  value={formik.values.company_phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Company Address</Label>
                <Input
                  id="company_address"
                  name="company_address"
                  placeholder="123 Business St, City, State"
                  value={formik.values.company_address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience_min">Min Experience (Years)</Label>
                <Input
                  id="experience_min"
                  name="experience_min"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formik.values.experience_min || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_min">Min Salary</Label>
                <Input
                  id="salary_min"
                  name="salary_min"
                  type="number"
                  min="0"
                  placeholder="50000"
                  value={formik.values.salary_min || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_max">Max Salary</Label>
                <Input
                  id="salary_max"
                  name="salary_max"
                  type="number"
                  min="0"
                  placeholder="80000"
                  value={formik.values.salary_max || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number_of_vacancies">Number of Vacancies</Label>
                <Input
                  id="number_of_vacancies"
                  name="number_of_vacancies"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formik.values.number_of_vacancies || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline *</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formik.values.deadline}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.deadline && formik.errors.deadline
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.deadline && formik.errors.deadline && (
                  <p className="text-sm text-red-500">
                    {formik.errors.deadline}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apply_link">Application Link *</Label>
              <Input
                id="apply_link"
                name="apply_link"
                type="url"
                placeholder="https://company.com/jobs/apply"
                value={formik.values.apply_link}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.apply_link && formik.errors.apply_link
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.apply_link && formik.errors.apply_link && (
                <p className="text-sm text-red-500">
                  {formik.errors.apply_link}
                </p>
              )}
            </div>
          </div>

          {/* Information Cards */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Publishing Guidelines
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Job postings require approval before being published</li>
              <li>• Ensure all information is accurate and up-to-date</li>
              <li>• Company logo should be clear and professional</li>
              <li>
                • Application deadline should be realistic and future-dated
              </li>
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
                <li>• Job ID: {initialData?.id}</li>
                <li>• Make sure to update application deadline if needed</li>
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
                  ? "Updating Job..."
                  : "Update Job"
                : isLoading
                ? "Creating Job..."
                : "Create Job"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
