"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  User,
  Facebook,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";

interface AgencyViewModalProps {
  agency: {
    id: string;
    name: string;
    contact_email: string;
    contact_phone: string;
    website?: string;
    director_name?: string;
    established_year?: number;
    description?: string;
    address?: string;
    facebook_url?: string;
    message_from_director?: string;
    services_offered?: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AgencyViewModal({
  agency,
  isOpen,
  onClose,
}: AgencyViewModalProps) {
  if (!agency) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Agency Details</span>
          </DialogTitle>
          <DialogDescription>
            Complete information about the agency
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {agency.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{agency.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {agency.established_year && (
                    <Badge className="bg-blue-100 text-blue-800">
                      Est. {agency.established_year}
                    </Badge>
                  )}
                  <Badge
                    className={
                      agency.is_deleted
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {agency.is_deleted ? "Inactive" : "Active"}
                  </Badge>
                </div>
              </div>
            </div>

            {agency.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{agency.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <a
                    href={`mailto:${agency.contact_email}`}
                    className="text-sm text-secondary hover:underline"
                  >
                    {agency.contact_email}
                  </a>
                </div>
              </div>
              {agency.contact_phone && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <a
                      href={`tel:${agency.contact_phone}`}
                      className="text-sm text-secondary hover:underline"
                    >
                      {agency.contact_phone}
                    </a>
                  </div>
                </div>
              )}
              {agency.website && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Website</p>
                    <a
                      href={agency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-secondary hover:underline"
                    >
                      {agency.website}
                    </a>
                  </div>
                </div>
              )}
              {agency.facebook_url && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <Facebook className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Facebook
                    </p>
                    <a
                      href={agency.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-secondary hover:underline"
                    >
                      Facebook Page
                    </a>
                  </div>
                </div>
              )}
            </div>

            {agency.address && (
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm text-gray-700">{agency.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Director Information */}
          {agency.director_name && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Director Information
                </h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Director
                    </p>
                    <p className="text-sm">{agency.director_name}</p>
                  </div>
                </div>

                {agency.message_from_director && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <h5 className="font-medium text-blue-900">
                        Message from Director
                      </h5>
                    </div>
                    <p className="text-sm text-blue-800">
                      {agency.message_from_director}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Services */}
          {agency.services_offered && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Services Offered
                </h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    {agency.services_offered}
                  </p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* System Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">System Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Registered
                  </p>
                  <p className="text-sm">
                    {format(new Date(agency.created_at), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Last Updated
                  </p>
                  <p className="text-sm">
                    {format(new Date(agency.updated_at), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
