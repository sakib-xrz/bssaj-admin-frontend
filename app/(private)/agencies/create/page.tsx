"use client";

import type React from "react";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/shared/container";
import { useCreateAgencyMutation } from "@/redux/features/agency/agencyApi";
import { toast } from "sonner";

const agencySchema = Yup.object({
  name: Yup.string()
    .required("Agency name is required")
    .min(2, "Name must be at least 2 characters"),
  contact_email: Yup.string()
    .email("Invalid email format")
    .required("Contact email is required"),
  contact_phone: Yup.string(),
  website: Yup.string().url("Invalid URL format"),
  director_name: Yup.string(),
  established_year: Yup.number()
    .typeError("Established year must be a number")
    .min(1900, "Invalid year")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .nullable(),
  description: Yup.string(),
  address: Yup.string(),
  facebook_url: Yup.string().url("Invalid URL format"),
});

export default function CreateAgencyPage() {
  const router = useRouter();
  const [createAgency, { isLoading, isError, error }] =
    useCreateAgencyMutation();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [successStoryImages, setSuccessStoryImages] = useState<File[]>([]);
  const [successStoryPreviews, setSuccessStoryPreviews] = useState<string[]>(
    []
  );

  console.log(logoFile);

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      successStoryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [logoPreview, successStoryPreviews]);

  const formik = useFormik({
    initialValues: {
      name: "Dev Agency",
      contact_email: "dev@agency.com",
      contact_phone: "1234567890",
      website: "https://devagency.com",
      director_name: "Dev Director",
      established_year: "2025",
      description: "Dev Agency Description",
      address: "Dev Address",
      facebook_url: "https://facebook.com/devagency",
    },
    validationSchema: agencySchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        // Append user and agency fields
        for (const key in values) {
          if (Object.prototype.hasOwnProperty.call(values, key)) {
            const value = values[key as keyof typeof values];
            if (key === "established_year") {
              if (value) {
                formData.append(key, String(Number(value)));
              }
            } else if (value !== null && value !== undefined) {
              formData.append(key, value);
            }
          }
        }

        // Append logo file
        if (logoFile) {
          formData.append("logo", logoFile);
        }

        // Append success story images
        successStoryImages.forEach((file, index) => {
          formData.append(`successStoryImages[${index}]`, file);
        });

        // Add static status fields
        formData.append("status", "PENDING");
        formData.append("is_approved", "false");
        formData.append("is_deleted", "false");

        // Use RTK Query mutation
        const result = await createAgency(formData).unwrap();
        console.log("Agency created successfully:", result);

        // Success actions
        formik.resetForm();
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoFile(null);
        setLogoPreview(null);
        successStoryPreviews.forEach((url) => URL.revokeObjectURL(url));
        setSuccessStoryImages([]);
        setSuccessStoryPreviews([]);

        // Navigate to agencies list
        router.push("/agencies");
        toast.success("Agency created successfully");
      } catch (error) {
        console.error("Error creating agency:", error);
        toast.error("Failed to create agency");
      }
    },
  });

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setLogoFile(file);
    } else {
      setLogoPreview(null);
      setLogoFile(null);
    }
  };

  const handleSuccessStoryImagesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));

    setSuccessStoryPreviews((prev) => [...prev, ...newPreviews]);
    setSuccessStoryImages((prev) => [...prev, ...selectedFiles]);

    // Clear the input value to allow selecting the same file(s) again
    event.target.value = "";
  };

  const handleRemoveSuccessStory = (index: number) => {
    URL.revokeObjectURL(successStoryPreviews[index]);

    setSuccessStoryPreviews((prev) => prev.filter((_, i) => i !== index));
    setSuccessStoryImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/agencies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Agencies
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Agency</h1>
            <p className="text-gray-600">Register a new agency in the system</p>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Agency Information</CardTitle>
            <CardDescription>
              Fill in the details to register a new agency
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  {/* @ts-expect-error server error */}
                  {error?.data?.message ||
                    "Failed to create agency. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agency Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter agency name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.name && formik.errors.name
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-sm text-red-500">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="director_name">Director Name</Label>
                    <Input
                      id="director_name"
                      name="director_name"
                      placeholder="Enter director name"
                      value={formik.values.director_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Agency Logo</Label>
                  <div className="flex flex-col gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    {logoPreview ? (
                      <div className="relative w-40 h-40">
                        <Image
                          src={logoPreview}
                          alt="Logo preview"
                          width={160}
                          height={160}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => {
                            URL.revokeObjectURL(logoPreview);
                            setLogoPreview(null);
                            setLogoFile(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("logo")?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter agency description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={4}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      placeholder="Enter contact email"
                      value={formik.values.contact_email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.contact_email &&
                        formik.errors.contact_email
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.contact_email &&
                      formik.errors.contact_email && (
                        <p className="text-sm text-red-500">
                          {formik.errors.contact_email}
                        </p>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      name="contact_phone"
                      placeholder="Enter contact phone"
                      value={formik.values.contact_phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Enter agency address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      placeholder="https://example.com"
                      value={formik.values.website}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.website && formik.errors.website
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.website && formik.errors.website && (
                      <p className="text-sm text-red-500">
                        {formik.errors.website}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook_url">Facebook URL</Label>
                    <Input
                      id="facebook_url"
                      name="facebook_url"
                      placeholder="https://facebook.com/agency"
                      value={formik.values.facebook_url}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.facebook_url &&
                        formik.errors.facebook_url
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.facebook_url &&
                      formik.errors.facebook_url && (
                        <p className="text-sm text-red-500">
                          {formik.errors.facebook_url}
                        </p>
                      )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="established_year">Established Year</Label>
                  <Input
                    id="established_year"
                    name="established_year"
                    type="number"
                    placeholder="2020"
                    value={formik.values.established_year}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.established_year &&
                      formik.errors.established_year
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.established_year &&
                    formik.errors.established_year && (
                      <p className="text-sm text-red-500">
                        {formik.errors.established_year}
                      </p>
                    )}
                </div>
              </div>

              {/* Success Stories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Success Stories
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="success_stories">Success Story Images</Label>
                  <div className="flex flex-col gap-4">
                    <Input
                      id="success_stories"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleSuccessStoryImagesChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("success_stories")?.click()
                      }
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Success Story Images
                    </Button>
                    {successStoryImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {successStoryImages.map((file, index) => (
                          <div
                            key={file.name + index}
                            className="relative w-full aspect-square"
                          >
                            <Image
                              src={successStoryPreviews[index]}
                              alt={`Success story ${index + 1}`}
                              fill
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                              onClick={() => handleRemoveSuccessStory(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/agencies">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading || !formik.isValid}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Creating Agency..." : "Create Agency"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
