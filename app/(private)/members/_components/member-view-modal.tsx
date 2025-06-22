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
import { User, Mail, Phone, Award, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

interface MemberViewModalProps {
  member: {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string;
    designation: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    user: {
      role: string;
      is_deleted: boolean;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const designationColors = {
  President: "bg-purple-100 text-purple-800",
  "Vice President": "bg-blue-100 text-blue-800",
  Secretary: "bg-green-100 text-green-800",
  Treasurer: "bg-orange-100 text-orange-800",
  "Board Member": "bg-gray-100 text-gray-800",
  "Committee Member": "bg-yellow-100 text-yellow-800",
};

export function MemberViewModal({
  member,
  isOpen,
  onClose,
}: MemberViewModalProps) {
  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Member Details</span>
          </DialogTitle>
          <DialogDescription>
            Complete information about the organization member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    className={
                      designationColors[
                        member.designation as keyof typeof designationColors
                      ] || designationColors["Committee Member"]
                    }
                  >
                    {member.designation}
                  </Badge>
                  <Badge
                    className={
                      member.is_deleted
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {member.is_deleted ? "Inactive" : "Active"}
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
                  <a
                    href={`mailto:${member.email}`}
                    className="text-sm text-secondary hover:underline"
                  >
                    {member.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <a
                    href={`tel:${member.phone}`}
                    className="text-sm text-secondary hover:underline"
                  >
                    {member.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Role Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">
              Role & Responsibilities
            </h4>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Designation</p>
                <p className="text-sm">{member.designation}</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">
                Key Responsibilities
              </h5>
              <ul className="text-sm text-blue-800 space-y-1">
                {member.designation === "President" && (
                  <>
                    <li>• Lead the organization and represent BSSAJ</li>
                    <li>• Oversee all organizational activities</li>
                    <li>• Make strategic decisions for the association</li>
                  </>
                )}
                {member.designation === "Vice President" && (
                  <>
                    <li>• Assist the President in organizational leadership</li>
                    <li>• Coordinate with different committees</li>
                    <li>• Act as President when needed</li>
                  </>
                )}
                {member.designation === "Secretary" && (
                  <>
                    <li>• Maintain meeting minutes and records</li>
                    <li>• Handle official correspondence</li>
                    <li>• Coordinate meetings and events</li>
                  </>
                )}
                {member.designation === "Treasurer" && (
                  <>
                    <li>• Manage organizational finances</li>
                    <li>• Prepare financial reports</li>
                    <li>• Oversee budget and expenses</li>
                  </>
                )}
                {![
                  "President",
                  "Vice President",
                  "Secretary",
                  "Treasurer",
                ].includes(member.designation) && (
                  <>
                    <li>• Participate in organizational activities</li>
                    <li>• Contribute to committee work</li>
                    <li>• Support organizational goals</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <Separator />

          {/* System Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">System Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User Role</p>
                  <p className="text-sm">{member.user.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-sm font-mono">{member.user_id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Member Since
                  </p>
                  <p className="text-sm">
                    {format(new Date(member.created_at), "dd MMM yyyy")}
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
                    {format(new Date(member.updated_at), "dd MMM yyyy")}
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
