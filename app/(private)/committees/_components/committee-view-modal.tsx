"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Crown, User, Loader2 } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { useGetCommitteeByIdQuery } from "@/redux/features/committee/committeeApi";

interface CommitteeViewModalProps {
  committeeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const designationColors = {
  PRESIDENT: "bg-purple-100 text-purple-800",
  VICE_PRESIDENT: "bg-blue-100 text-blue-800",
  GENERAL_SECRETARY: "bg-green-100 text-green-800",
  ASSISTANT_SECRETARY: "bg-cyan-100 text-cyan-800",
  TREASURER: "bg-orange-100 text-orange-800",
  JOINT_TREASURER: "bg-yellow-100 text-yellow-800",
  EXECUTIVE_MEMBER: "bg-gray-100 text-gray-800",
  ADVISOR: "bg-indigo-100 text-indigo-800",
};

const designationLabels = {
  PRESIDENT: "President",
  VICE_PRESIDENT: "Vice President",
  GENERAL_SECRETARY: "General Secretary",
  ASSISTANT_SECRETARY: "Assistant Secretary",
  TREASURER: "Treasurer",
  JOINT_TREASURER: "Joint Treasurer",
  EXECUTIVE_MEMBER: "Executive Member",
  ADVISOR: "Advisor",
};

export function CommitteeViewModal({
  committeeId,
  isOpen,
  onClose,
}: CommitteeViewModalProps) {
  const [imageError, setImageError] = useState(false);

  const { data: committeeData, isLoading } = useGetCommitteeByIdQuery(
    committeeId || "",
    {
      skip: !committeeId,
    }
  );

  const committee = committeeData?.data;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Committee Member Details</DialogTitle>
          <DialogDescription>
            View detailed information about this committee member
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : committee ? (
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              {committee.profile_picture && !imageError ? (
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 relative">
                  <Image
                    src={committee.profile_picture}
                    alt={`${committee.name} profile`}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {committee.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {committee.name}
                </h3>
                <Badge
                  className={
                    designationColors[
                      committee.designation as keyof typeof designationColors
                    ] || "bg-gray-100 text-gray-800"
                  }
                >
                  {designationLabels[
                    committee.designation as keyof typeof designationLabels
                  ] || committee.designation}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Term Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Term Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Start Year</p>
                    <p className="font-medium">{committee.term_start_year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Year</p>
                    <p className="font-medium">{committee.term_end_year}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Term Duration</p>
                  <p className="font-medium">
                    {committee.term_end_year - committee.term_start_year + 1}{" "}
                    year(s)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  Position Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Designation</p>
                    <p className="font-medium">
                      {designationLabels[
                        committee.designation as keyof typeof designationLabels
                      ] || committee.designation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <Badge
                      className={
                        new Date().getFullYear() >= committee.term_start_year &&
                        new Date().getFullYear() <= committee.term_end_year
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {new Date().getFullYear() >= committee.term_start_year &&
                      new Date().getFullYear() <= committee.term_end_year
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  System Information
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Member ID</p>
                    <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {committee.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Added Date</p>
                    <p className="text-sm">
                      {format(
                        new Date(committee.created_at),
                        "dd MMM yyyy 'at' hh:mm a"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm">
                      {format(
                        new Date(committee.updated_at),
                        "dd MMM yyyy 'at' hh:mm a"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Committee member not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
