"use client";

import { useState } from "react";
import Link from "next/link";
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
  Phone,
  Mail,
  UserCheck,
  CheckCircle,
  Clock,
  X,
  Check,
} from "lucide-react";
import { MemberViewModal } from "./_components/member-view-modal";
import { DeleteAlertDialog } from "@/app/(private)/_components/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";

// Updated mock data with new schema
const mockMembers = [
  {
    id: "1",
    user_id: "1",
    name: "Dr. Ahmed Rahman",
    email: "ahmed.rahman@example.com",
    phone: "+81-90-1234-5678",
    kind: "EXECUTIVE",
    is_deleted: false,
    approved_at: "2024-01-16T10:30:00Z",
    approved_by_id: "admin1",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      role: "ADMIN",
      is_deleted: false,
    },
    approved_by: {
      name: "Admin User",
    },
  },
  {
    id: "2",
    user_id: "2",
    name: "Ms. Fatima Khan",
    email: "fatima.khan@example.com",
    phone: "+81-80-9876-5432",
    kind: "EXECUTIVE",
    is_deleted: false,
    approved_at: "2024-01-16T09:15:00Z",
    approved_by_id: "admin1",
    created_at: "2024-01-14T09:15:00Z",
    updated_at: "2024-01-14T09:15:00Z",
    user: {
      role: "STUDENT",
      is_deleted: false,
    },
    approved_by: {
      name: "Admin User",
    },
  },
  {
    id: "3",
    user_id: "3",
    name: "Mr. Mohammad Ali",
    email: "mohammad.ali@example.com",
    phone: "+81-70-5555-1234",
    kind: "ASSOCIATE",
    is_deleted: false,
    approved_at: null,
    approved_by_id: null,
    created_at: "2024-01-13T14:45:00Z",
    updated_at: "2024-01-13T14:45:00Z",
    user: {
      role: "STUDENT",
      is_deleted: false,
    },
    approved_by: null,
  },
  {
    id: "4",
    user_id: "4",
    name: "Dr. Rashida Begum",
    email: "rashida.begum@example.com",
    phone: "+81-90-7777-8888",
    kind: "ADVISER",
    is_deleted: false,
    approved_at: "2024-01-11T11:20:00Z",
    approved_by_id: "admin1",
    created_at: "2024-01-10T11:20:00Z",
    updated_at: "2024-01-12T16:30:00Z",
    user: {
      role: "STUDENT",
      is_deleted: false,
    },
    approved_by: {
      name: "Admin User",
    },
  },
  {
    id: "5",
    user_id: "5",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@example.com",
    phone: "+81-90-1111-2222",
    kind: "STUDENT_REPRESENTATIVE",
    is_deleted: false,
    approved_at: "2024-01-18T14:00:00Z",
    approved_by_id: "admin1",
    created_at: "2024-01-18T10:00:00Z",
    updated_at: "2024-01-18T10:00:00Z",
    user: {
      role: "STUDENT",
      is_deleted: false,
    },
    approved_by: {
      name: "Admin User",
    },
  },
];

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
  STUDENT_REPRESENTATIVE: "Student Rep",
};

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState(mockMembers);

  const [selectedMember, setSelectedMember] = useState<
    (typeof members)[0] | null
  >(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      memberKindLabels[member.kind as keyof typeof memberKindLabels]
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const approvedMembersCount = members.filter(
    (m) => m.approved_at && !m.is_deleted
  ).length;
  const pendingApprovalCount = members.filter(
    (m) => !m.approved_at && !m.is_deleted
  ).length;

  const handleViewMember = (member: (typeof members)[0]) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleDeleteMember = (member: (typeof members)[0]) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    setIsDeleting(true);
    try {
      console.log("Deleting member:", selectedMember.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Remove member from list or refresh data
    } catch (error) {
      console.error("Error deleting member:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleApprove = (member: (typeof members)[0]) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === member.id
          ? {
              ...m,
              approved_at: new Date().toISOString(),
              approved_by_id: "current_admin",
              approved_by: { name: "Current Admin" },
              updated_at: new Date().toISOString(),
            }
          : m
      )
    );
  };

  const handleReject = (member: (typeof members)[0]) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === member.id
          ? {
              ...m,
              is_deleted: true,
              updated_at: new Date().toISOString(),
            }
          : m
      )
    );
  };

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600">
              Manage BSSAJ organization members and their roles
            </p>
          </div>
          <Link href="/members/create">
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              label: "Total Members",
              count: members.length,
              color: "text-blue-600",
              icon: UserCheck,
            },
            {
              label: "Approved Members",
              count: approvedMembersCount,
              color: "text-purple-600",
              icon: CheckCircle,
            },
            {
              label: "Pending Approval",
              count: pendingApprovalCount,
              color: "text-orange-600",
              icon: Clock,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.count}
                      </p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Members</CardTitle>
            <CardDescription>
              A list of all organization members and their designations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      className={member.is_deleted ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            <a
                              href={`mailto:${member.email}`}
                              className="text-secondary hover:underline"
                            >
                              {member.email}
                            </a>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            <a
                              href={`tel:${member.phone}`}
                              className="text-gray-600 hover:underline"
                            >
                              {member.phone}
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.approved_at ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              Approved
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-orange-600">
                              Pending
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(member.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!member.approved_at && !member.is_deleted ? (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleViewMember(member)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleApprove(member)}
                                  className="text-green-600"
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve Member
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleReject(member)}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject Member
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleViewMember(member)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/members/edit/${member.id}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Member
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteMember(member)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Permanently
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <MemberViewModal
          member={selectedMember}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Member"
          description="Are you sure you want to delete this member? This action cannot be undone."
          itemName={selectedMember?.name || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
