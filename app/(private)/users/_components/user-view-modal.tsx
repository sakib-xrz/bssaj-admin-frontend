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
import { User, Mail, MapPin, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

interface UserViewModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    agency_id?: string | null;
    address?: string;
    current_study_info?: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const roleColors = {
  STUDENT: "bg-blue-100 text-blue-800",
  AGENCY: "bg-green-100 text-green-800",
  ADMIN: "bg-purple-100 text-purple-800",
};

export function UserViewModal({ user, isOpen, onClose }: UserViewModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>User Details</span>
          </DialogTitle>
          <DialogDescription>
            Complete information about the user account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    className={roleColors[user.role as keyof typeof roleColors]}
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    className={
                      user.is_deleted
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {user.is_deleted ? "Inactive" : "Active"}
                  </Badge>
                </div>
              </div>
            </div>
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
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
              {user.address && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm">{user.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {user.current_study_info && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Study Information
                </h4>
                <p className="text-sm text-gray-700">
                  {user.current_study_info}
                </p>
              </div>
            </>
          )}

          {/* Agency Information */}
          {user.agency_id && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Agency Information
                </h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Agency ID
                    </p>
                    <p className="text-sm">{user.agency_id}</p>
                  </div>
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
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm">
                    {format(new Date(user.created_at), "dd MMM yyyy")}
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
                    {format(new Date(user.updated_at), "dd MMM yyyy")}
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
