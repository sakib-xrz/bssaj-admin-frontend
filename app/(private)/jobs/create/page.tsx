"use client";

import { useRouter } from "next/navigation";
import { JobForm } from "@/app/(private)/jobs/_components/job-form";
import Container from "@/components/shared/container";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateJobPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/jobs");
  };

  const handleCancel = () => {
    router.push("/jobs");
  };

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
              Create Job Posting
            </h1>
            <p className="text-gray-600">Add a new job posting to the system</p>
          </div>
        </div>

        <JobForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </Container>
  );
}
