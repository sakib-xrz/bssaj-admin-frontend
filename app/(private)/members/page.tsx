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
  UserX,
} from "lucide-react";
import { MemberViewModal } from "./_components/member-view-modal";
import { MemberDeactivateModal } from "./_components/member-deactivate-modal";
import { DeleteAlertDialog } from "@/components/shared/delete-alert-dialog";
import Container from "@/components/shared/container";
import { format } from "date-fns";

const mockMembers = [
  {
    id: "1",
    user_id: "1",
    name: "Dr. Ahmed Rahman",
    email: "ahmed.rahman@example.com",
    phone: "+81-90-1234-5678",
    designation: "President",
    is_deleted: false,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user: {
      role: "ADMIN",
      is_deleted: false,
    },
  },
  {
    id: "2",
    user_id: "2",
    name: "Ms. Fatima Khan",
    email: "fatima.khan@example.com",
    phone: "+81-80-9876-5432",
    designation: "Vice President",
    is_deleted: false,
    created_at: "2024-01-14T09:15:00Z",
    updated_at: "2024-01-14T09:15:00Z",
    user: {
      role: "STUDENT",
      is_deleted: false,
    },
  },
  {
    id: "3",
    user_id: "3",
    name: "Mr. Mohammad Ali",
    email: "mohammad.ali@example.com",
    phone: "+81-70-5555-1234",
    designation: "Secretary",
    is_deleted: false,
    created_at: "2024-01-13T14:45:00Z",
    updated_at: "2024-01-13T14:45:00Z",
    user: {
      role: "STUDENT",
      is_deleted: false,
    },
  },
  {
    id: "4",
    user_id: "4",
    name: "Dr. Rashida Begum",
    email: "rashida.begum@example.com",
    phone: "+81-90-7777-8888",
    designation: "Treasurer",
    is_deleted: true,
    created_at: "2024-01-10T11:20:00Z",
    updated_at: "2024-01-12T16:30:00Z",
    user: {
      role: "STUDENT",
      is_deleted: false,
    },
  },
];

const designationColors = {
  President: "bg-purple-100 text-purple-800",
  "Vice President": "bg-blue-100 text-blue-800",
  Secretary: "bg-green-100 text-green-800",
  Treasurer: "bg-orange-100 text-orange-800",
  "Board Member": "bg-gray-100 text-gray-800",
  "Committee Member": "bg-yellow-100 text-yellow-800",
};

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState(mockMembers);

  const [selectedMember, setSelectedMember] = useState<
    (typeof mockMembers)[0] | null
  >(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);

    return matchesSearch;
  });

  const toggleMemberStatus = (memberId: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? {
              ...member,
              is_deleted: !member.is_deleted,
              updated_at: new Date().toISOString(),
            }
          : member
      )
    );
  };

  const activeMembersCount = members.filter((m) => !m.is_deleted).length;
  const deletedMembersCount = members.filter((m) => m.is_deleted).length;

  const handleViewMember = (member: (typeof mockMembers)[0]) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleDeactivateMember = (member: (typeof mockMembers)[0]) => {
    setSelectedMember(member);
    setIsDeactivateModalOpen(true);
  };

  const handleDeleteMember = (member: (typeof mockMembers)[0]) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const handleRestoreMember = (member: (typeof mockMembers)[0]) => {
    setSelectedMember(member);
    toggleMemberStatus(member.id);
  };

  const confirmDeactivate = async (reason: string) => {
    if (!selectedMember) return;
    try {
      console.log("Deactivating member:", selectedMember.id, "Reason:", reason);
      toggleMemberStatus(selectedMember.id);
      setIsDeactivateModalOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error("Error deactivating member:", error);
    }
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

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600">
              Manage BSSAJ organization members and their roles
            </p>
          </div>
          <Link href="/members/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Members",
              count: members.length,
              color: "text-blue-600",
              icon: UserCheck,
            },
            {
              label: "Active Members",
              count: activeMembersCount,
              color: "text-green-600",
              icon: UserCheck,
            },
            {
              label: "Inactive Members",
              count: deletedMembersCount,
              color: "text-red-600",
              icon: UserCheck,
            },
            {
              label: "Board Members",
              count: members.filter((m) =>
                [
                  "President",
                  "Vice President",
                  "Secretary",
                  "Treasurer",
                ].includes(m.designation)
              ).length,
              color: "text-purple-600",
              icon: UserCheck,
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
                    <TableHead>Status</TableHead>
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
                            designationColors[
                              member.designation as keyof typeof designationColors
                            ] || designationColors["Committee Member"]
                          }
                        >
                          {member.designation}
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
                        <Badge
                          className={
                            member.is_deleted
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {member.is_deleted ? "Inactive" : "Active"}
                        </Badge>
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
                              onClick={() => {
                                if (member.is_deleted) {
                                  handleRestoreMember(member);
                                } else {
                                  handleDeactivateMember(member);
                                }
                              }}
                            >
                              {member.is_deleted ? (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Restore Member
                                </>
                              ) : (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate Member
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteMember(member)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Permanently
                            </DropdownMenuItem>
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

        <MemberDeactivateModal
          member={selectedMember}
          isOpen={isDeactivateModalOpen}
          onClose={() => setIsDeactivateModalOpen(false)}
          onConfirm={confirmDeactivate}
        />

        <DeleteAlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Member"
          description="Are you sure you want to permanently delete this member? This action cannot be undone."
          itemName={selectedMember?.name || ""}
          isLoading={isDeleting}
        />
      </div>
    </Container>
  );
}
