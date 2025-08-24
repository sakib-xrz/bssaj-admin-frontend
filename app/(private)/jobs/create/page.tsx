"use client";

import { useRouter } from "next/navigation";
import { JobForm } from "@/app/(private)/jobs/_components/job-form";
import Container from "@/components/shared/container";

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Job Posting
          </h1>
          <p className="text-gray-600">Add a new job posting to the system</p>
        </div>

        <JobForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </Container>
  );
}
