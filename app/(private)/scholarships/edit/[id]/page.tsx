"use client";

import { useRouter } from "next/navigation";
import { ScholarshipForm } from "@/app/(private)/scholarships/_components/scholarship-form";
import Container from "@/components/shared/container";
import { useGetSingleScholarshipQuery } from "@/redux/features/scholarship/scholarshipApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EditScholarshipPageProps {
  params: {
    id: string;
  };
}

export default function EditScholarshipPage({
  params,
}: EditScholarshipPageProps) {
  const router = useRouter();
  const { id } = params;

  const {
    data: scholarship,
    isLoading,
    isError,
    error,
  } = useGetSingleScholarshipQuery(id);

  const handleSuccess = () => {
    router.push("/scholarships");
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(error as { data?: { message?: string } })?.data?.message ||
              "Failed to load scholarship"}
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Scholarship</h1>
          <p className="text-gray-600">Update scholarship information</p>
        </div>

        <ScholarshipForm
          initialData={scholarship?.data}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Container>
  );
}
