"use client";

import { useRouter } from "next/navigation";
import { BannerForm } from "@/app/(private)/banners/_components/banner-form";
import Container from "@/components/shared/container";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/banners">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Banners
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Banner</h1>
            <p className="text-gray-600">Add a new banner to the website</p>
          </div>
        </div>

        <BannerForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </Container>
  );
}
