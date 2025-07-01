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
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import {
  useGetMemberByIdQuery,
  useUpdateMemberMutation,
  useApproveOrRejectMemberMutation,
} from "@/redux/features/member/memberApi";
import { toast } from "sonner";
import { format } from "date-fns";

const memberSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
  kind: Yup.string().required("Member kind is required"),
});

const memberKinds = [
  { value: "ADVISER", label: "Adviser" },
  { value: "HONORABLE", label: "Honorable" },
  { value: "EXECUTIVE", label: "Executive" },
  { value: "ASSOCIATE", label: "Associate" },
  { value: "STUDENT_REPRESENTATIVE", label: "Student Representative" },
];

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [isApproving, setIsApproving] = useState(false);

  // Fetch member data
  const { data: memberData, isLoading } = useGetMemberByIdQuery(memberId);
  const [updateMember] = useUpdateMemberMutation();
  const [approveOrRejectMember] = useApproveOrRejectMemberMutation();

  const member = memberData?.data;

  const formik = useFormik({
    initialValues: {
      name: member?.name || "",
      email: member?.email || "",
      phone: member?.phone || "",
      kind: member?.kind || "",
    },
    validationSchema: memberSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await updateMember({
          id: memberId,
          data: values,
        }).unwrap();

        toast.success("Member updated successfully");
        router.push("/members");
      } catch (error) {
        console.error("Error updating member:", error);
        toast.error("Failed to update member");
      }
    },
  });

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveOrRejectMember({
        id: memberId,
        data: { approved: true },
      }).unwrap();

      toast.success("Member approved successfully");
    } catch (error) {
      console.error("Error approving member:", error);
      toast.error("Failed to approve member");
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!member) {
    return <div>Member not found</div>;
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/members">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Members
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">Edit Member</h1>
            <p className="text-gray-600">
              Update member information and designation
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
            <CardDescription>Update the member details below</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Approval Status */}
            <div className="mb-6 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">Approval Status:</h4>
                  {member.approved_at ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-800">
                      Pending Approval
                    </Badge>
                  )}
                </div>
                {!member.approved_at && (
                  <Button
                    onClick={handleApprove}
                    size="sm"
                    disabled={isApproving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isApproving ? "Approving..." : "Approve Member"}
                  </Button>
                )}
              </div>
              {member.approved_at && member.approved_by && (
                <p className="text-sm text-gray-600 mt-2">
                  Approved by {member.approved_by.name} on{" "}
                  {new Date(member.approved_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
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
                    <p className="text-sm text-red-500">
                      {formik.errors.name as string}
                    </p>
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
                      {formik.errors.email as string}
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
                      {formik.errors.phone as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kind">Member Kind *</Label>
                  <Select
                    key={`member-kind-${member?.id}-${member?.kind}`}
                    value={formik.values.kind}
                    onValueChange={(value) =>
                      formik.setFieldValue("kind", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        formik.touched.kind && formik.errors.kind
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select member kind" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberKinds.map((kind) => (
                        <SelectItem key={kind.value} value={kind.value}>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <span>{kind.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.kind && formik.errors.kind && (
                    <p className="text-sm text-red-500">
                      {formik.errors.kind as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Update Information
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Member created on:{" "}
                    {format(new Date(member.created_at), "dd MMM yyyy")}
                  </li>
                  <li>
                    • Last updated:{" "}
                    {format(new Date(member.updated_at), "dd MMM yyyy")}
                  </li>
                  <li>• User ID: {member.user?.id}</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/members">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                >
                  Update Member
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
