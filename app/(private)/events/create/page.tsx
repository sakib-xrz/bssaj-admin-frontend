"use client";

import { useRouter } from "next/navigation";
import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/app/(private)/events/_components/event-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateEventPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/events");
  };

  const handleCancel = () => {
    router.push("/events");
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
            <p className="text-gray-600">
              Create a new event for the organization
            </p>
          </div>
        </div>

        <EventForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </Container>
  );
}
