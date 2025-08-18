"use client";

import { useRouter } from "next/navigation";
import { useGetSingleBannerQuery } from "@/redux/features/banner/bannerApi";
import { BannerForm } from "@/app/(private)/banners/_components/banner-form";
import Container from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EditBannerPageProps {
  params: {
    id: string;
  };
}

export default function EditBannerPage({ params }: EditBannerPageProps) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useGetSingleBannerQuery(
    params.id
  );

  const banner = data?.data;

  const handleSuccess = () => {
    router.push("/banners");
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Banner</h1>
            <p className="text-gray-600">Update banner information</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Banner</h1>
            <p className="text-gray-600">Update banner information</p>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error && "data" in error && error.data
                ? `Error loading banner: ${JSON.stringify(error.data)}`
                : "Failed to load banner. Please try again."}
            </AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

  if (!banner) {
    return (
      <Container>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Banner</h1>
            <p className="text-gray-600">Update banner information</p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Banner not found.</AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Banner</h1>
          <p className="text-gray-600">Update banner information</p>
        </div>

        <BannerForm
          initialData={{
            id: banner.id,
            title: banner.title,
            description: banner.description,
            link: banner.link,
            image: banner.image,
          }}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Container>
  );
}
