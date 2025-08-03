"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { DateTimePicker } from "@/components/shared/date-time-picker";
import {
  useCreateEventMutation,
  useUpdateEventMutation,
} from "@/redux/features/event/eventApi";
import { Loader2, Upload, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface EventFormData {
  title: string;
  description: string;
  location: string;
  event_date: string;
}

interface EventFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    location?: string;
    event_date?: string;
    cover_image?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const eventSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  location: Yup.string()
    .min(3, "Location must be at least 3 characters")
    .max(200, "Location must be less than 200 characters")
    .required("Location is required"),
  event_date: Yup.string().required("Event date is required"),
});

export function EventForm({
  initialData,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const [
    createEvent,
    { isLoading: isCreating, isError: isCreateError, error: createError },
  ] = useCreateEventMutation();
  const [
    updateEvent,
    { isLoading: isUpdating, isError: isUpdateError, error: updateError },
  ] = useUpdateEventMutation();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    initialData?.cover_image || null
  );

  const isEditing = !!initialData?.id;
  const isLoading = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;

  // Format initial event date for input
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString();
  };

  const formik = useFormik<EventFormData>({
    initialValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      event_date: formatDateForInput(initialData?.event_date),
    },
    validationSchema: eventSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("location", values.location);
        formData.append("event_date", values.event_date);

        if (coverImage) {
          formData.append("cover_image", coverImage);
        }

        if (isEditing && initialData?.id) {
          await updateEvent({
            id: initialData.id,
            data: formData,
          }).unwrap();
          toast.success("Event updated successfully");
        } else {
          await createEvent(formData).unwrap();
          toast.success("Event created successfully");
        }

        onSuccess?.();
      } catch (error: unknown) {
        const errorMessage = (error as { data?: { message?: string } })?.data
          ?.message;
        toast.error(
          errorMessage || `Failed to ${isEditing ? "update" : "create"} event`
        );
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Event" : "Create New Event"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the event information"
            : "Fill in the details to create a new event"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {/* @ts-expect-error server error */}
              {error?.data?.message ||
                `Failed to ${
                  isEditing ? "update" : "create"
                } event. Please try again.`}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter event title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.title && formik.errors.title
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-sm text-red-500">{formik.errors.title}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="location"
                name="location"
                placeholder="Enter event location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`pl-10 ${
                  formik.touched.location && formik.errors.location
                    ? "border-red-500"
                    : ""
                }`}
              />
            </div>
            {formik.touched.location && formik.errors.location && (
              <p className="text-sm text-red-500">{formik.errors.location}</p>
            )}
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <Label>Event Date & Time *</Label>
            <DateTimePicker
              value={formik.values.event_date}
              onChange={(value) => formik.setFieldValue("event_date", value)}
              placeholder="Select event date and time"
              className={
                formik.touched.event_date && formik.errors.event_date
                  ? "[&>*]:border-red-500"
                  : ""
              }
            />
            {formik.touched.event_date && formik.errors.event_date && (
              <p className="text-sm text-red-500">{formik.errors.event_date}</p>
            )}
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="cover_image">Cover Image (Optional)</Label>
            <div className="flex flex-col gap-4">
              <Input
                id="cover_image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {coverImagePreview ? (
                <div className="relative w-full h-48">
                  <Image
                    src={coverImagePreview}
                    alt="Cover image preview"
                    fill
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      if (
                        coverImagePreview &&
                        coverImagePreview.startsWith("blob:")
                      ) {
                        URL.revokeObjectURL(coverImagePreview);
                      }
                      setCoverImagePreview(null);
                      setCoverImage(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("cover_image")?.click()
                  }
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Cover Image
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload a cover image to showcase your event (recommended size:
              1200x400px)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Event Description *</Label>
            <RichTextEditor
              content={formik.values.description}
              onChange={(content) =>
                formik.setFieldValue("description", content)
              }
              placeholder="Describe your event in detail..."
              className={
                formik.touched.description && formik.errors.description
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-500">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* Information Cards */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Event Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Events are published immediately upon creation</li>
              <li>• Ensure all event details are accurate and up-to-date</li>
              <li>• Include clear descriptions and location information</li>
              <li>• Cover images should be high quality and relevant</li>
            </ul>
          </div>

          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">
                Update Information
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Changes will be visible immediately after saving</li>
                <li>• Event ID: {initialData?.id}</li>
                <li>• Notify attendees if there are significant changes</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing
                ? isLoading
                  ? "Updating Event..."
                  : "Update Event"
                : isLoading
                ? "Creating Event..."
                : "Create Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
