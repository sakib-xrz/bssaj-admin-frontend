"use client";

import { useRouter } from "next/navigation";
import { useGetSingleJobQuery } from "@/redux/features/job/jobApi";
import { JobForm } from "@/app/(private)/jobs/_components/job-form";
import Container from "@/components/shared/container";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EditJobPageProps {
  params: {
    id: string;
  };
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetSingleJobQuery(params.id);

  const job = data?.data;

  const handleSuccess = () => {
    router.push("/jobs");
  };

  const handleCancel = () => {
    router.push("/jobs");
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </Container>
    );
  }

  if (isError || !job) {
    return (
      <Container>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load job details. Please try again.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Job Posting
            </h1>
            <p className="text-gray-600">Update job posting information</p>
          </div>
        </div>

        <JobForm
          initialData={job}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Container>
  );
}
