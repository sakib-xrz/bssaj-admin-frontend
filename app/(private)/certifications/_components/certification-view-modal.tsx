"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useGetSingleCertificationQuery } from "@/redux/features/certification/certificationApi";
import {
  Loader2,
  Award,
  User,
  Eye,
  FileText,
  Shield,
  Calendar,
  Clock,
  GraduationCap,
  Users,
  CheckCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface Certification {
  id: string;
  sl_no: string;
  name: string;
  date_of_birth: string;
  gender: string;
  father_name: string;
  mother_name: string;
  student_id: string;
  completed_hours: string;
  grade: string;
  course_duration: string;
  issued_at: string;
  institute_name: string;
  agency_id: string;
  certificate_url: string | null;
  agency: {
    id: string;
    name: string;
    logo?: string;
    email?: string;
  };
  created_at: string;
  updated_at: string;
}

interface CertificationViewModalProps {
  certificationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CertificationViewModal({
  certificationId,
  isOpen,
  onClose,
}: CertificationViewModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data, isLoading, error } = useGetSingleCertificationQuery(
    certificationId!,
    {
      skip: !certificationId,
    }
  );

  const certification: Certification = data?.data;

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return format(date, "EEEE, MMMM do, yyyy");
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-6 h-6 text-primary" />
            </div>
            Certification Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-gray-500">Loading certification details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-medium">
              Failed to load certification details
            </p>
            <p className="text-gray-500 text-sm mt-1">Please try again later</p>
          </div>
        ) : certification ? (
          <div className="space-y-8">
            {/* Enhanced Header Section */}
            <Card className="border-l-4 border-l-primary shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Student Avatar and Basic Info */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                      <AvatarImage src={getInitials(certification.name)} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-lg font-bold">
                        {getInitials(certification.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {certification.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          {certification.sl_no}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
                    {certification.certificate_url && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() =>
                            window.open(
                              certification.certificate_url!,
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Certificate
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student Information */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Full Name
                      </label>
                      <p className="text-gray-900 font-medium mt-1">
                        {certification.name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Student ID
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded border flex-1">
                            {certification.student_id}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              copyToClipboard(
                                certification.student_id,
                                "student_id"
                              )
                            }
                          >
                            {copiedField === "student_id" ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Gender
                        </label>
                        <p className="text-gray-900 mt-1 capitalize">
                          {certification.gender}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Date of Birth
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">
                          {formatDate(certification.date_of_birth)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Family Information */}
                  <div>
                    <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                      <Users className="w-4 h-4" />
                      Family Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Father&apos;s Name
                        </label>
                        <p className="text-gray-900 mt-1">
                          {certification.father_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Mother&apos;s Name
                        </label>
                        <p className="text-gray-900 mt-1">
                          {certification.mother_name}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course & Certification Details */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    Course & Certification Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Course Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 border-b pb-2">
                        Course Information
                      </h4>

                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Institute Name
                        </label>
                        <p className="text-gray-900 font-medium mt-1">
                          {certification.institute_name}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Course Duration
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900">
                              {certification.course_duration || "N/A"} Hours
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Completed Hours
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <p className="text-gray-900">
                              {certification.completed_hours || "N/A"} Hours
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certification Results */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 border-b pb-2">
                        Certification Results
                      </h4>

                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Grade Achieved
                        </label>
                        <div className="mt-2">
                          <Badge className={`text-sm px-3 py-1`}>
                            {certification.grade || "N/A"}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Issue Date
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">
                            {formatDate(certification.issued_at)}
                          </p>
                        </div>
                      </div>

                      {/* Agency Information */}
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Issuing Agency
                        </label>
                        <div className="flex items-center gap-3 mt-2 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={certification.agency?.logo} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {certification.agency?.name
                                ?.substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {certification.agency?.name}
                            </p>
                            {certification.agency?.email && (
                              <p className="text-xs text-gray-500">
                                {certification.agency.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Verification Section */}
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                  <Shield className="w-5 h-5" />
                  Verification & Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Serial Number
                        </p>
                        <p className="text-xs text-gray-500">
                          Unique certification identifier
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                          {certification.sl_no}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            copyToClipboard(
                              certification.sl_no,
                              "verification_serial"
                            )
                          }
                        >
                          {copiedField === "verification_serial" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Verification Status
                        </p>
                        <p className="text-xs text-gray-500">
                          Certificate authenticity
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Verification Instructions
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Use the serial number for public verification</li>
                      <li>
                        • This certificate is digitally verified and authentic
                      </li>
                      <li>
                        • Contact the issuing agency for additional verification
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata Footer */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Created:{" "}
                      {certification.created_at
                        ? format(new Date(certification.created_at), "PPP")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      Last updated:{" "}
                      {certification.updated_at
                        ? format(new Date(certification.updated_at), "PPP")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Certification not found</p>
            <p className="text-gray-400 text-sm mt-1">
              The requested certification could not be located
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
