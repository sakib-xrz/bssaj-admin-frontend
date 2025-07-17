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
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/shared/container";
import { useCreateAgencyMutation } from "@/redux/features/agency/agencyApi";
import { useSearchUsersQuery } from "@/redux/features/user/userApi";
import { SearchSelect } from "@/components/shared/search-and-select";
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
  user_selection_type: Yup.string().required("Please select user type"),
  user_id: Yup.string().when("user_selection_type", {
    is: "existing",
    then: (schema) => schema.required("Please select a user"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function CreateAgencyPage() {
  const router = useRouter();
  const [createAgency, { isLoading, isError, error }] =
    useCreateAgencyMutation();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(
    null
  );
  interface SuccessStoryImage {
    id: string;
    file: File;
    preview: string;
  }
  const [successStoryImages, setSuccessStoryImages] = useState<
    SuccessStoryImage[]
  >([]);

  // User cache for search select
  const usersCache = useRef(new Map());

  console.log(logoFile);

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      if (coverPhotoPreview) {
        URL.revokeObjectURL(coverPhotoPreview);
      }
      successStoryImages.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [logoPreview, coverPhotoPreview, successStoryImages]);

  const formik = useFormik({
    initialValues: {
      name: "",
      contact_email: "",
      contact_phone: "",
      website: "",
      director_name: "",
      established_year: "",
      description: "",
      address: "",
      facebook_url: "",
      user_selection_type: "new",
      user_id: "",
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
            } else if (key === "user_selection_type") {
              formData.append(key, value);
            } else if (
              key === "user_id" &&
              values.user_selection_type === "existing"
            ) {
              formData.append(key, value);
            } else if (
              key !== "user_selection_type" &&
              key !== "user_id" &&
              value !== null &&
              value !== undefined
            ) {
              formData.append(key, value);
            }
          }
        }

        // Append logo file
        if (logoFile) {
          formData.append("logo", logoFile);
        }

        // Append cover photo file
        if (coverPhotoFile) {
          formData.append("cover_photo", coverPhotoFile);
        }

        // Append success story images
        successStoryImages.forEach((item, index) => {
          formData.append(`successStoryImages[${index}]`, item.file);
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
        if (coverPhotoPreview) URL.revokeObjectURL(coverPhotoPreview);
        setCoverPhotoFile(null);
        setCoverPhotoPreview(null);
        successStoryImages.forEach((item) => URL.revokeObjectURL(item.preview));
        setSuccessStoryImages([]);

        // Navigate to agencies list
        router.push("/agencies");
        toast.success("Agency created successfully");
      } catch (error) {
        console.error("Error creating agency:", error);
        toast.error("Failed to create agency");
      }
    },
  });

  // Transform user data for SearchSelect
  const transformUserData = useMemo(
    () => (data: unknown) => {
      const apiData = data as {
        data?: Array<{ id: string; name: string; email: string }>;
      };
      if (!apiData?.data) return [];

      return apiData.data.map((user) => {
        // Cache the user data
        usersCache.current.set(user.id, user);

        return {
          label: `${user.name} (${user.email})`,
          value: user.id,
        };
      });
    },
    []
  );

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    formik.setFieldValue("user_id", userId);

    // If a user is selected, auto-fill contact email and director name
    if (userId && usersCache.current.has(userId)) {
      const selectedUser = usersCache.current.get(userId);
      formik.setFieldValue("contact_email", selectedUser.email);
      formik.setFieldValue("director_name", selectedUser.name);
    }
  };

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

  const handleSuccessStoryImagesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);

    const newItems = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setSuccessStoryImages((prev) => [...prev, ...newItems]);

    // Clear the input value to allow selecting the same file(s) again
    event.target.value = "";
  };

  const handleRemoveSuccessStory = (id: string) => {
    const itemToRemove = successStoryImages.find((item) => item.id === id);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.preview);
    }

    setSuccessStoryImages((prev) => prev.filter((item) => item.id !== id));
  };

  console.log(formik.values);

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
              {/* User Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  User Selection
                </h3>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="user_selection_type"
                        value="new"
                        checked={formik.values.user_selection_type === "new"}
                        onChange={(e) => {
                          formik.handleChange(e);
                          formik.setFieldValue("user_id", "");
                          formik.setFieldValue("contact_email", "");
                          formik.setFieldValue("director_name", "");
                        }}
                        className="w-4 h-4 accent-primary"
                      />
                      Create new user
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="user_selection_type"
                        value="existing"
                        checked={
                          formik.values.user_selection_type === "existing"
                        }
                        onChange={(e) => {
                          formik.handleChange(e);
                          // Clear user_id when switching to existing
                          if (e.target.value === "existing") {
                            formik.setFieldValue("user_id", "");
                            formik.setFieldValue("contact_email", "");
                            formik.setFieldValue("director_name", "");
                          }
                        }}
                        className="w-4 h-4 accent-primary"
                      />
                      Select existing user
                    </Label>
                  </div>

                  {formik.touched.user_selection_type &&
                    formik.errors.user_selection_type && (
                      <p className="text-sm text-red-500">
                        {formik.errors.user_selection_type}
                      </p>
                    )}
                </div>

                {/* Existing User Selection */}
                {formik.values.user_selection_type === "existing" && (
                  <div className="space-y-2">
                    <SearchSelect
                      label="Select User *"
                      placeholder="Type to search for users..."
                      value={formik.values.user_id}
                      onChange={handleUserSelect}
                      useSearchQuery={useSearchUsersQuery}
                      searchParams={{ limit: 20 }}
                      transformData={transformUserData}
                      selectedOptionLabel={
                        formik.values.user_id &&
                        usersCache.current.has(formik.values.user_id)
                          ? `${
                              usersCache.current.get(formik.values.user_id)!
                                .name
                            } (${
                              usersCache.current.get(formik.values.user_id)!
                                .email
                            })`
                          : undefined
                      }
                      className={
                        formik.touched.user_id && formik.errors.user_id
                          ? "border-red-500"
                          : ""
                      }
                      emptyMessage="No users found matching your search"
                    />
                    {formik.touched.user_id && formik.errors.user_id && (
                      <p className="text-sm text-red-500">
                        {formik.errors.user_id}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Search for users to create an agency for them
                    </p>
                  </div>
                )}
              </div>

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
                    <Label htmlFor="director_name">
                      Director Name{" "}
                      {formik.values.user_selection_type === "new"
                        ? ""
                        : "(Auto-filled from user)"}
                    </Label>
                    <Input
                      id="director_name"
                      name="director_name"
                      placeholder="Enter director name"
                      value={formik.values.director_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={
                        formik.values.user_selection_type === "existing"
                      }
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
                  <Label htmlFor="cover_photo">
                    Agency Cover Photo (Optional)
                  </Label>
                  <div className="flex flex-col gap-4">
                    <Input
                      id="cover_photo"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverPhotoChange}
                      className="hidden"
                    />
                    {coverPhotoPreview ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={coverPhotoPreview}
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
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Cover Photo
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload a cover photo to showcase your agency (recommended
                    size: 1200x400px)
                  </p>
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
                    <Label htmlFor="contact_email">
                      Contact Email *{" "}
                      {formik.values.user_selection_type === "existing"
                        ? "(Auto-filled from user)"
                        : ""}
                    </Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      placeholder="Enter contact email"
                      value={formik.values.contact_email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={
                        formik.values.user_selection_type === "existing"
                      }
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
                        {successStoryImages.map((item, index) => (
                          <div
                            key={item.id}
                            className="relative w-full aspect-square"
                          >
                            <Image
                              src={item.preview}
                              alt={`Success story ${index + 1}`}
                              fill
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                              onClick={() => handleRemoveSuccessStory(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload success story images to showcase your agency (max 5
                    images)
                  </p>
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
