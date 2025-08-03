"use client";

import { useRouter, useParams } from "next/navigation";
import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/app/(private)/events/_components/event-form";
import { useGetSingleEventQuery } from "@/redux/features/event/eventApi";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { data, isLoading, error } = useGetSingleEventQuery(eventId);
  const event = data?.data;

  const handleSuccess = () => {
    router.push("/events");
  };

  const handleCancel = () => {
    router.push("/events");
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:justify-between sm:items-center gap-4">
            <Link href="/events">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <div className="sm:text-center">
              <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
              <p className="text-gray-600">Loading event details...</p>
            </div>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Loading Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:justify-between sm:items-center gap-4">
            <Link href="/events">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <div className="sm:text-center">
              <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
              <p className="text-gray-600">Event not found</p>
            </div>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">
                  Event not found or failed to load
                </p>
                <Link href="/events">
                  <Button>Return to Events</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:justify-between sm:items-center gap-4">
          <Link href="/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
          <div className="sm:text-center">
            <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
            <p className="text-gray-600">Update event information</p>
          </div>
        </div>

        <EventForm
          initialData={{
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location,
            event_date: event.event_date,
            cover_image: event.cover_image,
          }}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Container>
  );
}
