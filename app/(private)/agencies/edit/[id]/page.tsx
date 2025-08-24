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
import { useParams, useRouter } from "next/navigation";
import Container from "@/components/shared/container";
import {
  useGetAgencyByIdQuery,
  useUpdateAgencyMutation,
} from "@/redux/features/agency/agencyApi";
import { toast } from "sonner";

const agencySchema = Yup.object({
  name: Yup.string()
    .required("Agency name is required")
    .min(2, "Name must be at least 2 characters"),
  contact_email: Yup.string()
    .email("Invalid email format")
    .required("Contact email is required"),
  agency_email: Yup.string().email("Invalid email format").nullable(),
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

export default function EditAgencyPage() {
  const params = useParams();
  const router = useRouter();
  const agencyId = params.id as string;

  const {
    data: agencyData,
    isLoading: isLoadingAgency,
    isError: isAgencyError,
  } = useGetAgencyByIdQuery(agencyId);

  const [updateAgency, { isLoading, isError, error }] =
    useUpdateAgencyMutation();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(
    null
  );

  const agency = agencyData?.data;

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      if (coverPhotoPreview) {
        URL.revokeObjectURL(coverPhotoPreview);
      }
    };
  }, [logoPreview, coverPhotoPreview]);

  const formik = useFormik({
    initialValues: {
      name: "",
      contact_email: "",
      agency_email: "",
      contact_phone: "",
      website: "",
      director_name: "",
      established_year: "",
      description: "",
      address: "",
      facebook_url: "",
    },
    validationSchema: agencySchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        // Append agency fields
        for (const key in values) {
          if (Object.prototype.hasOwnProperty.call(values, key)) {
            const value = values[key as keyof typeof values];
            if (key === "established_year") {
              if (value) {
                formData.append(key, String(Number(value)));
              }
            } else if (value !== null && value !== undefined && value !== "") {
              formData.append(key, value);
            }
          }
        }

        // Append logo file if changed
        if (logoFile) {
          formData.append("logo", logoFile);
        }

        // Append cover photo file if changed
        if (coverPhotoFile) {
          formData.append("cover_photo", coverPhotoFile);
        }

        // Use RTK Query mutation
        await updateAgency({ id: agencyId, data: formData }).unwrap();

        // Success actions
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoFile(null);
        setLogoPreview(null);
        if (coverPhotoPreview) URL.revokeObjectURL(coverPhotoPreview);
        setCoverPhotoFile(null);
        setCoverPhotoPreview(null);

        // Navigate to agencies list
        router.push("/agencies");
        toast.success("Agency updated successfully");
      } catch (error) {
        console.error("Error updating agency:", error);
        toast.error("Failed to update agency");
      }
    },
  });

  // Update form values when agency data is loaded
  useEffect(() => {
    if (agency) {
      formik.setValues({
        name: agency.name || "",
        contact_email: agency.contact_email || "",
        agency_email: agency.agency_email || "",
        contact_phone: agency.contact_phone || "",
        website: agency.website || "",
        director_name: agency.director_name || "",
        established_year: agency.established_year
          ? String(agency.established_year)
          : "",
        description: agency.description || "",
        address: agency.address || "",
        facebook_url: agency.facebook_url || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agency]);

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

  const handleCoverPhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (coverPhotoPreview) {
      URL.revokeObjectURL(coverPhotoPreview);
    }
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCoverPhotoPreview(previewUrl);
      setCoverPhotoFile(file);
    } else {
      setCoverPhotoPreview(null);
      setCoverPhotoFile(null);
    }
  };

  if (isLoadingAgency) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
      </Container>
    );
  }

  if (isAgencyError || !agency) {
    return (
      <Container>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load agency details. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/agencies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Agencies
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">Edit Agency</h1>
            <p className="text-gray-600">Update agency information</p>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Agency Information</CardTitle>
            <CardDescription>Update the agency details below</CardDescription>
          </CardHeader>
          <CardContent>
            {isError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  {/* @ts-expect-error server error */}
                  {error?.data?.message ||
                    "Failed to update agency. Please try again."}
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
                    {logoPreview || agency.logo ? (
                      <div className="relative w-40 h-40">
                        <Image
                          src={logoPreview || agency.logo}
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
                            if (logoPreview) URL.revokeObjectURL(logoPreview);
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
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_photo">Agency Cover Photo</Label>
                  <div className="flex flex-col gap-4">
                    <Input
                      id="cover_photo"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverPhotoChange}
                      className="hidden"
                    />
                    {coverPhotoPreview || agency.cover_photo ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={coverPhotoPreview || agency.cover_photo}
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
                            if (coverPhotoPreview)
                              URL.revokeObjectURL(coverPhotoPreview);
                            setCoverPhotoPreview(null);
                            setCoverPhotoFile(null);
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
                        <Upload className="w-4 h-4" />
                        Upload Cover Photo
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
                    <Label htmlFor="agency_email">Agency Email</Label>
                    <Input
                      id="agency_email"
                      name="agency_email"
                      type="email"
                      placeholder="Enter agency email"
                      value={formik.values.agency_email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.agency_email &&
                        formik.errors.agency_email
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.agency_email &&
                      formik.errors.agency_email && (
                        <p className="text-sm text-red-500">
                          {formik.errors.agency_email}
                        </p>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="flex justify-end space-x-4">
                <Link href="/agencies">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Updating Agency..." : "Update Agency"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
