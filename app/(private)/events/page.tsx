"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CalendarDays,
  Loader2,
  MapPin,
  Clock,
} from "lucide-react";
import { EventViewModal } from "@/app/(private)/events/_components/event-view-modal";
import { DeleteAlertDialog } from "@/app/(private)/_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";
import {
  useGetAllEventsQuery,
  useDeleteEventMutation,
} from "@/redux/features/event/eventApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";

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

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 20,
    search: searchParams.get("search") || "",
  };

  const [params, setParams] = useState(initialParams);
  const [searchInput, setSearchInput] = useState(initialParams.search);

  // Debounce search query
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update search param when debounced search changes
  useEffect(() => {
    setParams((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Update URL when filters change
  useEffect(() => {
    const queryString = generateQueryString(params);
    router.push(`/events${queryString}`);
  }, [params, router]);

  const { data, isLoading } = useGetAllEventsQuery(sanitizeParams(params));

  const events = data?.data;

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (eventId: string) => {
    setImageErrors((prev) => new Set(prev).add(eventId));
  };

  // Handle pagination page change
  const handlePageChange = (page: number) => {
    if (
      page < 1 ||
      (data?.meta && page > Math.ceil(data?.meta.total / data?.meta.limit)) ||
      page === params.page
    ) {
      return;
    }
    setParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const getEventStatusBadge = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.event_date);

    if (eventDate > now) {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
    } else if (eventDate.toDateString() === now.toDateString()) {
      return <Badge className="bg-green-100 text-green-800">Today</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Past</Badge>;
    }
  };

  const formatEventDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, "MMM dd, yyyy"),
      time: format(date, "h:mm a"),
    };
  };

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600">Manage events and activities</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
              <CardDescription>
                A list of all events in the system
              </CardDescription>
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

  const hasEvents = events && events.length > 0;
  const hasSearchQuery = params.search.length > 0;

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600">Manage events and activities</p>
          </div>
          <Link href="/events/create">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>
              A list of all events in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              {hasEvents ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events?.map((event: Event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {event.cover_image && !imageErrors.has(event.id) ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                                <Image
                                  src={event.cover_image}
                                  alt={`${event.title} cover`}
                                  fill
                                  className="object-cover"
                                  onError={() => handleImageError(event.id)}
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-semibold">
                                <CalendarDays className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium line-clamp-1">
                                {event.title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {event.description
                                  .replace(/<[^>]*>/g, "")
                                  .substring(0, 50)}
                                ...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="line-clamp-1">
                              {event.location}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {formatEventDateTime(event.event_date).date}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatEventDateTime(event.event_date).time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{event.author?.name}</span>
                        </TableCell>
                        <TableCell>{getEventStatusBadge(event)}</TableCell>
                        <TableCell>
                          {format(new Date(event.created_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewEvent(event)}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/events/edit/${event.id}`}>
                                  <Edit className="h-4 w-4" />
                                  Edit Event
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteEvent(event)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  {hasSearchQuery ? (
                    <>
                      <p className="text-gray-500 text-lg mb-4">
                        No events found matching &quot;{params.search}&quot;
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchInput("");
                          setParams((prev) => ({
                            ...prev,
                            search: "",
                            page: 1,
                          }));
                        }}
                      >
                        Clear search
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 text-lg mb-4">
                        No events added yet
                      </p>
                      <Link href="/events/create">
                        <Button>
                          <Plus className="w-4 h-4" />
                          Create your first event
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {data?.meta && data?.meta.total > 1 && (
              <CustomPagination
                params={{ page: params.page }}
                totalPages={Math.ceil(data?.meta.total / params.limit)}
                handlePageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>

        <EventViewModal
          eventId={selectedEvent?.id || null}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (!selectedEvent) return;
            try {
              await deleteEvent({ id: selectedEvent.id }).unwrap();
              setIsDeleteDialogOpen(false);
              toast.success("Event deleted successfully");
            } catch (error) {
              console.error("Failed to delete event:", error);
              toast.error("Failed to delete event");
            } finally {
              setSelectedEvent(null);
            }
          }}
          title="Delete Event"
          description="Are you sure you want to delete this event? This action cannot be undone."
          itemName={selectedEvent?.title || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
