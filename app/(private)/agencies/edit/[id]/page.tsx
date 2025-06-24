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
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import Container from "@/components/shared/container";

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
    .min(1900, "Invalid year")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  description: Yup.string(),
  address: Yup.string(),
  facebook_url: Yup.string().url("Invalid URL format"),
  message_from_director: Yup.string(),
  services_offered: Yup.string(),
});

// Mock agency data - replace with actual API call
const mockAgency = {
  id: "1",
  name: "Global Education Consultancy",
  contact_email: "info@globaledu.com",
  contact_phone: "+1234567890",
  website: "https://globaledu.com",
  director_name: "John Smith",
  established_year: 2015,
  description:
    "Leading education consultancy helping students achieve their dreams",
  address: "123 Education Street, Tokyo, Japan",
  facebook_url: "https://facebook.com/globaledu",
  message_from_director:
    "We are committed to providing the best educational guidance.",
  services_offered:
    "Study abroad consulting, visa assistance, scholarship guidance",
  is_deleted: false,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z",
};

export default function EditAgencyPage() {
  const params = useParams();
  const agencyId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [agency] = useState(mockAgency);

  const formik = useFormik({
    initialValues: {
      name: agency.name,
      contact_email: agency.contact_email,
      contact_phone: agency.contact_phone || "",
      website: agency.website || "",
      director_name: agency.director_name || "",
      established_year: agency.established_year?.toString() || "",
      description: agency.description || "",
      address: agency.address || "",
      facebook_url: agency.facebook_url || "",
      message_from_director: agency.message_from_director || "",
      services_offered: agency.services_offered || "",
    },
    validationSchema: agencySchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        console.log("Updating agency:", agencyId, values, "Logo:", logoFile);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error updating agency:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Agency</h1>
            <p className="text-gray-600">
              Update agency information and details
            </p>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Agency Information</CardTitle>
            <CardDescription>Update the agency details below</CardDescription>
          </CardHeader>
          <CardContent>
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
                  <div className="flex items-center space-x-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {logoFile ? "Change Logo" : "Upload Logo"}
                    </Button>
                    {logoFile && (
                      <span className="text-sm text-gray-600">
                        {logoFile.name}
                      </span>
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

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Additional Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="services_offered">Services Offered</Label>
                  <Textarea
                    id="services_offered"
                    name="services_offered"
                    placeholder="Describe the services offered by the agency"
                    value={formik.values.services_offered}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message_from_director">
                    Message from Director
                  </Label>
                  <Textarea
                    id="message_from_director"
                    name="message_from_director"
                    placeholder="Enter message from director"
                    value={formik.values.message_from_director}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/agencies">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? "Updating..." : "Update Agency"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
