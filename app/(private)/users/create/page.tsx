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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/shared/container";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateUserMutation } from "@/redux/features/user/userApi";
import { toast } from "sonner";

const userSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  role: Yup.string()
    .oneOf(["STUDENT", "AGENCY", "ADMIN"], "Invalid role")
    .required("Role is required"),
  address: Yup.string(),
});

export default function CreateUserPage() {
  const router = useRouter();
  const [createUser, { isLoading, isError, error }] = useCreateUserMutation();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      address: "",
    },
    validationSchema: userSchema,
    onSubmit: async (values) => {
      try {
        await createUser(values).unwrap();
        router.push("/users");
        toast.success("User created successfully");
      } catch (err) {
        // Error will be handled by the isError and error states
        console.error("Failed to create user:", err);
        toast.error("Failed to create user");
      }
    },
  });

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create User</h1>
            <p className="text-gray-600">Add a new user to the system</p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Fill in the details to create a new user account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  {/* @ts-expect-error server error */}
                  {error?.data?.message ||
                    "Failed to create user. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
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
                    <p className="text-sm text-red-500">{formik.errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.email && formik.errors.email
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-sm text-red-500">
                      {formik.errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.password && formik.errors.password
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-sm text-red-500">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formik.values.role}
                    onValueChange={(value) =>
                      formik.setFieldValue("role", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        formik.touched.role && formik.errors.role
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="AGENCY">Agency</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.role && formik.errors.role && (
                    <p className="text-sm text-red-500">{formik.errors.role}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/users">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
