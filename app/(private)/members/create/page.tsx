"use client";

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
import { ArrowLeft, User, Mail, Phone, Award } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Container from "@/components/shared/container";

const memberSchema = Yup.object({
  user_id: Yup.string().required("User is required"),
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
  designation: Yup.string().required("Designation is required"),
});

// Mock users data - replace with actual API call (users who are not already members)
const mockAvailableUsers = [
  {
    id: "5",
    name: "Dr. Karim Hassan",
    email: "karim.hassan@example.com",
    role: "STUDENT",
  },
  {
    id: "6",
    name: "Ms. Nadia Islam",
    email: "nadia.islam@example.com",
    role: "STUDENT",
  },
  {
    id: "7",
    name: "Mr. Tariq Ahmed",
    email: "tariq.ahmed@example.com",
    role: "AGENCY",
  },
  {
    id: "8",
    name: "Dr. Salma Khatun",
    email: "salma.khatun@example.com",
    role: "STUDENT",
  },
];

const designations = [
  { value: "President", label: "President" },
  { value: "Vice President", label: "Vice President" },
  { value: "Secretary", label: "Secretary" },
  { value: "Treasurer", label: "Treasurer" },
  { value: "Board Member", label: "Board Member" },
  { value: "Committee Member", label: "Committee Member" },
  { value: "Advisor", label: "Advisor" },
  { value: "Coordinator", label: "Coordinator" },
];

export default function CreateMemberPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers] = useState(mockAvailableUsers);

  const formik = useFormik({
    initialValues: {
      user_id: "",
      name: "",
      email: "",
      phone: "",
      designation: "",
    },
    validationSchema: memberSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        console.log("Creating member:", values);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Redirect to members list or show success message
      } catch (error) {
        console.error("Error creating member:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Auto-fill name and email when user is selected
  const handleUserSelect = (userId: string) => {
    const selectedUser = availableUsers.find((user) => user.id === userId);
    if (selectedUser) {
      formik.setFieldValue("user_id", userId);
      formik.setFieldValue("name", selectedUser.name);
      formik.setFieldValue("email", selectedUser.email);
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col items-center space-x-4">
          <Link href="/members">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Members
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Add Member</h1>
            <p className="text-gray-600">
              Add a new member to the organization
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
            <CardDescription>
              Fill in the details to add a new organization member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="user_id">Select User *</Label>
                <Select
                  value={formik.values.user_id}
                  onValueChange={handleUserSelect}
                >
                  <SelectTrigger
                    className={
                      formik.touched.user_id && formik.errors.user_id
                        ? "border-red-500"
                        : ""
                    }
                  >
                    <SelectValue placeholder="Select a user to make them a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>
                            {user.name} ({user.email}) - {user.role}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.user_id && formik.errors.user_id && (
                  <p className="text-sm text-red-500">
                    {formik.errors.user_id}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Only users who are not already members are shown
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <p className="text-sm text-red-500">{formik.errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`pl-10 ${
                        formik.touched.email && formik.errors.email
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-sm text-red-500">
                      {formik.errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+81-XX-XXXX-XXXX"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`pl-10 ${
                        formik.touched.phone && formik.errors.phone
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-sm text-red-500">
                      {formik.errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Select
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
                            <Award className="w-4 h-4" />
                            <span>{designation.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.designation && formik.errors.designation && (
                    <p className="text-sm text-red-500">
                      {formik.errors.designation}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Member Responsibilities
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Participate in organization activities and meetings</li>
                  <li>• Represent BSSAJ in their designated capacity</li>
                  <li>
                    • Contribute to the community and organizational goals
                  </li>
                  <li>• Maintain active communication with other members</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/admin/members">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? "Adding Member..." : "Add Member"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
