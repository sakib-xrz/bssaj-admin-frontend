"use client";

import { useRouter } from "next/navigation";
import Container from "@/components/shared/container";
import { GalleryForm } from "../_components/gallery-form";

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Gallery Item
          </h1>
          <p className="text-gray-600">Add a new image to the gallery</p>
        </div>

        <GalleryForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </Container>
  );
}
