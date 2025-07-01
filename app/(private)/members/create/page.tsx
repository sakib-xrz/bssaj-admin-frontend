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
import { ArrowLeft, User, Mail, Phone, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/shared/container";
import { SearchSelect } from "@/components/shared/search-and-select";
import { useSearchUsersQuery } from "@/redux/features/user/userApi";
import { useCreateMemberMutation } from "@/redux/features/member/memberApi";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the User interface for type safety
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const memberSchema = Yup.object({
  user_id: Yup.string().required("User is required"),
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
  kind: Yup.string().required("Member kind is required"),
});

// Store user data for auto-filling form fields
const usersCache: Map<string, User> = new Map();

// Transform user data for SearchSelect component
const transformUserData = (
  data: unknown
): Array<{ label: string; value: string }> => {
  if (!data || typeof data !== "object" || !("data" in data)) return [];
  const users = (data as { data: User[] }).data;
  if (!Array.isArray(users)) return [];

  // Update the cache with user data for auto-filling (don't clear existing cache)
  users.forEach((user: User) => {
    usersCache.set(user.id, user);
  });

  return users.map((user: User) => ({
    label: `${user.name} (${user.email})`,
    value: user.id,
  }));
};

const memberKinds = [
  { value: "ADVISER", label: "Adviser" },
  { value: "HONORABLE", label: "Honorable" },
  { value: "EXECUTIVE", label: "Executive" },
  { value: "ASSOCIATE", label: "Associate" },
  { value: "STUDENT_REPRESENTATIVE", label: "Student Representative" },
];

export default function CreateMemberPage() {
  const router = useRouter();
  const [createMember, { isLoading, isError, error }] =
    useCreateMemberMutation();

  const formik = useFormik({
    initialValues: {
      user_id: "",
      name: "",
      email: "",
      phone: "",
      kind: "",
    },
    validationSchema: memberSchema,
    onSubmit: async (values) => {
      try {
        const result = await createMember(values).unwrap();
        console.log("Member created successfully:", result);

        // Redirect to members list
        router.push("/members");
        toast.success("Member created successfully");
      } catch (error) {
        console.error("Error creating member:", error);
        toast.error("Failed to create member");
      }
    },
  });

  // Auto-fill name and email when user is selected
  const handleUserSelect = (userId: string) => {
    formik.setFieldValue("user_id", userId);

    if (!userId) {
      // Clear form fields if no user is selected
      formik.setFieldValue("name", "");
      formik.setFieldValue("email", "");
      return;
    }

    // Get user data from cache and auto-fill form
    const selectedUser = usersCache.get(userId);
    if (selectedUser) {
      formik.setFieldValue("name", selectedUser.name);
      formik.setFieldValue("email", selectedUser.email);
    }
  };

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
            {isError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  {/* @ts-expect-error server error */}
                  {error?.data?.message ||
                    "Failed to create member. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-6">
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
                    usersCache.has(formik.values.user_id)
                      ? `${usersCache.get(formik.values.user_id)!.name} (${
                          usersCache.get(formik.values.user_id)!.email
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
                  <Label htmlFor="kind">Member Kind *</Label>
                  <Select
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
                    <p className="text-sm text-red-500">{formik.errors.kind}</p>
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

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">
                  Approval Required
                </h4>
                <p className="text-sm text-yellow-800">
                  New members require approval from an administrator before they
                  can access member-only features. The member will be notified
                  once their membership is approved.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/members">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading || !formik.isValid}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Adding Member..." : "Add Member"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
