"use client";

import { useRouter } from "next/navigation";
import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { NewsForm } from "@/app/(private)/news/_components/news-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateNewsPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/news");
  };

  const handleCancel = () => {
    router.push("/news");
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/news">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create News</h1>
            <p className="text-gray-600">
              Create a new news item for the organization
            </p>
          </div>
        </div>

        <NewsForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </Container>
  );
}
