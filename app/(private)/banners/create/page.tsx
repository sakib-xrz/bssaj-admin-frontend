"use client";

import { useRouter } from "next/navigation";
import { BannerForm } from "@/app/(private)/banners/_components/banner-form";
import Container from "@/components/shared/container";

export default function CreateBannerPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/banners");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Banner</h1>
          <p className="text-gray-600">Add a new banner to the website</p>
        </div>

        <BannerForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </Container>
  );
}
