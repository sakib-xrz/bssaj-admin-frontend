"use client";

import { useRouter } from "next/navigation";
import Container from "@/components/shared/container";
import { GalleryForm } from "../_components/gallery-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateGalleryPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/gallery");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/gallery">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Gallery
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Create Gallery Item
            </h1>
            <p className="text-gray-600">Add a new image to the gallery</p>
          </div>
        </div>

        <GalleryForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </Container>
  );
}
