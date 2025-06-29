"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Container from "@/components/shared/container";
import userLogin from "@/service/auth/userLogin";
import { setToken } from "@/redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useState } from "react";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "superadmin@bssaj.com",
      password: "123456",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const response = await userLogin(values);
        const access_token = response?.data?.access_token;
        dispatch(setToken({ token: access_token }));
        toast.success("Logged in successfully");
      } catch (error) {
        formik.resetForm();
        // @ts-expect-error Error message is a string
        setError(error.message);
      }
    },
  });

  return (
    <Container className="flex items-center justify-center min-h-screen py-12">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            BSSAJ Admin
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to login to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={formik.handleSubmit}>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-destructive">
                  {formik.errors.email}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-destructive">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="mb-4 bg-destructive/10 text-center"
              >
                <AlertDescription className="font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Container>
  );
}
