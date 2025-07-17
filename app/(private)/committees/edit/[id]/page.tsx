"use client";

import { useFormik } from "formik";
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
import { ArrowLeft, User, Upload, X, Calendar, Crown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@/components/shared/container";
import {
  useGetCommitteeByIdQuery,
  useUpdateCommitteeMutation,
} from "@/redux/features/committee/committeeApi";
import { toast } from "sonner";

const designations = [
  { value: "PRESIDENT", label: "President" },
  { value: "SR_VICE_PRESIDENT", label: "Sr. Vice President" },
  { value: "VICE_PRESIDENT", label: "Vice President" },
  { value: "GENERAL_SECRETARY", label: "General Secretary" },
  { value: "JOINT_GENERAL_SECRETARY", label: "Joint General Secretary" },
  { value: "TREASURER", label: "Treasurer" },
  { value: "JOINT_TREASURER", label: "Joint Treasurer" },
  { value: "EXECUTIVE_MEMBER", label: "Executive Member" },
  { value: "ADVISOR", label: "Advisor" },
  { value: "OTHER", label: "Other" },
];

export default function EditCommitteePage() {
  const params = useParams();
  const router = useRouter();
  const committeeId = params.id as string;

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);

  // Fetch committee data
  const { data: committeeData, isLoading } =
    useGetCommitteeByIdQuery(committeeId);
  const [updateCommittee] = useUpdateCommitteeMutation();

  const committee = committeeData?.data;

  useEffect(() => {
    return () => {
      if (profilePicturePreview) {
        URL.revokeObjectURL(profilePicturePreview);
      }
    };
  }, [profilePicturePreview]);

  const formik = useFormik({
    initialValues: {
      name: committee?.name || "",
      designation: committee?.designation || "",
      term_start_year: committee?.term_start_year || "",
      term_end_year: committee?.term_end_year || "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        formData.append("name", values.name);
        formData.append(
          "designation",
          values.designation || committee?.designation
        );
        formData.append(
          "term_start_year",
          String(Number(values.term_start_year))
        );
        formData.append("term_end_year", String(Number(values.term_end_year)));

        // Append profile picture if provided
        if (profilePictureFile) {
          formData.append("profile_picture", profilePictureFile);
        }

        await updateCommittee({
          id: committeeId,
          data: formData,
        }).unwrap();

        toast.success("Committee member updated successfully");
        router.push("/committees");
      } catch (error) {
        console.error("Error updating committee member:", error);
        toast.error("Failed to update committee member");
      }
    },
  });

  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (profilePicturePreview) {
      URL.revokeObjectURL(profilePicturePreview);
    }
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(previewUrl);
      setProfilePictureFile(file);
    } else {
      setProfilePicturePreview(null);
      setProfilePictureFile(null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!committee) {
    return <div>Committee member not found</div>;
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/committees">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Committee
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Committee Member
            </h1>
            <p className="text-gray-600">
              Update committee member information and designation
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Committee Member Information</CardTitle>
            <CardDescription>
              Update the committee member details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`pl-10 ${
                      formik.touched.name && formik.errors.name
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-red-500">
                    {formik.errors.name as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Select
                  key={`designation-${committee?.id}-${committee?.designation}`}
                  value={formik.values.designation}
                  onValueChange={(value) =>
                    formik.setFieldValue("designation", value)
                  }
                >
                  <SelectTrigger
                    className={
                      formik.touched.designation && formik.errors.designation
                        ? "border-red-500"
                        : ""
                    }
                  >
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((designation) => (
                      <SelectItem
                        key={designation.value}
                        value={designation.value}
                      >
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4" />
                          <span>{designation.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.designation && formik.errors.designation && (
                  <p className="text-sm text-red-500">
                    {formik.errors.designation as string}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="term_start_year">Start Year *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="term_start_year"
                      name="term_start_year"
                      type="number"
                      inputMode="numeric"
                      placeholder="2024"
                      value={formik.values.term_start_year}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`pl-10 ${
                        formik.touched.term_start_year &&
                        formik.errors.term_start_year
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {formik.touched.term_start_year &&
                    formik.errors.term_start_year && (
                      <p className="text-sm text-red-500">
                        {formik.errors.term_start_year as string}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term_end_year">End Year *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="term_end_year"
                      name="term_end_year"
                      type="number"
                      inputMode="numeric"
                      placeholder="2026"
                      value={formik.values.term_end_year}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`pl-10 ${
                        formik.touched.term_end_year &&
                        formik.errors.term_end_year
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {formik.touched.term_end_year &&
                    formik.errors.term_end_year && (
                      <p className="text-sm text-red-500">
                        {formik.errors.term_end_year as string}
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_picture">Profile Picture</Label>
                <div className="flex flex-col gap-4">
                  <Input
                    id="profile_picture"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />

                  {/* Show current profile picture if exists */}
                  {committee?.profile_picture && !profilePicturePreview && (
                    <div className="relative w-40 h-40 mb-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Current profile picture
                      </p>
                      <Image
                        src={committee.profile_picture}
                        alt="Current profile picture"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Show new preview if uploading */}
                  {profilePicturePreview && (
                    <div className="relative w-40 h-40">
                      <Image
                        src={profilePicturePreview}
                        alt="Profile picture preview"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover rounded-lg mb-2"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                          URL.revokeObjectURL(profilePicturePreview);
                          setProfilePicturePreview(null);
                          setProfilePictureFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("profile_picture")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {committee?.profile_picture || profilePicturePreview
                      ? "Change"
                      : "Upload"}{" "}
                    Profile Picture
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Upload a new profile picture to replace the current one
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/committees">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                >
                  Update Committee Member
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
