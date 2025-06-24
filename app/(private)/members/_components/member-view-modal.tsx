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
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";

interface MemberViewModalProps {
  member: {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string;
    kind: string;
    is_deleted: boolean;
    approved_at: string | null;
    approved_by_id: string | null;
    created_at: string;
    updated_at: string;
    user: {
      role: string;
      is_deleted: boolean;
    };
    approved_by?: {
      name: string;
    } | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const memberKindColors = {
  ADVISER: "bg-purple-100 text-purple-800",
  HONORABLE: "bg-indigo-100 text-indigo-800",
  EXECUTIVE: "bg-blue-100 text-blue-800",
  ASSOCIATE: "bg-green-100 text-green-800",
  STUDENT_REPRESENTATIVE: "bg-orange-100 text-orange-800",
};

const memberKindLabels = {
  ADVISER: "Adviser",
  HONORABLE: "Honorable",
  EXECUTIVE: "Executive",
  ASSOCIATE: "Associate",
  STUDENT_REPRESENTATIVE: "Student Representative",
};

export function MemberViewModal({
  member,
  isOpen,
  onClose,
}: MemberViewModalProps) {
  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                  <Badge
                    className={
                      memberKindColors[
                        member.kind as keyof typeof memberKindColors
                      ]
                    }
                  >
                    {
                      memberKindLabels[
                        member.kind as keyof typeof memberKindLabels
                      ]
                    }
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
                  {member.approved_at ? (
                    <Badge className="bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Approval
                    </Badge>
                  )}
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

          {/* Member Classification */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">
              Member Classification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Designation
                  </p>
                  <p className="text-sm font-semibold">
                    {
                      memberKindLabels[
                        member.kind as keyof typeof memberKindLabels
                      ]
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Approval Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Approval Status</h4>
            {member.approved_at ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Member Approved
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-green-700">
                    <strong>Approved on:</strong>{" "}
                    {format(new Date(member.approved_at), "PPP")}
                  </p>
                  {member.approved_by && (
                    <p className="text-sm text-green-700">
                      <strong>Approved by:</strong> {member.approved_by.name}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">
                    Pending Approval
                  </span>
                </div>
                <p className="text-sm text-orange-700 mt-2">
                  This member is waiting for administrative approval to access
                  member-only features.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Role Information & Responsibilities */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">
              Role & Responsibilities
            </h4>

            {/* Member Kind Responsibilities */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">
                {memberKindLabels[member.kind as keyof typeof memberKindLabels]}{" "}
                Responsibilities
              </h5>
              <ul className="text-sm text-blue-800 space-y-1">
                {member.kind === "ADVISER" && (
                  <>
                    <li>
                      • Provide guidance and strategic direction to the
                      organization
                    </li>
                    <li>• Mentor executive members and committee leaders</li>
                    <li>• Participate in high-level decision making</li>
                  </>
                )}
                {member.kind === "HONORABLE" && (
                  <>
                    <li>
                      • Represent the organization in ceremonial functions
                    </li>
                    <li>• Provide dignified leadership and guidance</li>
                    <li>• Support organizational prestige and reputation</li>
                  </>
                )}
                {member.kind === "EXECUTIVE" && (
                  <>
                    <li>• Lead organizational operations and initiatives</li>
                    <li>• Make strategic decisions for the association</li>
                    <li>• Oversee committees and coordinate activities</li>
                  </>
                )}
                {member.kind === "ASSOCIATE" && (
                  <>
                    <li>• Participate actively in organizational activities</li>
                    <li>• Support committees and working groups</li>
                    <li>• Contribute to community engagement initiatives</li>
                  </>
                )}
                {member.kind === "STUDENT_REPRESENTATIVE" && (
                  <>
                    <li>• Represent student interests and concerns</li>
                    <li>
                      • Bridge communication between students and leadership
                    </li>
                    <li>• Organize student-focused activities and events</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <Separator />

          {/* Timeline Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Member Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Member Since
                  </p>
                  <p className="text-sm">
                    {format(new Date(member.created_at), "PPP")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center border border-primary">
                  <UserCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Last Updated
                  </p>
                  <p className="text-sm">
                    {format(new Date(member.updated_at), "PPP")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* System Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">System Information</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Member ID:</span>
                  <span className="ml-2 text-gray-600">{member.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">User ID:</span>
                  <span className="ml-2 text-gray-600">{member.user_id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">User Role:</span>
                  <span className="ml-2 text-gray-600">{member.user.role}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-gray-600">
                    {member.is_deleted ? "Inactive" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
