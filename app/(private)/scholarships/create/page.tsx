"use client";

import { useRouter } from "next/navigation";
import { ScholarshipForm } from "@/app/(private)/scholarships/_components/scholarship-form";
import Container from "@/components/shared/container";

export default function CreateScholarshipPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/scholarships");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Scholarship
          </h1>
          <p className="text-gray-600">Add a new scholarship opportunity</p>
        </div>

        <ScholarshipForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </Container>
  );
}
