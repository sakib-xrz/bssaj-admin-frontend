"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { NewsForm } from "@/app/(private)/news/_components/news-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useGetSingleNewsQuery } from "@/redux/features/news/newsApi";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;

  const { data, isLoading, isError } = useGetSingleNewsQuery(newsId);
  const news = data?.data;

  const handleSuccess = () => {
    router.push("/news");
  };

  const handleCancel = () => {
    router.push("/news");
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading news details...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (isError || !news) {
    return (
      <Container>
        <div className="space-y-6">
          <Link href="/news">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load news details. The news item may not exist.
            </AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Edit News</h1>
            <p className="text-gray-600">Update the news information</p>
          </div>
        </div>

        <NewsForm
          initialData={news}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Container>
  );
}
