"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetSingleEventQuery } from "@/redux/features/event/eventApi";
import {
  Loader2,
  MapPin,
  CalendarDays,
  Clock,
  User,
  Edit,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  cover_image: string | null;
  author: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  };
  created_at: string;
  updated_at: string;
}

interface EventViewModalProps {
  eventId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventViewModal({
  eventId,
  isOpen,
  onClose,
}: EventViewModalProps) {
  const { data, isLoading, error } = useGetSingleEventQuery(eventId!, {
    skip: !eventId,
  });

  const event: Event = data?.data;

  if (!isOpen) return null;

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);

    if (eventDateTime > now) {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
    } else if (eventDateTime.toDateString() === now.toDateString()) {
      return <Badge className="bg-green-100 text-green-800">Today</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Past</Badge>;
    }
  };

  const formatEventDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, "EEEE, MMMM do, yyyy"),
      time: format(date, "h:mm a"),
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Event Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load event details</p>
          </div>
        ) : event ? (
          <div className="space-y-6">
            {/* Header with Title and Status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h2>
                <div className="flex items-center gap-2">
                  {getEventStatus(event.event_date)}
                </div>
              </div>
              <Link href={`/events/edit/${event.id}`}>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Edit className="w-4 h-4" />
                  Edit Event
                </Button>
              </Link>
            </div>

            {/* Cover Image */}
            {event.cover_image && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={event.cover_image}
                  alt={`${event.title} cover`}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Date & Time</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-blue-800 font-medium">
                    {formatEventDateTime(event.event_date).date}
                  </p>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-blue-700">
                      {formatEventDateTime(event.event_date).time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Location</h3>
                </div>
                <p className="text-green-800">{event.location}</p>
              </div>
            </div>

            {/* Author Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Event Organizer</h3>
              </div>
              <div className="flex items-center gap-3">
                {event.author.profile_picture ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden relative">
                    <Image
                      src={event.author.profile_picture}
                      alt={event.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {event.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {event.author.name}
                  </p>
                  <p className="text-sm text-gray-600">{event.author.email}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Event Description
              </h3>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>

            {/* Metadata */}
            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-gray-500">
                <p>Created: {format(new Date(event.created_at), "PPP")}</p>
                <p>Last updated: {format(new Date(event.updated_at), "PPP")}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Event not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
