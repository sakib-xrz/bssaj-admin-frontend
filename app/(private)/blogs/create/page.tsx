import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function CreateBlogPage() {
  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/blogs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Blog</h1>
            <p className="text-gray-600">
              Create a new blog post in the system
            </p>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Blog Information</CardTitle>
            <CardDescription>
              Fill in the details to create a new blog post
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </Container>
  );
}
