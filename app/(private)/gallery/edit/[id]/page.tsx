"use client";

import { useRouter } from "next/navigation";
import { useGetSingleGalleryQuery } from "@/redux/features/gallery/galleryApi";
import Container from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { GalleryForm } from "@/app/(private)/gallery/_components/gallery-form";

interface EditGalleryPageProps {
  params: {
    id: string;
  };
}

export default function EditGalleryPage({ params }: EditGalleryPageProps) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useGetSingleGalleryQuery(
    params.id
  );

  const galleryItem = data?.data;

  const handleSuccess = () => {
    router.push("/gallery");
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Gallery Item
            </h1>
            <p className="text-gray-600">Update gallery item information</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Gallery Item
            </h1>
            <p className="text-gray-600">Update gallery item information</p>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error && "data" in error && error.data
                ? `Error loading gallery item: ${JSON.stringify(error.data)}`
                : "Failed to load gallery item. Please try again."}
            </AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

  if (!galleryItem) {
    return (
      <Container>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Gallery Item
            </h1>
            <p className="text-gray-600">Update gallery item information</p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Gallery item not found.</AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Gallery Item
          </h1>
          <p className="text-gray-600">Update gallery item information</p>
        </div>

        <GalleryForm
          initialData={{
            id: galleryItem.id,
            title: galleryItem.title,
            link: galleryItem.link,
            image: galleryItem.image,
          }}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Container>
  );
}
